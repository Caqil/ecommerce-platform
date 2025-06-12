// src/models/CartItem.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem extends Document {
  _id: string;
  cart: string; // Cart ID
  product: string; // Product ID
  variant?: string; // ProductVariant ID (optional)
  
  // Quantity and pricing
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  
  // Product snapshot (to preserve data if product changes)
  productSnapshot: {
    name: string;
    slug: string;
    sku: string;
    image?: string;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
      unit: 'cm' | 'in';
    };
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
  
  // Customizations or addons
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
  
  // Notes
  notes?: string;
  
  // Timestamps
  addedAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  displayName: string;
  finalUnitPrice: number;
  finalTotalPrice: number;
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

const CartItemSchema = new Schema({
  cart: {
    type: Schema.Types.ObjectId,
    ref: 'Cart',
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
    default: 1,
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
  
  // Notes
  notes: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  
  addedAt: {
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
CartItemSchema.index({ cart: 1, product: 1, variant: 1 });
CartItemSchema.index({ addedAt: -1 });

// Unique constraint for cart + product + variant combination
CartItemSchema.index(
  { cart: 1, product: 1, variant: 1 },
  { 
    unique: true,
    partialFilterExpression: { variant: { $type: 'objectId' } }
  }
);
CartItemSchema.index(
  { cart: 1, product: 1 },
  { 
    unique: true,
    partialFilterExpression: { variant: { $type: 'null' } }
  }
);

// Virtuals
CartItemSchema.virtual('displayName').get(function(this: ICartItem) {
  if (this.variantSnapshot && this.variantSnapshot.attributes.length > 0) {
    const variantInfo = this.variantSnapshot.attributes
      .map(attr => `${attr.name}: ${attr.value}`)
      .join(', ');
    return `${this.productSnapshot.name} (${variantInfo})`;
  }
  return this.productSnapshot.name;
});

CartItemSchema.virtual('finalUnitPrice').get(function(this: ICartItem) {
  let price = this.unitPrice;
  
  // Add customization costs
  if (this.customizations && this.customizations.length > 0) {
    price += this.customizations.reduce((sum, custom) => sum + custom.price, 0);
  }
  
  // Add gift wrap cost
  if (this.giftWrap && this.giftWrap.enabled) {
    price += this.giftWrap.price;
  }
  
  return price;
});

CartItemSchema.virtual('finalTotalPrice').get(function(this: ICartItem) {
  return this.finalUnitPrice * this.quantity;
});

// Pre-save middleware
CartItemSchema.pre('save', async function(this: ICartItem, next) {
  try {
    // If this is a new item or product/variant changed, create snapshots
    if (this.isNew || this.isModified('product') || this.isModified('variant')) {
      await this.createSnapshots();
    }
    
    // Calculate prices
    await this.calculatePrices();
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance methods
CartItemSchema.methods.createSnapshots = async function() {
  const Product = mongoose.model('Product');
  const ProductVariant = mongoose.model('ProductVariant');
  
  // Get product data
  const product = await Product.findById(this.product);
  if (!product) {
    throw new Error('Product not found');
  }
  
  // Create product snapshot
  this.productSnapshot = {
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    image: product.images && product.images.length > 0 
      ? product.images.find(img => img.isMain)?.url || product.images[0].url
      : undefined,
    weight: product.weight,
    dimensions: product.dimensions
  };
  
  // Create variant snapshot if variant exists
  if (this.variant) {
    const variant = await ProductVariant.findById(this.variant);
    if (!variant) {
      throw new Error('Product variant not found');
    }
    
    this.variantSnapshot = {
      sku: variant.sku,
      attributes: variant.attributes.map(attr => ({
        name: attr.name,
        value: attr.value
      })),
      image: variant.image,
      weight: variant.weight,
      dimensions: variant.dimensions
    };
  }
};

CartItemSchema.methods.calculatePrices = async function() {
  const Product = mongoose.model('Product');
  const ProductVariant = mongoose.model('ProductVariant');
  
  // Get current price
  let basePrice = 0;
  
  if (this.variant) {
    const variant = await ProductVariant.findById(this.variant);
    basePrice = variant?.price || 0;
    
    // If variant doesn't have price, use product price
    if (!basePrice) {
      const product = await Product.findById(this.product);
      basePrice = product?.finalPrice || 0;
    }
  } else {
    const product = await Product.findById(this.product);
    basePrice = product?.finalPrice || 0;
  }
  
  this.unitPrice = basePrice;
  
  // Calculate total price (base + customizations + gift wrap) * quantity
  let totalCustomizationPrice = 0;
  if (this.customizations && this.customizations.length > 0) {
    totalCustomizationPrice = this.customizations.reduce((sum, custom) => sum + custom.price, 0);
  }
  
  let giftWrapPrice = 0;
  if (this.giftWrap && this.giftWrap.enabled) {
    giftWrapPrice = this.giftWrap.price;
  }
  
  this.totalPrice = (basePrice + totalCustomizationPrice + giftWrapPrice) * this.quantity;
};

CartItemSchema.methods.updateQuantity = async function(newQuantity: number) {
  this.quantity = Math.max(1, newQuantity);
  await this.calculatePrices();
  return this.save();
};

CartItemSchema.methods.addCustomization = function(name: string, value: string, price: number) {
  this.customizations.push({ name, value, price });
  return this.calculatePrices();
};

CartItemSchema.methods.removeCustomization = function(index: number) {
  if (index >= 0 && index < this.customizations.length) {
    this.customizations.splice(index, 1);
    return this.calculatePrices();
  }
};

CartItemSchema.methods.setGiftWrap = function(enabled: boolean, message?: string, price: number = 0) {
  this.giftWrap = {
    enabled,
    message: message || '',
    price
  };
  return this.calculatePrices();
};

CartItemSchema.methods.checkAvailability = async function() {
  const Product = mongoose.model('Product');
  const ProductVariant = mongoose.model('ProductVariant');
  
  if (this.variant) {
    const variant = await ProductVariant.findById(this.variant);
    if (!variant || variant.status !== 'active') {
      return { available: false, reason: 'Variant not available' };
    }
    
    if (variant.inventoryQuantity < this.quantity) {
      return { 
        available: false, 
        reason: 'Insufficient stock',
        availableQuantity: variant.inventoryQuantity
      };
    }
  } else {
    const product = await Product.findById(this.product);
    if (!product || product.status !== 'active') {
      return { available: false, reason: 'Product not available' };
    }
    
    if (product.trackInventory && product.inventoryQuantity < this.quantity) {
      return { 
        available: false, 
        reason: 'Insufficient stock',
        availableQuantity: product.inventoryQuantity
      };
    }
  }
  
  return { available: true };
};

// Static methods
CartItemSchema.statics.findByCart = function(cartId: string) {
  return this.find({ cart: cartId })
    .populate('product')
    .populate('variant')
    .sort({ addedAt: 1 });
};

export default mongoose.models.CartItem || mongoose.model<ICartItem>('CartItem', CartItemSchema);