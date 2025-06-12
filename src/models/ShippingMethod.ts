// src/models/ShippingMethod.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IShippingMethod extends Document {
  _id: string;
  
  // Basic info
  name: string;
  description?: string;
  carrier?: string; // UPS, FedEx, USPS, DHL, etc.
  
  // Pricing
  type: 'flat_rate' | 'weight_based' | 'price_based' | 'quantity_based' | 'free' | 'calculated';
  cost: number; // Base cost for flat rate
  
  // Weight-based pricing
  weightRates: Array<{
    minWeight: number;
    maxWeight?: number;
    rate: number;
  }>;
  
  // Price-based pricing
  priceRates: Array<{
    minPrice: number;
    maxPrice?: number;
    rate: number;
  }>;
  
  // Quantity-based pricing
  quantityRates: Array<{
    minQuantity: number;
    maxQuantity?: number;
    rate: number;
  }>;
  
  // Free shipping conditions
  freeShippingThreshold?: number; // Minimum order amount for free shipping
  
  // Restrictions
  minOrderAmount?: number;
  maxOrderAmount?: number;
  minWeight?: number;
  maxWeight?: number;
  
  // Zones
  zones: string[]; // ShippingZone IDs
  
  // Delivery estimates
  estimatedDays: {
    min: number;
    max: number;
  };
  
  // Features
  trackingAvailable: boolean;
  signatureRequired: boolean;
  insuranceAvailable: boolean;
  
  // Tax settings
  taxable: boolean;
  
  // Status
  status: 'active' | 'inactive';
  
  // Display
  sortOrder: number;
  
  // API integration (for calculated rates)
  apiSettings?: {
    provider: string; // 'ups', 'fedex', 'usps', etc.
    serviceCode: string;
    accountNumber?: string;
    settings: Record<string, any>;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  isActive: boolean;
}

const WeightRateSchema = new Schema({
  minWeight: {
    type: Number,
    required: true,
    min: 0,
  },
  maxWeight: {
    type: Number,
    min: 0,
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  _id: false,
});

const PriceRateSchema = new Schema({
  minPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  maxPrice: {
    type: Number,
    min: 0,
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  _id: false,
});

const QuantityRateSchema = new Schema({
  minQuantity: {
    type: Number,
    required: true,
    min: 0,
  },
  maxQuantity: {
    type: Number,
    min: 0,
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  _id: false,
});

const EstimatedDaysSchema = new Schema({
  min: {
    type: Number,
    required: true,
    min: 0,
  },
  max: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  _id: false,
});

const ApiSettingsSchema = new Schema({
  provider: {
    type: String,
    required: true,
  },
  serviceCode: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
  },
  settings: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, {
  _id: false,
});

const ShippingMethodSchema = new Schema({
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
  carrier: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  
  // Pricing
  type: {
    type: String,
    enum: ['flat_rate', 'weight_based', 'price_based', 'quantity_based', 'free', 'calculated'],
    required: true,
    index: true,
  },
  cost: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Rate structures
  weightRates: [WeightRateSchema],
  priceRates: [PriceRateSchema],
  quantityRates: [QuantityRateSchema],
  
  // Free shipping
  freeShippingThreshold: {
    type: Number,
    min: 0,
  },
  
  // Restrictions
  minOrderAmount: {
    type: Number,
    min: 0,
  },
  maxOrderAmount: {
    type: Number,
    min: 0,
  },
  minWeight: {
    type: Number,
    min: 0,
  },
  maxWeight: {
    type: Number,
    min: 0,
  },
  
  // Zones
  zones: [{
    type: Schema.Types.ObjectId,
    ref: 'ShippingZone',
    index: true,
  }],
  
  // Delivery estimates
  estimatedDays: {
    type: EstimatedDaysSchema,
    required: true,
  },
  
  // Features
  trackingAvailable: {
    type: Boolean,
    default: false,
  },
  signatureRequired: {
    type: Boolean,
    default: false,
  },
  insuranceAvailable: {
    type: Boolean,
    default: false,
  },
  
  // Tax settings
  taxable: {
    type: Boolean,
    default: false,
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true,
  },
  
  // Display
  sortOrder: {
    type: Number,
    default: 0,
    index: true,
  },
  
  // API integration
  apiSettings: ApiSettingsSchema,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
ShippingMethodSchema.index({ status: 1, sortOrder: 1 });
ShippingMethodSchema.index({ type: 1, status: 1 });
ShippingMethodSchema.index({ zones: 1, status: 1 });

// Virtuals
ShippingMethodSchema.virtual('isActive').get(function(this: IShippingMethod) {
  return this.status === 'active';
});

// Pre-save validation
ShippingMethodSchema.pre('save', function(this: IShippingMethod, next) {
  // Validate rate structures based on type
  switch (this.type) {
    case 'weight_based':
      if (!this.weightRates || this.weightRates.length === 0) {
        return next(new Error('Weight rates are required for weight-based shipping'));
      }
      break;
    case 'price_based':
      if (!this.priceRates || this.priceRates.length === 0) {
        return next(new Error('Price rates are required for price-based shipping'));
      }
      break;
    case 'quantity_based':
      if (!this.quantityRates || this.quantityRates.length === 0) {
        return next(new Error('Quantity rates are required for quantity-based shipping'));
      }
      break;
    case 'calculated':
      if (!this.apiSettings) {
        return next(new Error('API settings are required for calculated shipping'));
      }
      break;
  }
  
  // Validate estimated days
  if (this.estimatedDays.min > this.estimatedDays.max) {
    return next(new Error('Minimum estimated days cannot be greater than maximum'));
  }
  
  next();
});

// Static methods
ShippingMethodSchema.statics.findActive = function() {
  return this.find({ status: 'active' }).sort({ sortOrder: 1, name: 1 });
};

ShippingMethodSchema.statics.findByZone = function(zoneId: string) {
  return this.find({
    zones: zoneId,
    status: 'active'
  }).sort({ sortOrder: 1, name: 1 });
};

ShippingMethodSchema.statics.findForOrder = function(orderData: {
  weight?: number;
  total: number;
  quantity: number;
  zoneId: string;
}) {
  const query: any = {
    zones: orderData.zoneId,
    status: 'active'
  };
  
  // Add restrictions
  if (orderData.total !== undefined) {
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { minOrderAmount: { $exists: false } },
        { minOrderAmount: { $lte: orderData.total } }
      ]
    });
    query.$and.push({
      $or: [
        { maxOrderAmount: { $exists: false } },
        { maxOrderAmount: { $gte: orderData.total } }
      ]
    });
  }
  
  if (orderData.weight !== undefined) {
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { minWeight: { $exists: false } },
        { minWeight: { $lte: orderData.weight } }
      ]
    });
    query.$and.push({
      $or: [
        { maxWeight: { $exists: false } },
        { maxWeight: { $gte: orderData.weight } }
      ]
    });
  }
  
  return this.find(query).sort({ sortOrder: 1, name: 1 });
};

