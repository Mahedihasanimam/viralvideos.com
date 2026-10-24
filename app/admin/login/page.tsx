'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/supabase'
export default function Login() {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [err, setErr] = useState(''), router = useRouter()
  const go = async () => {
    const { error } = await db().auth.signInWithPassword({ email, password })
    if (error) setErr(error.message); else router.push('/admin/site_texts')
  }
  return (
    <div className="login">
      <h1>Admin sign in</h1>
      <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()} /></label>
      {err && <p className="msg">{err}</p>}
      <button className="btn" onClick={go}>Sign in</button>
    </div>
  )
}
