'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !message) return
    setSent(true)
  }

  if (sent) {
    return (
      <div className="contact-form-success">
        <i className="fa-solid fa-circle-check" style={{ color: '#31942e', fontSize: '28px', marginBottom: '10px' }}></i>
        <h4 style={{ color: '#31942e', margin: '0 0 6px' }}>ধন্যবাদ! আপনার বার্তা সফলভাবে পাঠানো হয়েছে।</h4>
        <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।</p>
      </div>
    )
  }

  return (
    <div className="contact-form-widget">
      <h3 className="contact-form-title">সরাসরি বার্তা পাঠান</h3>
      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-group">
          <label>আপনার নাম:</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="আপনার পূর্ণ নাম লিখুন"
          />
        </div>
        <div className="form-group">
          <label>ইমেইল ঠিকানা:</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="example@mail.com"
          />
        </div>
        <div className="form-group">
          <label>আপনার বার্তা:</label>
          <textarea
            rows={5}
            required
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="আপনার মতামত বা প্রশ্ন এখানে লিখুন..."
          />
        </div>
        <button type="submit" className="contact-submit-btn">
          <i className="fa-solid fa-paper-plane" style={{ marginRight: '8px' }}></i>
          বার্তা পাঠান
        </button>
      </form>
    </div>
  )
}
