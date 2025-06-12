// src/app/api/setup/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { NextApiRequest, NextApiResponse } from 'next'

interface SetupStatus {
  isCompleted: boolean
  currentStep: number
  completedSteps: string[]
  startedAt?: string
  completedAt?: string
  version: string
}

const SETUP_STEPS = [
  'requirements',
  'license',
  'database',
  'admin',
  'store',
  'complete'
]
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const setupCompletePath = join(process.cwd(), '.setup-complete');
  const isSetupCompleted = existsSync(setupCompletePath);
  res.status(200).json({ isSetupCompleted });
}
function getSetupStatusPath() {
  return join(process.cwd(), '.setup-status.json')
}

function getSetupStatus(): SetupStatus {
  const statusPath = getSetupStatusPath()
  
  if (!existsSync(statusPath)) {
    return {
      isCompleted: false,
      currentStep: 1,
      completedSteps: [],
      version: '1.0.0'
    }
  }
  
  try {
    const statusData = readFileSync(statusPath, 'utf8')
    return JSON.parse(statusData)
  } catch (error) {
    console.error('Error reading setup status:', error)
    return {
      isCompleted: false,
      currentStep: 1,
      completedSteps: [],
      version: '1.0.0'
    }
  }
}

function saveSetupStatus(status: SetupStatus) {
  const statusPath = getSetupStatusPath()
  try {
    writeFileSync(statusPath, JSON.stringify(status, null, 2))
  } catch (error) {
    console.error('Error saving setup status:', error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const setupCompletePath = join(process.cwd(), '.setup-complete')
    const isCompleted = existsSync(setupCompletePath)
    
    if (isCompleted) {
      return NextResponse.json({
        isCompleted: true,
        currentStep: 6,
        completedSteps: SETUP_STEPS,
        message: 'Setup is already completed',
        canAccess: {
          admin: true,
          store: true,
          api: true
        }
      })
    }
    
    const status = getSetupStatus()
    
    return NextResponse.json({
      ...status,
      totalSteps: SETUP_STEPS.length,
      steps: SETUP_STEPS,
      nextStep: status.currentStep < SETUP_STEPS.length ? SETUP_STEPS[status.currentStep] : null,
      progress: Math.round((status.completedSteps.length / SETUP_STEPS.length) * 100),
      canAccess: {
        admin: false,
        store: false,
        api: false
      }
    })
    
  } catch (error) {
    console.error('Setup status error:', error)
    return NextResponse.json(
      { 
        message: 'Failed to get setup status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { step, action, data } = await request.json()
    
    if (!step || !action) {
      return NextResponse.json(
        { message: 'Step and action are required' },
        { status: 400 }
      )
    }
    
    const status = getSetupStatus()
    
    switch (action) {
      case 'start':
        if (!status.startedAt) {
          status.startedAt = new Date().toISOString()
        }
        break
        
      case 'complete':
        if (!status.completedSteps.includes(step)) {
          status.completedSteps.push(step)
        }
        
        // Update current step to next step
        const currentStepIndex = SETUP_STEPS.indexOf(step)
        if (currentStepIndex >= 0) {
          status.currentStep = Math.min(currentStepIndex + 2, SETUP_STEPS.length)
        }
        
        // If this is the last step, mark as completed
        if (step === 'complete') {
          status.isCompleted = true
          status.completedAt = new Date().toISOString()
        }
        break
        
      case 'reset':
        // Reset setup status
        status.currentStep = 1
        status.completedSteps = []
        status.isCompleted = false
        delete status.startedAt
        delete status.completedAt
        break
        
      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        )
    }
    
    saveSetupStatus(status)
    
    return NextResponse.json({
      success: true,
      status,
      message: `Setup step '${step}' ${action} successfully`
    })
    
  } catch (error) {
    console.error('Setup status update error:', error)
    return NextResponse.json(
      { 
        message: 'Failed to update setup status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Reset setup - remove all setup files
    const setupPaths = [
      join(process.cwd(), '.setup-complete'),
      join(process.cwd(), '.setup-status.json')
    ]
    
    for (const path of setupPaths) {
      if (existsSync(path)) {
        require('fs').unlinkSync(path)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Setup has been reset successfully'
    })
    
  } catch (error) {
    console.error('Setup reset error:', error)
    return NextResponse.json(
      { 
        message: 'Failed to reset setup',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}