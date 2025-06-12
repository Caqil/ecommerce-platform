// src/models/Review.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  _id: string;
  
  // Review target
  product: string; // Product ID
  variant?: string; // ProductVariant ID (optional)
  order?: string; // Order ID (for verified purchases)
  orderItem?: string; // OrderItem ID
  
  // Reviewer
  customer?: string; // User ID (null for guest reviews)
  customerInfo: {
    name: string;
    email?: string;
    isVerifiedPurchase: boolean;
  };
  
  // Review content
  rating: number; // 1-5 stars
  title: string;
  content: string;
  
  // Media
  images: Array<{
    _id: string;
    url: string;
    alt: string;
    caption?: string;
  }>;
  
  // Status and moderation
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  moderationNotes?: string;
  moderatedBy?: string; // Admin user ID
  moderatedAt?: Date;
  
  // Helpful votes
  helpfulVotes: number;
  notHelpfulVotes: number;
  
  // Responses
  response?: {
    content: string;
    author: string; // Admin or vendor user ID
    authorName: string;
    createdAt: Date;
  };
  
  // Additional info
  pros: string[];
  cons: string[];
  
  // Metadata
  ipAddress?: string;
  userAgent?: string;
  
  // Features rated (optional detailed ratings)
  featureRatings: Array<{
    feature: string;
    rating: number;
  }>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  isGuest: boolean;
  canEdit: boolean;
  overallHelpfulness: number;
}

const CustomerInfoSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  _id: false,
});

const ReviewImageSchema = new Schema({
  url: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
  caption: {
    type: String,
    trim: true,
  },
}, {
  _id: true,
});

const ResponseSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  authorName: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  _id: false,
});

const FeatureRatingSchema = new Schema({
  feature: {
    type: String,
    required: true,
    trim: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
}, {
  _id: false,
});

const ReviewSchema = new Schema({
  // Review target
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
  order: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    index: true,
  },
  orderItem: {
    type: Schema.Types.ObjectId,
    ref: 'OrderItem',
    index: true,
  },
  
  // Reviewer
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  customerInfo: {
    type: CustomerInfoSchema,
    required: true,
  },
  
  // Review content
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
    index: 'text',
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000,
    index: 'text',
  },
  
  // Media
  images: [ReviewImageSchema],
  
  // Status and moderation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'spam'],
    default: 'pending',
    index: true,
  },
  moderationNotes: {
    type: String,
    trim: true,
  },
  moderatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  moderatedAt: {
    type: Date,
    index: true,
  },
  
  // Helpful votes
  helpfulVotes: {
    type: Number,
    default: 0,
    min: 0,
    index: true,
  },
  notHelpfulVotes: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Response
  response: ResponseSchema,
  
  // Additional info
  pros: [{
    type: String,
    trim: true,
    maxlength: 200,
  }],
  cons: [{
    type: String,
    trim: true,
    maxlength: 200,
  }],
  
  // Metadata
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  
  // Feature ratings
  featureRatings: [FeatureRatingSchema],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
ReviewSchema.index({ product: 1, status: 1, createdAt: -1 });
ReviewSchema.index({ customer: 1, createdAt: -1 });
ReviewSchema.index({ rating: 1, status: 1 });
ReviewSchema.index({ 'customerInfo.isVerifiedPurchase': 1, status: 1 });
ReviewSchema.index({ helpfulVotes: -1, status: 1 });
ReviewSchema.index({ title: 'text', content: 'text' });

// Compound indexes
ReviewSchema.index({ product: 1, variant: 1, customer: 1 }, { unique: true, sparse: true });
ReviewSchema.index({ status: 1, createdAt: -1 });

// Virtuals
ReviewSchema.virtual('isGuest').get(function(this: IReview) {
  return !this.customer;
});

ReviewSchema.virtual('canEdit').get(function(this: IReview) {
  return this.status === 'pending';
});

ReviewSchema.virtual('overallHelpfulness').get(function(this: IReview) {
  const total = this.helpfulVotes + this.notHelpfulVotes;
  return total > 0 ? (this.helpfulVotes / total) * 100 : 0;
});

// Pre-save middleware
ReviewSchema.pre('save', function(this: IReview, next) {
  // Set moderation date when status changes
  if (this.isModified('status') && this.status !== 'pending') {
    this.moderatedAt = new Date();
  }
  
  next();
});

// Post-save middleware to update product rating
ReviewSchema.post('save', async function(this: IReview) {
  if (this.status === 'approved') {
    await this.updateProductRating();
  }
});

ReviewSchema.post('remove', async function(this: IReview) {
  await this.updateProductRating();
});

// Static methods
ReviewSchema.statics.findByProduct = function(productId: string, options: any = {}) {
  const query: any = { 
    product: productId,
    status: 'approved'
  };
  
  if (options.variant) {
    query.variant = options.variant;
  }
  
  return this.find(query).sort({ createdAt: -1 });
};

ReviewSchema.statics.findByCustomer = function(customerId: string) {
  return this.find({ customer: customerId }).sort({ createdAt: -1 });
};

ReviewSchema.statics.findPending = function() {
  return this.find({ status: 'pending' }).sort({ createdAt: 1 });
};

ReviewSchema.statics.findFeatured = function(productId?: string, limit: number = 5) {
  const query: any = {
    status: 'approved',
    helpfulVotes: { $gte: 3 }
  };
  
  if (productId) {
    query.product = productId;
  }
  
  return this.find(query)
    .sort({ helpfulVotes: -1, rating: -1 })
    .limit(limit);
};

ReviewSchema.statics.getProductStats = async function(productId: string) {
  const stats = await this.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    },
    {
      $addFields: {
        ratingCounts: {
          5: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 5] } } } },
          4: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 4] } } } },
          3: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 3] } } } },
          2: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 2] } } } },
          1: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 1] } } } }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalReviews: 0,
    averageRating: 0,
    ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  };
};

// Instance methods
ReviewSchema.methods.approve = function(moderatorId: string) {
  this.status = 'approved';
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  return this.save();
};

ReviewSchema.methods.reject = function(moderatorId: string, reason?: string) {
  this.status = 'rejected';
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  if (reason) {
    this.moderationNotes = reason;
  }
  return this.save();
};

ReviewSchema.methods.markAsSpam = function(moderatorId: string) {
  this.status = 'spam';
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  return this.save();
};

ReviewSchema.methods.addResponse = function(content: string, authorId: string, authorName: string) {
  this.response = {
    content,
    author: authorId,
    authorName,
    createdAt: new Date()
  };
  return this.save();
};

ReviewSchema.methods.voteHelpful = function(helpful: boolean = true) {
  if (helpful) {
    this.helpfulVotes += 1;
  } else {
    this.notHelpfulVotes += 1;
  }
  return this.save();
};

ReviewSchema.methods.updateProductRating = async function() {
  const Product = mongoose.model('Product');
  const stats = await this.constructor.getProductStats(this.product);
  
  await Product.findByIdAndUpdate(this.product, {
    averageRating: Math.round(stats.averageRating * 10) / 10,
    reviewCount: stats.totalReviews,
    ratingCount: stats.totalReviews
  });
};

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);