// src/models/Cart.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ICart extends Document {
  _id: string;
  
  // Owner
  user?: string; // User ID (null for guest carts)
  sessionId?: string; // For guest carts
  
  // Status
  status: 'active' | 'abandoned' | 'converted' | 'expired';
  
  // Totals
  itemCount: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  total: number;
  
  // Currency
  currency: string;
  
  // Applied coupons
  appliedCoupons: Array<{
    couponId: string;
    code: string;
    discountAmount: number;
    discountType: 'percentage' | 'fixed';
  }>;
  
  // Shipping info (for estimation)
  shippingAddress?: {
    country: string;
    state: string;
    city: string;
    postalCode: string;
  };
  
  // Notes
  notes?: string;
  
  // Expiry (for guest carts)
  expiresAt?: Date;
  
  // Timestamps
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  isExpired: boolean;
  isGuest: boolean;
}

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

const ShippingAddressSchema = new Schema({
  country: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  _id: false,
});

const CartSchema = new Schema({
  // Owner
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    sparse: true,
    index: true,
  },
  sessionId: {
    type: String,
    sparse: true,
    index: true,
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'abandoned', 'converted', 'expired'],
    default: 'active',
    index: true,
  },
  
  // Totals
  itemCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  subtotal: {
    type: Number,
    default: 0,
    min: 0,
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  shippingAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  total: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Currency
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
  },
  
  // Applied coupons
  appliedCoupons: [AppliedCouponSchema],
  
  // Shipping info
  shippingAddress: ShippingAddressSchema,
  
  // Notes
  notes: {
    type: String,
    trim: true,
  },
  
  // Expiry
  expiresAt: {
    type: Date,
    index: true,
  },
  
  // Activity tracking
  lastActivityAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
CartSchema.index({ user: 1, status: 1 });
CartSchema.index({ sessionId: 1, status: 1 });
CartSchema.index({ status: 1, lastActivityAt: -1 });
CartSchema.index({ expiresAt: 1 }, { sparse: true });

// Ensure either user or sessionId is provided
CartSchema.index({ user: 1 }, { sparse: true, unique: true, partialFilterExpression: { status: 'active' } });
CartSchema.index({ sessionId: 1 }, { sparse: true, unique: true, partialFilterExpression: { status: 'active' } });

// Virtuals
CartSchema.virtual('isExpired').get(function(this: ICart) {
  return this.expiresAt ? this.expiresAt < new Date() : false;
});

CartSchema.virtual('isGuest').get(function(this: ICart) {
  return !this.user && !!this.sessionId;
});

