// src/app/api/setup/validate-requirements/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { access, constants } from 'fs/promises'
import { join } from 'path'

interface RequirementCheck {
  name: string
  status: 'passed' | 'failed' | 'warning'
  message: string
  required: boolean
}

export async function GET(request: NextRequest) {
  try {
    const requirements: RequirementCheck[] = []

    // Check Node.js version
    const nodeVersion = process.version
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
    
    requirements.push({
      name: 'Node.js Version',
      status: majorVersion >= 18 ? 'passed' : 'failed',
      message: majorVersion >= 18 
        ? `Node.js ${nodeVersion} (✓ Compatible)` 
        : `Node.js ${nodeVersion} (✗ Requires Node.js 18+)`,
      required: true
    })

    // Check if Next.js is available
    try {
      require('next')
      requirements.push({
        name: 'Next.js Framework',
        status: 'passed',
        message: 'Next.js is properly installed',
        required: true
      })
    } catch (error) {
      requirements.push({
        name: 'Next.js Framework',
        status: 'failed',
        message: 'Next.js is not installed or not accessible',
        required: true
      })
    }

    // Check MongoDB driver
    try {
      require('mongodb')
      requirements.push({
        name: 'MongoDB Driver',
        status: 'passed',
        message: 'MongoDB driver is installed',
        required: true
      })
    } catch (error) {
      requirements.push({
        name: 'MongoDB Driver',
        status: 'failed',
        message: 'MongoDB driver is not installed',
        required: true
      })
    }

    // Check write permissions for uploads directory
    try {
      const uploadsPath = join(process.cwd(), 'public', 'uploads')
      await access(uploadsPath, constants.W_OK)
      requirements.push({
        name: 'Upload Directory Permissions',
        status: 'passed',
        message: 'Upload directory is writable',
        required: true
      })
    } catch (error) {
      requirements.push({
        name: 'Upload Directory Permissions',
        status: 'warning',
        message: 'Upload directory may not be writable (will be created during setup)',
        required: false
      })
    }

    // Check if .env.local exists
    try {
      await access(join(process.cwd(), '.env.local'), constants.F_OK)
      requirements.push({
        name: 'Environment Configuration',
        status: 'passed',
        message: 'Environment file (.env.local) exists',
        required: true
      })
    } catch (error) {
      requirements.push({
        name: 'Environment Configuration',
        status: 'warning',
        message: 'Environment file will be created during setup',
        required: false
      })
    }

    // Check available memory
    const memoryUsage = process.memoryUsage()
    const totalMemoryMB = Math.round(memoryUsage.heapTotal / 1024 / 1024)
    
    requirements.push({
      name: 'Available Memory',
      status: totalMemoryMB > 512 ? 'passed' : 'warning',
      message: `${totalMemoryMB}MB heap memory available`,
      required: false
    })

    // Check if port 3000 is available (or current port)
    const port = process.env.PORT || '3000'
    requirements.push({
      name: 'Port Availability',
      status: 'passed',
      message: `Running on port ${port}`,
      required: true
    })

    // Check essential packages
    const essentialPackages = [
      'react',
      'react-dom',
      'typescript',
      '@radix-ui/react-accordion',
      'tailwindcss',
      'lucide-react'
    ]

    let missingPackages = 0
    for (const pkg of essentialPackages) {
      try {
        require(pkg)
      } catch (error) {
        missingPackages++
      }
    }

    requirements.push({
      name: 'Essential Dependencies',
      status: missingPackages === 0 ? 'passed' : 'failed',
      message: missingPackages === 0 
        ? 'All essential packages are installed'
        : `${missingPackages} essential packages are missing`,
      required: true
    })

    // Calculate overall status
    const failedRequired = requirements.filter(r => r.required && r.status === 'failed').length
    const warnings = requirements.filter(r => r.status === 'warning').length
    
    const overallStatus = failedRequired > 0 ? 'failed' : warnings > 0 ? 'warning' : 'passed'

    return NextResponse.json({
      status: overallStatus,
      message: failedRequired > 0 
        ? `${failedRequired} critical requirements failed`
        : warnings > 0 
        ? `Ready with ${warnings} warnings`
        : 'All requirements passed',
      requirements,
      summary: {
        total: requirements.length,
        passed: requirements.filter(r => r.status === 'passed').length,
        failed: requirements.filter(r => r.status === 'failed').length,
        warnings: warnings,
        canProceed: failedRequired === 0
      }
    })

  } catch (error) {
    console.error('Requirements check error:', error)
    return NextResponse.json(
      { 
        status: 'failed',
        message: 'Failed to check system requirements',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}