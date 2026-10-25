'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/supabase'
import AdminIcon from '@/components/AdminIcon'

export default function SettingsPage() {
  const [admins, setAdmins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState<'ok' | 'err'>('ok')
  const [busy, setBusy] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const notify = (m: string, t: 'ok' | 'err' = 'ok') => { setMsg(m); setMsgType(t) }

  const loadAdmins = async () => {
    setLoading(true)
    // We can list from auth.users joined with admins if we use the service key,
    // but with anon key we can only see our own row. So we show what we can.
    const { data: { user } } = await db().auth.getUser()
    setCurrentUser(user)
    const { data, error } = await db().from('admins').select('user_id')
    if (!error) setAdmins(data || [])
    setLoading(false)
  }

  useEffect(() => { loadAdmins() }, [])

  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setBusy(true)
    setMsg('')
    // We can't lookup users by email with anon key — provide instructions instead
    notify(
      `To grant admin access to "${email}", run this in Supabase SQL Editor:\n` +
      `INSERT INTO admins (user_id) SELECT id FROM auth.users WHERE email = '${email}';`,
      'ok'
    )
    setBusy(false)
  }

  const removeAdmin = async (userId: string) => {
    if (userId === currentUser?.id) {
      if (!confirm('Remove your own admin access? You will be signed out.')) return
    } else {
      if (!confirm('Remove this admin?')) return
    }
    setBusy(true)
    const { error } = await db().from('admins').delete().eq('user_id', userId)
    setBusy(false)
    if (error) notify('Error: ' + error.message, 'err')
    else {
      notify('Removed')
      if (userId === currentUser?.id) {
        await db().auth.signOut()
        window.location.href = '/admin/login'
      } else {
        loadAdmins()
      }
    }
  }

  return (
    <div className="settings-page">
      <div className="admin-page-heading">
        <div>
          <p className="admin-page-kicker">Configuration</p>
          <h1>Settings</h1>
        </div>
      </div>

      {msg && (
        <div className={`crud2-msg ${msgType === 'err' ? 'err' : 'ok'}`} style={{ marginBottom: 20 }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
            {msgType === 'ok' ? '✓ ' : '⚠ '}{msg}
          </pre>
          <button className="crud2-msg-close" onClick={() => setMsg('')}>×</button>
        </div>
      )}

      <div className="settings-grid">
        {/* Admin Users Card */}
        <div className="settings-card">
          <h2 className="settings-card-title">
            <AdminIcon name="tags" size={20} /> Admin Users
          </h2>
          <p className="settings-card-desc">
            Users who can access this admin panel. Only existing Supabase Auth users can be added.
          </p>

          {loading ? (
            <div className="dash-loading"><span className="spinner" /> Loading…</div>
          ) : (
            <div className="settings-admin-list">
              {admins.map((a) => (
                <div key={a.user_id} className="settings-admin-row">
                  <div className="settings-admin-avatar">
                    {(currentUser?.email || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="settings-admin-info">
                    <strong>{a.user_id === currentUser?.id ? currentUser?.email : a.user_id}</strong>
                    {a.user_id === currentUser?.id && <span className="badge badge-green">You</span>}
                  </div>
                  <button
                    className="btn btn-danger-sm"
                    onClick={() => removeAdmin(a.user_id)}
                    disabled={busy}
                  >
                    Remove
                  </button>
                </div>
              ))}
              {admins.length === 0 && <p style={{ color: '#788486', fontSize: 13 }}>No admins found.</p>}
            </div>
          )}

          <div className="settings-divider" />
          <h3 className="settings-subheading">Add Admin by Email</h3>
          <p className="settings-card-desc">
            The user must already exist in Supabase Authentication. This will generate the SQL command to run.
          </p>
          <form className="settings-add-form" onSubmit={addAdmin}>
            <input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button className="btn btn-primary" type="submit" disabled={busy}>
              Generate SQL
            </button>
          </form>
        </div>

        {/* Site Info Card */}
        <div className="settings-card">
          <h2 className="settings-card-title">
            <AdminIcon name="help" size={20} /> About This Installation
          </h2>
          <div className="settings-info-list">
            <div className="settings-info-row">
              <span>Platform</span>
              <strong>Next.js + Supabase</strong>
            </div>
            <div className="settings-info-row">
              <span>Admin Users</span>
              <strong>{admins.length}</strong>
            </div>
            <div className="settings-info-row">
              <span>Supabase URL</span>
              <strong style={{ fontSize: 11, wordBreak: 'break-all' }}>
                {process.env.NEXT_PUBLIC_SUPABASE_URL || '(not set)'}
              </strong>
            </div>
          </div>

          <div className="settings-divider" />

          <h3 className="settings-subheading">Database Schema & Permissions Fix</h3>
          <p className="settings-card-desc">
            Fixes "column not found" and "permission denied" errors. Run this once in <strong>Supabase Dashboard &gt; SQL Editor</strong>:
          </p>
          <div className="settings-sql-block">
            <pre style={{ maxHeight: 160, overflowY: 'auto' }}>{`ALTER TABLE posts ADD COLUMN IF NOT EXISTS language text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS platform text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS download_url text;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL ROUTINES IN SCHEMA public TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO anon;

INSERT INTO admins (user_id) SELECT id FROM auth.users ON CONFLICT DO NOTHING;

NOTIFY pgrst, 'reload schema';`}</pre>
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: 8 }}
            onClick={() => {
              navigator.clipboard.writeText(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS language text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS platform text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS download_url text;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL ROUTINES IN SCHEMA public TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO anon;

INSERT INTO admins (user_id) SELECT id FROM auth.users ON CONFLICT DO NOTHING;

NOTIFY pgrst, 'reload schema';`)
              notify('Copied SQL fix to clipboard! Paste into Supabase SQL Editor and click Run.', 'ok')
            }}
          >
            <AdminIcon name="copy" size={15} /> Copy SQL Fix
          </button>
        </div>

        {/* Quick Links Card */}
        <div className="settings-card">
          <h2 className="settings-card-title">
            <AdminIcon name="link" size={20} /> External Links
          </h2>
          <div className="settings-ext-links">
            {[
              { label: 'Supabase Dashboard', href: 'https://supabase.com/dashboard', desc: 'Manage database, auth & storage' },
              { label: 'Next.js Docs', href: 'https://nextjs.org/docs', desc: 'App router documentation' },
              { label: 'View Live Site', href: '/', desc: 'Open your public website' },
            ].map(l => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="settings-ext-link">
                <div>
                  <strong>{l.label}</strong>
                  <span>{l.desc}</span>
                </div>
                <span>↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
