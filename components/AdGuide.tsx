'use client'
import { useState } from 'react'
import AdminIcon from '@/components/AdminIcon'

export default function AdGuide() {
  const [open, setOpen] = useState(true)

  return (
    <div className="easy-card" style={{ marginBottom: 20 }}>
      <div
        className="easy-card-header"
        style={{
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          userSelect: 'none',
        }}
        onClick={() => setOpen(!open)}
      >
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
            <AdminIcon name="info" size={18} />
            Adsterra অ্যাড পরিবর্তন করার সহজ নির্দেশিকা
          </h2>
          <p className="easy-card-sub" style={{ marginTop: 4 }}>
            এখন আর কোড ভেঙে আলাদা করতে হবে না—সরাসরি পেস্ট করলেই অটোমেটিক সেট হয়ে যাবে।
          </p>
        </div>
        <button
          type="button"
          className="easy-btn easy-btn-ghost"
          style={{ padding: '6px 12px', fontSize: 13 }}
          onClick={(e) => {
            e.stopPropagation()
            setOpen(!open)
          }}
        >
          {open ? 'লুকান ▲' : 'নির্দেশিকা দেখুন ▼'}
        </button>
      </div>

      {open && (
        <div style={{ padding: '0 24px 20px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 14,
              marginTop: 10,
            }}
          >
            <div
              style={{
                background: '#f7faf8',
                border: '1px solid #e0ebe3',
                borderRadius: 8,
                padding: '14px 16px',
              }}
            >
              <strong style={{ display: 'block', color: '#1e3328', fontSize: 14, marginBottom: 6 }}>
                ধাপ ১: Adsterra থেকে কোড কপি
              </strong>
              <p style={{ margin: 0, fontSize: 13, color: '#4d5d5e', lineHeight: 1.5 }}>
                Adsterra ড্যাশবোর্ডে গিয়ে আপনার ওয়েবসাইটের প্লেসমেন্ট থেকে <strong>"Get Code"</strong>-এ ক্লিক করে সম্পূর্ণ কোডটি হুবহু কপি করুন।
              </p>
            </div>

            <div
              style={{
                background: '#f7faf8',
                border: '1px solid #e0ebe3',
                borderRadius: 8,
                padding: '14px 16px',
              }}
            >
              <strong style={{ display: 'block', color: '#1e3328', fontSize: 14, marginBottom: 6 }}>
                ধাপ ২: Magic Box-এ পেস্ট
              </strong>
              <p style={{ margin: 0, fontSize: 13, color: '#4d5d5e', lineHeight: 1.5 }}>
                যে অ্যাডটি বদলাতে চান সেটির <strong>Edit</strong> ফর্মে যান এবং <strong>"Magic Auto-Extractor"</strong> বক্সে কপি করা কোডটি পেস্ট করুন।
              </p>
            </div>

            <div
              style={{
                background: '#f7faf8',
                border: '1px solid #e0ebe3',
                borderRadius: 8,
                padding: '14px 16px',
              }}
            >
              <strong style={{ display: 'block', color: '#1e3328', fontSize: 14, marginBottom: 6 }}>
                ধাপ ৩: অটো-এক্সট্র্যাক্ট ও সেভ
              </strong>
              <p style={{ margin: 0, fontSize: 13, color: '#4d5d5e', lineHeight: 1.5 }}>
                সিস্টেম নিজে থেকেই Key, Script URL, Ad Type ও Size পূরণ করে দেবে। এরপর নিচে <strong>"Save Changes"</strong> বাটনে ক্লিক করলেই কাজ শেষ!
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              padding: '10px 14px',
              background: '#edf7ec',
              border: '1px solid #c2e2c0',
              borderRadius: 7,
              fontSize: 13,
              color: '#1e4d2b',
            }}
          >
            💡 <strong>টিপস:</strong> অ্যাড সাময়িক বন্ধ রাখতে চাইলে ডিলিট করবেন না; এডিট ফর্মে গিয়ে <strong>"Show this ad on the website"</strong> টিক চিহ্নটি তুলে দিয়ে Save করুন।
          </div>
        </div>
      )}
    </div>
  )
}
