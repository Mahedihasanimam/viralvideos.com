'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface SearchItem {
  title: string
  url: string
  thumbnail: string
}

export default function LiveSearchBox() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setShowDropdown(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        const data = await res.json()
        setResults(data)
        setShowDropdown(true)
      } catch (err) {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div id="customSearchBox" ref={containerRef}>
      <input
        type="text"
        id="searchInput"
        placeholder="মুভির নাম লিখুন..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => {
          if (results.length > 0) setShowDropdown(true)
        }}
        autoComplete="off"
      />
      {showDropdown && (
        <ul id="results">
          {loading && <li className="search-loading">সন্ধান করা হচ্ছে...</li>}
          {!loading && results.length === 0 && (
            <li className="search-no-results">কিছু পাওয়া যায়নি</li>
          )}
          {!loading &&
            results.map((item, idx) => (
              <li key={idx} onClick={() => setShowDropdown(false)}>
                <img src={item.thumbnail} alt={item.title} />
                <Link href={item.url}>{item.title}</Link>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
