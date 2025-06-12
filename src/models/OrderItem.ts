// src/models/OrderItem.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem extends Document {
  _id: string;
  order: string; // Order ID
  product: string; // Product ID
  variant?: string; // ProductVariant ID (optional)
  
  // Quantity and pricing
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  
  // Product snapshot (preserved data at time of purchase)
  productSnapshot: {
    name: string;
    slug: string;
    sku: string;
    description: string;
    image?: string;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
      unit: 'cm' | 'in';
    };
    brand?: {
      id: string;
      name: string;
    };
    categories: Array<{
      id: string;
      name: string;
    }>;
  };
  
  // Variant snapshot (if applicable)
  variantSnapshot?: {
    sku: string;
    attributes: Array<{
      name: string;
      value: string;
    }>;
    image?: string;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
      unit: 'cm' | 'in';
    };
  };
  
  // Customizations applied at purchase
  customizations: Array<{
    name: string;
    value: string;
    price: number;
  }>;
  
  // Gift options
  giftWrap?: {
    enabled: boolean;
    message?: string;
    price: number;
  };
  
  // Fulfillment
  fulfillmentStatus: 'unfulfilled' | 'partial' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled';
  shippedQuantity: number;
  
  // Digital product info
  isDigital: boolean;
  downloadUrls: Array<{
    name: string;
    url: string;
    expiresAt?: Date;
    downloadCount: number;
    downloadLimit?: number;
  }>;
  
  // Refund info
  refundedQuantity: number;
  refundedAmount: number;
  
  // Reviews
  reviewId?: string; // Review ID if customer has reviewed this item
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  displayName: string;
  canReview: boolean;
  canRefund: boolean;
  remainingQuantity: number;
}

const DimensionSchema = new Schema({
  length: {
    type: Number,
    required: true,
    min: 0,
  },
  width: {
    type: Number,
    required: true,
    min: 0,
  },
  height: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    enum: ['cm', 'in'],
    default: 'cm',
  },
}, {
  _id: false,
});

const BrandSnapshotSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
}, {
  _id: false,
});

const CategorySnapshotSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
}, {
  _id: false,
});

const ProductSnapshotSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  weight: {
    type: Number,
    min: 0,
  },
  dimensions: DimensionSchema,
  brand: BrandSnapshotSchema,
  categories: [CategorySnapshotSchema],
}, {
  _id: false,
});

const VariantAttributeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
}, {
  _id: false,
});

const VariantSnapshotSchema = new Schema({
  sku: {
    type: String,
    required: true,
  },
  attributes: [VariantAttributeSchema],
  image: {
    type: String,
  },
  weight: {
    type: Number,
    min: 0,
  },
  dimensions: DimensionSchema,
}, {
  _id: false,
});

const CustomizationSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  _id: false,
});

const GiftWrapSchema = new Schema({
  enabled: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    maxlength: 500,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  _id: false,
});

const DownloadUrlSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  downloadLimit: {
    type: Number,
    min: 0,
  },
}, {
  _id: false,
});

const OrderItemSchema = new Schema({
  order: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  },
  variant: {
    type: Schema.Types.ObjectId,
    ref: 'ProductVariant',
    index: true,
  },
  
  // Quantity and pricing
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  
  // Snapshots
  productSnapshot: {
    type: ProductSnapshotSchema,
    required: true,
  },
  variantSnapshot: VariantSnapshotSchema,
  
  // Customizations
  customizations: [CustomizationSchema],
  
  // Gift options
  giftWrap: GiftWrapSchema,
  
  // Fulfillment
  fulfillmentStatus: {
    type: String,
    enum: ['unfulfilled', 'partial', 'fulfilled', 'shipped', 'delivered', 'cancelled'],
    default: 'unfulfilled',
    index: true,
  },
  shippedQuantity: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Digital product
  isDigital: {
    type: Boolean,
    default: false,
    index: true,
  },
  downloadUrls: [DownloadUrlSchema],
  
  // Refund info
  refundedQuantity: {
    type: Number,
    default: 0,
    min: 0,
  },
  refundedAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Reviews
  reviewId: {
    type: Schema.Types.ObjectId,
    ref: 'Review',
    index: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
OrderItemSchema.index({ order: 1, product: 1 });
OrderItemSchema.index({ product: 1, fulfillmentStatus: 1 });
OrderItemSchema.index({ variant: 1, fulfillmentStatus: 1 });
OrderItemSchema.index({ isDigital: 1 });
OrderItemSchema.index({ reviewId: 1 });

// Virtuals
OrderItemSchema.virtual('displayName').get(function(this: IOrderItem) {
  if (this.variantSnapshot && this.variantSnapshot.attributes.length > 0) {
    const variantInfo = this.variantSnapshot.attributes
      .map(attr => `${attr.name}: ${attr.value}`)
      .join(', ');
    return `${this.productSnapshot.name} (${variantInfo})`;
  }
  return this.productSnapshot.name;
});

OrderItemSchema.virtual('canReview').get(function(this: IOrderItem) {
  return !this.reviewId && ['delivered'].includes(this.fulfillmentStatus);
});

OrderItemSchema.virtual('canRefund').get(function(this: IOrderItem) {
  return this.refundedQuantity < this.quantity;
});

OrderItemSchema.virtual('remainingQuantity').get(function(this: IOrderItem) {
  return this.quantity - this.refundedQuantity;
});

// Pre-save middleware
OrderItemSchema.pre('save', function(this: IOrderItem, next) {
  // Ensure refunded quantity doesn't exceed total quantity
  if (this.refundedQuantity > this.quantity) {
    this.refundedQuantity = this.quantity;
  }
  
  // Ensure shipped quantity doesn't exceed remaining quantity
  if (this.shippedQuantity > this.remainingQuantity) {
    this.shippedQuantity = this.remainingQuantity;
  }
  
  next();
});

// Static methods
OrderItemSchema.statics.findByOrder = function(orderId: string) {
  return this.find({ order: orderId })
    .populate('product')
    .populate('variant');
};

OrderItemSchema.statics.findByProduct = function(productId: string) {
  return this.find({ product: productId })
    .populate('order')
    .sort({ createdAt: -1 });
};

OrderItemSchema.statics.findAwaitingFulfillment = function() {
  return this.find({
    fulfillmentStatus: 'unfulfilled',
    isDigital: false
  })
    .populate('order')
    .populate('product');
};

OrderItemSchema.statics.findDigitalItems = function(orderId?: string) {
  const query: any = { isDigital: true };
  if (orderId) {
    query.order = orderId;
  }
  
  return this.find(query)
    .populate('order')
    .populate('product');
};

OrderItemSchema.statics.getProductSalesStats = async function(productId: string, startDate: Date, endDate: Date) {
  const stats = await this.aggregate([
    {
      $lookup: {
        from: 'orders',
        localField: 'order',
        foreignField: '_id',
        as: 'orderInfo'
      }
    },
    {
      $unwind: '$orderInfo'
    },
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        'orderInfo.placedAt': { $gte: startDate, $lte: endDate },
        'orderInfo.status': { $nin: ['cancelled', 'refunded'] },
        'orderInfo.paymentStatus': 'paid'
      }
    },
    {
      $group: {
        _id: null,
        totalSold: { $sum: '$quantity' },
        totalRevenue: { $sum: '$totalPrice' },
        totalOrders: { $sum: 1 },
        averagePrice: { $avg: '$unitPrice' }
      }
    }
  ]);
  
  return stats[0] || {
    totalSold: 0,
    totalRevenue: 0,
    totalOrders: 0,
    averagePrice: 0
  };
};

