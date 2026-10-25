'use client'
import { useParams } from 'next/navigation'
import Crud from '@/components/Crud'
import { CFG } from '@/lib/adminConfig'

export default function Page() {
  const { table } = useParams() as { table: string }
  const cfg = CFG[table]
  if (!cfg) return (
    <div style={{ padding: '40px 0', textAlign: 'center', color: '#788486' }}>
      <p style={{ fontSize: 32, margin: '0 0 10px' }}>404</p>
      <p>Unknown section: <strong>{table}</strong></p>
    </div>
  )
  return <Crud cfg={cfg} />
}
