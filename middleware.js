import { NextResponse } from "next/server"

/**
 * Middleware to handle subdomain-based routing
 * Validates domain access and redirects appropriately
 */
export function middleware(request) {
  const { pathname, hostname } = request.nextUrl

  const isStaffSubdomain = hostname.startsWith("stuff.")
  const token = request.cookies.get("token")?.value

  // Define staff-only routes
  const staffRoutes = [
    "/accountantportal",
    "/full-program",
    "/single-session",
    "/school",
    "/doctorportal",
    "/calendar-main",
    "/Admin-Book-Appointment",
    "/full-program-appointments",
    "/appointments",
    "/student",
    "/doctor",
    "/accountant",
    "/Payment-Transactions",
    "/checks",
    "/drive-link",
    "/sign-in",
  ]

  // Define client-only routes
  const clientRoutes = ["/clientportal", "/Book-Appointment", "/profile", "/financial-records", "/student-calendar"]

  const isStaffRoute = staffRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))
  const isClientRoute = clientRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))

  // Check if route is public
  const isPublicRoute =
    pathname === "/sign-in" ||
    pathname === "/clientportal" ||
    pathname === "/clientportal/forgot-password" ||
    pathname === "/clientportal/reset-password" ||
    pathname === "/error" ||
    pathname === "/not-found"

  // Staff route on main domain
  if (!isStaffSubdomain && isStaffRoute && !isPublicRoute) {
    return NextResponse.redirect(new URL("/not-found", request.url))
  }

  // Client route on staff subdomain
  if (isStaffSubdomain && isClientRoute) {
    return NextResponse.redirect(new URL("/not-found", request.url))
  }

  // Sign-in page only on staff subdomain
  if (!isStaffSubdomain && pathname === "/sign-in") {
    return NextResponse.redirect(new URL("/clientportal", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
}
