// src/models/EmailTemplate.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IEmailTemplate extends Document {
  _id: string;
  
  // Template identification
  name: string;
  slug: string; // Unique identifier for the template
  category: 'order' | 'customer' | 'marketing' | 'system' | 'shipping' | 'abandoned_cart';
  
  // Email content
  subject: string;
  htmlContent: string;
  textContent?: string; // Plain text version
  
  // Template variables
  availableVariables: Array<{
    key: string;
    description: string;
    example?: string;
  }>;
  
  // Design
  layout?: string; // Base layout template
  styles?: string; // Custom CSS
  
  // Settings
  fromName?: string; // Override default from name
  fromEmail?: string; // Override default from email
  replyTo?: string;
  
  // Attachments
  attachments: Array<{
    name: string;
    path: string;
    contentType: string;
  }>;
  
  // Trigger conditions
  trigger: {
    event: string; // Event that triggers this email
    conditions?: Record<string, any>; // Additional conditions
    delay?: number; // Delay in minutes before sending
  };
  
  // A/B Testing
  isTestVariant: boolean;
  parentTemplate?: string; // Parent template ID for variants
  testPercentage?: number; // Percentage of recipients for this variant
  
  // Personalization
  personalization: {
    enabled: boolean;
    rules: Array<{
      condition: string;
      content: string;
    }>;
  };
  
  // Analytics
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  
  // Status
  status: 'active' | 'inactive' | 'draft';
  isDefault: boolean; // Is this the default template for this category
  
  // Version control
  version: number;
  publishedAt?: Date;
  
  // Metadata
  createdBy?: string; // Admin user ID
  tags: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  openRate: number;
  clickRate: number;
  deliveryRate: number;
}

const VariableSchema = new Schema({
  key: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  example: {
    type: String,
  },
}, {
  _id: false,
});

const AttachmentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
}, {
  _id: false,
});

const TriggerSchema = new Schema({
  event: {
    type: String,
    required: true,
  },
  conditions: {
    type: Schema.Types.Mixed,
    default: {},
  },
  delay: {
    type: Number,
    min: 0,
    default: 0,
  },
}, {
  _id: false,
});

const PersonalizationRuleSchema = new Schema({
  condition: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
}, {
  _id: false,
});

const PersonalizationSchema = new Schema({
  enabled: {
    type: Boolean,
    default: false,
  },
  rules: [PersonalizationRuleSchema],
}, {
  _id: false,
});

const StatsSchema = new Schema({
  sent: {
    type: Number,
    default: 0,
    min: 0,
  },
  delivered: {
    type: Number,
    default: 0,
    min: 0,
  },
  opened: {
    type: Number,
    default: 0,
    min: 0,
  },
  clicked: {
    type: Number,
    default: 0,
    min: 0,
  },
  bounced: {
    type: Number,
    default: 0,
    min: 0,
  },
  unsubscribed: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  _id: false,
});

