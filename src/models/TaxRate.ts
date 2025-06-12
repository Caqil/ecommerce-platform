// src/models/TaxRate.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ITaxRate extends Document {
  _id: string;
  
  // Basic info
  name: string;
  description?: string;
  
  // Tax details
  rate: number; // Tax rate as percentage (e.g., 8.25 for 8.25%)
  type: 'inclusive' | 'exclusive'; // Whether tax is included in price or added
  
  // Geographic coverage
  country: string; // ISO country code
  state?: string; // State/province code
  city?: string;
  postalCodes?: string[]; // Specific postal codes or patterns
  
  // Product applicability
  applyToShipping: boolean;
  applyToDigitalProducts: boolean;
  
  // Product categories (if empty, applies to all)
  applicableCategories: string[]; // Category IDs
  excludedCategories: string[]; // Category IDs
  
  // Tax class/group
  taxClass?: string; // 'standard', 'reduced', 'zero', 'exempt'
  
  // Priority (for overlapping rates)
  priority: number;
  
  // Status
  status: 'active' | 'inactive';
  
  // Date range
  effectiveFrom?: Date;
  effectiveTo?: Date;
  
  // Compound tax (tax on tax)
  compound: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  isActive: boolean;
  isEffective: boolean;
}

const TaxRateSchema = new Schema({
  // Basic info
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
  
  // Tax details
  rate: {
    type: Number,
    required: true,
    min: 0,
    max: 100, // Percentage
    index: true,
  },
  type: {
    type: String,
    enum: ['inclusive', 'exclusive'],
    default: 'exclusive',
  },
  
  // Geographic coverage
  country: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    length: 2, // ISO 3166-1 alpha-2
    index: true,
  },
  state: {
    type: String,
    uppercase: true,
    trim: true,
    index: true,
  },
  city: {
    type: String,
    trim: true,
    index: true,
  },
  postalCodes: [{
    type: String,
    trim: true,
  }],
  
  // Product applicability
  applyToShipping: {
    type: Boolean,
    default: false,
  },
  applyToDigitalProducts: {
    type: Boolean,
    default: true,
  },
  
  // Categories
  applicableCategories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category',
  }],
  excludedCategories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category',
  }],
  
  // Tax class
  taxClass: {
    type: String,
    enum: ['standard', 'reduced', 'zero', 'exempt'],
    default: 'standard',
    index: true,
  },
  
  // Priority
  priority: {
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
  
  // Date range
  effectiveFrom: {
    type: Date,
    index: true,
  },
  effectiveTo: {
    type: Date,
    index: true,
  },
  
  // Compound tax
  compound: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
TaxRateSchema.index({ country: 1, state: 1, city: 1, status: 1 });
TaxRateSchema.index({ status: 1, priority: -1 });
TaxRateSchema.index({ effectiveFrom: 1, effectiveTo: 1 });
TaxRateSchema.index({ taxClass: 1, status: 1 });

// Compound indexes
TaxRateSchema.index({ 
  country: 1, 
  state: 1, 
  status: 1, 
  effectiveFrom: 1, 
  effectiveTo: 1 
});

// Virtuals
TaxRateSchema.virtual('isActive').get(function(this: ITaxRate) {
  return this.status === 'active';
});

TaxRateSchema.virtual('isEffective').get(function(this: ITaxRate) {
  const now = new Date();
  
  if (this.effectiveFrom && this.effectiveFrom > now) return false;
  if (this.effectiveTo && this.effectiveTo < now) return false;
  
  return true;
});

// Static methods
TaxRateSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    $or: [
      { effectiveFrom: { $exists: false } },
      { effectiveFrom: { $lte: now } }
    ],
    $or: [
      { effectiveTo: { $exists: false } },
      { effectiveTo: { $gte: now } }
    ]
  }).sort({ priority: -1, rate: -1 });
};

TaxRateSchema.statics.findByLocation = function(location: {
  country: string;
  state?: string;
  city?: string;
  postalCode?: string;
}) {
  const now = new Date();
  const query: any = {
    country: location.country.toUpperCase(),
    status: 'active',
    $or: [
      { effectiveFrom: { $exists: false } },
      { effectiveFrom: { $lte: now } },
    ],
    $or: [
      { effectiveTo: { $exists: false } },
      { effectiveTo: { $gte: now } }
    ]
  };
  
  // Build location-specific query
  const locationQueries = [];
  
  // Country only
  locationQueries.push({
    country: location.country.toUpperCase(),
    state: { $exists: false },
    city: { $exists: false }
  });
  
  // Country and state
  if (location.state) {
    locationQueries.push({
      country: location.country.toUpperCase(),
      state: location.state.toUpperCase(),
      city: { $exists: false }
    });
  }
  
  // Country, state, and city
  if (location.state && location.city) {
    locationQueries.push({
      country: location.country.toUpperCase(),
      state: location.state.toUpperCase(),
      city: location.city
    });
  }
  
  query.$or = locationQueries;
  
  return this.find(query).sort({ priority: -1, rate: -1 });
};

