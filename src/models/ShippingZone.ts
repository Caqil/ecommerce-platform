// src/models/ShippingZone.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IShippingZone extends Document {
  _id: string;
  
  // Basic info
  name: string;
  description?: string;
  
  // Geographic coverage
  countries: Array<{
    code: string; // ISO country code (US, CA, GB, etc.)
    name: string;
    states?: Array<{
      code: string; // State/province code
      name: string;
      postalCodes?: string[]; // Specific postal codes or patterns
    }>;
    postalCodes?: string[]; // Country-level postal codes or patterns
  }>;
  
  // Status
  status: 'active' | 'inactive';
  
  // Priority (for overlapping zones)
  priority: number;
  
  // Default zone
  isDefault: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  isActive: boolean;
  countryCount: number;
}

const StateSchema = new Schema({
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  postalCodes: [{
    type: String,
    trim: true,
  }],
}, {
  _id: false,
});

const CountrySchema = new Schema({
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    length: 2, // ISO 3166-1 alpha-2
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  states: [StateSchema],
  postalCodes: [{
    type: String,
    trim: true,
  }],
}, {
  _id: false,
});

const ShippingZoneSchema = new Schema({
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
  
  // Geographic coverage
  countries: {
    type: [CountrySchema],
    required: true,
    validate: {
      validator: function(countries: any[]) {
        return countries && countries.length > 0;
      },
      message: 'At least one country must be specified'
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true,
  },
  
  // Priority
  priority: {
    type: Number,
    default: 0,
    index: true,
  },
  
  // Default zone
  isDefault: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
ShippingZoneSchema.index({ status: 1, priority: -1 });
ShippingZoneSchema.index({ 'countries.code': 1, status: 1 });
ShippingZoneSchema.index({ isDefault: 1 });

// Ensure only one default zone
ShippingZoneSchema.index(
  { isDefault: 1 },
  { 
    unique: true,
    partialFilterExpression: { isDefault: true, status: 'active' }
  }
);

// Virtuals
ShippingZoneSchema.virtual('isActive').get(function(this: IShippingZone) {
  return this.status === 'active';
});

ShippingZoneSchema.virtual('countryCount').get(function(this: IShippingZone) {
  return this.countries.length;
});

// Pre-save middleware
ShippingZoneSchema.pre('save', async function(this: IShippingZone, next) {
  // If setting as default, remove default from other zones
  if (this.isDefault && this.status === 'active') {
    await this.constructor.updateMany(
      { _id: { $ne: this._id }, isDefault: true },
      { $set: { isDefault: false } }
    );
  }
  
  // Validate country codes (basic validation)
  for (const country of this.countries) {
    if (country.code.length !== 2) {
      return next(new Error(`Invalid country code: ${country.code}. Must be 2 characters.`));
    }
  }
  
  next();
});

// Static methods
ShippingZoneSchema.statics.findActive = function() {
  return this.find({ status: 'active' }).sort({ priority: -1, name: 1 });
};

ShippingZoneSchema.statics.findDefault = function() {
  return this.findOne({ isDefault: true, status: 'active' });
};

ShippingZoneSchema.statics.findByCountry = function(countryCode: string) {
  return this.find({
    'countries.code': countryCode.toUpperCase(),
    status: 'active'
  }).sort({ priority: -1 });
};

ShippingZoneSchema.statics.findByAddress = function(address: {
  country: string;
  state?: string;
  postalCode?: string;
}) {
  const countryCode = address.country.toUpperCase();
  
  return this.find({
    'countries.code': countryCode,
    status: 'active'
  }).sort({ priority: -1 });
};

ShippingZoneSchema.statics.findForAddress = async function(address: {
  country: string;
  state?: string;
  postalCode?: string;
}) {
  const zones = await this.findByAddress(address);
  
  // Find the most specific matching zone
  for (const zone of zones) {
    if (zone.matchesAddress(address)) {
      return zone;
    }
  }
  
  // Return default zone if no specific match
  return this.findDefault();
};

// Instance methods
ShippingZoneSchema.methods.matchesAddress = function(address: {
  country: string;
  state?: string;
  postalCode?: string;
}) {
  const countryCode = address.country.toUpperCase();
  
  // Find matching country
  const country = this.countries.find(c => c.code === countryCode);
  if (!country) return false;
  
  // If no state specified in address, country match is sufficient
  if (!address.state) return true;
  
  const stateCode = address.state.toUpperCase();
  
  // If country has no state restrictions, match
  if (!country.states || country.states.length === 0) {
    return this.matchesPostalCode(address.postalCode, country.postalCodes);
  }
  
  // Find matching state
  const state = country.states.find(s => s.code === stateCode);
  if (!state) return false;
  
  // Check postal code if specified
  return this.matchesPostalCode(address.postalCode, state.postalCodes);
};

ShippingZoneSchema.methods.matchesPostalCode = function(postalCode?: string, patterns?: string[]) {
  if (!postalCode || !patterns || patterns.length === 0) return true;
  
  const code = postalCode.replace(/\s/g, '').toUpperCase();
  
  return patterns.some(pattern => {
    // Simple pattern matching
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(code);
  });
};

ShippingZoneSchema.methods.addCountry = function(countryCode: string, countryName: string) {
  const code = countryCode.toUpperCase();
  
  // Check if country already exists
  const existingIndex = this.countries.findIndex(c => c.code === code);
  
  if (existingIndex >= 0) {
    // Update existing country
    this.countries[existingIndex].name = countryName;
  } else {
    // Add new country
    this.countries.push({
      code,
      name: countryName,
      states: [],
      postalCodes: []
    });
  }
  
  return this.save();
};

ShippingZoneSchema.methods.removeCountry = function(countryCode: string) {
  const code = countryCode.toUpperCase();
  this.countries = this.countries.filter(c => c.code !== code);
  return this.save();
};

ShippingZoneSchema.methods.addState = function(countryCode: string, stateCode: string, stateName: string) {
  const code = countryCode.toUpperCase();
  const country = this.countries.find(c => c.code === code);
  
  if (!country) {
    throw new Error(`Country ${countryCode} not found in this zone`);
  }
  
  const stateUpper = stateCode.toUpperCase();
  const existingIndex = country.states?.findIndex(s => s.code === stateUpper) ?? -1;
  
  if (existingIndex >= 0 && country.states) {
    // Update existing state
    country.states[existingIndex].name = stateName;
  } else {
    // Add new state
    if (!country.states) country.states = [];
    country.states.push({
      code: stateUpper,
      name: stateName,
      postalCodes: []
    });
  }
  
  return this.save();
};

ShippingZoneSchema.methods.removeState = function(countryCode: string, stateCode: string) {
  const code = countryCode.toUpperCase();
  const country = this.countries.find(c => c.code === code);
  
  if (country && country.states) {
    const stateUpper = stateCode.toUpperCase();
    country.states = country.states.filter(s => s.code !== stateUpper);
  }
  
  return this.save();
};

ShippingZoneSchema.methods.addPostalCodePattern = function(
  countryCode: string, 
  pattern: string, 
  stateCode?: string
) {
  const code = countryCode.toUpperCase();
  const country = this.countries.find(c => c.code === code);
  
  if (!country) {
    throw new Error(`Country ${countryCode} not found in this zone`);
  }
  
  if (stateCode) {
    const stateUpper = stateCode.toUpperCase();
    const state = country.states?.find(s => s.code === stateUpper);
    
    if (!state) {
      throw new Error(`State ${stateCode} not found in country ${countryCode}`);
    }
    
    if (!state.postalCodes) state.postalCodes = [];
    if (!state.postalCodes.includes(pattern)) {
      state.postalCodes.push(pattern);
    }
  } else {
    if (!country.postalCodes) country.postalCodes = [];
    if (!country.postalCodes.includes(pattern)) {
      country.postalCodes.push(pattern);
    }
  }
  
  return this.save();
};

ShippingZoneSchema.methods.getShippingMethods = function() {
  const ShippingMethod = mongoose.model('ShippingMethod');
  return ShippingMethod.findByZone(this._id);
};

ShippingZoneSchema.methods.getCoverage = function() {
  const coverage = {
    countries: this.countries.length,
    states: 0,
    hasPostalCodeRestrictions: false
  };
  
  for (const country of this.countries) {
    if (country.states) {
      coverage.states += country.states.length;
    }
    
    if (country.postalCodes && country.postalCodes.length > 0) {
      coverage.hasPostalCodeRestrictions = true;
    }
    
    if (country.states) {
      for (const state of country.states) {
        if (state.postalCodes && state.postalCodes.length > 0) {
          coverage.hasPostalCodeRestrictions = true;
        }
      }
    }
  }
  
  return coverage;
};

export default mongoose.models.ShippingZone || mongoose.model<IShippingZone>('ShippingZone', ShippingZoneSchema);