'use client'

import Link from 'next/link'
import NProgress from 'nprogress' // Import NProgress directly

/**
 * A custom Link component that triggers NProgress immediately on click.
 * Use this component for all internal navigations.
 */
const CustomLink = ({ href, children, onClick, ...props }) => {
  const handleClick = (e) => {
    // Call NProgress.start() immediately when the link is clicked
    // Ensure it's only for internal navigations
    if (href && typeof href === 'string' && (href.startsWith('/') || href.startsWith('.'))) {
      // Use the globally exposed start function from NProgressBar
      if (typeof window !== 'undefined' && window.__startNProgress) {
        window.__startNProgress();
      } else {
        // Fallback if __startNProgress is not yet available (shouldn't happen in production)
        NProgress.start();
      }
    }

    // Call any original onClick handler passed to the component
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}

export default CustomLink
