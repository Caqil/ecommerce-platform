import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

export async function POST(request: NextRequest) {
  let client: MongoClient | null = null

  try {
    const { mongoUri } = await request.json()

    if (!mongoUri) {
      return NextResponse.json(
        { message: 'MongoDB URI is required' },
        { status: 400 }
      )
    }

    // Test connection
    client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 5000,
    })

    await client.connect()
    
    // Test basic operations
    const db = client.db()
    await db.admin().ping()

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      serverInfo: {
        version: (await db.admin().serverStatus()).version,
        host: (await db.admin().serverStatus()).host
      }
    })

  } catch (error) {
    console.error('Database connection error:', error)
    
    let message = 'Database connection failed'
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND')) {
        message = 'Database host not found. Please check your host address.'
      } else if (error.message.includes('ECONNREFUSED')) {
        message = 'Connection refused. Please check if MongoDB is running.'
      } else if (error.message.includes('Authentication failed')) {
        message = 'Authentication failed. Please check your username and password.'
      } else if (error.message.includes('timeout')) {
        message = 'Connection timeout. Please check your network and database settings.'
      } else {
        message = error.message
      }
    }

    return NextResponse.json(
      { message },
      { status: 400 }
    )
  } finally {
    if (client) {
      await client.close()
    }
  }
}