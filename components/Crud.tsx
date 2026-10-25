'use client'
import { useEffect, useState, useCallback } from 'react'
import { db } from '@/lib/supabase'
import AdminIcon from '@/components/AdminIcon'
import ImageUploader from '@/components/ImageUploader'
import RichTextEditor from '@/components/RichTextEditor'

const PAGE_SIZE = 25

const SQL_FIX = `-- 1. Ensure all columns exist on posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS language text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS platform text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS download_url text;

-- 2. Grant table access to authenticated (admin) and anon (visitors)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL ROUTINES IN SCHEMA public TO anon;

-- 3. Make future tables accessible automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO anon;

-- 4. Ensure admin user registration and reload schema cache
INSERT INTO admins (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

NOTIFY pgrst, 'reload schema';`

export default function Crud({ cfg }: { cfg: any }) {
  const [rows, setRows] = useState<any[]>([])
  const [row, setRow] = useState<any>(null)
  const [isNew, setNew] = useState(false)
  const [refs, setRefs] = useState<Record<string, any[]>>({})
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState<'ok' | 'err'>('ok')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [permError, setPermError] = useState(false)
  const [copiedSql, setCopiedSql] = useState(false)

  const singular = cfg.singular || cfg.title.replace(/s$/, '')
  const searchCol = cfg.cols?.[0] || 'title'
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const load = useCallback(async (searchVal = search, pg = page) => {
    setLoading(true)
    let q = db().from(cfg.table).select('*', { count: 'exact' }).order(cfg.order, { ascending: cfg.asc ?? true })
    if (searchVal.trim()) {
      q = q.ilike(searchCol, `%${searchVal.trim()}%`)
    }
    q = q.range((pg - 1) * PAGE_SIZE, pg * PAGE_SIZE - 1)
    const { data, error, count } = await (q as any)
    if (error) {
      if (error.message?.includes('permission denied')) {
        setPermError(true)
      }
      notify('Could not load data: ' + error.message, 'err')
    } else {
      setPermError(false)
      setRows(data || [])
      setTotal(count ?? 0)
    }
    setLoading(false)
  }, [cfg.table, cfg.order, cfg.asc, search, page, searchCol])

  useEffect(() => {
    setRow(null)
    setMsg('')
    setSearch('')
    setPage(1)
    setPermError(false)
    load('', 1)

    // Load referenced items (e.g. categories for post category_id)
    cfg.fields?.filter((f: any) => f.ref).forEach(async (f: any) => {
      const { data } = await db().from(f.ref).select('id,name').order('sort', { ascending: true })
      if (data) {
        setRefs(prev => ({ ...prev, [f.n]: data }))
      }
    })
  }, [cfg.table])

  const notify = (m: string, t: 'ok' | 'err' = 'ok') => {
    setMsg(m)
    setMsgType(t)
  }

  const handleSearch = (v: string) => {
    setSearch(v)
    setPage(1)
    load(v, 1)
  }

  const goPage = (p: number) => {
    setPage(p)
    load(search, p)
  }

  const copySql = () => {
    navigator.clipboard.writeText(SQL_FIX)
    setCopiedSql(true)
    setTimeout(() => setCopiedSql(false), 3000)
  }

  const openNew = () => {
    const defaults: any = { published: true, featured: false, views: 0 }
    if (cfg.table === 'site_texts') defaults.grp = 'General'
    if (cfg.table === 'nav_links') defaults.location = 'header'
    setRow(defaults)
    setNew(true)
    setMsg('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openEdit = (item: any) => {
    setRow({ ...item })
    setNew(false)
    setMsg('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const closeForm = () => {
    setRow(null)
    setNew(false)
  }

  const setField = (n: string, v: any) => {
    setRow((prev: any) => ({ ...prev, [n]: v }))
  }

  const save = async () => {
    setMsg('')
    setSaving(true)
    const r: any = { ...row }

    // Type coercion
    cfg.fields?.forEach((f: any) => {
      if (f.t === 'num') {
        r[f.n] = r[f.n] === '' || r[f.n] == null ? 0 : Number(r[f.n])
      }
      if (f.t === 'ref' && !r[f.n]) {
        r[f.n] = null
      }
    })

    // Auto-generate slug for posts if blank
    if (cfg.table === 'posts' && !r.slug) {
      r.slug = r.title
        ? r.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36)
        : 'p-' + Date.now().toString(36)
    }

    // Try saving with automatic fallback for missing optional columns
    const payload = { ...r }
    let lastError: any = null
    let skippedCols: string[] = []

    for (let attempt = 0; attempt < 6; attempt++) {
      const { error } = await db().from(cfg.table).upsert(payload, { onConflict: cfg.pk })
      if (!error) {
        lastError = null
        break
      }
      lastError = error
      // Check if error is due to a missing column in Supabase schema cache
      const match = error.message?.match(/Could not find the '([^']+)' column of/)
      if (match && match[1] && payload[match[1]] !== undefined) {
        skippedCols.push(match[1])
        delete payload[match[1]]
        continue
      }
      break
    }

    setSaving(false)
    if (lastError) {
      if (lastError.message?.includes('permission denied')) setPermError(true)
      notify('Error saving: ' + lastError.message, 'err')
    } else {
      const note = skippedCols.length > 0
        ? ` (Note: Run the SQL update in Help & Database to save: ${skippedCols.join(', ')})`
        : ''
      notify(`✓ Successfully saved "${r.title || r.name || r.label || singular}"!${note}`, 'ok')
      setRow(null)
      load()
    }
  }

  const del = async (itemToDelete?: any) => {
    const target = itemToDelete || row
    if (!target) return
    const displayName = target.title || target.name || target.label || singular
    if (!confirm(`Are you sure you want to delete "${displayName}"? This cannot be undone.`)) {
      return
    }

    const pkVal = target[cfg.pk]
    setDeletingId(pkVal)
    const { error } = await db().from(cfg.table).delete().eq(cfg.pk, pkVal)
    setDeletingId(null)

    if (error) {
      if (error.message?.includes('permission denied')) setPermError(true)
      notify('Error deleting: ' + error.message, 'err')
    } else {
      notify(`Deleted "${displayName}"`, 'ok')
      if (row && row[cfg.pk] === pkVal) setRow(null)
      load()
    }
  }

  const getCategoryName = (catId: string) => {
    const list = refs['category_id'] || []
    const match = list.find(c => c.id === catId)
    return match ? match.name : null
  }

  // =========================================================================
  // RENDER: EDITOR / CREATE VIEW
  // =========================================================================
  if (row) {
    return (
      <div className="easy-editor">
        {/* Top bar with back button & quick save */}
        <div className="easy-editor-topbar">
          <button className="easy-btn-back" onClick={closeForm}>
            <AdminIcon name="back" size={16} /> Back to all {cfg.title}
          </button>
          <div className="easy-editor-actions-top">
            <button className="easy-btn easy-btn-ghost" onClick={closeForm}>
              Cancel
            </button>
            <button className="easy-btn easy-btn-primary" disabled={saving} onClick={save}>
              {saving ? <><span className="spinner sm" />Saving…</> : <><AdminIcon name="save" size={16} /> Save Changes</>}
            </button>
          </div>
        </div>

        {msg && (
          <div className={`easy-alert ${msgType === 'err' ? 'easy-alert-err' : 'easy-alert-ok'}`}>
            <AdminIcon name={msgType === 'ok' ? 'check' : 'alert'} size={18} />
            <div style={{ flex: 1 }}>{msg}</div>
            <button className="easy-alert-close" onClick={() => setMsg('')}>×</button>
          </div>
        )}

        {permError && (
          <div className="easy-perm-banner">
            <div className="easy-perm-icon">
              <AdminIcon name="alert" size={24} />
            </div>
            <div className="easy-perm-content">
              <strong>Database Permissions Fix Required</strong>
              <p>
                Your database reported: <em>permission denied for table {cfg.table}</em>.
                Run the quick 10-second fix in your Supabase SQL Editor to enable full access:
              </p>
              <button className="easy-btn easy-btn-sql" onClick={copySql}>
                <AdminIcon name="copy" size={15} />
                {copiedSql ? 'Copied SQL to Clipboard!' : 'Copy 10-Second SQL Fix'}
              </button>
            </div>
          </div>
        )}

        <div className="easy-card">
          <div className="easy-card-header">
            <h2>{isNew ? `Create New ${singular}` : `Edit: ${row.title || row.name || row.label || singular}`}</h2>
            <p className="easy-card-sub">Fill in the details below. Click <strong>Save Changes</strong> when you are done.</p>
          </div>

          <div className="easy-form-grid">
            {cfg.fields?.map((f: any) => {
              const val = row[f.n] ?? ''
              const isLocked = f.lockOnEdit && !isNew

              // Image Uploader (File upload from device OR paste link)
              if (f.t === 'image' || f.n === 'image_url') {
                return (
                  <div key={f.n} className="easy-field-row easy-field-full">
                    <ImageUploader
                      value={val}
                      onChange={url => setField(f.n, url)}
                      label={f.l}
                      hint={f.hint}
                    />
                  </div>
                )
              }

              // Rich Text Editor (WYSIWYG with headings, bold, lists, links, images)
              if (f.t === 'richtext') {
                return (
                  <div key={f.n} className="easy-field-row easy-field-full">
                    <label className="easy-field-label">
                      {f.l} {f.req && <span className="easy-req">*</span>}
                    </label>
                    <RichTextEditor
                      value={val}
                      onChange={html => setField(f.n, html)}
                      placeholder={f.placeholder}
                    />
                    {f.hint && <p className="easy-field-hint">{f.hint}</p>}
                  </div>
                )
              }

              // Boolean toggle
              if (f.t === 'bool') {
                return (
                  <div key={f.n} className="easy-field-row easy-toggle-row">
                    <div>
                      <strong className="easy-field-label">{f.l}</strong>
                      {f.hint && <p className="easy-field-hint">{f.hint}</p>}
                    </div>
                    <label className="easy-toggle-switch">
                      <input
                        type="checkbox"
                        checked={!!val}
                        onChange={e => setField(f.n, e.target.checked)}
                      />
                      <span className="easy-toggle-slider" />
                      <span className="easy-toggle-status">{val ? 'Active / Yes' : 'Hidden / No'}</span>
                    </label>
                  </div>
                )
              }

              // Textarea
              if (f.t === 'area') {
                return (
                  <div key={f.n} className="easy-field-row easy-field-full">
                    <label className="easy-field-label" htmlFor={`field-${f.n}`}>
                      {f.l} {f.req && <span className="easy-req">*</span>}
                    </label>
                    <textarea
                      id={`field-${f.n}`}
                      rows={f.rows || 4}
                      className="easy-input easy-textarea"
                      placeholder={f.placeholder || f.l}
                      value={val}
                      onChange={e => setField(f.n, e.target.value)}
                    />
                    {f.hint && <p className="easy-field-hint">{f.hint}</p>}
                  </div>
                )
              }

              // Reference dropdown (e.g. Category)
              if (f.t === 'ref') {
                return (
                  <div key={f.n} className="easy-field-row">
                    <label className="easy-field-label" htmlFor={`field-${f.n}`}>
                      {f.l} {f.req && <span className="easy-req">*</span>}
                    </label>
                    <select
                      id={`field-${f.n}`}
                      className="easy-input easy-select"
                      value={val}
                      onChange={e => setField(f.n, e.target.value)}
                    >
                      <option value="">— Select {f.l} —</option>
                      {(refs[f.n] || []).map((o: any) => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                    {f.hint && <p className="easy-field-hint">{f.hint}</p>}
                  </div>
                )
              }

              // Standard inputs (text, number, url)
              return (
                <div key={f.n} className={`easy-field-row ${f.n === 'title' ? 'easy-field-full' : ''}`}>
                  <label className="easy-field-label" htmlFor={`field-${f.n}`}>
                    {f.l} {f.req && <span className="easy-req">*</span>}
                  </label>
                  <input
                    id={`field-${f.n}`}
                    type={f.t === 'num' ? 'number' : f.t === 'url' ? 'url' : 'text'}
                    className="easy-input"
                    disabled={isLocked}
                    placeholder={f.placeholder || f.l}
                    value={val}
                    onChange={e => setField(f.n, e.target.value)}
                  />
                  {f.hint && <p className="easy-field-hint">{f.hint}</p>}
                </div>
              )
            })}
          </div>

          {/* Bottom Actions */}
          <div className="easy-card-footer">
            <button className="easy-btn easy-btn-primary easy-btn-lg" disabled={saving} onClick={save}>
              {saving ? <><span className="spinner sm" />Saving…</> : <><AdminIcon name="save" size={18} /> Save Changes</>}
            </button>
            <button className="easy-btn easy-btn-ghost" onClick={closeForm}>
              Cancel
            </button>
            {!isNew && (
              <button
                className="easy-btn easy-btn-danger"
                style={{ marginLeft: 'auto' }}
                disabled={saving}
                onClick={() => del(row)}
              >
                <AdminIcon name="delete" size={16} /> Delete This {singular}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // RENDER: LIST VIEW
  // =========================================================================
  return (
    <div className="easy-container">
      {/* Header with Title & Big Add Button */}
      <div className="easy-header">
        <div>
          <h1 className="easy-title">
            <span className="easy-title-icon">
              <AdminIcon name={cfg.icon} size={24} />
            </span>
            {cfg.title}
          </h1>
          <p className="easy-subtitle">
            Manage your website {cfg.title.toLowerCase()}. Total: <strong>{total}</strong>
          </p>
        </div>
        <button className="easy-btn easy-btn-primary easy-btn-lg" onClick={openNew}>
          <AdminIcon name="plus" size={18} />
          <span>Add New {singular}</span>
        </button>
      </div>

      {/* Permission Error Banner */}
      {permError && (
        <div className="easy-perm-banner">
          <div className="easy-perm-icon">
            <AdminIcon name="alert" size={24} />
          </div>
          <div className="easy-perm-content">
            <strong>Action Needed: Supabase Permission Error</strong>
            <p>
              Supabase reported: <em>permission denied for table {cfg.table}</em>.
              This happens when the database tables are missing role permissions for authenticated admin users.
            </p>
            <div style={{ marginTop: 10 }}>
              <button className="easy-btn easy-btn-sql" onClick={copySql}>
                <AdminIcon name="copy" size={15} />
                {copiedSql ? 'Copied SQL to Clipboard!' : 'Copy 10-Second SQL Fix'}
              </button>
              <span style={{ marginLeft: 12, fontSize: 13, color: '#334244' }}>
                Paste into <strong>Supabase Dashboard &gt; SQL Editor</strong> and click <strong>Run</strong>.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {msg && (
        <div className={`easy-alert ${msgType === 'err' ? 'easy-alert-err' : 'easy-alert-ok'}`}>
          <AdminIcon name={msgType === 'ok' ? 'check' : 'alert'} size={18} />
          <div style={{ flex: 1 }}>{msg}</div>
          <button className="easy-alert-close" onClick={() => setMsg('')}>×</button>
        </div>
      )}

      {/* Search Toolbar */}
      <div className="easy-toolbar">
        <div className="easy-search-box">
          <span className="easy-search-icon">
            <AdminIcon name="search" size={16} />
          </span>
          <input
            type="search"
            className="easy-search-input"
            placeholder={`Search ${cfg.title.toLowerCase()} by title or name…`}
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
          {search && (
            <button className="easy-search-clear" onClick={() => handleSearch('')}>
              ×
            </button>
          )}
        </div>
      </div>

      {/* Items List */}
      <div className="easy-card" style={{ padding: 0 }}>
        {loading ? (
          <div className="easy-loading">
            <span className="spinner lg" />
            <p>Loading {cfg.title.toLowerCase()}…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="easy-empty">
            <div className="easy-empty-icon">
              <AdminIcon name={cfg.icon} size={36} />
            </div>
            <h3>No {cfg.title.toLowerCase()} found</h3>
            <p>
              {search
                ? `No items matched your search "${search}". Try searching something else.`
                : `You don't have any ${cfg.title.toLowerCase()} yet.`}
            </p>
            <button className="easy-btn easy-btn-primary" style={{ marginTop: 12 }} onClick={openNew}>
              <AdminIcon name="plus" size={16} />
              <span>Create Your First {singular}</span>
            </button>
          </div>
        ) : (
          <div className="easy-list">
            {rows.map(r => {
              const id = r[cfg.pk]
              const title = r.title || r.name || r.label || '(Untitled)'
              const catName = r.category_id ? getCategoryName(r.category_id) : null
              const isDeleting = deletingId === id

              return (
                <div key={id} className="easy-item-row" onClick={() => openEdit(r)}>
                  {/* Thumbnail if post */}
                  {cfg.table === 'posts' && (
                    <div className="easy-item-thumb">
                      {r.image_url ? (
                        <img src={r.image_url} alt={title} />
                      ) : (
                        <div className="easy-item-thumb-placeholder">
                          <AdminIcon name="film" size={24} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Main Info */}
                  <div className="easy-item-info">
                    <div className="easy-item-title-row">
                      <strong className="easy-item-title">{title}</strong>
                      {r.published === true && <span className="easy-badge easy-badge-green">Published</span>}
                      {r.published === false && <span className="easy-badge easy-badge-gray">Draft</span>}
                      {r.featured && <span className="easy-badge easy-badge-yellow">Featured ★</span>}
                    </div>

                    <div className="easy-item-meta">
                      {catName && (
                        <span className="easy-meta-tag">
                          <AdminIcon name="tags" size={12} /> {catName}
                        </span>
                      )}
                      {r.slug && (
                        <span className="easy-meta-tag">
                          <AdminIcon name="link" size={12} /> /{r.slug}
                        </span>
                      )}
                      {r.location && (
                        <span className="easy-meta-tag">
                          <AdminIcon name="menu" size={12} /> {r.location} menu
                        </span>
                      )}
                      {r.grp && (
                        <span className="easy-meta-tag">
                          <AdminIcon name="layers" size={12} /> {r.grp}
                        </span>
                      )}
                      {r.views != null && (
                        <span className="easy-meta-tag">
                          <AdminIcon name="eye" size={12} /> {r.views} views
                        </span>
                      )}
                      {r.value && (
                        <span className="easy-meta-text">
                          {String(r.value).slice(0, 75)}
                          {String(r.value).length > 75 ? '…' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions right on each item */}
                  <div className="easy-item-actions" onClick={e => e.stopPropagation()}>
                    <button
                      className="easy-btn easy-btn-edit"
                      onClick={() => openEdit(r)}
                      title="Edit this item"
                    >
                      <AdminIcon name="edit" size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      className="easy-btn easy-btn-del"
                      disabled={isDeleting}
                      onClick={() => del(r)}
                      title="Delete this item"
                    >
                      {isDeleting ? '…' : <AdminIcon name="delete" size={14} />}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="easy-pagination">
            <span className="easy-pag-info">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} items
            </span>
            <div className="easy-pag-controls">
              <button
                className="easy-btn easy-btn-ghost easy-btn-sm"
                disabled={page <= 1}
                onClick={() => goPage(page - 1)}
              >
                ‹ Previous
              </button>
              <span className="easy-pag-current">
                Page {page} of {totalPages}
              </span>
              <button
                className="easy-btn easy-btn-ghost easy-btn-sm"
                disabled={page >= totalPages}
                onClick={() => goPage(page + 1)}
              >
                Next ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
