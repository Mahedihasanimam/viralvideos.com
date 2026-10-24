'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/supabase'

export default function Crud({ cfg }: { cfg: any }) {
  const [rows, setRows] = useState<any[]>([])
  const [row, setRow] = useState<any>(null)
  const [isNew, setNew] = useState(false)
  const [refs, setRefs] = useState<any>({})
  const [msg, setMsg] = useState(''), [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data, error } = await db().from(cfg.table).select('*').order(cfg.order, { ascending: cfg.asc ?? true })
    if (error) setMsg('Could not load data: ' + error.message)
    else setRows(data || [])
    setLoading(false)
  }
  useEffect(() => {
    setRow(null); setMsg(''); load()
    cfg.fields.filter((f: any) => f.ref).forEach(async (f: any) => {
      const { data } = await db().from(f.ref).select('id,name').order('sort')
      setRefs((r: any) => ({ ...r, [f.n]: data || [] }))
    })
  }, [cfg.table])

  const save = async () => {
    setMsg('')
    setLoading(true)
    const r: any = { ...row }
    cfg.fields.forEach((f: any) => {
      if (f.t === 'num') r[f.n] = r[f.n] === '' || r[f.n] == null ? 0 : Number(r[f.n])
      if (f.t === 'ref' && !r[f.n]) r[f.n] = null
    })
    if (cfg.table === 'posts' && !r.slug) r.slug = 'p-' + Date.now().toString(36)
    const { error } = await db().from(cfg.table).upsert(r, { onConflict: cfg.pk })
    setLoading(false)
    setMsg(error ? 'Error: ' + error.message : 'Saved')
    if (!error) { setRow(null); load() }
  }
  const del = async () => {
    if (!confirm('Delete this item?')) return
    setLoading(true)
    const { error } = await db().from(cfg.table).delete().eq(cfg.pk, row[cfg.pk])
    setLoading(false)
    setMsg(error ? 'Error: ' + error.message : 'Deleted')
    if (!error) { setRow(null); load() }
  }
  const set = (n: string, v: any) => setRow({ ...row, [n]: v })

  return (
    <div className="crud">
      <div className="crud-list">
        <button className="btn" disabled={loading} onClick={() => { setRow({ published: true, featured: false, views: 0 }); setNew(true); setMsg('') }}>+ New</button>
        {loading && <span className="crud-loading">Loading…</span>}
        {rows.map((r) => (
          <button key={r[cfg.pk]} className={'crud-row' + (row?.[cfg.pk] === r[cfg.pk] ? ' on' : '')} onClick={() => { setRow(r); setNew(false); setMsg('') }}>
            {cfg.cols.map((c: string) => <span key={c}>{String(r[c] ?? '').slice(0, 60)}</span>)}
          </button>
        ))}
      </div>
      <div className="crud-form">
        {msg && <p className="msg">{msg}</p>}
        {!row ? <p>Select an item or create a new one.</p> : (<>
          {cfg.table === 'posts' && row.image_url && <img className="crud-image-preview" src={row.image_url} alt="Poster preview" />}
          {cfg.fields.map((f: any) => (
            <label key={f.n}>{f.l}
              {f.t === 'area' ? <textarea rows={f.rows || 4} value={row[f.n] ?? ''} onChange={(e) => set(f.n, e.target.value)} />
                : f.t === 'bool' ? <input type="checkbox" checked={!!row[f.n]} onChange={(e) => set(f.n, e.target.checked)} />
                : f.t === 'ref' ? <select value={row[f.n] ?? ''} onChange={(e) => set(f.n, e.target.value)}><option value="">—</option>{(refs[f.n] || []).map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
                : <input type={f.t === 'num' ? 'number' : f.t === 'url' ? 'url' : 'text'} value={row[f.n] ?? ''} disabled={f.lockOnEdit && !isNew} onChange={(e) => set(f.n, e.target.value)} />}
            </label>
          ))}
          <div className="actions"><button className="btn" disabled={loading} onClick={save}>{loading ? 'Saving…' : 'Save changes'}</button>{!isNew && <button className="btn ghost danger" disabled={loading} onClick={del}>Delete</button>}</div>
        </>)}
      </div>
    </div>
  )
}