// Instance methods
ShippingMethodSchema.methods.calculateRate = function(orderData: {
  weight?: number;
  total: number;
  quantity: number;
}) {
  // Check if order meets free shipping threshold
  if (this.freeShippingThreshold && orderData.total >= this.freeShippingThreshold) {
    return 0;
  }
  
  switch (this.type) {
    case 'flat_rate':
      return this.cost;
      
    case 'free':
      return 0;
      
    case 'weight_based':
      return this.calculateWeightBasedRate(orderData.weight || 0);
      
    case 'price_based':
      return this.calculatePriceBasedRate(orderData.total);
      
    case 'quantity_based':
      return this.calculateQuantityBasedRate(orderData.quantity);
      
    case 'calculated':
      // This would call external API
      throw new Error('Calculated rates require API integration');
      
    default:
      return this.cost;
  }
};

ShippingMethodSchema.methods.calculateWeightBasedRate = function(weight: number) {
  for (const rate of this.weightRates) {
    if (weight >= rate.minWeight && (!rate.maxWeight || weight <= rate.maxWeight)) {
      return rate.rate;
    }
  }
  
  // If no matching rate found, use the highest rate
  const sortedRates = this.weightRates.sort((a, b) => b.minWeight - a.minWeight);
  return sortedRates[0]?.rate || 0;
};

ShippingMethodSchema.methods.calculatePriceBasedRate = function(price: number) {
  for (const rate of this.priceRates) {
    if (price >= rate.minPrice && (!rate.maxPrice || price <= rate.maxPrice)) {
      return rate.rate;
    }
  }
  
  // If no matching rate found, use the highest rate
  const sortedRates = this.priceRates.sort((a, b) => b.minPrice - a.minPrice);
  return sortedRates[0]?.rate || 0;
};

ShippingMethodSchema.methods.calculateQuantityBasedRate = function(quantity: number) {
  for (const rate of this.quantityRates) {
    if (quantity >= rate.minQuantity && (!rate.maxQuantity || quantity <= rate.maxQuantity)) {
      return rate.rate;
    }
  }
  
  // If no matching rate found, use the highest rate
  const sortedRates = this.quantityRates.sort((a, b) => b.minQuantity - a.minQuantity);
  return sortedRates[0]?.rate || 0;
};

ShippingMethodSchema.methods.isAvailableForOrder = function(orderData: {
  weight?: number;
  total: number;
  quantity: number;
  zoneId: string;
}) {
  if (this.status !== 'active') return false;
  if (!this.zones.includes(orderData.zoneId)) return false;
  
  if (this.minOrderAmount && orderData.total < this.minOrderAmount) return false;
  if (this.maxOrderAmount && orderData.total > this.maxOrderAmount) return false;
  
  if (orderData.weight !== undefined) {
    if (this.minWeight && orderData.weight < this.minWeight) return false;
    if (this.maxWeight && orderData.weight > this.maxWeight) return false;
  }
  
  return true;
};

ShippingMethodSchema.methods.getEstimatedDelivery = function() {
  const now = new Date();
  const minDate = new Date(now.getTime() + this.estimatedDays.min * 24 * 60 * 60 * 1000);
  const maxDate = new Date(now.getTime() + this.estimatedDays.max * 24 * 60 * 60 * 1000);
  
  return {
    min: minDate,
    max: maxDate,
    display: this.estimatedDays.min === this.estimatedDays.max 
      ? `${this.estimatedDays.min} business days`
      : `${this.estimatedDays.min}-${this.estimatedDays.max} business days`
  };
};

export default mongoose.models.ShippingMethod || mongoose.model<IShippingMethod>('ShippingMethod', ShippingMethodSchema);