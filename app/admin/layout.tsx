'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { db } from '@/lib/supabase'
import { CFG } from '@/lib/adminConfig'
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname(), router = useRouter(), [ok, setOk] = useState(false)
  const isLogin = path === '/admin/login'
  useEffect(() => {
    if (isLogin) return
    ;(async () => {
      const { data: { user } } = await db().auth.getUser()
      const { data } = user ? await db().from('admins').select('user_id').maybeSingle() : { data: null }
      if (!data) router.replace('/admin/login'); else setOk(true)
    })()
  }, [path])
  if (isLogin) return <div className="admin">{children}</div>
  if (!ok) return <div className="admin"><p>Checking access…</p></div>
  return (
    <div className="admin">
      <nav className="admin-nav">
        <strong>Admin</strong>
        {Object.entries(CFG).map(([k, c]: any) => <Link key={k} href={`/admin/${k}`} className={path === `/admin/${k}` ? 'on' : ''}>{c.title}</Link>)}
        <Link href="/">View site</Link>
        <button className="btn ghost" onClick={async () => { await db().auth.signOut(); router.replace('/admin/login') }}>Sign out</button>
      </nav>
      {children}
    </div>
  )
}