// Instance methods
OrderItemSchema.methods.fulfill = function(quantity?: number) {
  const fulfillQuantity = quantity || (this.quantity - this.shippedQuantity);
  
  this.shippedQuantity += fulfillQuantity;
  
  if (this.shippedQuantity >= this.quantity) {
    this.fulfillmentStatus = 'fulfilled';
  } else if (this.shippedQuantity > 0) {
    this.fulfillmentStatus = 'partial';
  }
  
  return this.save();
};

OrderItemSchema.methods.ship = function(quantity?: number) {
  const shipQuantity = quantity || (this.quantity - this.shippedQuantity);
  
  this.shippedQuantity += shipQuantity;
  
  if (this.shippedQuantity >= this.quantity) {
    this.fulfillmentStatus = 'shipped';
  } else if (this.shippedQuantity > 0) {
    this.fulfillmentStatus = 'partial';
  }
  
  return this.save();
};

OrderItemSchema.methods.deliver = function() {
  this.fulfillmentStatus = 'delivered';
  this.shippedQuantity = this.quantity;
  
  return this.save();
};

OrderItemSchema.methods.refund = function(quantity?: number, amount?: number) {
  const refundQuantity = Math.min(quantity || this.remainingQuantity, this.remainingQuantity);
  const refundAmount = amount || (this.unitPrice * refundQuantity);
  
  this.refundedQuantity += refundQuantity;
  this.refundedAmount += refundAmount;
  
  if (this.refundedQuantity >= this.quantity) {
    this.fulfillmentStatus = 'cancelled';
  }
  
  return this.save();
};

OrderItemSchema.methods.addDownloadUrl = function(name: string, url: string, expiresAt?: Date, downloadLimit?: number) {
  this.downloadUrls.push({
    name,
    url,
    expiresAt,
    downloadCount: 0,
    downloadLimit
  });
  
  this.isDigital = true;
  this.fulfillmentStatus = 'fulfilled';
  
  return this.save();
};

OrderItemSchema.methods.trackDownload = function(urlIndex: number) {
  if (urlIndex >= 0 && urlIndex < this.downloadUrls.length) {
    this.downloadUrls[urlIndex].downloadCount += 1;
    return this.save();
  }
  throw new Error('Invalid download URL index');
};

OrderItemSchema.methods.canDownload = function(urlIndex: number) {
  if (urlIndex < 0 || urlIndex >= this.downloadUrls.length) {
    return { canDownload: false, reason: 'Invalid download URL' };
  }
  
  const downloadUrl = this.downloadUrls[urlIndex];
  
  if (downloadUrl.expiresAt && downloadUrl.expiresAt < new Date()) {
    return { canDownload: false, reason: 'Download link has expired' };
  }
  
  if (downloadUrl.downloadLimit && downloadUrl.downloadCount >= downloadUrl.downloadLimit) {
    return { canDownload: false, reason: 'Download limit exceeded' };
  }
  
  return { canDownload: true };
};

export default mongoose.models.OrderItem || mongoose.model<IOrderItem>('OrderItem', OrderItemSchema);