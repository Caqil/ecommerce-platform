
import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  sku: string;
  barcode?: string;
  status: 'active' | 'inactive' | 'draft' | 'archived';
  visibility: 'public' | 'private' | 'hidden';
  type: 'simple' | 'variable' | 'grouped' | 'external' | 'virtual' | 'downloadable';
  
  // Pricing
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  
  // Inventory
  trackInventory: boolean;
  inventoryQuantity: number;
  lowStockThreshold: number;
  allowBackorders: boolean;
  
  // Physical properties
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  
  // Categories and classification
  categories: string[]; // Category IDs
  brand?: string; // Brand ID
  tags: string[];
  
  // Media
  images: Array<{
    _id: string;
    url: string;
    alt: string;
    isMain: boolean;
    sortOrder: number;
  }>;
  
  // SEO
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    searchKeywords: string[];
  };
  
  // Attributes
  attributes: Array<{
    attributeId: string;
    values: string[]; // AttributeValue IDs
  }>;
  
  // Variants (for variable products)
  hasVariants: boolean;
  variantAttributes: string[]; // Attribute IDs used for variants
  
  // External product (affiliate)
  externalUrl?: string;
  externalButtonText?: string;
  
  // Virtual/Downloadable
  downloadable: boolean;
  virtual: boolean;
  downloadFiles: Array<{
    name: string;
    url: string;
    downloadLimit?: number;
    downloadExpiry?: number; // days
  }>;
  
  // Shipping
  requiresShipping: boolean;
  shippingClass?: string;
  
  // Reviews and ratings
  averageRating: number;
  ratingCount: number;
  reviewCount: number;
  
  // Sales data
  totalSales: number;
  viewCount: number;
  
  // Featured and promotional
  featured: boolean;
  onSale: boolean;
  saleStartDate?: Date;
  saleEndDate?: Date;
  
  // Related products
  relatedProducts: string[]; // Product IDs
  crossSellProducts: string[]; // Product IDs
  upSellProducts: string[]; // Product IDs
  
  // Vendor (for multi-vendor)
  vendor?: string; // User ID
  
  // Addons
  addons: Array<{
    name: string;
    price: number;
    required: boolean;
  }>;
  
  // Custom fields
  customFields: Array<{
    key: string;
    value: string;
    type: 'text' | 'number' | 'boolean' | 'date';
  }>;
  
  // Timestamps
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  isInStock: boolean;
  finalPrice: number;
  discountPercentage: number;
}

const ImageSchema = new Schema({
  url: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
  isMain: {
    type: Boolean,
    default: false,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, {
  _id: true,
});

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

const SEOSchema = new Schema({
  metaTitle: {
    type: String,
    maxlength: 60,
  },
  metaDescription: {
    type: String,
    maxlength: 160,
  },
  metaKeywords: {
    type: String,
    maxlength: 255,
  },
  searchKeywords: [{
    type: String,
    trim: true,
  }],
}, {
  _id: false,
});

const AttributeSchema = new Schema({
  attributeId: {
    type: Schema.Types.ObjectId,
    ref: 'Attribute',
    required: true,
  },
  values: [{
    type: Schema.Types.ObjectId,
    ref: 'AttributeValue',
  }],
}, {
  _id: false,
});

const DownloadFileSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  downloadLimit: {
    type: Number,
    min: -1, // -1 for unlimited
  },
  downloadExpiry: {
    type: Number,
    min: 0, // days
  },
}, {
  _id: false,
});

const AddonSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  required: {
    type: Boolean,
    default: false,
  },
}, {
  _id: false,
});