TaxRateSchema.statics.findForAddress = async function(address: {
  country: string;
  state?: string;
  city?: string;
  postalCode?: string;
}) {
  const rates = await this.findByLocation(address);
  
  // Filter by postal code if specified
  if (address.postalCode) {
    return rates.filter(rate => rate.matchesPostalCode(address.postalCode));
  }
  
  return rates;
};

TaxRateSchema.statics.calculateTax = async function(
  amount: number,
  address: {
    country: string;
    state?: string;
    city?: string;
    postalCode?: string;
  },
  options: {
    categories?: string[];
    isShipping?: boolean;
    isDigital?: boolean;
    taxClass?: string;
  } = {}
) {
  const rates = await this.findForAddress(address);
  
  let totalTax = 0;
  let taxDetails = [];
  let compoundBase = amount;
  
  // Filter rates based on options
  const applicableRates = rates.filter(rate => {
    // Check if applies to shipping
    if (options.isShipping && !rate.applyToShipping) return false;
    
    // Check if applies to digital products
    if (options.isDigital && !rate.applyToDigitalProducts) return false;
    
    // Check tax class
    if (options.taxClass && rate.taxClass !== options.taxClass) return false;
    
    // Check categories
    if (options.categories && options.categories.length > 0) {
      // If applicable categories specified, must match
      if (rate.applicableCategories.length > 0) {
        const hasApplicable = options.categories.some(cat => 
          rate.applicableCategories.includes(cat)
        );
        if (!hasApplicable) return false;
      }
      
      // If excluded categories specified, must not match
      if (rate.excludedCategories.length > 0) {
        const hasExcluded = options.categories.some(cat => 
          rate.excludedCategories.includes(cat)
        );
        if (hasExcluded) return false;
      }
    }
    
    return true;
  });
  
  // Calculate tax for non-compound rates first
  for (const rate of applicableRates.filter(r => !r.compound)) {
    const taxAmount = (amount * rate.rate) / 100;
    totalTax += taxAmount;
    
    taxDetails.push({
      name: rate.name,
      rate: rate.rate,
      amount: taxAmount,
      compound: false
    });
  }
  
  // Calculate compound taxes (tax on tax)
  for (const rate of applicableRates.filter(r => r.compound)) {
    const taxAmount = (compoundBase * rate.rate) / 100;
    totalTax += taxAmount;
    compoundBase += taxAmount;
    
    taxDetails.push({
      name: rate.name,
      rate: rate.rate,
      amount: taxAmount,
      compound: true
    });
  }
  
  return {
    totalTax: Math.round(totalTax * 100) / 100,
    taxDetails,
    effectiveRate: amount > 0 ? (totalTax / amount) * 100 : 0
  };
};

// Instance methods
TaxRateSchema.methods.matchesPostalCode = function(postalCode?: string) {
  if (!postalCode || !this.postalCodes || this.postalCodes.length === 0) {
    return true; // No postal code restrictions
  }
  
  const code = postalCode.replace(/\s/g, '').toUpperCase();
  
  return this.postalCodes.some(pattern => {
    // Simple pattern matching with wildcards
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(code);
  });
};

TaxRateSchema.methods.appliesTo = function(options: {
  categories?: string[];
  isShipping?: boolean;
  isDigital?: boolean;
  taxClass?: string;
}) {
  // Check shipping
  if (options.isShipping && !this.applyToShipping) return false;
  
  // Check digital products
  if (options.isDigital && !this.applyToDigitalProducts) return false;
  
  // Check tax class
  if (options.taxClass && this.taxClass !== options.taxClass) return false;
  
  // Check categories
  if (options.categories && options.categories.length > 0) {
    // Must match applicable categories if specified
    if (this.applicableCategories.length > 0) {
      const hasApplicable = options.categories.some(cat => 
        this.applicableCategories.includes(cat)
      );
      if (!hasApplicable) return false;
    }
    
    // Must not match excluded categories
    if (this.excludedCategories.length > 0) {
      const hasExcluded = options.categories.some(cat => 
        this.excludedCategories.includes(cat)
      );
      if (hasExcluded) return false;
    }
  }
  
  return true;
};

TaxRateSchema.methods.calculateTaxAmount = function(amount: number) {
  return (amount * this.rate) / 100;
};

TaxRateSchema.methods.addPostalCode = function(postalCode: string) {
  if (!this.postalCodes) this.postalCodes = [];
  
  const code = postalCode.trim().toUpperCase();
  if (!this.postalCodes.includes(code)) {
    this.postalCodes.push(code);
  }
  
  return this.save();
};

TaxRateSchema.methods.removePostalCode = function(postalCode: string) {
  if (!this.postalCodes) return this;
  
  const code = postalCode.trim().toUpperCase();
  this.postalCodes = this.postalCodes.filter(pc => pc !== code);
  
  return this.save();
};

export default mongoose.models.TaxRate || mongoose.model<ITaxRate>('TaxRate', TaxRateSchema);