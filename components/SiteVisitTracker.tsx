'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function SiteVisitTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Only track public site paths (skip /admin)
    if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/api')) {
      return
    }

    try {
      // 1. Generate or retrieve persistent visitor ID
      let visitorId = localStorage.getItem('rb_visitor_id')
      if (!visitorId) {
        visitorId = 'v_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
        localStorage.setItem('rb_visitor_id', visitorId)
      }

      // 2. Prevent counting duplicate visits from same tab in 30 seconds
      const lastVisitKey = `rb_last_visit_${pathname}`
      const lastVisitTime = sessionStorage.getItem(lastVisitKey)
      const now = Date.now()

      if (lastVisitTime && now - Number(lastVisitTime) < 30000) {
        return
      }
      sessionStorage.setItem(lastVisitKey, String(now))

      // 3. Send tracking request to server
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'visit',
          path: pathname,
          visitorId,
        }),
      }).catch(() => {
        // silent fail
      })
    } catch {
      // ignore
    }
  }, [pathname])

  return null
}

