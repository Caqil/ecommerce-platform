import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, existsSync } from 'fs'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    // Create setup completion marker
    const setupCompletePath = join(process.cwd(), '.setup-complete')
    
    const completionData = {
      completedAt: new Date().toISOString(),
      version: '1.0.0',
      platform: 'ecommerce-platform-pro'
    }

    writeFileSync(setupCompletePath, JSON.stringify(completionData, null, 2))

    // Update environment file to mark setup as complete
    const envPath = join(process.cwd(), '.env.local')
    
    if (existsSync(envPath)) {
      const envContent = require('fs').readFileSync(envPath, 'utf8')
      const updatedEnv = envContent + '\n# Setup completed\nSETUP_COMPLETED=true\n'
      writeFileSync(envPath, updatedEnv)
    }

    return NextResponse.json({
      success: true,
      message: 'Setup completed successfully',
      timestamp: new Date().toISOString(),
      nextSteps: [
        'Access admin panel at /admin',
        'Configure payment methods',
        'Add your first products',
        'Install additional addons'
      ]
    })

  } catch (error) {
    console.error('Setup completion error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Setup completion failed' },
      { status: 500 }
    )
  }
}