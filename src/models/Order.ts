// src/models/Order.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  _id: string;
  orderNumber: string; // Human-readable order number
  
  // Customer
  customer?: string; // User ID (null for guest orders)
  customerInfo: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  
  // Status
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
  fulfillmentStatus: 'unfulfilled' | 'partial' | 'fulfilled' | 'shipped' | 'delivered';
  
  // Addresses
  billingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  
  shippingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  
  // Pricing
  currency: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  total: number;
  refundedAmount: number;
  
  // Payment
  paymentMethod: string;
  paymentDetails: {
    provider: string; // stripe, paypal, etc.
    transactionId?: string;
    paymentIntentId?: string;
    last4?: string;
    brand?: string;
  };
  
  // Shipping
  shippingMethod?: {
    id: string;
    name: string;
    description?: string;
    estimatedDelivery?: string;
  };
  
  // Tracking
  trackingNumbers: Array<{
    carrier: string;
    trackingNumber: string;
    url?: string;
    addedAt: Date;
  }>;
  
  // Applied discounts
  appliedCoupons: Array<{
    couponId: string;
    code: string;
    discountAmount: number;
    discountType: 'percentage' | 'fixed';
  }>;
  
  // Important dates
  placedAt: Date;
  confirmedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  
  // Notes
  customerNotes?: string;
  internalNotes?: string;
  
  // Metadata
  source: 'web' | 'mobile' | 'api' | 'admin';
  ipAddress?: string;
  userAgent?: string;
  
  // Fulfillment
  requiresShipping: boolean;
  
  // Analytics
  totalWeight?: number;
  itemCount: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  customerFullName: string;
  isGuest: boolean;
  canCancel: boolean;
  canRefund: boolean;
}

const AddressSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  address1: {
    type: String,
    required: true,
    trim: true,
  },
  address2: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
}, {
  _id: false,
});

const CustomerInfoSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
}, {
  _id: false,
});

const PaymentDetailsSchema = new Schema({
  provider: {
    type: String,
    required: true,
  },
  transactionId: {
    type: String,
  },
  paymentIntentId: {
    type: String,
  },
  last4: {
    type: String,
  },
  brand: {
    type: String,
  },
}, {
  _id: false,
});

const ShippingMethodSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  estimatedDelivery: {
    type: String,
  },
}, {
  _id: false,
});

const TrackingNumberSchema = new Schema({
  carrier: {
    type: String,
    required: true,
  },
  trackingNumber: {
    type: String,
    required: true,
  },
  url: {
    type: String,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  _id: false,
});

const AppliedCouponSchema = new Schema({
  couponId: {
    type: Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true,
  },
  code: {
    type: String,
    required: true,
    uppercase: true,
  },
  discountAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
}, {
  _id: false,
});

const OrderSchema = new Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  
  // Customer
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  customerInfo: {
    type: CustomerInfoSchema,
    required: true,
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
    index: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'pending',
    index: true,
  },
  fulfillmentStatus: {
    type: String,
    enum: ['unfulfilled', 'partial', 'fulfilled', 'shipped', 'delivered'],
    default: 'unfulfilled',
    index: true,
  },
  
  // Addresses
  billingAddress: {
    type: AddressSchema,
    required: true,
  },
  shippingAddress: {
    type: AddressSchema,
    required: true,
  },
  
  // Pricing
  currency: {
    type: String,
    required: true,
    default: 'USD',
    uppercase: true,
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  taxAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  shippingAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
    index: true,
  },
  refundedAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Payment
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentDetails: PaymentDetailsSchema,
  
  // Shipping
  shippingMethod: ShippingMethodSchema,
  
  // Tracking
  trackingNumbers: [TrackingNumberSchema],
  
  // Applied discounts
  appliedCoupons: [AppliedCouponSchema],
  
  // Important dates
  placedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  confirmedAt: {
    type: Date,
    index: true,
  },
  shippedAt: {
    type: Date,
    index: true,
  },
  deliveredAt: {
    type: Date,
    index: true,
  },
  cancelledAt: {
    type: Date,
    index: true,
  },
  
  // Notes
  customerNotes: {
    type: String,
    trim: true,
  },
  internalNotes: {
    type: String,
    trim: true,
  },
  
  // Metadata
  source: {
    type: String,
    enum: ['web', 'mobile', 'api', 'admin'],
    default: 'web',
    index: true,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  
  // Fulfillment
  requiresShipping: {
    type: Boolean,
    default: true,
  },
  
  // Analytics
  totalWeight: {
    type: Number,
    min: 0,
  },
  itemCount: {
    type: Number,
    required: true,
    min: 1,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
OrderSchema.index({ customer: 1, status: 1 });
OrderSchema.index({ 'customerInfo.email': 1 });
OrderSchema.index({ status: 1, placedAt: -1 });
OrderSchema.index({ paymentStatus: 1, placedAt: -1 });
OrderSchema.index({ fulfillmentStatus: 1, placedAt: -1 });
OrderSchema.index({ placedAt: -1 });
OrderSchema.index({ total: -1 });

// Compound indexes
OrderSchema.index({ customer: 1, placedAt: -1 });
OrderSchema.index({ status: 1, paymentStatus: 1, fulfillmentStatus: 1 });

// Virtuals
OrderSchema.virtual('customerFullName').get(function(this: IOrder) {
  return `${this.customerInfo.firstName} ${this.customerInfo.lastName}`;
});

OrderSchema.virtual('isGuest').get(function(this: IOrder) {
  return !this.customer;
});

OrderSchema.virtual('canCancel').get(function(this: IOrder) {
  return ['pending', 'confirmed'].includes(this.status) && this.paymentStatus !== 'paid';
});

OrderSchema.virtual('canRefund').get(function(this: IOrder) {
  return this.paymentStatus === 'paid' && !['cancelled', 'refunded'].includes(this.status);
});

// Pre-save middleware
OrderSchema.pre('save', function(this: IOrder, next) {
  // Auto-generate order number if not set
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    this.orderNumber = `ORD-${timestamp.slice(-8)}-${random}`;
  }
  
  // Update status-specific dates
  if (this.isModified('status')) {
    const now = new Date();
    switch (this.status) {
      case 'confirmed':
        if (!this.confirmedAt) this.confirmedAt = now;
        break;
      case 'shipped':
        if (!this.shippedAt) this.shippedAt = now;
        if (this.fulfillmentStatus === 'unfulfilled') this.fulfillmentStatus = 'shipped';
        break;
      case 'delivered':
        if (!this.deliveredAt) this.deliveredAt = now;
        this.fulfillmentStatus = 'delivered';
        break;
      case 'cancelled':
        if (!this.cancelledAt) this.cancelledAt = now;
        break;
    }
  }
  
  next();
});

// Static methods
OrderSchema.statics.generateOrderNumber = function() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `ORD-${timestamp.slice(-8)}-${random}`;
};

OrderSchema.statics.findByCustomer = function(customerId: string) {
  return this.find({ customer: customerId }).sort({ placedAt: -1 });
};

OrderSchema.statics.findByEmail = function(email: string) {
  return this.find({ 'customerInfo.email': email.toLowerCase() }).sort({ placedAt: -1 });
};

OrderSchema.statics.findRecent = function(days: number = 30) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.find({ placedAt: { $gte: cutoffDate } }).sort({ placedAt: -1 });
};

