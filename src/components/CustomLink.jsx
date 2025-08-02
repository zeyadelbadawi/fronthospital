"use client"

import Link from "next/link"
import { useLoading } from "@/contexts/LoadingContext"
import { usePathname } from "next/navigation"

// Corrected CustomLink component as a named export
export function CustomLink({ href, children, ...props }) {
  const { startLoading, stopLoading } = useLoading()
  const pathname = usePathname()

  const handleNavigation = () => {
    // Only trigger loading if navigating to a different path
    if (pathname !== href) {
      startLoading()
    }
  }

  return (
    <Link
      href={href}
      onNavigate={handleNavigation} // Trigger loading immediately on navigation start
      onComplete={stopLoading} // Stop loading when navigation completes
      onError={stopLoading} // Stop loading if navigation errors
      {...props}
    >
      {children}
    </Link>
  )
}
