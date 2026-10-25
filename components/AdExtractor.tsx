'use client'
import { useState } from 'react'
import AdminIcon from '@/components/AdminIcon'

export function parseAdsterraCode(raw: string) {
  const text = raw.trim()
  if (!text) return null

  const result: {
    ad_type?: 'banner' | 'native' | 'smartlink'
    key_value?: string
    script_url?: string
    target_url?: string
    width?: number
    height?: number
  } = {}

  // 1. Plain Direct Link / Smartlink (no script tags)
  if (text.startsWith('http://') || text.startsWith('https://')) {
    if (!text.includes('<script') && !text.includes('invoke.js')) {
      result.ad_type = 'smartlink'
      result.target_url = text
      return result
    }
  }

  // 2. Banner detection (atOptions)
  const keyMatch = text.match(/['"]key['"]\s*:\s*['"]([a-zA-Z0-9_-]+)['"]/i)
  const heightMatch = text.match(/['"]height['"]\s*:\s*([0-9]+)/i)
  const widthMatch = text.match(/['"]width['"]\s*:\s*([0-9]+)/i)

  // 3. Native container detection: <div id="container-6fb853f324c105cabb940b068bf675d0">
  const containerMatch = text.match(/id=['"]container-([a-zA-Z0-9_-]+)['"]/i)

  // 4. Script src detection: src="//... or src="https://...
  const srcMatch = text.match(/src=['"](\/\/[^'"]+|https?:\/\/[^'"]+)['"]/i)

  if (keyMatch) {
    result.ad_type = 'banner'
    result.key_value = keyMatch[1]
    if (widthMatch) result.width = parseInt(widthMatch[1], 10)
    if (heightMatch) result.height = parseInt(heightMatch[1], 10)
    if (srcMatch) {
      let url = srcMatch[1]
      if (url.startsWith('//')) url = 'https:' + url
      result.script_url = url
    }
    return result
  }

  if (containerMatch) {
    result.ad_type = 'native'
    result.key_value = containerMatch[1]
    if (srcMatch) {
      let url = srcMatch[1]
      if (url.startsWith('//')) url = 'https:' + url
      result.script_url = url
    }
    result.width = 0
    result.height = 0
    return result
  }

  // If script src is present without atOptions or container
  if (srcMatch) {
    let url = srcMatch[1]
    if (url.startsWith('//')) url = 'https:' + url
    result.script_url = url
    const urlKey = url.match(/\/([a-zA-Z0-9]{32})\/?/i)
    if (urlKey) {
      result.key_value = urlKey[1]
    }
    result.ad_type = 'native'
    return result
  }

  // Fallback: If it contains a URL anywhere in text
  const anyUrl = text.match(/https?:\/\/[^\s"'<>]+/i)
  if (anyUrl) {
    result.ad_type = 'smartlink'
    result.target_url = anyUrl[0]
    return result
  }

  return null
}

export default function AdExtractor({
  onExtract,
}: {
  onExtract: (data: any) => void
}) {
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const handleProcess = (codeToParse?: string) => {
    const raw = codeToParse !== undefined ? codeToParse : input
    if (!raw.trim()) {
      setFeedback({ msg: 'অনুগ্রহ করে Adsterra থেকে পাওয়া কোডটি পেস্ট করুন।', type: 'err' })
      return
    }

    const extracted = parseAdsterraCode(raw)
    if (!extracted) {
      setFeedback({
        msg: 'কোড থেকে কোনো Adsterra Key বা URL শনাক্ত করা যায়নি। কোডটি সম্পূর্ণ কপি করা হয়েছে কিনা যাচাই করুন।',
        type: 'err',
      })
      return
    }

    onExtract(extracted)

    const parts: string[] = []
    if (extracted.ad_type) parts.push(`টাইপ: ${extracted.ad_type.toUpperCase()}`)
    if (extracted.key_value) parts.push(`Key: ${extracted.key_value}`)
    if (extracted.script_url) parts.push(`Script URL যোগ হয়েছে`)
    if (extracted.target_url) parts.push(`Smartlink যোগ হয়েছে`)
    if (extracted.width && extracted.height) parts.push(`সাইজ: ${extracted.width}x${extracted.height}`)

    setFeedback({
      msg: `সফলভাবে কোড Extract করা হয়েছে! (${parts.join(' | ')})`,
      type: 'ok',
    })
    setInput('')
  }

  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setInput(val)
    // Auto-extract immediately on paste if valid code
    if (val.trim().length > 15) {
      handleProcess(val)
    }
  }

  return (
    <div className="ad-extractor-box">
      <div className="ad-extractor-header">
        <div className="ad-extractor-title">
          <span className="ad-extractor-icon">🪄</span>
          <div>
            <strong>Magic Auto-Extractor (Adsterra Code Paste)</strong>
            <p>Adsterra থেকে কপি করা পুরো কোডটি এখানে পেস্ট করুন—সব ফিল্ড নিজে থেকেই পূরণ হয়ে যাবে!</p>
          </div>
        </div>
      </div>

      <div className="ad-extractor-body">
        <textarea
          className="ad-extractor-textarea"
          rows={3}
          placeholder="Adsterra থেকে পাওয়া সম্পূর্ণ কোড (<script>...</script> বা Direct Link) এখানে পেস্ট করুন..."
          value={input}
          onChange={handlePasteChange}
        />

        <div className="ad-extractor-actions">
          <button
            type="button"
            className="easy-btn easy-btn-primary"
            onClick={() => handleProcess()}
          >
            <AdminIcon name="check" size={16} /> Extract & Auto-Fill Fields
          </button>
          {input && (
            <button
              type="button"
              className="easy-btn easy-btn-ghost"
              onClick={() => {
                setInput('')
                setFeedback(null)
              }}
            >
              Clear
            </button>
          )}
        </div>

        {feedback && (
          <div className={`ad-extractor-feedback ${feedback.type}`}>
            <AdminIcon name={feedback.type === 'ok' ? 'check' : 'alert'} size={16} />
            <span>{feedback.msg}</span>
          </div>
        )}
      </div>
    </div>
  )
}