OrderSchema.statics.findPending = function() {
  return this.find({
    status: { $in: ['pending', 'confirmed', 'processing'] }
  }).sort({ placedAt: 1 });
};

OrderSchema.statics.findAwaitingShipment = function() {
  return this.find({
    status: { $in: ['confirmed', 'processing'] },
    fulfillmentStatus: 'unfulfilled',
    requiresShipping: true
  }).sort({ placedAt: 1 });
};

OrderSchema.statics.getSalesStats = async function(startDate: Date, endDate: Date) {
  const stats = await this.aggregate([
    {
      $match: {
        placedAt: { $gte: startDate, $lte: endDate },
        status: { $nin: ['cancelled', 'refunded'] },
        paymentStatus: 'paid'
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
        totalItems: { $sum: '$itemCount' }
      }
    }
  ]);
  
  return stats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalItems: 0
  };
};

// Instance methods
OrderSchema.methods.getItems = function() {
  const OrderItem = mongoose.model('OrderItem');
  return OrderItem.find({ order: this._id })
    .populate('product')
    .populate('variant');
};

OrderSchema.methods.cancel = function(reason?: string) {
  if (!this.canCancel) {
    throw new Error('Order cannot be cancelled');
  }
  
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  
  if (reason) {
    this.internalNotes = (this.internalNotes || '') + `\nCancelled: ${reason}`;
  }
  
  return this.save();
};

OrderSchema.methods.markAsPaid = function(transactionId?: string) {
  this.paymentStatus = 'paid';
  
  if (transactionId) {
    this.paymentDetails.transactionId = transactionId;
  }
  
  if (this.status === 'pending') {
    this.status = 'confirmed';
    this.confirmedAt = new Date();
  }
  
  return this.save();
};

OrderSchema.methods.markAsShipped = function(trackingInfo?: { carrier: string; trackingNumber: string; url?: string }) {
  this.status = 'shipped';
  this.fulfillmentStatus = 'shipped';
  this.shippedAt = new Date();
  
  if (trackingInfo) {
    this.trackingNumbers.push({
      carrier: trackingInfo.carrier,
      trackingNumber: trackingInfo.trackingNumber,
      url: trackingInfo.url,
      addedAt: new Date()
    });
  }
  
  return this.save();
};

OrderSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  this.fulfillmentStatus = 'delivered';
  this.deliveredAt = new Date();
  
  return this.save();
};

OrderSchema.methods.refund = function(amount?: number) {
  if (!this.canRefund) {
    throw new Error('Order cannot be refunded');
  }
  
  const refundAmount = amount || this.total;
  
  if (refundAmount >= this.total - this.refundedAmount) {
    this.status = 'refunded';
    this.paymentStatus = 'refunded';
    this.refundedAmount = this.total;
  } else {
    this.paymentStatus = 'partially_refunded';
    this.refundedAmount += refundAmount;
  }
  
  return this.save();
};

OrderSchema.methods.updateInventory = async function(operation: 'decrease' | 'increase' = 'decrease') {
  const OrderItem = mongoose.model('OrderItem');
  const Product = mongoose.model('Product');
  const ProductVariant = mongoose.model('ProductVariant');
  
  const items = await OrderItem.find({ order: this._id });
  
  for (const item of items) {
    const adjustment = operation === 'decrease' ? -item.quantity : item.quantity;
    
    if (item.variant) {
      await ProductVariant.findByIdAndUpdate(
        item.variant,
        { $inc: { inventoryQuantity: adjustment } }
      );
    } else {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { inventoryQuantity: adjustment } }
      );
    }
  }
};

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);