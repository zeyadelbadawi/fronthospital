'use client'

import { useEffect, useRef, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'

const NProgressBar = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const progressRef = useRef({
    startTime: null,
    estimatedDuration: 1000,
    actualProgress: 0,
    isNavigating: false,
    progressInterval: null,
    performanceObserver: null
  })

  // Calculate realistic progress based on actual loading
  const calculateRealisticProgress = useCallback(() => {
    const { startTime, estimatedDuration } = progressRef.current
    if (!startTime) return 0

    const elapsed = Date.now() - startTime
    const baseProgress = Math.min(elapsed / estimatedDuration, 0.95)
    
    // Add realistic curve - fast start, slow middle, fast end
    let progress
    if (baseProgress < 0.3) {
      // Fast initial progress (0-30%)
      progress = baseProgress * 1.2
    } else if (baseProgress < 0.7) {
      // Slower middle progress (30-70%)
      progress = 0.36 + (baseProgress - 0.3) * 0.5
    } else {
      // Faster final progress (70-95%)
      progress = 0.56 + (baseProgress - 0.7) * 1.56
    }

    return Math.min(progress, 0.95)
  }, [])

  // Estimate loading time based on connection and page complexity
  const estimateLoadingTime = useCallback(() => {
    let baseTime = 800 // Base loading time

    // Adjust for connection speed
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = navigator.connection
      const effectiveType = connection.effectiveType
      
      switch (effectiveType) {
        case 'slow-2g':
          baseTime *= 4
          break
        case '2g':
          baseTime *= 2.5
          break
        case '3g':
          baseTime *= 1.5
          break
        case '4g':
        default:
          baseTime *= 1
          break
      }

      // Adjust for RTT (Round Trip Time)
      if (connection.rtt) {
        baseTime += connection.rtt * 2
      }
    }

    // Add randomness for realism (±20%)
    const randomFactor = 0.8 + Math.random() * 0.4
    return Math.max(300, Math.min(baseTime * randomFactor, 3000))
  }, [])

  // Advanced progress animation
  const animateProgress = useCallback(() => {
    if (!progressRef.current.isNavigating) return

    const progress = calculateRealisticProgress()
    progressRef.current.actualProgress = progress

    // Use custom progress setting to avoid NProgress's internal logic
    if (progress > 0) {
      NProgress.set(progress)
    }

    // Continue animation if not complete
    if (progress < 0.95) {
      progressRef.current.progressInterval = requestAnimationFrame(animateProgress)
    }
  }, [calculateRealisticProgress])

  // Start realistic loading (called by CustomLink)
  const startRealisticLoading = useCallback(() => {
    if (progressRef.current.isNavigating) return

    progressRef.current.isNavigating = true
    progressRef.current.startTime = Date.now()
    progressRef.current.estimatedDuration = estimateLoadingTime()
    progressRef.current.actualProgress = 0

    // Configure NProgress for professional look
    NProgress.configure({
      showSpinner: false,
      trickle: false, // We'll handle progress manually
      minimum: 0.02,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // Material Design easing
      speed: 200,
      template: '<div class="bar" role="bar"><div class="peg"></div></div>'
    })

    NProgress.start()
    animateProgress()

    // Set up performance observer to detect actual loading completion
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      progressRef.current.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation' || entry.entryType === 'paint') {
            // Adjust progress based on actual performance metrics
            const loadTime = entry.loadEventEnd - entry.loadEventStart
            if (loadTime > 0) {
              progressRef.current.estimatedDuration = Math.max(
                progressRef.current.estimatedDuration,
                loadTime
              )
            }
          }
        })
      })

      try {
        progressRef.current.performanceObserver.observe({
          entryTypes: ['navigation', 'paint', 'largest-contentful-paint']
        })
      } catch (e) {
        // Fallback if observer types not supported
        console.warn('Performance observer not fully supported:', e)
      }
    }
  }, [estimateLoadingTime, animateProgress])

  // Complete loading with realistic timing
  const completeRealisticLoading = useCallback(() => {
    if (!progressRef.current.isNavigating) return

    // Cancel animation frame
    if (progressRef.current.progressInterval) {
      cancelAnimationFrame(progressRef.current.progressInterval)
      progressRef.current.progressInterval = null
    }

    // Disconnect performance observer
    if (progressRef.current.performanceObserver) {
      progressRef.current.performanceObserver.disconnect()
      progressRef.current.performanceObserver = null
    }

    // Smooth completion
    const currentProgress = progressRef.current.actualProgress
    const remainingProgress = 1 - currentProgress
    const completionTime = Math.min(remainingProgress * 200, 300)

    // Animate to 100%
    NProgress.set(0.99)
    
    setTimeout(() => {
      NProgress.done()
      progressRef.current.isNavigating = false
      progressRef.current.actualProgress = 0
    }, completionTime)
  }, [])

  // Effect to handle route changes and trigger completion
  useEffect(() => {
    // This effect runs on every route change (pathname or searchParams change)
    // It means a new page has started loading or finished loading.
    // We need to ensure NProgress.done() is called when the new page is ready.

    const handleLoad = () => {
      // Small delay to ensure components are rendered and browser is idle
      setTimeout(completeRealisticLoading, 100)
    }

    const handleDOMContentLoaded = () => {
      // Page structure loaded, but resources might still be loading
      setTimeout(() => {
        if (progressRef.current.actualProgress < 0.8) {
          NProgress.set(0.8)
        }
      }, 50)
    }

    // Listen for various completion events
    if (typeof window !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleDOMContentLoaded)
        window.addEventListener('load', handleLoad)
      } else {
        // Document already loaded (e.g., client-side navigation where DOM is already parsed)
        handleLoad()
      }
    }

    // Cleanup function for event listeners
    return () => {
      if (typeof window !== 'undefined') {
        document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded)
        window.removeEventListener('load', handleLoad)
      }
      // Ensure NProgress is removed if component unmounts during navigation
      NProgress.remove()
      if (progressRef.current.progressInterval) {
        cancelAnimationFrame(progressRef.current.progressInterval)
      }
      if (progressRef.current.performanceObserver) {
        progressRef.current.performanceObserver.disconnect()
      }
    }
  }, [pathname, searchParams, completeRealisticLoading]) // Depend on pathname and searchParams for route changes

  // Expose startRealisticLoading for CustomLink
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Attach startRealisticLoading to window for CustomLink to access
      // This is a workaround as context/props might be complex for global links
      window.__startNProgress = startRealisticLoading;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.__startNProgress;
      }
    };
  }, [startRealisticLoading]);


  return null // This component doesn't render anything, it just manages NProgress
}

export default NProgressBar
