// src/models/WishlistItem.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlistItem extends Document {
  _id: string;
  wishlist: string; // Wishlist ID
  product: string; // Product ID
  variant?: string; // ProductVariant ID (optional)
  
  // Notes
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  
  // Pricing snapshot (for price alerts)
  priceWhenAdded: number;
  
  // Price alerts
  priceAlert?: {
    enabled: boolean;
    targetPrice: number;
    notified: boolean;
  };
  
  // Timestamps
  addedAt: Date;
  lastCheckedAt: Date;
  
  // Virtual fields
  displayName: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercentage: number;
  inStock: boolean;
}

const PriceAlertSchema = new Schema({
  enabled: {
    type: Boolean,
    default: false,
  },
  targetPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  notified: {
    type: Boolean,
    default: false,
  },
}, {
  _id: false,
});

const WishlistItemSchema = new Schema({
  wishlist: {
    type: Schema.Types.ObjectId,
    ref: 'Wishlist',
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
  
  // Notes
  notes: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
    index: true,
  },
  
  // Pricing
  priceWhenAdded: {
    type: Number,
    required: true,
    min: 0,
  },
  
  // Price alerts
  priceAlert: PriceAlertSchema,
  
  // Timestamps
  addedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  lastCheckedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: false, // Using custom timestamp fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
WishlistItemSchema.index({ wishlist: 1, product: 1, variant: 1 }, { unique: true });
WishlistItemSchema.index({ priority: 1, addedAt: -1 });
WishlistItemSchema.index({ 'priceAlert.enabled': 1, 'priceAlert.notified': 1 });

// Virtuals
WishlistItemSchema.virtual('displayName').get(function(this: IWishlistItem) {
  // This will be populated when product/variant are populated
  return '';
});

WishlistItemSchema.virtual('currentPrice').get(function(this: IWishlistItem) {
  // This will be calculated from populated product/variant
  return 0;
});

WishlistItemSchema.virtual('priceChange').get(function(this: IWishlistItem) {
  return this.currentPrice - this.priceWhenAdded;
});

WishlistItemSchema.virtual('priceChangePercentage').get(function(this: IWishlistItem) {
  if (this.priceWhenAdded === 0) return 0;
  return ((this.currentPrice - this.priceWhenAdded) / this.priceWhenAdded) * 100;
});

WishlistItemSchema.virtual('inStock').get(function(this: IWishlistItem) {
  // This will be calculated from populated product/variant
  return false;
});

// Pre-save middleware
WishlistItemSchema.pre('save', async function(this: IWishlistItem, next) {
  try {
    // Set price when added if not already set
    if (this.isNew) {
      await this.updatePricing();
    }
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Static methods
WishlistItemSchema.statics.findByWishlist = function(wishlistId: string) {
  return this.find({ wishlist: wishlistId })
    .populate('product')
    .populate('variant')
    .sort({ addedAt: -1 });
};

WishlistItemSchema.statics.findByProduct = function(productId: string) {
  return this.find({ product: productId })
    .populate('wishlist')
    .sort({ addedAt: -1 });
};

WishlistItemSchema.statics.findWithPriceAlerts = function() {
  return this.find({
    'priceAlert.enabled': true,
    'priceAlert.notified': false
  })
    .populate('product')
    .populate('variant')
    .populate({
      path: 'wishlist',
      populate: {
        path: 'user',
        select: 'email firstName lastName preferences'
      }
    });
};

WishlistItemSchema.statics.findByPriority = function(wishlistId: string, priority: string) {
  return this.find({
    wishlist: wishlistId,
    priority
  })
    .populate('product')
    .populate('variant')
    .sort({ addedAt: -1 });
};

WishlistItemSchema.statics.findRecentlyAdded = function(days: number = 7) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.find({
    addedAt: { $gte: cutoffDate }
  })
    .populate('product')
    .populate('variant')
    .populate('wishlist')
    .sort({ addedAt: -1 });
};

WishlistItemSchema.statics.checkPriceAlerts = async function() {
  const items = await this.findWithPriceAlerts();
  const alertsTriggered = [];
  
  for (const item of items) {
    await item.updatePricing();
    
    if (item.currentPrice <= item.priceAlert.targetPrice) {
      item.priceAlert.notified = true;
      await item.save();
      alertsTriggered.push(item);
    }
  }
  
  return alertsTriggered;
};

// Instance methods
WishlistItemSchema.methods.updatePricing = async function() {
  const Product = mongoose.model('Product');
  const ProductVariant = mongoose.model('ProductVariant');
  
  let currentPrice = 0;
  
  if (this.variant) {
    const variant = await ProductVariant.findById(this.variant);
    if (variant) {
      currentPrice = variant.finalPrice || variant.price || 0;
    }
  }
  
  if (!currentPrice) {
    const product = await Product.findById(this.product);
    if (product) {
      currentPrice = product.finalPrice || 0;
    }
  }
  
  // Set initial price when added
  if (this.isNew) {
    this.priceWhenAdded = currentPrice;
  }
  
  this.lastCheckedAt = new Date();
  
  // Virtual will calculate current price, but we need to store it for alerts
  this._currentPrice = currentPrice;
  
  return this.save();
};

WishlistItemSchema.methods.setPriceAlert = function(targetPrice: number, enabled: boolean = true) {
  this.priceAlert = {
    enabled,
    targetPrice,
    notified: false
  };
  return this.save();
};

WishlistItemSchema.methods.removePriceAlert = function() {
  this.priceAlert = undefined;
  return this.save();
};

WishlistItemSchema.methods.setPriority = function(priority: 'low' | 'medium' | 'high') {
  this.priority = priority;
  return this.save();
};

WishlistItemSchema.methods.addToCart = async function(quantity: number = 1) {
  const Cart = mongoose.model('Cart');
  const Wishlist = mongoose.model('Wishlist');
  
  const wishlist = await Wishlist.findById(this.wishlist);
  if (!wishlist) {
    throw new Error('Wishlist not found');
  }
  
  let cart;
  if (wishlist.user) {
    cart = await Cart.findOrCreateForUser(wishlist.user);
  } else if (wishlist.sessionId) {
    cart = await Cart.findOrCreateForSession(wishlist.sessionId);
  } else {
    throw new Error('Cannot add to cart: no user or session');
  }
  
  await cart.addItem(
    this.product.toString(),
    this.variant?.toString() || null,
    quantity
  );
  
  return cart;
};

WishlistItemSchema.methods.checkAvailability = async function() {
  const Product = mongoose.model('Product');
  const ProductVariant = mongoose.model('ProductVariant');
  
  if (this.variant) {
    const variant = await ProductVariant.findById(this.variant);
    if (!variant || variant.status !== 'active') {
      return { available: false, reason: 'Variant not available' };
    }
    
    return { 
      available: variant.isInStock,
      reason: variant.isInStock ? null : 'Out of stock',
      stock: variant.inventoryQuantity
    };
  } else {
    const product = await Product.findById(this.product);
    if (!product || product.status !== 'active') {
      return { available: false, reason: 'Product not available' };
    }
    
    return { 
      available: product.isInStock,
      reason: product.isInStock ? null : 'Out of stock',
      stock: product.inventoryQuantity
    };
  }
};

WishlistItemSchema.methods.getDisplayInfo = async function() {
  const Product = mongoose.model('Product');
  const ProductVariant = mongoose.model('ProductVariant');
  
  const product = await Product.findById(this.product);
  if (!product) return null;
  
  let displayName = product.name;
  let image = product.images && product.images.length > 0 
    ? product.images.find(img => img.isMain)?.url || product.images[0].url
    : null;
  let price = product.finalPrice;
  let sku = product.sku;
  
  if (this.variant) {
    const variant = await ProductVariant.findById(this.variant);
    if (variant) {
      displayName += ` (${variant.displayName})`;
      image = variant.image || image;
      price = variant.finalPrice || price;
      sku = variant.sku;
    }
  }
  
  return {
    displayName,
    image,
    price,
    sku,
    slug: product.slug,
    priceWhenAdded: this.priceWhenAdded,
    priceChange: price - this.priceWhenAdded,
    priceChangePercentage: this.priceWhenAdded > 0 
      ? ((price - this.priceWhenAdded) / this.priceWhenAdded) * 100 
      : 0
  };
};

export default mongoose.models.WishlistItem || mongoose.model<IWishlistItem>('WishlistItem', WishlistItemSchema);