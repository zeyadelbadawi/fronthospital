import { NextResponse } from "next/server"
import { isStaffRoute, isClientRoute, isPublicStaffRoute, isPublicClientRoute } from "@/config/domain-routes"

/**
 * Middleware to handle subdomain-based routing
 * Validates domain access and redirects appropriately
 * This runs BEFORE any page rendering to prevent flash of content
 */
export function middleware(request) {
  const { pathname, hostname } = request.nextUrl

  const isStaffSubdomain = hostname.startsWith("stuff.")
  const token = request.cookies.get("token")?.value

  // Check route types using centralized config
  const staffRoute = isStaffRoute(pathname)
  const clientRoute = isClientRoute(pathname)
  const publicStaffRoute = isPublicStaffRoute(pathname)
  const publicClientRoute = isPublicClientRoute(pathname)

  // Determine if route is public based on subdomain
  const isPublicRoute = isStaffSubdomain ? publicStaffRoute : publicClientRoute

  // Allow public routes without authentication
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Block client routes on staff subdomain
  if (isStaffSubdomain && clientRoute) {
    return NextResponse.redirect(new URL("/not-found", request.url))
  }

  // Block staff routes on main domain
  if (!isStaffSubdomain && staffRoute) {
    return NextResponse.redirect(new URL("/not-found", request.url))
  }

  // Block /sign-in on main domain (redirect to clientportal)
  if (!isStaffSubdomain && pathname === "/sign-in") {
    return NextResponse.redirect(new URL("/clientportal", request.url))
  }

  // Require authentication for protected routes
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/error", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
}
