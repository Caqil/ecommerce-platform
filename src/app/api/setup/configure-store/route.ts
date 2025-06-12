import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

export async function POST(request: NextRequest) {
  let client: MongoClient | null = null

  try {
    const { store, dbConfig } = await request.json()

    if (!store || !dbConfig) {
      return NextResponse.json(
        { message: 'Store data and database config are required' },
        { status: 400 }
      )
    }

    const { mongoUri } = JSON.parse(dbConfig)
    client = new MongoClient(mongoUri)
    await client.connect()

    const db = client.db()

    // Update store settings
    const storeSettings = {
      general: {
        siteName: store.name,
        siteDescription: store.description,
        contactEmail: store.email,
        contactPhone: store.phone,
        timezone: store.timezone,
        language: store.language,
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12',
      },
      store: {
        currency: store.currency,
        currencyPosition: 'left',
        thousandSeparator: ',',
        decimalSeparator: '.',
        decimalPlaces: 2,
        weightUnit: 'lbs',
        dimensionUnit: 'in',
      },
      address: {
        street: store.address,
        city: store.city,
        state: store.state,
        zipCode: store.zipCode,
        country: store.country,
      },
      email: {
        fromName: store.name,
        fromEmail: store.email,
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPass: '',
        smtpSecure: false,
      },
      seo: {
        metaTitle: store.name,
        metaDescription: store.description,
        keywords: '',
        ogImage: '',
        favicon: '',
      },
      security: {
        enableRegistration: true,
        requireEmailVerification: false,
        enableGuestCheckout: true,
        sessionTimeout: 1440,
        enableCaptcha: false,
      }
    }

    await db.collection('settings').updateOne(
      { _id: 'app_settings' },
      { 
        $set: {
          ...storeSettings,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )

    // Create default categories
    const defaultCategories = [
      {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and accessories',
        status: 'active',
        parentId: null,
        sortOrder: 1,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Fashion and apparel',
        status: 'active',
        parentId: null,
        sortOrder: 2,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Home and garden products',
        status: 'active',
        parentId: null,
        sortOrder: 3,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    await db.collection('categories').insertMany(defaultCategories)

    // Create default shipping zone
    const defaultShippingZone = {
      name: 'Default Zone',
      regions: [store.country],
      methods: [
        {
          name: 'Standard Shipping',
          description: '5-7 business days',
          cost: 5.00,
          freeShippingMin: 50.00,
          enabled: true
        },
        {
          name: 'Express Shipping',
          description: '2-3 business days',
          cost: 15.00,
          freeShippingMin: 100.00,
          enabled: true
        }
      ],
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await db.collection('shipping_zones').insertOne(defaultShippingZone)

    return NextResponse.json({
      success: true,
      message: 'Store configured successfully',
      storeName: store.name
    })

  } catch (error) {
    console.error('Store configuration error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Store configuration failed' },
      { status: 500 }
    )
  } finally {
    if (client) {
      await client.close()
    }
  }
}