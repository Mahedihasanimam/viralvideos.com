'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { db } from '@/lib/supabase'
import { CFG } from '@/lib/adminConfig'
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname(), router = useRouter(), [ok, setOk] = useState(false), [error, setError] = useState('')
  const isLogin = path === '/admin/login'
  useEffect(() => {
    if (isLogin) return
    ;(async () => {
      const { data: { user }, error: authError } = await db().auth.getUser()
      if (authError) { setError(authError.message); return }
      const { data, error: adminError } = user ? await db().from('admins').select('user_id').eq('user_id', user.id).maybeSingle() : { data: null, error: null }
      if (adminError) { setError(`Could not verify admin access: ${adminError.message}`); return }
      if (!data) router.replace('/admin/login'); else setOk(true)
    })()
  }, [path])
  if (isLogin) return <div className="admin">{children}</div>
  if (!ok) return <div className="admin admin-status"><p>{error || 'Checking access…'}</p>{error && <Link href="/admin/login">Return to sign in</Link>}</div>
  return (
    <div className="admin admin-dashboard">
      <aside className="admin-sidebar">
        <Link href="/admin/site_texts" className="admin-brand">
          <span className="admin-brand-mark">RB</span>
          <span><b>Review Bazar</b><small>Admin panel</small></span>
        </Link>
        <p className="admin-menu-label">Manage website</p>
        <nav className="admin-menu">
          {Object.entries(CFG).map(([k, c]: any) => (
            <Link key={k} href={`/admin/${k}`} className={path === `/admin/${k}` ? 'on' : ''}>
              <span className="admin-menu-icon">{c.icon}</span>{c.title}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <Link href="/" className="admin-site-link"><span>↗</span> View website</Link>
          <button className="admin-signout" onClick={async () => { await db().auth.signOut(); router.replace('/admin/login') }}><span>↪</span> Sign out</button>
        </div>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-topbar-kicker">Website control center</p>
            <strong>Good to see you, Admin</strong>
          </div>
          <Link href="/" className="admin-view-button">View live site ↗</Link>
        </header>
        <main className="admin-content">{children}</main>
      </section>
    </div>
  )
}