const CustomFieldSchema = new Schema({
  key: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'number', 'boolean', 'date'],
    default: 'text',
  },
}, {
  _id: false,
});

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255,
    index: 'text',
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
    index: 'text',
  },
  shortDescription: {
    type: String,
    maxlength: 500,
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
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'archived'],
    default: 'draft',
    index: true,
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'hidden'],
    default: 'public',
    index: true,
  },
  type: {
    type: String,
    enum: ['simple', 'variable', 'grouped', 'external', 'virtual', 'downloadable'],
    default: 'simple',
    index: true,
  },
  
  // Pricing
  price: {
    type: Number,
    required: true,
    min: 0,
    index: true,
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
  trackInventory: {
    type: Boolean,
    default: true,
  },
  inventoryQuantity: {
    type: Number,
    default: 0,
    min: 0,
    index: true,
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
    min: 0,
  },
  allowBackorders: {
    type: Boolean,
    default: false,
  },
  
  // Physical properties
  weight: {
    type: Number,
    min: 0,
  },
  dimensions: DimensionSchema,
  
  // Categories and classification
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category',
    index: true,
  }],
  brand: {
    type: Schema.Types.ObjectId,
    ref: 'Brand',
    index: true,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  
  // Media
  images: [ImageSchema],
  
  // SEO
  seo: SEOSchema,
  
  // Attributes
  attributes: [AttributeSchema],
  
  // Variants
  hasVariants: {
    type: Boolean,
    default: false,
    index: true,
  },
  variantAttributes: [{
    type: Schema.Types.ObjectId,
    ref: 'Attribute',
  }],
  
  // External product
  externalUrl: {
    type: String,
    trim: true,
  },
  externalButtonText: {
    type: String,
    default: 'Buy Now',
    trim: true,
  },
  
  // Virtual/Downloadable
  downloadable: {
    type: Boolean,
    default: false,
    index: true,
  },
  virtual: {
    type: Boolean,
    default: false,
    index: true,
  },
  downloadFiles: [DownloadFileSchema],
  
  // Shipping
  requiresShipping: {
    type: Boolean,
    default: true,
  },
  shippingClass: {
    type: String,
    trim: true,
  },
  
  // Reviews and ratings
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    index: true,
  },
  ratingCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Sales data
  totalSales: {
    type: Number,
    default: 0,
    min: 0,
    index: true,
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Featured and promotional
  featured: {
    type: Boolean,
    default: false,
    index: true,
  },
  onSale: {
    type: Boolean,
    default: false,
    index: true,
  },
  saleStartDate: {
    type: Date,
  },
  saleEndDate: {
    type: Date,
  },
  
  // Related products
  relatedProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
  }],
  crossSellProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
  }],
  upSellProducts: [{
    type: Schema.Types.ObjectId,
    ref: 'Product',
  }],
  
  // Vendor
  vendor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  
  // Addons
  addons: [AddonSchema],
  
  // Custom fields
  customFields: [CustomFieldSchema],
  
  // Publishing
  publishedAt: {
    type: Date,
    index: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
ProductSchema.index({ name: 'text', description: 'text', 'seo.searchKeywords': 'text' });
ProductSchema.index({ status: 1, visibility: 1 });
ProductSchema.index({ categories: 1, status: 1 });
ProductSchema.index({ brand: 1, status: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ featured: 1, status: 1 });
ProductSchema.index({ onSale: 1, status: 1 });
ProductSchema.index({ totalSales: -1 });
ProductSchema.index({ averageRating: -1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ publishedAt: -1 });
ProductSchema.index({ vendor: 1, status: 1 });

// Compound indexes
ProductSchema.index({ status: 1, visibility: 1, publishedAt: -1 });
ProductSchema.index({ categories: 1, status: 1, featured: -1 });

// Virtuals
ProductSchema.virtual('isInStock').get(function(this: IProduct) {
  if (!this.trackInventory) return true;
  return this.inventoryQuantity > 0 || this.allowBackorders;
});

ProductSchema.virtual('finalPrice').get(function(this: IProduct) {
  if (this.onSale && this.compareAtPrice && this.compareAtPrice > this.price) {
    return this.price;
  }
  return this.compareAtPrice || this.price;
});

ProductSchema.virtual('discountPercentage').get(function(this: IProduct) {
  if (!this.compareAtPrice || this.compareAtPrice <= this.price) return 0;
  return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
});

// Pre-save middleware
ProductSchema.pre('save', function(this: IProduct, next) {
  // Set publishedAt when status changes to active
  if (this.isModified('status') && this.status === 'active' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Ensure main image
  if (this.images && this.images.length > 0) {
    const hasMain = this.images.some(img => img.isMain);
    if (!hasMain) {
      this.images[0].isMain = true;
    }
  }
  
  // Auto-set virtual and downloadable flags
  if (this.type === 'virtual') {
    this.virtual = true;
    this.requiresShipping = false;
  }
  
  if (this.type === 'downloadable') {
    this.downloadable = true;
  }
  
  next();
});

// Static methods
ProductSchema.statics.findPublished = function() {
  return this.find({
    status: 'active',
    visibility: 'public',
    publishedAt: { $lte: new Date() }
  });
};

ProductSchema.statics.findFeatured = function() {
  return this.find({
    status: 'active',
    visibility: 'public',
    featured: true,
    publishedAt: { $lte: new Date() }
  });
};

ProductSchema.statics.findOnSale = function() {
  return this.find({
    status: 'active',
    visibility: 'public',
    onSale: true,
    publishedAt: { $lte: new Date() }
  });
};

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);