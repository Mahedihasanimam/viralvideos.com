'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Logo from './Logo'

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
    }
  }

  return (
    <header id="header-wrap">
      {/* Mobile Drawer */}
      <div className={`mobile-menu-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <span className="mobile-menu-title">ViralVideo Menu</span>
          <button className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <ul className="mobile-nav-list">
          <li><Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link></li>
          <li><Link href="/?featured=1" onClick={() => setMobileMenuOpen(false)}>ফিচার</Link></li>
          <li><Link href="/category/bangla" onClick={() => setMobileMenuOpen(false)}>বাংলা মুভি এবং ওয়েব সিরিজ</Link></li>
          <li><Link href="/category/hindi" onClick={() => setMobileMenuOpen(false)}>হিন্দি মুভি ও ওয়েব সিরিজ</Link></li>
          <li><Link href="/category/english" onClick={() => setMobileMenuOpen(false)}>ইংলিশ মুভি ও সিরিজ</Link></li>
          <li><Link href="/category/korean" onClick={() => setMobileMenuOpen(false)}>কোরিয়ান মুভি ও সিরিজ</Link></li>
          <li><Link href="/category/horror" onClick={() => setMobileMenuOpen(false)}>হরর মুভি ও সিরিজ</Link></li>
          <li><Link href="/p/about" onClick={() => setMobileMenuOpen(false)}>About</Link></li>
          <li><Link href="/p/contact-us" onClick={() => setMobileMenuOpen(false)}>Contact</Link></li>
        </ul>
      </div>
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      <div className="container row header-inner">
        {/* Mobile menu trigger button */}
        <span
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(true)}
          title="Menu"
        >
          <i className="fa-solid fa-bars"></i>
        </span>

        {/* Custom ViralVideo Logo */}
        <div className="header-logo">
          <div className="main-logo">
            <Logo variant="light" />
          </div>
        </div>

        {/* Desktop Navigation Menu */}
        <div className="header-menu">
          <nav id="main-menu">
            <ul id="main-menu-nav" role="menubar">
              <li><Link href="/" role="menuitem">Home</Link></li>
              <li><Link href="/?featured=1" role="menuitem">ফিচার</Link></li>
              <li><Link href="/category/bangla" role="menuitem">বাংলা মুভি এবং ওয়েব সিরিজ</Link></li>
              <li><Link href="/category/hindi" role="menuitem">হিন্দি মুভি ও ওয়েব সিরিজ</Link></li>
              <li><Link href="/category/english" role="menuitem">ইংলিশ মুভি ও সিরিজ</Link></li>
              <li><Link href="/category/korean" role="menuitem">কোরিয়ান মুভি ও সিরিজ</Link></li>
            </ul>
          </nav>
        </div>

        {/* Search bar slide-down */}
        <div id="nav-search" style={{ display: searchOpen ? 'block' : 'none' }}>
          <form className="search-form" onSubmit={handleSearchSubmit} role="search">
            <input
              type="search"
              className="search-input"
              placeholder="মুভি বা সিরিজ সন্ধান করুন..."
              autoComplete="off"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus={searchOpen}
            />
            <span
              className="hide-search"
              onClick={() => setSearchOpen(false)}
              title="Close Search"
            >
              <i className="fa-solid fa-xmark"></i>
            </span>
          </form>
        </div>

        {/* Search trigger icon button */}
        {!searchOpen && (
          <span
            className="show-search"
            onClick={() => setSearchOpen(true)}
            title="Search"
          >
            <i className="fa-solid fa-magnifying-glass"></i>
          </span>
        )}
      </div>
    </header>
  )
}
