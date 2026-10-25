'use client'
import '@/app/admin.css'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { db } from '@/lib/supabase'
import { NAV_SECTIONS } from '@/lib/adminConfig'
import AdminIcon from '@/components/AdminIcon'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const router = useRouter()
  const [ok, setOk] = useState(false)
  const [error, setError] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isLogin = path === '/admin/login'

  useEffect(() => {
    if (isLogin) return
      ; (async () => {
        const { data: { user }, error: authError } = await db().auth.getUser()
        if (authError) { setError(authError.message); return }
        const { data, error: adminError } = user
          ? await db().from('admins').select('user_id').eq('user_id', user.id).maybeSingle()
          : { data: null, error: null }
        if (adminError) { setError(`Could not verify admin: ${adminError.message}`); return }
        if (!data) router.replace('/admin/login')
        else { setOk(true); setAdminEmail(user?.email || 'Admin') }
      })()
  }, [path])

  if (isLogin) return <div className="admin">{children}</div>
  if (!ok) return (
    <div className="admin admin-status">
      <div className="admin-status-spinner"><span className="spinner lg" /></div>
      <p>{error || 'Checking access…'}</p>
      {error && <Link href="/admin/login" className="btn btn-primary">Return to sign in</Link>}
    </div>
  )

  const signOut = async () => {
    await db().auth.signOut()
    router.replace('/admin/login')
  }

  const activePath = (key: string) => {
    if (key === '') return path === '/admin'
    return path === `/admin/${key}`
  }

  return (
    <div className={`admin admin-dashboard ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile overlay */}
      {sidebarOpen && <div className="admin-mobile-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <Link href="/admin" className="admin-brand">
            <span className="admin-brand-mark">RB</span>
            <span>
              <b>Viral Videos</b>
              <small>Admin Panel</small>
            </span>
          </Link>
          <button className="admin-mobile-close" onClick={() => setSidebarOpen(false)}>×</button>
        </div>

        <p className="admin-menu-label">Website</p>
        <nav className="admin-menu">
          {NAV_SECTIONS.map(s => (
            <Link
              key={s.key}
              href={s.key === '' ? '/admin' : `/admin/${s.key}`}
              className={`admin-menu-item ${activePath(s.key) ? 'on' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="admin-menu-icon">
                <AdminIcon name={s.icon} size={18} />
              </span>
              <span>{s.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-user-pill">
            <span className="admin-user-avatar">{adminEmail.charAt(0).toUpperCase()}</span>
            <span className="admin-user-email">{adminEmail}</span>
          </div>
          <Link href="/" target="_blank" className="admin-site-link">
            <AdminIcon name="external" size={15} /> View website
          </Link>
          <button className="admin-signout" onClick={signOut}>
            <AdminIcon name="logout" size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <section className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="admin-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <span /><span /><span />
            </button>
            <div>
              <p className="admin-topbar-kicker">Viral Videos Movies</p>
              <strong>Control Center</strong>
            </div>
          </div>
          <div className="admin-topbar-right">
            <Link href="/" target="_blank" className="admin-view-button">View live site ↗</Link>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </section>
    </div>
  )
}
