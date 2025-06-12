// src/models/Brand.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IBrand extends Document {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  
  // Media
  logo?: string;
  banner?: string;
  
  // Contact info
  website?: string;
  email?: string;
  phone?: string;
  
  // Address
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  
  // Social media
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  
  // Status
  status: 'active' | 'inactive';
  featured: boolean;
  
  // SEO
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  };
  
  // Statistics
  productCount: number;
  totalSales: number;
  averageRating: number;
  
  // Display
  sortOrder: number;
  
  // Custom fields
  customFields: Array<{
    key: string;
    value: string;
    type: 'text' | 'number' | 'boolean' | 'date';
  }>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema({
  street: {
    type: String,
    required: true,
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
}, {
  _id: false,
});

const SocialMediaSchema = new Schema({
  facebook: {
    type: String,
    trim: true,
  },
  twitter: {
    type: String,
    trim: true,
  },
  instagram: {
    type: String,
    trim: true,
  },
  linkedin: {
    type: String,
    trim: true,
  },
  youtube: {
    type: String,
    trim: true,
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

const BrandSchema = new Schema({
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
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
    index: 'text',
  },
  
  // Media
  logo: {
    type: String,
  },
  banner: {
    type: String,
  },
  
  // Contact info
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true;
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Website must be a valid URL'
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  phone: {
    type: String,
    trim: true,
  },
  
  // Address
  address: AddressSchema,
  
  // Social media
  socialMedia: SocialMediaSchema,
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true,
  },
  featured: {
    type: Boolean,
    default: false,
    index: true,
  },
  
  // SEO
  seo: SEOSchema,
  
  // Statistics
  productCount: {
    type: Number,
    default: 0,
    min: 0,
    index: true,
  },
  totalSales: {
    type: Number,
    default: 0,
    min: 0,
    index: true,
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    index: true,
  },
  
  // Display
  sortOrder: {
    type: Number,
    default: 0,
    index: true,
  },
  
  // Custom fields
  customFields: [CustomFieldSchema],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
BrandSchema.index({ name: 'text', description: 'text' });
BrandSchema.index({ status: 1, featured: 1 });
BrandSchema.index({ status: 1, sortOrder: 1 });
BrandSchema.index({ totalSales: -1 });
BrandSchema.index({ averageRating: -1 });
BrandSchema.index({ productCount: -1 });

// Static methods
BrandSchema.statics.findActive = function() {
  return this.find({ status: 'active' }).sort({ sortOrder: 1, name: 1 });
};

BrandSchema.statics.findFeatured = function() {
  return this.find({
    status: 'active',
    featured: true
  }).sort({ sortOrder: 1, name: 1 });
};

BrandSchema.statics.findPopular = function(limit: number = 10) {
  return this.find({ status: 'active' })
    .sort({ totalSales: -1, productCount: -1 })
    .limit(limit);
};

BrandSchema.statics.findTopRated = function(limit: number = 10) {
  return this.find({
    status: 'active',
    averageRating: { $gte: 4 }
  })
    .sort({ averageRating: -1, totalSales: -1 })
    .limit(limit);
};

// Instance methods
BrandSchema.methods.updateStats = async function() {
  const Product = mongoose.model('Product');
  
  // Update product count
  this.productCount = await Product.countDocuments({
    brand: this._id,
    status: 'active'
  });
  
  // Update total sales
  const salesResult = await Product.aggregate([
    { $match: { brand: this._id, status: 'active' } },
    { $group: { _id: null, totalSales: { $sum: '$totalSales' } } }
  ]);
  this.totalSales = salesResult.length > 0 ? salesResult[0].totalSales : 0;
  
  // Update average rating
  const ratingResult = await Product.aggregate([
    { $match: { brand: this._id, status: 'active', averageRating: { $gt: 0 } } },
    { $group: { _id: null, avgRating: { $avg: '$averageRating' } } }
  ]);
  this.averageRating = ratingResult.length > 0 ? Math.round(ratingResult[0].avgRating * 10) / 10 : 0;
  
  return this.save();
};

BrandSchema.methods.getProducts = function(options: any = {}) {
  const Product = mongoose.model('Product');
  return Product.find({
    brand: this._id,
    status: 'active',
    ...options
  });
};

BrandSchema.methods.getTopProducts = function(limit: number = 10) {
  const Product = mongoose.model('Product');
  return Product.find({
    brand: this._id,
    status: 'active'
  })
    .sort({ totalSales: -1, averageRating: -1 })
    .limit(limit);
};

export default mongoose.models.Brand || mongoose.model<IBrand>('Brand', BrandSchema);