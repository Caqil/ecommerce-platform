
import mongoose, { Document, Schema } from 'mongoose';

export interface IProductVariant extends Document {
  _id: string;
  product: string; // Product ID
  sku: string;
  barcode?: string;
  
  // Variant attributes (e.g., Size: Large, Color: Red)
  attributes: Array<{
    attributeId: string; // Attribute ID
    valueId: string; // AttributeValue ID
    name: string; // Attribute name (for quick access)
    value: string; // Value name (for quick access)
  }>;
  
  // Pricing
  price?: number; // If not set, uses parent product price
  compareAtPrice?: number;
  costPrice?: number;
  
  // Inventory
  inventoryQuantity: number;
  lowStockThreshold?: number; // If not set, uses parent product threshold
  allowBackorders?: boolean; // If not set, uses parent product setting
  
  // Physical properties
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  
  // Media
  image?: string; // Main variant image
  images: Array<{
    _id: string;
    url: string;
    alt: string;
    sortOrder: number;
  }>;
  
  // Status
  status: 'active' | 'inactive';
  
  // Sales data
  totalSales: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  isInStock: boolean;
  finalPrice: number;
  discountPercentage: number;
  displayName: string;
}

const VariantAttributeSchema = new Schema({
  attributeId: {
    type: Schema.Types.ObjectId,
    ref: 'Attribute',
    required: true,
  },
  valueId: {
    type: Schema.Types.ObjectId,
    ref: 'AttributeValue',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  value: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  _id: false,
});

const VariantImageSchema = new Schema({
  url: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, {
  _id: true,
});

const VariantDimensionSchema = new Schema({
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

const ProductVariantSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
  },
  barcode: {
    type: String,
    trim: true,
    sparse: true,
    index: true,
  },
  
  // Variant attributes
  attributes: {
    type: [VariantAttributeSchema],
    required: true,
    validate: {
      validator: function(attrs: any[]) {
        return attrs && attrs.length > 0;
      },
      message: 'Variant must have at least one attribute'
    }
  },
  
  // Pricing
  price: {
    type: Number,
    min: 0,
  },
  compareAtPrice: {
    type: Number,
    min: 0,
  },
  costPrice: {
    type: Number,
    min: 0,
  },
  
  // Inventory
  inventoryQuantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    index: true,
  },
  lowStockThreshold: {
    type: Number,
    min: 0,
  },
  allowBackorders: {
    type: Boolean,
  },
  
  // Physical properties
  weight: {
    type: Number,
    min: 0,
  },
  dimensions: VariantDimensionSchema,
  
  // Media
  image: {
    type: String,
  },
  images: [VariantImageSchema],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true,
  },
  
  // Sales data
  totalSales: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
ProductVariantSchema.index({ product: 1, status: 1 });
ProductVariantSchema.index({ 'attributes.attributeId': 1, 'attributes.valueId': 1 });
ProductVariantSchema.index({ inventoryQuantity: 1 });
ProductVariantSchema.index({ totalSales: -1 });

// Compound indexes
ProductVariantSchema.index({ product: 1, 'attributes.attributeId': 1, 'attributes.valueId': 1 });

// Virtuals
ProductVariantSchema.virtual('isInStock').get(function(this: IProductVariant) {
  return this.inventoryQuantity > 0;
});

ProductVariantSchema.virtual('finalPrice').get(function(this: IProductVariant) {
  if (!this.price) return 0; // Will need to get from parent product
  
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return this.price;
  }
  return this.compareAtPrice || this.price;
});

ProductVariantSchema.virtual('discountPercentage').get(function(this: IProductVariant) {
  if (!this.price || !this.compareAtPrice || this.compareAtPrice <= this.price) return 0;
  return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
});

ProductVariantSchema.virtual('displayName').get(function(this: IProductVariant) {
  return this.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ');
});

// Pre-save middleware
ProductVariantSchema.pre('save', function(this: IProductVariant, next) {
  // Ensure attributes are sorted consistently
  if (this.attributes && this.attributes.length > 1) {
    this.attributes.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  next();
});

// Static methods
ProductVariantSchema.statics.findByProduct = function(productId: string) {
  return this.find({ product: productId, status: 'active' });
};

ProductVariantSchema.statics.findByAttributes = function(productId: string, attributes: Array<{attributeId: string, valueId: string}>) {
  return this.findOne({
    product: productId,
    status: 'active',
    $and: attributes.map(attr => ({
      'attributes': {
        $elemMatch: {
          attributeId: attr.attributeId,
          valueId: attr.valueId
        }
      }
    }))
  });
};

ProductVariantSchema.statics.findInStock = function(productId?: string) {
  const query: any = { 
    status: 'active',
    inventoryQuantity: { $gt: 0 }
  };
  
  if (productId) {
    query.product = productId;
  }
  
  return this.find(query);
};

// Instance methods
ProductVariantSchema.methods.updateInventory = function(quantity: number, operation: 'add' | 'subtract' = 'subtract') {
  if (operation === 'subtract') {
    this.inventoryQuantity = Math.max(0, this.inventoryQuantity - quantity);
  } else {
    this.inventoryQuantity += quantity;
  }
  return this.save();
};

ProductVariantSchema.methods.isLowStock = function() {
  const threshold = this.lowStockThreshold || 5; // Default threshold
  return this.inventoryQuantity <= threshold;
};

export default mongoose.models.ProductVariant || mongoose.model<IProductVariant>('ProductVariant', ProductVariantSchema);