// src/models/Setting.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ISetting extends Document {
  _id: string;
  
  // Setting identification
  key: string; // Unique key for the setting
  group: string; // Group/category of setting (general, email, shipping, etc.)
  
  // Value
  value: any; // The actual setting value
  defaultValue?: any; // Default value for the setting
  
  // Metadata
  name: string; // Human-readable name
  description?: string; // Description of what this setting does
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'json';
  
  // Validation
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[]; // Valid options for select/enum types
  };
  
  // UI hints
  inputType: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'multiselect' | 'file' | 'color' | 'email' | 'url' | 'password';
  placeholder?: string;
  helpText?: string;
  
  // Access control
  isPublic: boolean; // Can be accessed by frontend
  isReadonly: boolean; // Cannot be modified via UI
  
  // Display
  sortOrder: number;
  
  // Status
  isActive: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  groupName: string;
}

const ValidationSchema = new Schema({
  required: {
    type: Boolean,
    default: false,
  },
  min: {
    type: Number,
  },
  max: {
    type: Number,
  },
  pattern: {
    type: String,
  },
  options: [{
    type: String,
  }],
}, {
  _id: false,
});

const SettingSchema = new Schema({
  // Setting identification
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  group: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  
  // Value
  value: {
    type: Schema.Types.Mixed,
    required: true,
  },
  defaultValue: {
    type: Schema.Types.Mixed,
  },
  
  // Metadata
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array', 'json'],
    required: true,
  },
  
  // Validation
  validation: ValidationSchema,
  
  // UI hints
  inputType: {
    type: String,
    enum: ['text', 'textarea', 'number', 'boolean', 'select', 'multiselect', 'file', 'color', 'email', 'url', 'password'],
    default: 'text',
  },
  placeholder: {
    type: String,
    trim: true,
  },
  helpText: {
    type: String,
    trim: true,
  },
  
  // Access control
  isPublic: {
    type: Boolean,
    default: false,
    index: true,
  },
  isReadonly: {
    type: Boolean,
    default: false,
  },
  
  // Display
  sortOrder: {
    type: Number,
    default: 0,
    index: true,
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
SettingSchema.index({ group: 1, sortOrder: 1 });
SettingSchema.index({ isPublic: 1, isActive: 1 });

// Virtuals
SettingSchema.virtual('groupName').get(function(this: ISetting) {
  // Convert group key to display name
  return this.group.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
});

// Static methods
SettingSchema.statics.findByGroup = function(group: string) {
  return this.find({
    group: group.toLowerCase(),
    isActive: true
  }).sort({ sortOrder: 1, name: 1 });
};

SettingSchema.statics.findPublic = function() {
  return this.find({
    isPublic: true,
    isActive: true
  }).sort({ group: 1, sortOrder: 1 });
};

SettingSchema.statics.getValue = async function(key: string, defaultValue?: any) {
  const setting = await this.findOne({ key: key.toLowerCase(), isActive: true });
  
  if (!setting) {
    return defaultValue;
  }
  
  return setting.value !== undefined ? setting.value : setting.defaultValue;
};

SettingSchema.statics.setValue = async function(key: string, value: any) {
  return this.findOneAndUpdate(
    { key: key.toLowerCase() },
    { value },
    { new: true, upsert: false }
  );
};

SettingSchema.statics.getGroupSettings = async function(group: string) {
  const settings = await this.findByGroup(group);
  const result: Record<string, any> = {};
  
  for (const setting of settings) {
    result[setting.key] = setting.value !== undefined ? setting.value : setting.defaultValue;
  }
  
  return result;
};

SettingSchema.statics.getAllSettings = async function() {
  const settings = await this.find({ isActive: true });
  const result: Record<string, any> = {};
  
  for (const setting of settings) {
    result[setting.key] = setting.value !== undefined ? setting.value : setting.defaultValue;
  }
  
  return result;
};

SettingSchema.statics.getPublicSettings = async function() {
  const settings = await this.findPublic();
  const result: Record<string, any> = {};
  
  for (const setting of settings) {
    result[setting.key] = setting.value !== undefined ? setting.value : setting.defaultValue;
  }
  
  return result;
};

SettingSchema.statics.createDefaultSettings = async function() {
  const defaultSettings = [
    // General Settings
    {
      key: 'site_name',
      group: 'general',
      name: 'Site Name',
      description: 'The name of your store',
      type: 'string',
      value: 'My eCommerce Store',
      inputType: 'text',
      isPublic: true,
      sortOrder: 1
    },
    {
      key: 'site_description',
      group: 'general',
      name: 'Site Description',
      description: 'A brief description of your store',
      type: 'string',
      value: 'Your one-stop shop for everything',
      inputType: 'textarea',
      isPublic: true,
      sortOrder: 2
    },
    {
      key: 'site_logo',
      group: 'general',
      name: 'Site Logo',
      description: 'Upload your store logo',
      type: 'string',
      value: '',
      inputType: 'file',
      isPublic: true,
      sortOrder: 3
    },
    {
      key: 'default_currency',
      group: 'general',
      name: 'Default Currency',
      description: 'The default currency for your store',
      type: 'string',
      value: 'USD',
      inputType: 'select',
      validation: { options: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] },
      isPublic: true,
      sortOrder: 4
    },
    {
      key: 'timezone',
      group: 'general',
      name: 'Timezone',
      description: 'Your store timezone',
      type: 'string',
      value: 'America/New_York',
      inputType: 'select',
      sortOrder: 5
    },
    
    // Email Settings
    {
      key: 'email_from_name',
      group: 'email',
      name: 'From Name',
      description: 'The name emails are sent from',
      type: 'string',
      value: 'My Store',
      inputType: 'text',
      sortOrder: 1
    },
    {
      key: 'email_from_address',
      group: 'email',
      name: 'From Email',
      description: 'The email address emails are sent from',
      type: 'string',
      value: 'noreply@mystore.com',
      inputType: 'email',
      validation: { required: true },
      sortOrder: 2
    },
    
    // Payment Settings
    {
      key: 'payment_methods',
      group: 'payment',
      name: 'Enabled Payment Methods',
      description: 'Which payment methods are enabled',
      type: 'array',
      value: ['stripe', 'paypal'],
      inputType: 'multiselect',
      validation: { options: ['stripe', 'paypal', 'square', 'authorize_net'] },
      sortOrder: 1
    },
    
    // Shipping Settings
    {
      key: 'enable_shipping',
      group: 'shipping',
      name: 'Enable Shipping',
      description: 'Whether shipping is enabled for physical products',
      type: 'boolean',
      value: true,
      inputType: 'boolean',
      sortOrder: 1
    },
    {
      key: 'free_shipping_threshold',
      group: 'shipping',
      name: 'Free Shipping Threshold',
      description: 'Minimum order amount for free shipping',
      type: 'number',
      value: 50,
      inputType: 'number',
      validation: { min: 0 },
      sortOrder: 2
    },
    
    // Tax Settings
    {
      key: 'enable_taxes',
      group: 'tax',
      name: 'Enable Taxes',
      description: 'Whether taxes are calculated',
      type: 'boolean',
      value: true,
      inputType: 'boolean',
      sortOrder: 1
    },
    {
      key: 'tax_inclusive_prices',
      group: 'tax',
      name: 'Tax Inclusive Prices',
      description: 'Whether displayed prices include taxes',
      type: 'boolean',
      value: false,
      inputType: 'boolean',
      sortOrder: 2
    },
    
    // Inventory Settings
    {
      key: 'track_inventory',
      group: 'inventory',
      name: 'Track Inventory',
      description: 'Whether to track product inventory',
      type: 'boolean',
      value: true,
      inputType: 'boolean',
      sortOrder: 1
    },
    {
      key: 'allow_backorders',
      group: 'inventory',
      name: 'Allow Backorders',
      description: 'Whether to allow orders when out of stock',
      type: 'boolean',
      value: false,
      inputType: 'boolean',
      sortOrder: 2
    },
    
    // SEO Settings
    {
      key: 'seo_title',
      group: 'seo',
      name: 'Default SEO Title',
      description: 'Default title for SEO',
      type: 'string',
      value: 'My eCommerce Store',
      inputType: 'text',
      isPublic: true,
      sortOrder: 1
    },
    {
      key: 'seo_description',
      group: 'seo',
      name: 'Default SEO Description',
      description: 'Default meta description for SEO',
      type: 'string',
      value: 'Shop the best products at great prices',
      inputType: 'textarea',
      isPublic: true,
      sortOrder: 2
    }
  ];
  
  for (const setting of defaultSettings) {
    await this.findOneAndUpdate(
      { key: setting.key },
      setting,
      { upsert: true, new: true }
    );
  }
};

// Instance methods
SettingSchema.methods.validate = function() {
  const errors = [];
  
  if (!this.validation) return { valid: true, errors };
  
  // Required validation
  if (this.validation.required && (this.value === undefined || this.value === null || this.value === '')) {
    errors.push(`${this.name} is required`);
  }
  
  // Type-specific validation
  if (this.value !== undefined && this.value !== null) {
    switch (this.type) {
      case 'number':
        if (isNaN(Number(this.value))) {
          errors.push(`${this.name} must be a number`);
        } else {
          const num = Number(this.value);
          if (this.validation.min !== undefined && num < this.validation.min) {
            errors.push(`${this.name} must be at least ${this.validation.min}`);
          }
          if (this.validation.max !== undefined && num > this.validation.max) {
            errors.push(`${this.name} must be at most ${this.validation.max}`);
          }
        }
        break;
        
      case 'string':
        const str = String(this.value);
        if (this.validation.min !== undefined && str.length < this.validation.min) {
          errors.push(`${this.name} must be at least ${this.validation.min} characters`);
        }
        if (this.validation.max !== undefined && str.length > this.validation.max) {
          errors.push(`${this.name} must be at most ${this.validation.max} characters`);
        }
        if (this.validation.pattern) {
          const regex = new RegExp(this.validation.pattern);
          if (!regex.test(str)) {
            errors.push(`${this.name} format is invalid`);
          }
        }
        break;
        
      case 'array':
        if (!Array.isArray(this.value)) {
          errors.push(`${this.name} must be an array`);
        }
        break;
    }
    
    // Options validation
    if (this.validation.options && this.validation.options.length > 0) {
      if (this.type === 'array') {
        const invalidOptions = this.value.filter((v: string) => !this.validation.options!.includes(v));
        if (invalidOptions.length > 0) {
          errors.push(`${this.name} contains invalid options: ${invalidOptions.join(', ')}`);
        }
      } else {
        if (!this.validation.options.includes(String(this.value))) {
          errors.push(`${this.name} must be one of: ${this.validation.options.join(', ')}`);
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

SettingSchema.methods.resetToDefault = function() {
  if (this.defaultValue !== undefined) {
    this.value = this.defaultValue;
  }
  return this.save();
};

export default mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);