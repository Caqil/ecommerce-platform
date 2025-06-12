import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { z } from 'zod'

const checkDatabaseSchema = z.object({
  mongoUri: z.string().min(1, 'MongoDB URI is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mongoUri } = checkDatabaseSchema.parse(body)

    // Test MongoDB connection
    const client = new MongoClient(mongoUri)
    
    try {
      // Connect with timeout
      await client.connect()
      
      // Test basic operations
      const db = client.db()
      await db.admin().ping()
      
      // Check if database already exists and has data
      const collections = await db.listCollections().toArray()
      const hasExistingData = collections.length > 0

      return NextResponse.json({
        message: 'Database connection successful',
        hasExistingData,
        databaseName: db.databaseName
      })

    } finally {
      await client.close()
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Database connection error:', error)
    
    // Provide helpful error messages
    let message = 'Database connection failed'
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        message = 'Cannot connect to MongoDB. Make sure MongoDB is running.'
      } else if (error.message.includes('authentication failed')) {
        message = 'Database authentication failed. Check your credentials.'
      } else if (error.message.includes('Invalid connection string')) {
        message = 'Invalid MongoDB connection string format.'
      }
    }

    return NextResponse.json({ message }, { status: 500 })
  }
}