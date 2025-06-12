// src/models/AttributeValue.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IAttributeValue extends Document {
  _id: string;
  attribute: string; // Attribute ID
  name: string;
  slug: string;
  description?: string;
  
  // Value data
  value: string; // The actual value
  displayValue?: string; // How to display the value (e.g., for colors: "Red (#FF0000)")
  
  // Additional data for different types
  colorCode?: string; // For color attributes
  image?: string; // For image attributes
  
  // Display
  sortOrder: number;
  
  // Status
  status: 'active' | 'inactive';
  
  // Usage statistics
  productCount: number; // How many products use this value
  variantCount: number; // How many variants use this value
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const AttributeValueSchema = new Schema({
  attribute: {
    type: Schema.Types.ObjectId,
    ref: 'Attribute',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: 'text',
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  
  // Value data
  value: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  displayValue: {
    type: String,
    trim: true,
  },
  
  // Additional data
  colorCode: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true;
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: 'Color code must be a valid hex color'
    }
  },
  image: {
    type: String,
  },
  
  // Display
  sortOrder: {
    type: Number,
    default: 0,
    index: true,
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true,
  },
  
  // Usage statistics
  productCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  variantCount: {
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
AttributeValueSchema.index({ attribute: 1, status: 1, sortOrder: 1 });
AttributeValueSchema.index({ attribute: 1, slug: 1 }, { unique: true });
AttributeValueSchema.index({ name: 'text' });
AttributeValueSchema.index({ productCount: -1 });
AttributeValueSchema.index({ variantCount: -1 });

// Compound indexes
AttributeValueSchema.index({ attribute: 1, status: 1, productCount: -1 });

// Pre-save middleware
AttributeValueSchema.pre('save', function(this: IAttributeValue, next) {
  // Auto-generate displayValue if not provided
  if (!this.displayValue) {
    if (this.colorCode) {
      this.displayValue = `${this.name} (${this.colorCode})`;
    } else {
      this.displayValue = this.name;
    }
  }
  
  next();
});

// Static methods
AttributeValueSchema.statics.findByAttribute = function(attributeId: string) {
  return this.find({
    attribute: attributeId,
    status: 'active'
  }).sort({ sortOrder: 1, name: 1 });
};

AttributeValueSchema.statics.findActive = function() {
  return this.find({ status: 'active' }).sort({ sortOrder: 1, name: 1 });
};

AttributeValueSchema.statics.findPopular = function(attributeId?: string, limit: number = 10) {
  const query: any = { status: 'active' };
  if (attributeId) {
    query.attribute = attributeId;
  }
  
  return this.find(query)
    .sort({ productCount: -1, variantCount: -1 })
    .limit(limit);
};

AttributeValueSchema.statics.searchValues = function(attributeId: string, searchTerm: string) {
  return this.find({
    attribute: attributeId,
    status: 'active',
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { value: { $regex: searchTerm, $options: 'i' } },
      { displayValue: { $regex: searchTerm, $options: 'i' } }
    ]
  }).sort({ productCount: -1, name: 1 });
};

// Instance methods
AttributeValueSchema.methods.updateStats = async function() {
  const Product = mongoose.model('Product');
  const ProductVariant = mongoose.model('ProductVariant');
  
  // Update product count
  this.productCount = await Product.countDocuments({
    'attributes.values': this._id,
    status: 'active'
  });
  
  // Update variant count
  this.variantCount = await ProductVariant.countDocuments({
    'attributes.valueId': this._id,
    status: 'active'
  });
  
  return this.save();
};

AttributeValueSchema.methods.getProducts = function() {
  const Product = mongoose.model('Product');
  return Product.find({
    'attributes.values': this._id,
    status: 'active'
  });
};

AttributeValueSchema.methods.getVariants = function() {
  const ProductVariant = mongoose.model('ProductVariant');
  return ProductVariant.find({
    'attributes.valueId': this._id,
    status: 'active'
  });
};

export default mongoose.models.AttributeValue || mongoose.model<IAttributeValue>('AttributeValue', AttributeValueSchema);