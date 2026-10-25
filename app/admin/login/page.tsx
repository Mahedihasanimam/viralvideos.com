'use client'
import '@/app/admin.css'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/supabase'
import AdminIcon from '@/components/AdminIcon'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  const go = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (busy) return
    setErr('')
    setBusy(true)
    const { error } = await db().auth.signInWithPassword({ email, password })
    if (error) {
      setErr(error.message)
      setBusy(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <main className="login-shell">
      {/* Left Column: Form Card */}
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand">
          <span className="login-mark">
            <AdminIcon name="film" size={22} />
          </span>
          <div>
            <strong style={{ fontSize: 18, color: '#1e3328', display: 'block' }}>Viral Videos</strong>
            <small style={{ fontSize: 11, color: '#7b8e85', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>
              Control Center
            </small>
          </div>
        </div>

        <div className="login-heading">
          <p className="login-eyebrow">Content Management</p>
          <h1 id="login-title">Welcome back</h1>
          <p>Sign in to manage your reviews, pages, and website content.</p>
        </div>

        <form className="login-form" onSubmit={go}>
          <label htmlFor="admin-email">Email address</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {err && <p className="login-error" role="alert">⚠ {err}</p>}

          <button className="login-submit" type="submit" disabled={busy}>
            {busy ? <><span className="spinner sm" /> Signing in…</> : 'Sign in to dashboard →'}
          </button>
        </form>

        <Link className="login-back" href="/">
          ← Back to website
        </Link>
      </section>

      {/* Right Column: Hero Aside */}
      <aside className="login-aside">
        <div className="login-aside-content">
          <p className="login-eyebrow">Viral Videos Movies</p>
          <h2>Your stories deserve a beautiful home.</h2>
          <p>
            Publish thoughtful reviews, upload high-quality posters, and keep every part of your movie magazine up to date.
          </p>

          <div className="login-features">
            <div className="login-feature-item">
              <span className="login-feature-check">✓</span>
              <span>Fast & easy review writing with Rich Text Editor</span>
            </div>
            <div className="login-feature-item">
              <span className="login-feature-check">✓</span>
              <span>Upload posters with 98% automatic storage compression</span>
            </div>
            <div className="login-feature-item">
              <span className="login-feature-check">✓</span>
              <span>Easily manage categories, pages, menus, and site texts</span>
            </div>
          </div>
        </div>

        <div className="login-aside-footer">
          <span>🔒 Private Admin Area</span>
          <span>·</span>
          <span>Viral Videos</span>
        </div>
      </aside>
    </main>
  )
}
