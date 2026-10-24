'use client'
import { useParams } from 'next/navigation'
import Crud from '@/components/Crud'
import { CFG } from '@/lib/adminConfig'
export default function Page() {
  const { table } = useParams() as { table: string }
  const cfg = CFG[table]
  if (!cfg) return <p>Unknown section.</p>
  return <><div className="admin-page-heading"><div><p className="admin-page-kicker">Manage website</p><h1>{cfg.title}</h1></div><span className="admin-page-count">Edit and publish your content</span></div><Crud cfg={cfg} /></>
}
