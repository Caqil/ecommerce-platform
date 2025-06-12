import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  let client: MongoClient | null = null

  try {
    const { admin, dbConfig } = await request.json()

    if (!admin || !dbConfig) {
      return NextResponse.json(
        { message: 'Admin data and database config are required' },
        { status: 400 }
      )
    }

    const { mongoUri } = JSON.parse(dbConfig)
    client = new MongoClient(mongoUri)
    await client.connect()

    const db = client.db()

    // Check if admin already exists
    const existingAdmin = await db.collection('users').findOne({ 
      email: admin.email 
    })

    if (existingAdmin) {
      return NextResponse.json(
        { message: 'An admin with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(admin.password, 12)

    // Create admin user
    const adminUser = {
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      emailVerified: true,
      permissions: [
        'admin.access',
        'users.manage',
        'products.manage',
        'orders.manage',
        'settings.manage',
        'addons.manage'
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      profile: {
        avatar: null,
        phone: null,
        bio: 'System Administrator'
      }
    }

    const result = await db.collection('users').insertOne(adminUser)

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      adminId: result.insertedId,
      email: admin.email
    })

  } catch (error) {
    console.error('Admin creation error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Admin creation failed' },
      { status: 500 }
    )
  } finally {
    if (client) {
      await client.close()
    }
  }
}