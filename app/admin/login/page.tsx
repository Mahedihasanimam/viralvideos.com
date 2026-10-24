'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/supabase'
export default function Login() {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false), router = useRouter()
  const go = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (busy) return
    setErr('')
    setBusy(true)
    const { error } = await db().auth.signInWithPassword({ email, password })
    if (error) {
      setErr(error.message)
      setBusy(false)
    } else router.push('/admin/site_texts')
  }
  return (
    <main className="login-shell">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand">
          <span className="login-mark">RB</span>
          <span>Review Bazar</span>
        </div>
        <div className="login-heading">
          <p className="login-eyebrow">Content management</p>
          <h1 id="login-title">Welcome back</h1>
          <p>Sign in to manage your reviews, pages, and site settings.</p>
        </div>
        <form className="login-form" onSubmit={go}>
          <label htmlFor="admin-email">Email address</label>
          <input id="admin-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label htmlFor="admin-password">Password</label>
          <input id="admin-password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {err && <p className="login-error" role="alert">{err}</p>}
          <button className="login-submit" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in to dashboard'}</button>
        </form>
        <a className="login-back" href="/">← Back to website</a>
      </section>
      <aside className="login-aside">
        <div>
          <p className="login-eyebrow">Review Bazar Movies</p>
          <h2>Your stories deserve a beautiful home.</h2>
          <p>Publish thoughtful reviews and keep every part of your movie magazine up to date.</p>
        </div>
        <span className="login-aside-footer">Private admin area</span>
      </aside>
    </main>
  )
}
