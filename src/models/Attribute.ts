// src/models/Attribute.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IAttribute extends Document {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  
  // Type and behavior
  type: 'select' | 'multiselect' | 'text' | 'number' | 'boolean' | 'color' | 'image';
  inputType: 'dropdown' | 'radio' | 'checkbox' | 'text' | 'number' | 'color' | 'image';
  
  // Validation
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  
  // Display options
  showOnProductPage: boolean;
  showInFilters: boolean;
  showInComparison: boolean;
  showInSearch: boolean;
  
  // Usage
  usedForVariants: boolean; // Can be used to create product variants
  global: boolean; // Available for all products vs category-specific
  
  // Categories (if not global)
  categories: string[]; // Category IDs
  
  // Display
  sortOrder: number;
  
  // Status
  status: 'active' | 'inactive';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  valueCount: number;
}

const ValidationSchema = new Schema({
  min: {
    type: Number,
  },
  max: {
    type: Number,
  },
  pattern: {
    type: String,
  },
  message: {
    type: String,
  },
}, {
  _id: false,
});

const AttributeSchema = new Schema({
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
  },
  
  // Type and behavior
  type: {
    type: String,
    enum: ['select', 'multiselect', 'text', 'number', 'boolean', 'color', 'image'],
    required: true,
    index: true,
  },
  inputType: {
    type: String,
    enum: ['dropdown', 'radio', 'checkbox', 'text', 'number', 'color', 'image'],
    required: true,
  },
  
  // Validation
  required: {
    type: Boolean,
    default: false,
  },
  validation: ValidationSchema,
  
  // Display options
  showOnProductPage: {
    type: Boolean,
    default: true,
  },
  showInFilters: {
    type: Boolean,
    default: true,
    index: true,
  },
  showInComparison: {
    type: Boolean,
    default: false,
  },
  showInSearch: {
    type: Boolean,
    default: false,
    index: true,
  },
  
  // Usage
  usedForVariants: {
    type: Boolean,
    default: false,
    index: true,
  },
  global: {
    type: Boolean,
    default: true,
    index: true,
  },
  
  // Categories
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category',
    index: true,
  }],
  
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
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
AttributeSchema.index({ name: 'text' });
AttributeSchema.index({ status: 1, sortOrder: 1 });
AttributeSchema.index({ type: 1, status: 1 });
AttributeSchema.index({ usedForVariants: 1, status: 1 });
AttributeSchema.index({ global: 1, status: 1 });
AttributeSchema.index({ categories: 1, status: 1 });

// Virtuals
AttributeSchema.virtual('valueCount').get(function(this: IAttribute) {
  // This will be populated by separate query
  return 0;
});

// Pre-save validation
AttributeSchema.pre('save', function(this: IAttribute, next) {
  // Validate input type based on attribute type
  const validInputTypes: Record<string, string[]> = {
    select: ['dropdown', 'radio'],
    multiselect: ['checkbox'],
    text: ['text'],
    number: ['number'],
    boolean: ['checkbox'],
    color: ['color'],
    image: ['image']
  };
  
  if (!validInputTypes[this.type]?.includes(this.inputType)) {
    return next(new Error(`Invalid input type '${this.inputType}' for attribute type '${this.type}'`));
  }
  
  // If not global, must have categories
  if (!this.global && (!this.categories || this.categories.length === 0)) {
    return next(new Error('Non-global attributes must be assigned to at least one category'));
  }
  
  // If global, clear categories
  if (this.global) {
    this.categories = [];
  }
  
  next();
});

// Static methods
AttributeSchema.statics.findActive = function() {
  return this.find({ status: 'active' }).sort({ sortOrder: 1, name: 1 });
};

AttributeSchema.statics.findGlobal = function() {
  return this.find({
    status: 'active',
    global: true
  }).sort({ sortOrder: 1, name: 1 });
};

AttributeSchema.statics.findForCategory = function(categoryId: string) {
  return this.find({
    status: 'active',
    $or: [
      { global: true },
      { categories: categoryId }
    ]
  }).sort({ sortOrder: 1, name: 1 });
};

AttributeSchema.statics.findForVariants = function() {
  return this.find({
    status: 'active',
    usedForVariants: true
  }).sort({ sortOrder: 1, name: 1 });
};

AttributeSchema.statics.findForFilters = function(categoryId?: string) {
  const query: any = {
    status: 'active',
    showInFilters: true
  };
  
  if (categoryId) {
    query.$or = [
      { global: true },
      { categories: categoryId }
    ];
  } else {
    query.global = true;
  }
  
  return this.find(query).sort({ sortOrder: 1, name: 1 });
};

// Instance methods
AttributeSchema.methods.getValues = function() {
  const AttributeValue = mongoose.model('AttributeValue');
  return AttributeValue.find({
    attribute: this._id,
    status: 'active'
  }).sort({ sortOrder: 1, name: 1 });
};

AttributeSchema.methods.updateValueCount = async function() {
  const AttributeValue = mongoose.model('AttributeValue');
  const count = await AttributeValue.countDocuments({
    attribute: this._id,
    status: 'active'
  });
  // Note: This is a virtual field, so we don't update the document
  return count;
};

export default mongoose.models.Attribute || mongoose.model<IAttribute>('Attribute', AttributeSchema);