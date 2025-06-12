// src/app/api/setup/verify-license/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { z } from 'zod'

const verifyLicenseSchema = z.object({
  purchaseCode: z.string().min(1, 'Purchase code is required')
})

interface EnvatoSaleData {
  item: {
    id: string
    name: string
    author_username: string
  }
  buyer: string
  license: string
  supported_until: string
  purchase_count: number
  sold_at: string
}

export async function POST(request: NextRequest) {
  let client: MongoClient | null = null

  try {
    const body = await request.json()
    const { purchaseCode } = verifyLicenseSchema.parse(body)

    // Validate purchase code format (Envato format)
    const envateCodeRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
    
    if (!envateCodeRegex.test(purchaseCode)) {
      return NextResponse.json(
        { message: 'Invalid purchase code format. Please check your Envato purchase code.' },
        { status: 400 }
      )
    }

    // Connect to database to check if code is already used
    const mongoUri = process.env.DATABASE_URL || process.env.MONGODB_URI
    if (mongoUri) {
      client = new MongoClient(mongoUri)
      await client.connect()
      
      const db = client.db()
      const existingLicense = await db.collection('licenses').findOne({ 
        purchaseCode: purchaseCode.toLowerCase() 
      })

      if (existingLicense) {
        return NextResponse.json(
          { message: 'This purchase code has already been used for an installation.' },
          { status: 400 }
        )
      }
    }

    // Verify with Envato API
    const verificationResult = await verifyWithEnvatoAPI(purchaseCode)
    
    if (!verificationResult.isValid) {
      return NextResponse.json(
        { message: verificationResult.error || 'Invalid purchase code' },
        { status: 400 }
      )
    }

    // Store license information in database
    const licenseData = {
      purchaseCode: purchaseCode.toLowerCase(),
      itemId: verificationResult.data?.item?.id,
      itemName: verificationResult.data?.item?.name,
      buyer: verificationResult.data?.buyer,
      license: verificationResult.data?.license,
      supportedUntil: verificationResult.data?.supported_until,
      soldAt: verificationResult.data?.sold_at,
      verifiedAt: new Date(),
      status: 'verified',
      domain: request.headers.get('host'),
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown'
    }

    if (client) {
      const db = client.db()
      await db.collection('licenses').insertOne(licenseData)
    }

    return NextResponse.json({
      message: 'License verified successfully',
      license: {
        purchaseCode,
        itemName: verificationResult.data?.item?.name,
        buyer: verificationResult.data?.buyer,
        supportedUntil: verificationResult.data?.supported_until,
        verifiedAt: licenseData.verifiedAt
      }
    })

  } catch (error) {
    console.error('License verification error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'License verification failed. Please try again.' },
      { status: 500 }
    )
  } finally {
    if (client) {
      await client.close()
    }
  }
}

async function verifyWithEnvatoAPI(purchaseCode: string): Promise<{
  isValid: boolean
  error?: string
  data?: EnvatoSaleData
}> {
  try {
    const ENVATO_API_TOKEN = process.env.ENVATO_API_TOKEN
    const ENVATO_ITEM_ID = process.env.ENVATO_ITEM_ID
    
    if (!ENVATO_API_TOKEN) {
      // Development mode - allow any valid format
      if (process.env.NODE_ENV === 'development') {
        console.warn('ENVATO_API_TOKEN not set, using development verification')
        return {
          isValid: true,
          data: {
            item: {
              id: ENVATO_ITEM_ID || 'dev-item',
              name: 'eCommerce Platform Pro',
              author_username: 'your-username'
            },
            buyer: 'Development User',
            license: 'regular',
            supported_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            purchase_count: 1,
            sold_at: new Date().toISOString()
          }
        }
      }
      
      return {
        isValid: false,
        error: 'License verification service is not configured'
      }
    }

    if (!ENVATO_ITEM_ID) {
      return {
        isValid: false,
        error: 'Product verification is not configured'
      }
    }

    // Call Envato API
    const response = await fetch(`https://api.envato.com/v3/market/author/sale?code=${purchaseCode}`, {
      headers: {
        'Authorization': `Bearer ${ENVATO_API_TOKEN}`,
        'User-Agent': 'eCommerce Platform Pro License Verification'
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return {
          isValid: false,
          error: 'Purchase code not found. Please check your code and try again.'
        }
      }
      
      if (response.status === 403) {
        return {
          isValid: false,
          error: 'Access denied. This may be due to API rate limits.'
        }
      }

      return {
        isValid: false,
        error: `Verification failed with status ${response.status}`
      }
    }

    const saleData: EnvatoSaleData = await response.json()

    // Verify this is the correct item
    if (saleData.item?.id !== ENVATO_ITEM_ID) {
      return {
        isValid: false,
        error: 'This purchase code is not for eCommerce Platform Pro'
      }
    }

    // Check if license is still supported (for regular licenses)
    const supportedUntil = new Date(saleData.supported_until)
    const now = new Date()
    
    if (saleData.license === 'regular' && supportedUntil < now) {
      // License expired but still allow installation (support expired ≠ license invalid)
      console.warn(`License support expired on ${supportedUntil.toISOString()}`)
    }

    return {
      isValid: true,
      data: saleData
    }

  } catch (error) {
    console.error('Envato API verification error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return {
          isValid: false,
          error: 'Verification timeout. Please check your internet connection and try again.'
        }
      }
      
      if (error.message.includes('ENOTFOUND')) {
        return {
          isValid: false,
          error: 'Network error. Please check your internet connection.'
        }
      }
    }

    // In production, you might want to implement fallback verification
    // or allow installation with manual verification for critical cases
    return {
      isValid: false,
      error: 'Unable to verify license. Please contact support if this problem persists.'
    }
  }
}

// Helper function to validate license during app runtime
export async function validateActiveLicense(): Promise<boolean> {
  try {
    const mongoUri = process.env.DATABASE_URL || process.env.MONGODB_URI
    if (!mongoUri) return false

    const client = new MongoClient(mongoUri)
    await client.connect()
    
    const db = client.db()
    const license = await db.collection('licenses').findOne({ 
      status: 'verified' 
    }, { 
      sort: { verifiedAt: -1 } 
    })

    await client.close()
    
    return !!license
  } catch (error) {
    console.error('License validation error:', error)
    return false
  }
}