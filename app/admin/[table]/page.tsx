'use client'
import { useParams } from 'next/navigation'
import Crud from '@/components/Crud'
import { CFG } from '@/lib/adminConfig'
export default function Page() {
  const { table } = useParams() as { table: string }
  const cfg = CFG[table]
  if (!cfg) return <p>Unknown section.</p>
  return <><h1>{cfg.title}</h1><Crud cfg={cfg} /></>
}
