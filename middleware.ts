import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || ""
  const subdomain = host.split(".")[0]

  const isClientSubdomain = subdomain === "client"

  // Clone the request headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-subdomain", subdomain)
  requestHeaders.set("x-is-client-portal", isClientSubdomain ? "true" : "false")

  if (isClientSubdomain) {
    const pathname = request.nextUrl.pathname

    // Don't redirect if already in /client path
    if (!pathname.startsWith("/client")) {
      const url = request.nextUrl.clone()
      url.pathname = `/client${pathname === "/" ? "" : pathname}`
      return NextResponse.redirect(url)
    }
  }

  if (!isClientSubdomain && request.nextUrl.pathname.startsWith("/clientportal")) {
    const url = request.nextUrl.clone()
    url.host = `client.${host}`
    return NextResponse.redirect(url)
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
