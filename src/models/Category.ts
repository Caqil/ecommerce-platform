import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface for the Category document
export interface ICategory extends Document {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string;
  level: number;
  path: string[];
  image?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  status: 'active' | 'inactive';
  visibility: 'public' | 'private';
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  };
  productCount: number;
  featured: boolean;
  showOnHomepage: boolean;
  customFields: Array<{
    key: string;
    value: string;
    type: 'text' | 'number' | 'boolean' | 'date';
  }>;
  createdAt: Date;
  updatedAt: Date;
  fullPath: string;
  hasChildren: boolean;
  isRoot: boolean;
  getChildren: () => Promise<ICategory[]>;
  getDescendants: () => Promise<ICategory[]>;
  getAncestors: () => Promise<ICategory | null>;
  updateProductCount: () => Promise<ICategory>;
  isDescendantOf: (categoryId: string) => boolean;
  isAncestorOf: (categoryId: string) => boolean;
}

// Interface for static methods
interface ICategoryModel extends Model<ICategory> {
  findRoots: () => Promise<ICategory[]>;
  findChildren: (parentId: string) => Promise<ICategory[]>;
  findDescendants: (categoryId: string) => Promise<ICategory[]>;
  findAncestors: (categoryId: string) => Promise<ICategory | null>;
  buildHierarchy: (parentId: string | null) => Promise<any[]>;
  findFeatured: () => Promise<ICategory[]>;
  findForHomepage: () => Promise<ICategory[]>;
}

const SEOSchema = new Schema({
  metaTitle: { type: String, maxlength: 60 },
  metaDescription: { type: String, maxlength: 160 },
  metaKeywords: { type: String, maxlength: 255 },
}, { _id: false });

const CustomFieldSchema = new Schema({
  key: { type: String, required: true },
  value: { type: String, required: true },
  type: { type: String, enum: ['text', 'number', 'boolean', 'date'], default: 'text' },
}, { _id: false });

const CategorySchema = new Schema<ICategory, ICategoryModel>({
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
  description: { type: String, trim: true, index: 'text' },
  parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
  level: { type: Number, required: true, default: 0, min: 0, index: true },
  path: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  image: { type: String },
  icon: { type: String },
  color: { type: String, match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/ },
  sortOrder: { type: Number, default: 0, index: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
  visibility: { type: String, enum: ['public', 'private'], default: 'public', index: true },
  seo: SEOSchema,
  productCount: { type: Number, default: 0, min: 0, index: true },
  featured: { type: Boolean, default: false, index: true },
  showOnHomepage: { type: Boolean, default: false, index: true },
  customFields: [CustomFieldSchema],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
CategorySchema.index({ name: 'text', description: 'text' });
CategorySchema.index({ parent: 1, status: 1, sortOrder: 1 });
CategorySchema.index({ level: 1, status: 1 });
CategorySchema.index({ path: 1 });
CategorySchema.index({ featured: 1, status: 1 });
CategorySchema.index({ showOnHomepage: 1, status: 1 });
CategorySchema.index({ status: 1, visibility: 1, sortOrder: 1 });
CategorySchema.index({ parent: 1, status: 1, visibility: 1, sortOrder: 1 });

// Virtuals
CategorySchema.virtual('fullPath').get(function(this: ICategory) {
  return this.path.map(id => id.toString()).concat([this._id.toString()]).join('/');
});

CategorySchema.virtual('hasChildren').get(function(this: ICategory) {
  return false; // Will be populated by separate query
});

CategorySchema.virtual('isRoot').get(function(this: ICategory) {
  return this.level === 0 && !this.parent;
});

// Pre-save middleware
CategorySchema.pre('save', async function(this: ICategory, next) {
  try {
    if (this.isModified('parent')) {
      if (this.parent) {
        const parentCategory = await (this.constructor as ICategoryModel).findById(this.parent);
        if (!parentCategory) {
          throw new Error('Parent category not found');
        }
        if (parentCategory.path.includes(this._id)) {
          throw new Error('Circular reference detected');
        }
        this.level = parentCategory.level + 1;
        this.path = [...parentCategory.path, parentCategory._id];
      } else {
        this.level = 0;
        this.path = [];
      }
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Post-save middleware
CategorySchema.post('save', async function(this: ICategory) {
  if (this.isModified('path') || this.isModified('level')) {
    await (this.constructor as ICategoryModel).updateMany(
      { parent: this._id },
      {
        $set: {
          level: this.level + 1,
          path: [...this.path, this._id]
        }
      }
    );
  }
});

// Static methods
CategorySchema.statics.findRoots = function(this: ICategoryModel) {
  return this.find({ parent: null, status: 'active', visibility: 'public' })
    .sort({ sortOrder: 1, name: 1 });
};

CategorySchema.statics.findChildren = function(this: ICategoryModel, parentId: string) {
  return this.find({ parent: parentId, status: 'active', visibility: 'public' })
    .sort({ sortOrder: 1, name: 1 });
};

CategorySchema.statics.findDescendants = function(this: ICategoryModel, categoryId: string) {
  return this.find({ path: categoryId, status: 'active', visibility: 'public' })
    .sort({ level: 1, sortOrder: 1, name: 1 });
};

CategorySchema.statics.findAncestors = function(this: ICategoryModel, categoryId: string) {
  return this.findById(categoryId)
    .populate({
      path: 'path',
      select: 'name slug level',
      options: { sort: { level: 1 } }
    });
};

CategorySchema.statics.buildHierarchy = async function(this: ICategoryModel, parentId: string | null = null) {
  const categories = await this.find({ parent: parentId, status: 'active', visibility: 'public' })
    .sort({ sortOrder: 1, name: 1 });
  
  const result = [];
  for (const category of categories) {
    const children = await this.buildHierarchy(category._id);
    result.push({
      ...category.toObject(),
      children
    });
  }
  return result;
};

CategorySchema.statics.findFeatured = function(this: ICategoryModel) {
  return this.find({ featured: true, status: 'active', visibility: 'public' })
    .sort({ sortOrder: 1, name: 1 });
};

CategorySchema.statics.findForHomepage = function(this: ICategoryModel) {
  return this.find({ showOnHomepage: true, status: 'active', visibility: 'public' })
    .sort({ sortOrder: 1, name: 1 });
};

// Instance methods
CategorySchema.methods.getChildren = function(this: ICategory) {
  return (this.constructor as ICategoryModel).findChildren(this._id);
};

CategorySchema.methods.getDescendants = function(this: ICategory) {
  return (this.constructor as ICategoryModel).findDescendants(this._id);
};

CategorySchema.methods.getAncestors = function(this: ICategory) {
  return (this.constructor as ICategoryModel).findAncestors(this._id);
};

CategorySchema.methods.updateProductCount = async function(this: ICategory) {
  const Product = mongoose.model('Product');
  this.productCount = await Product.countDocuments({
    categories: this._id,
    status: 'active'
  });
  return this.save();
};

CategorySchema.methods.isDescendantOf = function(this: ICategory, categoryId: string) {
  return this.path.includes(categoryId);
};

CategorySchema.methods.isAncestorOf = function(this: ICategory, categoryId: string) {
  return false; // Would need to query the potential descendant
};

export default mongoose.models.Category || mongoose.model<ICategory, ICategoryModel>('Category', CategorySchema);