// Pre-save middleware
CartSchema.pre('save', function(this: ICart, next) {
  // Ensure either user or sessionId is provided
  if (!this.user && !this.sessionId) {
    return next(new Error('Cart must have either user or sessionId'));
  }
  
  // Set expiry for guest carts (30 days)
  if (!this.user && this.sessionId && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  // Update last activity
  this.lastActivityAt = new Date();
  
  next();
});

// Static methods
CartSchema.statics.findByUser = function(userId: string) {
  return this.findOne({ user: userId, status: 'active' });
};

CartSchema.statics.findBySession = function(sessionId: string) {
  return this.findOne({ sessionId, status: 'active' });
};

CartSchema.statics.findOrCreateForUser = async function(userId: string) {
  let cart = await this.findByUser(userId);
  if (!cart) {
    cart = new this({ user: userId });
    await cart.save();
  }
  return cart;
};

CartSchema.statics.findOrCreateForSession = async function(sessionId: string) {
  let cart = await this.findBySession(sessionId);
  if (!cart) {
    cart = new this({ sessionId });
    await cart.save();
  }
  return cart;
};

CartSchema.statics.findAbandoned = function(daysAgo: number = 1) {
  const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return this.find({
    status: 'active',
    itemCount: { $gt: 0 },
    lastActivityAt: { $lt: cutoffDate }
  });
};

CartSchema.statics.cleanupExpired = function() {
  return this.updateMany(
    {
      status: 'active',
      expiresAt: { $lt: new Date() }
    },
    {
      $set: { status: 'expired' }
    }
  );
};

// Instance methods
CartSchema.methods.addItem = async function(productId: string, variantId: string | null, quantity: number = 1) {
  const CartItem = mongoose.model('CartItem');
  
  // Check if item already exists
  const existingItem = await CartItem.findOne({
    cart: this._id,
    product: productId,
    variant: variantId
  });
  
  if (existingItem) {
    existingItem.quantity += quantity;
    await existingItem.save();
  } else {
    const newItem = new CartItem({
      cart: this._id,
      product: productId,
      variant: variantId,
      quantity
    });
    await newItem.save();
  }
  
  await this.recalculateTotals();
  return this;
};

CartSchema.methods.removeItem = async function(itemId: string) {
  const CartItem = mongoose.model('CartItem');
  await CartItem.findByIdAndDelete(itemId);
  await this.recalculateTotals();
  return this;
};

CartSchema.methods.updateItemQuantity = async function(itemId: string, quantity: number) {
  const CartItem = mongoose.model('CartItem');
  
  if (quantity <= 0) {
    await CartItem.findByIdAndDelete(itemId);
  } else {
    await CartItem.findByIdAndUpdate(itemId, { quantity });
  }
  
  await this.recalculateTotals();
  return this;
};

CartSchema.methods.clear = async function() {
  const CartItem = mongoose.model('CartItem');
  await CartItem.deleteMany({ cart: this._id });
  await this.recalculateTotals();
  return this;
};

CartSchema.methods.getItems = function() {
  const CartItem = mongoose.model('CartItem');
  return CartItem.find({ cart: this._id })
    .populate('product')
    .populate('variant');
};

CartSchema.methods.recalculateTotals = async function() {
  const CartItem = mongoose.model('CartItem');
  
  const items = await CartItem.find({ cart: this._id })
    .populate('product')
    .populate('variant');
  
  this.itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  this.subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  
  // Apply coupons
  this.discountAmount = this.appliedCoupons.reduce((sum, coupon) => sum + coupon.discountAmount, 0);
  
  // Calculate tax (simplified - would need proper tax calculation)
  this.taxAmount = (this.subtotal - this.discountAmount) * 0.1; // 10% tax example
  
  // Calculate total
  this.total = this.subtotal + this.taxAmount + this.shippingAmount - this.discountAmount;
  
  await this.save();
  return this;
};

CartSchema.methods.applyCoupon = async function(couponCode: string) {
  const Coupon = mongoose.model('Coupon');
  const coupon = await Coupon.findOne({ code: couponCode, status: 'active' });
  
  if (!coupon) {
    throw new Error('Invalid coupon code');
  }
  
  // Check if coupon is already applied
  if (this.appliedCoupons.some(ac => ac.code === couponCode)) {
    throw new Error('Coupon already applied');
  }
  
  // Validate coupon (minimum amount, usage limits, etc.)
  if (coupon.minimumAmount && this.subtotal < coupon.minimumAmount) {
    throw new Error(`Minimum order amount of ${coupon.minimumAmount} required`);
  }
  
  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (this.subtotal * coupon.discountValue) / 100;
    if (coupon.maximumDiscount) {
      discountAmount = Math.min(discountAmount, coupon.maximumDiscount);
    }
  } else {
    discountAmount = coupon.discountValue;
  }
  
  this.appliedCoupons.push({
    couponId: coupon._id,
    code: coupon.code,
    discountAmount,
    discountType: coupon.discountType
  });
  
  await this.recalculateTotals();
  return this;
};

CartSchema.methods.removeCoupon = async function(couponCode: string) {
  this.appliedCoupons = this.appliedCoupons.filter(ac => ac.code !== couponCode);
  await this.recalculateTotals();
  return this;
};

CartSchema.methods.mergeCarts = async function(otherCartId: string) {
  const CartItem = mongoose.model('CartItem');
  const otherItems = await CartItem.find({ cart: otherCartId });
  
  for (const item of otherItems) {
    await this.addItem(item.product.toString(), item.variant?.toString() || null, item.quantity);
  }
  
  // Delete the other cart
  await this.constructor.findByIdAndDelete(otherCartId);
  await CartItem.deleteMany({ cart: otherCartId });
  
  return this;
};

export default mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);