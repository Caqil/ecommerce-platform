import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const verifyLicenseSchema = z.object({
  purchaseCode: z.string().min(1, 'Purchase code is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { purchaseCode } = verifyLicenseSchema.parse(body)

    // Validate purchase code format (Envato format)
    const envateCodeRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
    
    if (!envateCodeRegex.test(purchaseCode)) {
      return NextResponse.json(
        { message: 'Invalid purchase code format' },
        { status: 400 }
      )
    }

    // In production, verify with Envato API
    // For demo purposes, we'll simulate verification
    const isValid = await verifyWithEnvatoAPI(purchaseCode)
    
    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid or already used purchase code' },
        { status: 400 }
      )
    }

    // Store license information (in production, save to database)
    const licenseData = {
      purchaseCode,
      verifiedAt: new Date(),
      status: 'verified'
    }

    return NextResponse.json({
      message: 'License verified successfully',
      license: licenseData
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('License verification error:', error)
    return NextResponse.json(
      { message: 'License verification failed' },
      { status: 500 }
    )
  }
}

async function verifyWithEnvatoAPI(purchaseCode: string): Promise<boolean> {
  try {
    // In production, implement actual Envato API verification
    // https://build.envato.com/api/
    
    const ENVATO_API_TOKEN = process.env.ENVATO_API_TOKEN
    
    if (!ENVATO_API_TOKEN) {
      // For demo/development, accept any valid format
      console.warn('ENVATO_API_TOKEN not set, using demo verification')
      return true
    }

    const response = await fetch(`https://api.envato.com/v3/market/author/sale?code=${purchaseCode}`, {
      headers: {
        'Authorization': `Bearer ${ENVATO_API_TOKEN}`,
        'User-Agent': 'eCommerce Platform Pro'
      }
    })

    if (response.ok) {
      const data = await response.json()
      return data.item?.id === process.env.ENVATO_ITEM_ID
    }

    return false
  } catch (error) {
    console.error('Envato API verification error:', error)
    // In case of API failure, you might want to allow installation
    // or implement offline verification
    return false
  }
}