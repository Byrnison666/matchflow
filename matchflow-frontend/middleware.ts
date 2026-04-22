import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_PREFIXES = ['/app', '/onboarding']
const PUBLIC_PATHS = ['/', '/premium', '/premium/success']
const AUTH_PREFIXES = ['/auth']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (isProtected && !token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if ((pathname === '/auth/login' || pathname === '/auth/register') && token) {
    return NextResponse.redirect(new URL('/app/discover', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
