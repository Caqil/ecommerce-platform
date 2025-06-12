// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static assets and API routes during build
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // Check if setup is completed via environment or headers
  const isSetupCompleted = process.env.SETUP_COMPLETED === 'true'
  
  // Setup routes
  const isSetupRoute = pathname.startsWith('/setup')
  
  // Admin and protected routes
  const isAdminRoute = pathname.startsWith('/admin')
  const isProtectedRoute = isAdminRoute

  // If setup is not completed
  if (!isSetupCompleted) {
    // Allow setup routes
    if (isSetupRoute) {
      return NextResponse.next()
    }

    // Allow root page to show setup redirect
    if (pathname === '/') {
      return NextResponse.next()
    }

    // Redirect protected routes to setup
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/setup', request.url))
    }

    // Allow other public routes
    return NextResponse.next()
  }

  // If setup is completed but trying to access setup routes
  if (isSetupCompleted && isSetupRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Allow all routes after setup is completed
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}