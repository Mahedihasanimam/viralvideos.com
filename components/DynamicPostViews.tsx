'use client'

import React, { useEffect, useState } from 'react'
import { toBengaliNumerals } from '@/lib/date'

interface DynamicPostViewsProps {
  slug: string
  initialViews: number
  className?: string
}

export default function DynamicPostViews({
  slug,
  initialViews = 0,
  className = '',
}: DynamicPostViewsProps) {
  const [views, setViews] = useState(initialViews)
  const [hasUpdated, setHasUpdated] = useState(false)

  useEffect(() => {
    if (!slug) return

    let visitorId = ''
    try {
      visitorId = localStorage.getItem('rb_visitor_id') || ''
      if (!visitorId) {
        visitorId = 'v_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
        localStorage.setItem('rb_visitor_id', visitorId)
      }
    } catch {
      // ignore
    }

    // Check session storage to prevent inflating count on rapid refresh
    const sessionKey = `rb_viewed_post_${slug}`
    const alreadyTracked = typeof window !== 'undefined' && sessionStorage.getItem(sessionKey)

    // Call tracking API
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'post',
        slug,
        path: `/post/${slug}`,
        visitorId,
        alreadyTracked: !!alreadyTracked,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.views === 'number') {
          setViews(data.views)
          setHasUpdated(true)
          try {
            sessionStorage.setItem(sessionKey, '1')
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        // Fallback: client-side increment if network fails
        if (!alreadyTracked) {
          setViews(prev => prev + 1)
          setHasUpdated(true)
        }
      })
  }, [slug])

  return (
    <span className={`post-views dynamic-views ${hasUpdated ? 'views-live' : ''} ${className}`}>
      <i className="fa-solid fa-eye" style={{ marginRight: '4px' }}></i>
      <span className="views-number">{toBengaliNumerals(views)}</span> ভিউ
    </span>
  )
}

