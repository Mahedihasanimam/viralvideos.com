'use client'

import { useEffect, useState } from 'react'

export default function FloatingNightToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('dark-mode') === 'true'
    if (saved) {
      document.documentElement.classList.add('dark-mode-active')
      setIsDark(true)
    }
  }, [])

  function toggleNight() {
    const html = document.documentElement
    if (html.classList.contains('dark-mode-active')) {
      html.classList.remove('dark-mode-active')
      localStorage.setItem('dark-mode', 'false')
      setIsDark(false)
    } else {
      html.classList.add('dark-mode-active')
      localStorage.setItem('dark-mode', 'true')
      setIsDark(true)
    }
  }

  return (
    <button
      className="night-btn"
      id="night-toggle"
      onClick={toggleNight}
      title="Toggle Night/Day Mode"
    >
      {isDark ? '☀️ ডে মোড' : '🌙 নাইট মোড'}
    </button>
  )
}