const EmailTemplateSchema = new Schema({
  // Template identification
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  category: {
    type: String,
    enum: ['order', 'customer', 'marketing', 'system', 'shipping', 'abandoned_cart'],
    required: true,
    index: true,
  },
  
  // Email content
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  htmlContent: {
    type: String,
    required: true,
  },
  textContent: {
    type: String,
  },
  
  // Template variables
  availableVariables: [VariableSchema],
  
  // Design
  layout: {
    type: String,
    default: 'default',
  },
  styles: {
    type: String,
  },
  
  // Settings
  fromName: {
    type: String,
    trim: true,
  },
  fromEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  replyTo: {
    type: String,
    trim: true,
    lowercase: true,
  },
  
  // Attachments
  attachments: [AttachmentSchema],
  
  // Trigger conditions
  trigger: {
    type: TriggerSchema,
    required: true,
  },
  
  // A/B Testing
  isTestVariant: {
    type: Boolean,
    default: false,
    index: true,
  },
  parentTemplate: {
    type: Schema.Types.ObjectId,
    ref: 'EmailTemplate',
  },
  testPercentage: {
    type: Number,
    min: 0,
    max: 100,
  },
  
  // Personalization
  personalization: {
    type: PersonalizationSchema,
    default: { enabled: false, rules: [] },
  },
  
  // Analytics
  stats: {
    type: StatsSchema,
    default: {},
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'draft',
    index: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
    index: true,
  },
  
  // Version control
  version: {
    type: Number,
    default: 1,
  },
  publishedAt: {
    type: Date,
  },
  
  // Metadata
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
EmailTemplateSchema.index({ category: 1, status: 1 });
EmailTemplateSchema.index({ 'trigger.event': 1, status: 1 });
EmailTemplateSchema.index({ isDefault: 1, category: 1 });
EmailTemplateSchema.index({ tags: 1 });

// Ensure only one default template per category
EmailTemplateSchema.index(
  { category: 1, isDefault: 1 },
  { 
    unique: true,
    partialFilterExpression: { isDefault: true, status: 'active' }
  }
);

// Virtuals
EmailTemplateSchema.virtual('openRate').get(function(this: IEmailTemplate) {
  return this.stats.sent > 0 ? (this.stats.opened / this.stats.sent) * 100 : 0;
});

EmailTemplateSchema.virtual('clickRate').get(function(this: IEmailTemplate) {
  return this.stats.opened > 0 ? (this.stats.clicked / this.stats.opened) * 100 : 0;
});

EmailTemplateSchema.virtual('deliveryRate').get(function(this: IEmailTemplate) {
  return this.stats.sent > 0 ? ((this.stats.sent - this.stats.bounced) / this.stats.sent) * 100 : 0;
});

// Pre-save middleware
EmailTemplateSchema.pre('save', async function(this: IEmailTemplate, next) {
  // If setting as default, remove default from other templates in same category
  if (this.isDefault && this.status === 'active') {
    await this.constructor.updateMany(
      { 
        _id: { $ne: this._id }, 
        category: this.category,
        isDefault: true 
      },
      { $set: { isDefault: false } }
    );
  }
  
  // Set published date when status changes to active
  if (this.isModified('status') && this.status === 'active' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Generate text content from HTML if not provided
  if (!this.textContent && this.htmlContent) {
    this.textContent = this.htmlContent
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
  
  next();
});

// Static methods
EmailTemplateSchema.statics.findActive = function() {
  return this.find({ status: 'active' }).sort({ category: 1, name: 1 });
};

EmailTemplateSchema.statics.findByCategory = function(category: string) {
  return this.find({
    category,
    status: 'active'
  }).sort({ isDefault: -1, name: 1 });
};

EmailTemplateSchema.statics.findByEvent = function(event: string) {
  return this.find({
    'trigger.event': event,
    status: 'active'
  }).sort({ isDefault: -1, version: -1 });
};

EmailTemplateSchema.statics.findDefault = function(category: string) {
  return this.findOne({
    category,
    isDefault: true,
    status: 'active'
  });
};

EmailTemplateSchema.statics.getDefaultTemplates = async function() {
  const defaultTemplates = [
    {
      name: 'Order Confirmation',
      slug: 'order_confirmation',
      category: 'order',
      subject: 'Order Confirmation - {{order.orderNumber}}',
      htmlContent: `
        <h1>Thank you for your order!</h1>
        <p>Hi {{customer.firstName}},</p>
        <p>We've received your order and are processing it now.</p>
        <h2>Order Details</h2>
        <p>Order Number: {{order.orderNumber}}</p>
        <p>Order Total: {{order.total}}</p>
        <p>Thank you for shopping with us!</p>
      `,
      trigger: { event: 'order.confirmed' },
      availableVariables: [
        { key: 'customer.firstName', description: 'Customer first name' },
        { key: 'customer.lastName', description: 'Customer last name' },
        { key: 'order.orderNumber', description: 'Order number' },
        { key: 'order.total', description: 'Order total amount' }
      ],
      status: 'active',
      isDefault: true
    },
    {
      name: 'Welcome Email',
      slug: 'welcome_email',
      category: 'customer',
      subject: 'Welcome to {{store.name}}!',
      htmlContent: `
        <h1>Welcome {{customer.firstName}}!</h1>
        <p>Thank you for creating an account with {{store.name}}.</p>
        <p>We're excited to have you as part of our community!</p>
      `,
      trigger: { event: 'customer.registered' },
      availableVariables: [
        { key: 'customer.firstName', description: 'Customer first name' },
        { key: 'store.name', description: 'Store name' }
      ],
      status: 'active',
      isDefault: true
    },
    {
      name: 'Password Reset',
      slug: 'password_reset',
      category: 'customer',
      subject: 'Reset Your Password',
      htmlContent: `
        <h1>Password Reset Request</h1>
        <p>Hi {{customer.firstName}},</p>
        <p>We received a request to reset your password.</p>
        <p><a href="{{resetLink}}">Click here to reset your password</a></p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
      trigger: { event: 'customer.password_reset' },
      availableVariables: [
        { key: 'customer.firstName', description: 'Customer first name' },
        { key: 'resetLink', description: 'Password reset link' }
      ],
      status: 'active',
      isDefault: true
    },
    {
      name: 'Order Shipped',
      slug: 'order_shipped',
      category: 'shipping',
      subject: 'Your Order Has Shipped - {{order.orderNumber}}',
      htmlContent: `
        <h1>Your order is on its way!</h1>
        <p>Hi {{customer.firstName}},</p>
        <p>Great news! Your order {{order.orderNumber}} has shipped.</p>
        <p>Tracking Number: {{shipping.trackingNumber}}</p>
        <p>You can track your package using the link above.</p>
      `,
      trigger: { event: 'order.shipped' },
      availableVariables: [
        { key: 'customer.firstName', description: 'Customer first name' },
        { key: 'order.orderNumber', description: 'Order number' },
        { key: 'shipping.trackingNumber', description: 'Shipping tracking number' }
      ],
      status: 'active',
      isDefault: true
    },
    {
      name: 'Abandoned Cart Reminder',
      slug: 'abandoned_cart',
      category: 'abandoned_cart',
      subject: 'You left something in your cart',
      htmlContent: `
        <h1>Don't forget about your items!</h1>
        <p>Hi {{customer.firstName}},</p>
        <p>You left some great items in your cart. Complete your purchase before they're gone!</p>
        <p><a href="{{cart.checkoutUrl}}">Complete Your Purchase</a></p>
      `,
      trigger: { 
        event: 'cart.abandoned',
        delay: 60 // 1 hour delay
      },
      availableVariables: [
        { key: 'customer.firstName', description: 'Customer first name' },
        { key: 'cart.checkoutUrl', description: 'Cart checkout URL' }
      ],
      status: 'active',
      isDefault: true
    }
  ];
  
  for (const template of defaultTemplates) {
    await this.findOneAndUpdate(
      { slug: template.slug },
      template,
      { upsert: true, new: true }
    );
  }
  
  return defaultTemplates;
};

// Instance methods
EmailTemplateSchema.methods.render = function(variables: Record<string, any> = {}) {
  let subject = this.subject;
  let htmlContent = this.htmlContent;
  let textContent = this.textContent || '';
  
  // Replace variables in subject and content
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    subject = subject.replace(regex, String(value));
    htmlContent = htmlContent.replace(regex, String(value));
    textContent = textContent.replace(regex, String(value));
  }
  
  // Apply personalization rules
  if (this.personalization.enabled) {
    for (const rule of this.personalization.rules) {
      // Simple condition evaluation (would need more sophisticated logic)
      if (this.evaluateCondition(rule.condition, variables)) {
        htmlContent += `\n${rule.content}`;
      }
    }
  }
  
  return {
    subject,
    htmlContent,
    textContent,
    fromName: this.fromName,
    fromEmail: this.fromEmail,
    replyTo: this.replyTo
  };
};

EmailTemplateSchema.methods.evaluateCondition = function(condition: string, variables: Record<string, any>) {
  // Simple condition evaluation
  // In a real implementation, you'd want a more robust condition parser
  try {
    const func = new Function('vars', `with(vars) { return ${condition}; }`);
    return func(variables);
  } catch (error) {
    console.error('Error evaluating condition:', error);
    return false;
  }
};

EmailTemplateSchema.methods.createVariant = function(name: string, testPercentage: number) {
  const variant = new this.constructor({
    name,
    slug: `${this.slug}_variant_${Date.now()}`,
    category: this.category,
    subject: this.subject,
    htmlContent: this.htmlContent,
    textContent: this.textContent,
    trigger: this.trigger,
    isTestVariant: true,
    parentTemplate: this._id,
    testPercentage,
    status: 'draft'
  });
  
  return variant.save();
};

EmailTemplateSchema.methods.trackEvent = function(event: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed') {
  this.stats[event] += 1;
  return this.save();
};

EmailTemplateSchema.methods.getPerformanceMetrics = function() {
  return {
    openRate: this.openRate,
    clickRate: this.clickRate,
    deliveryRate: this.deliveryRate,
    bounceRate: this.stats.sent > 0 ? (this.stats.bounced / this.stats.sent) * 100 : 0,
    unsubscribeRate: this.stats.sent > 0 ? (this.stats.unsubscribed / this.stats.sent) * 100 : 0
  };
};

export default mongoose.models.EmailTemplate || mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);