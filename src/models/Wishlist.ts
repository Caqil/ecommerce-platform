// src/models/Wishlist.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlist extends Document {
  _id: string;
  
  // Owner
  user?: string; // User ID (null for guest wishlists)
  sessionId?: string; // For guest wishlists
  
  // List info
  name: string;
  description?: string;
  
  // Privacy
  isPublic: boolean;
  shareToken?: string; // For sharing private wishlists
  
  // Status
  status: 'active' | 'archived';
  
  // Statistics
  itemCount: number;
  totalValue: number;
  
  // Timestamps
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  isGuest: boolean;
  isDefault: boolean;
}

const WishlistSchema = new Schema({
  // Owner
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  sessionId: {
    type: String,
    index: true,
  },
  
  // List info
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    default: 'My Wishlist',
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  
  // Privacy
  isPublic: {
    type: Boolean,
    default: false,
    index: true,
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active',
    index: true,
  },
  
  // Statistics
  itemCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalValue: {
    type: Number,
    default: 0,
    min: 0,
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
WishlistSchema.index({ user: 1, status: 1 });
WishlistSchema.index({ sessionId: 1, status: 1 });
WishlistSchema.index({ isPublic: 1, status: 1 });
WishlistSchema.index({ lastActivityAt: -1 });

// Ensure one default wishlist per user
WishlistSchema.index(
  { user: 1, name: 1 },
  { 
    unique: true,
    partialFilterExpression: { name: 'My Wishlist', status: 'active' }
  }
);

// Virtuals
WishlistSchema.virtual('isGuest').get(function(this: IWishlist) {
  return !this.user && !!this.sessionId;
});

WishlistSchema.virtual('isDefault').get(function(this: IWishlist) {
  return this.name === 'My Wishlist';
});

// Pre-save middleware
WishlistSchema.pre('save', function(this: IWishlist, next) {
  // Ensure either user or sessionId is provided
  if (!this.user && !this.sessionId) {
    return next(new Error('Wishlist must have either user or sessionId'));
  }
  
  // Generate share token if public and not set
  if (this.isPublic && !this.shareToken) {
    this.shareToken = Math.random().toString(36).substr(2, 15) + Math.random().toString(36).substr(2, 15);
  }
  
  // Clear share token if not public
  if (!this.isPublic) {
    this.shareToken = undefined;
  }
  
  // Update last activity
  this.lastActivityAt = new Date();
  
  next();
});

// Static methods
WishlistSchema.statics.findByUser = function(userId: string) {
  return this.find({ user: userId, status: 'active' }).sort({ createdAt: 1 });
};

WishlistSchema.statics.findBySession = function(sessionId: string) {
  return this.find({ sessionId, status: 'active' }).sort({ createdAt: 1 });
};

WishlistSchema.statics.findDefaultForUser = function(userId: string) {
  return this.findOne({ 
    user: userId, 
    name: 'My Wishlist',
    status: 'active'
  });
};

WishlistSchema.statics.findDefaultForSession = function(sessionId: string) {
  return this.findOne({ 
    sessionId, 
    name: 'My Wishlist',
    status: 'active'
  });
};

WishlistSchema.statics.findOrCreateDefaultForUser = async function(userId: string) {
  let wishlist = await this.findDefaultForUser(userId);
  if (!wishlist) {
    wishlist = new this({
      user: userId,
      name: 'My Wishlist'
    });
    await wishlist.save();
  }
  return wishlist;
};

WishlistSchema.statics.findOrCreateDefaultForSession = async function(sessionId: string) {
  let wishlist = await this.findDefaultForSession(sessionId);
  if (!wishlist) {
    wishlist = new this({
      sessionId,
      name: 'My Wishlist'
    });
    await wishlist.save();
  }
  return wishlist;
};

WishlistSchema.statics.findByShareToken = function(shareToken: string) {
  return this.findOne({
    shareToken,
    isPublic: true,
    status: 'active'
  });
};

WishlistSchema.statics.findPublic = function(limit: number = 10) {
  return this.find({
    isPublic: true,
    status: 'active',
    itemCount: { $gt: 0 }
  })
    .sort({ lastActivityAt: -1 })
    .limit(limit);
};

// Instance methods
WishlistSchema.methods.addItem = async function(productId: string, variantId?: string) {
  const WishlistItem = mongoose.model('WishlistItem');
  
  // Check if item already exists
  const existingItem = await WishlistItem.findOne({
    wishlist: this._id,
    product: productId,
    variant: variantId || null
  });
  
  if (existingItem) {
    return existingItem;
  }
  
  const newItem = new WishlistItem({
    wishlist: this._id,
    product: productId,
    variant: variantId
  });
  
  await newItem.save();
  await this.updateStats();
  
  return newItem;
};

WishlistSchema.methods.removeItem = async function(itemId: string) {
  const WishlistItem = mongoose.model('WishlistItem');
  await WishlistItem.findByIdAndDelete(itemId);
  await this.updateStats();
  return this;
};

WishlistSchema.methods.hasItem = async function(productId: string, variantId?: string) {
  const WishlistItem = mongoose.model('WishlistItem');
  const item = await WishlistItem.findOne({
    wishlist: this._id,
    product: productId,
    variant: variantId || null
  });
  return !!item;
};

WishlistSchema.methods.getItems = function() {
  const WishlistItem = mongoose.model('WishlistItem');
  return WishlistItem.find({ wishlist: this._id })
    .populate('product')
    .populate('variant')
    .sort({ addedAt: -1 });
};

WishlistSchema.methods.clear = async function() {
  const WishlistItem = mongoose.model('WishlistItem');
  await WishlistItem.deleteMany({ wishlist: this._id });
  await this.updateStats();
  return this;
};

WishlistSchema.methods.updateStats = async function() {
  const WishlistItem = mongoose.model('WishlistItem');
  
  const items = await WishlistItem.find({ wishlist: this._id })
    .populate('product')
    .populate('variant');
  
  this.itemCount = items.length;
  this.totalValue = items.reduce((sum, item) => {
    const price = item.variant?.finalPrice || item.product?.finalPrice || 0;
    return sum + price;
  }, 0);
  
  await this.save();
  return this;
};

WishlistSchema.methods.moveToCart = async function() {
  const Cart = mongoose.model('Cart');
  const WishlistItem = mongoose.model('WishlistItem');
  
  let cart;
  if (this.user) {
    cart = await Cart.findOrCreateForUser(this.user);
  } else if (this.sessionId) {
    cart = await Cart.findOrCreateForSession(this.sessionId);
  } else {
    throw new Error('Cannot move wishlist items to cart: no user or session');
  }
  
  const items = await this.getItems();
  const results = [];
  
  for (const item of items) {
    try {
      await cart.addItem(
        item.product._id.toString(),
        item.variant?._id.toString() || null,
        1
      );
      await item.remove();
      results.push({ success: true, item: item._id });
    } catch (error) {
      results.push({ success: false, item: item._id, error: error.message });
    }
  }
  
  await this.updateStats();
  return results;
};

WishlistSchema.methods.mergeWishlists = async function(otherWishlistId: string) {
  const WishlistItem = mongoose.model('WishlistItem');
  const otherItems = await WishlistItem.find({ wishlist: otherWishlistId });
  
  for (const item of otherItems) {
    await this.addItem(
      item.product.toString(),
      item.variant?.toString()
    );
  }
  
  // Delete the other wishlist
  await this.constructor.findByIdAndDelete(otherWishlistId);
  await WishlistItem.deleteMany({ wishlist: otherWishlistId });
  
  return this;
};

WishlistSchema.methods.makePublic = function() {
  this.isPublic = true;
  if (!this.shareToken) {
    this.shareToken = Math.random().toString(36).substr(2, 15) + Math.random().toString(36).substr(2, 15);
  }
  return this.save();
};

WishlistSchema.methods.makePrivate = function() {
  this.isPublic = false;
  this.shareToken = undefined;
  return this.save();
};

export default mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema);