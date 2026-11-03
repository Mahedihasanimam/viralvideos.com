'use client'

import React, { useEffect, useState } from 'react'
import { toBengaliNumerals } from '@/lib/date'

interface StatsData {
  totalVisits: number
  todayVisits: number
  totalContentViews: number
}

export default function VisitorStatsWidget() {
  const [stats, setStats] = useState<StatsData>({
    totalVisits: 0,
    todayVisits: 0,
    totalContentViews: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/track')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setStats({
            totalVisits: data.totalVisits || 0,
            todayVisits: data.todayVisits || 0,
            totalContentViews: data.totalContentViews || 0,
          })
        }
      })
      .catch(() => {
        // ignore
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading && stats.totalVisits === 0) {
    return null
  }

  return (
    <div className="visitor-stats-box">
      <div className="visitor-stats-item">
        <span className="stats-icon">
          <i className="fa-solid fa-users"></i>
        </span>
        <div className="stats-info">
          <span className="stats-label">মোট ভিজিটর</span>
          <strong className="stats-value">{toBengaliNumerals(stats.totalVisits)}</strong>
        </div>
      </div>

      <div className="visitor-stats-item">
        <span className="stats-icon stats-icon-today">
          <i className="fa-solid fa-calendar-day"></i>
        </span>
        <div className="stats-info">
          <span className="stats-label">আজকের ভিজিটর</span>
          <strong className="stats-value">{toBengaliNumerals(stats.todayVisits)}</strong>
        </div>
      </div>

      <div className="visitor-stats-item">
        <span className="stats-icon stats-icon-views">
          <i className="fa-solid fa-eye"></i>
        </span>
        <div className="stats-info">
          <span className="stats-label">মোট কনটেন্ট ভিউ</span>
          <strong className="stats-value">{toBengaliNumerals(stats.totalContentViews)}</strong>
        </div>
      </div>

      <div className="visitor-stats-live">
        <span className="live-dot"></span>
        <span>ওয়েবসাইট লাইভ ভিউ চালু আছে</span>
      </div>
    </div>
  )
}

