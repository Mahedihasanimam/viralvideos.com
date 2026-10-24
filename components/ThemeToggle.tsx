'use client'
import { useEffect, useState } from 'react'
export default function ThemeToggle({ night, day }: { night: string; day: string }) {
  const [dark, setDark] = useState(false)
  useEffect(() => { const d = localStorage.getItem('theme') === 'dark'; setDark(d); document.documentElement.dataset.theme = d ? 'dark' : 'light' }, [])
  const toggle = () => { const d = !dark; setDark(d); localStorage.setItem('theme', d ? 'dark' : 'light'); document.documentElement.dataset.theme = d ? 'dark' : 'light' }
  return <button className="btn ghost" onClick={toggle}>{dark ? day : night}</button>
}
