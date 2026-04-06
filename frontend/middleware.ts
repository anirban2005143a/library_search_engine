import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Decode JWT token (basic decoding, not verification)
function decodeToken(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token format')
    }

    const decoded = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    )

    return decoded
  } catch (error) {
    return null
  }
}

// Get token from cookies
function getTokenFromCookies(request: NextRequest): string | null {
  const token = request.cookies.get('lms_jwt_token')?.value
  return token || null
}

// Check if user is authenticated
function isAuthenticated(request: NextRequest): boolean {
  const token = getTokenFromCookies(request)
  if (!token) return false

  const decoded = decodeToken(token)
  return decoded !== null
}

// Get user role from token
function getUserRole(request: NextRequest): string | null {
  const token = getTokenFromCookies(request)
  if (!token) return null

  const decoded = decodeToken(token)
  return decoded?.role || null
}

// Routes that require authentication
const protectedRoutes = [
  '/admin',
  '/dashboard',
  '/logs',
  '/manage',
  '/favorites',
  '/userProfile'
]

// Routes that require specific roles
const roleBasedRoutes: Record<string, string[]> = {
  '/admin/dashboard': ['ADMIN', 'ROOT_ADMIN'],
  '/admin/logs': ['ADMIN', 'ROOT_ADMIN'],
  '/admin/manage/users': ['ADMIN', 'ROOT_ADMIN'],
  '/admin/manage/books': ['ADMIN', 'ROOT_ADMIN'],
  '/admin/favorites': ['READER', 'ADMIN', 'ROOT_ADMIN'],
  '/admin/userProfile': ['READER', 'ADMIN', 'ROOT_ADMIN'],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    // Check authentication
    if (!isAuthenticated(request)) {
      // Redirect to login page
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Check role-based access
    const requiredRoles = roleBasedRoutes[pathname]
    if (requiredRoles) {
      const userRole = getUserRole(request)
      if (!userRole || !requiredRoles.includes(userRole)) {
        // Redirect to home page if insufficient permissions
        const homeUrl = new URL('/', request.url)
        return NextResponse.redirect(homeUrl)
      }
    }
  }

  // Allow the request to continue
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}