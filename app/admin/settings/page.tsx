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
            Creates all tables (including <strong>Ad Settings</strong>) and fixes permissions. Run this once in <strong>Supabase Dashboard &gt; SQL Editor</strong>:
          </p>
          <div className="settings-sql-block">
            <pre style={{ maxHeight: 180, overflowY: 'auto' }}>{`-- 1. Create ad_settings table
CREATE TABLE IF NOT EXISTS ad_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot text UNIQUE NOT NULL,
  label text NOT NULL DEFAULT '',
  ad_type text NOT NULL DEFAULT 'banner' CHECK (ad_type IN ('banner', 'native', 'smartlink')),
  key_value text NOT NULL DEFAULT '',
  script_url text NOT NULL DEFAULT '',
  target_url text NOT NULL DEFAULT '',
  width int NOT NULL DEFAULT 0,
  height int NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Ensure post columns exist
ALTER TABLE posts ADD COLUMN IF NOT EXISTS language text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS platform text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS download_url text;

-- 3. Permissions
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

-- 4. Enable RLS & policies for ad_settings
ALTER TABLE ad_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_ads" ON ad_settings;
DROP POLICY IF EXISTS "admin_ads" ON ad_settings;
CREATE POLICY "read_ads" ON ad_settings FOR SELECT USING (true);
CREATE POLICY "admin_ads" ON ad_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
);

-- 5. Insert default ad slots if not exist
INSERT INTO ad_settings (slot, label, ad_type, key_value, script_url, target_url, width, height) VALUES
('native_sidebar', 'Sidebar native ad', 'native', '6fb853f324c105cabb940b068bf675d0', 'https://bancadeltempoidea.org/21/6fb853f324c105cabb940b068bf675d0', '', 0, 0),
('banner_300x250', 'Sidebar 300x250 banner', 'banner', '6aee385fd7d8587b55e2df7c7f10bc8d', 'https://bancadeltempoidea.org/22/6aee385fd7d8587b55e2df7c7f10bc8d', '', 300, 250),
('banner_468x60', 'Inline 468x60 banner', 'banner', 'a76fd710f7a27301e5c4e5a6a10ed59d', 'https://bancadeltempoidea.org/22/a76fd710f7a27301e5c4e5a6a10ed59d', '', 468, 60),
('banner_160x300', 'Sidebar 160x300 banner', 'banner', '92d17c94bab006dd97e6cb8ae3e5d36c', 'https://bancadeltempoidea.org/22/92d17c94bab006dd97e6cb8ae3e5d36c', '', 160, 300),
('banner_320x50', 'Mobile top 320x50 banner', 'banner', '439ae85f24a41e503f4433dcf29bfdb3', 'https://bancadeltempoidea.org/22/439ae85f24a41e503f4433dcf29bfdb3', '', 320, 50),
('banner_728x90', 'Desktop top 728x90 banner', 'banner', '92befdeb1f92f13a75cdd637578617e7', 'https://bancadeltempoidea.org/22/92befdeb1f92f13a75cdd637578617e7', '', 728, 90),
('smartlink_global', 'Global smartlink', 'smartlink', '', '', 'https://directyp.org/4/d74988ed07d2e9cf1ebf1e68fcddcb89', 0, 0),
('popunder_global', 'Global popunder script', 'native', '', 'https://aarems.org/1/f023ee03cd0e81f8ac94c7462316d8ba', '', 0, 0),
('socialbar_global', 'Global social bar script', 'native', '', 'https://bancadeltempoidea.org/14/7ca7d3009b54e2e6eb42f9b429b26800', '', 0, 0)
ON CONFLICT (slot) DO NOTHING;

INSERT INTO admins (user_id) SELECT id FROM auth.users ON CONFLICT DO NOTHING;

NOTIFY pgrst, 'reload schema';`}</pre>
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: 8 }}
            onClick={() => {
              navigator.clipboard.writeText(`CREATE TABLE IF NOT EXISTS ad_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot text UNIQUE NOT NULL,
  label text NOT NULL DEFAULT '',
  ad_type text NOT NULL DEFAULT 'banner' CHECK (ad_type IN ('banner', 'native', 'smartlink')),
  key_value text NOT NULL DEFAULT '',
  script_url text NOT NULL DEFAULT '',
  target_url text NOT NULL DEFAULT '',
  width int NOT NULL DEFAULT 0,
  height int NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE posts ADD COLUMN IF NOT EXISTS language text;
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

ALTER TABLE ad_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_ads" ON ad_settings;
DROP POLICY IF EXISTS "admin_ads" ON ad_settings;
CREATE POLICY "read_ads" ON ad_settings FOR SELECT USING (true);
CREATE POLICY "admin_ads" ON ad_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
);

INSERT INTO ad_settings (slot, label, ad_type, key_value, script_url, target_url, width, height) VALUES
('native_sidebar', 'Sidebar native ad', 'native', '6fb853f324c105cabb940b068bf675d0', 'https://bancadeltempoidea.org/21/6fb853f324c105cabb940b068bf675d0', '', 0, 0),
('banner_300x250', 'Sidebar 300x250 banner', 'banner', '6aee385fd7d8587b55e2df7c7f10bc8d', 'https://bancadeltempoidea.org/22/6aee385fd7d8587b55e2df7c7f10bc8d', '', 300, 250),
('banner_468x60', 'Inline 468x60 banner', 'banner', 'a76fd710f7a27301e5c4e5a6a10ed59d', 'https://bancadeltempoidea.org/22/a76fd710f7a27301e5c4e5a6a10ed59d', '', 468, 60),
('banner_160x300', 'Sidebar 160x300 banner', 'banner', '92d17c94bab006dd97e6cb8ae3e5d36c', 'https://bancadeltempoidea.org/22/92d17c94bab006dd97e6cb8ae3e5d36c', '', 160, 300),
('banner_320x50', 'Mobile top 320x50 banner', 'banner', '439ae85f24a41e503f4433dcf29bfdb3', 'https://bancadeltempoidea.org/22/439ae85f24a41e503f4433dcf29bfdb3', '', 320, 50),
('banner_728x90', 'Desktop top 728x90 banner', 'banner', '92befdeb1f92f13a75cdd637578617e7', 'https://bancadeltempoidea.org/22/92befdeb1f92f13a75cdd637578617e7', '', 728, 90),
('smartlink_global', 'Global smartlink', 'smartlink', '', '', 'https://directyp.org/4/d74988ed07d2e9cf1ebf1e68fcddcb89', 0, 0),
('popunder_global', 'Global popunder script', 'native', '', 'https://aarems.org/1/f023ee03cd0e81f8ac94c7462316d8ba', '', 0, 0),
('socialbar_global', 'Global social bar script', 'native', '', 'https://bancadeltempoidea.org/14/7ca7d3009b54e2e6eb42f9b429b26800', '', 0, 0)
ON CONFLICT (slot) DO NOTHING;

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
