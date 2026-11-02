'use client'

import React, { useRef, useState } from 'react'
import { db } from '@/lib/supabase'
import AdminIcon from '@/components/AdminIcon'
import VideoPlayer from '@/components/VideoPlayer'

interface VideoUploaderProps {
  value: string
  onChange: (url: string) => void
  label?: string
  hint?: string
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export default function VideoUploader({
  value,
  onChange,
  label = 'Video File',
  hint = 'Upload an MP4/WebM video file from your device, or paste a video/YouTube link',
}: VideoUploaderProps) {
  const [tab, setTab] = useState<'upload' | 'url'>('upload')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Remove previous file from Supabase storage when replacing or deleting
  const deleteOldStorageFile = async (oldUrl: string) => {
    if (!oldUrl || !oldUrl.includes('/storage/v1/object/public/videos/')) return
    try {
      const parts = oldUrl.split('/storage/v1/object/public/videos/')
      if (parts[1]) {
        await db().storage.from('videos').remove([decodeURIComponent(parts[1])])
      }
    } catch {
      // ignore
    }
  }

  // Upload file to Supabase Storage with accurate progress tracking
  const uploadWithProgress = (file: File, path: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const client = db()
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://snfgbkzeyaniwqfqobua.supabase.co'
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        
        // Try getting logged-in user session token for authenticated storage access
        const { data: sessionData } = await client.auth.getSession()
        const token = sessionData?.session?.access_token || anonKey

        const uploadEndpoint = `${supabaseUrl}/storage/v1/object/videos/${encodeURIComponent(path)}`
        const xhr = new XMLHttpRequest()

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100)
            setProgress(percent)
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const publicUrl = `${supabaseUrl}/storage/v1/object/public/videos/${path}`
            resolve(publicUrl)
          } else {
            let errorMsg = `Upload failed (Status ${xhr.status})`
            try {
              const res = JSON.parse(xhr.responseText)
              if (res.message) errorMsg = res.message
              if (res.error) errorMsg = `${res.error}: ${res.message || ''}`
            } catch {
              // ignore json parse error
            }

            // Check if bucket doesn't exist
            if (xhr.status === 404 || errorMsg.toLowerCase().includes('bucket not found')) {
              errorMsg = "Storage bucket 'videos' does not exist yet. Please run the SQL setup in Settings to create the 'videos' bucket, or use the 'Paste Video URL' tab."
            }
            reject(new Error(errorMsg))
          }
        }

        xhr.onerror = () => {
          reject(new Error('Network error during video upload. Please check your connection.'))
        }

        xhr.open('POST', uploadEndpoint, true)
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        xhr.setRequestHeader('apikey', anonKey)
        xhr.setRequestHeader('x-upsert', 'true')
        xhr.setRequestHeader('Content-Type', file.type || 'video/mp4')
        xhr.send(file)
      } catch (err) {
        reject(err)
      }
    })
  }

  const handleFile = async (file: File) => {
    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-matroska', 'video/avi']
    const isVideo = validTypes.includes(file.type) || /\.(mp4|webm|ogg|mov|mkv|avi)$/i.test(file.name)

    if (!isVideo) {
      setError('Please select a valid video file (.mp4, .webm, .ogg, .mov, .mkv)')
      return
    }

    // 250MB size limit check
    const maxSize = 250 * 1024 * 1024
    if (file.size > maxSize) {
      setError(`File is too large (${formatBytes(file.size)}). Maximum recommended size is 250MB.`)
      return
    }

    setUploading(true)
    setProgress(0)
    setError('')
    setFileDetails({ name: file.name, size: formatBytes(file.size) })

    try {
      // Clean up previous uploaded video
      if (value) {
        await deleteOldStorageFile(value)
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'mp4'
      const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().substring(0, 30)
      const fileName = `uploads/${Date.now()}-${cleanName}.${fileExt}`

      // Attempt upload with real-time byte progress
      try {
        const publicUrl = await uploadWithProgress(file, fileName)
        onChange(publicUrl)
        setUploading(false)
        setProgress(100)
        return
      } catch (xhrErr: any) {
        // Fallback to supabase-js client upload
        console.warn('XHR upload failed, trying standard client upload:', xhrErr)
        const { data, error: clientErr } = await db().storage.from('videos').upload(fileName, file, {
          contentType: file.type || 'video/mp4',
          cacheControl: '31536000',
          upsert: true,
        })

        if (!clientErr && data) {
          const { data: pubData } = db().storage.from('videos').getPublicUrl(fileName)
          if (pubData?.publicUrl) {
            onChange(pubData.publicUrl)
            setUploading(false)
            setProgress(100)
            return
          }
        }

        throw xhrErr || clientErr || new Error('Upload failed')
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to upload video. Please ensure the Supabase storage bucket is created.')
      setFileDetails(null)
    } finally {
      setUploading(false)
    }
  }

  const handleApplyUrl = () => {
    if (!customUrl.trim()) return
    setError('')
    onChange(customUrl.trim())
    setCustomUrl('')
  }

  const handleRemove = async () => {
    if (value && confirm('Are you sure you want to remove this video?')) {
      await deleteOldStorageFile(value)
      onChange('')
      setFileDetails(null)
      setError('')
      setProgress(0)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  return (
    <div className="video-uploader-box">
      <div className="video-uploader-header">
        <div>
          <label className="easy-field-label" style={{ marginBottom: 2 }}>
            <AdminIcon name="video" size={16} /> {label}
          </label>
          {hint && <p className="easy-field-hint" style={{ margin: 0 }}>{hint}</p>}
        </div>

        {!value && (
          <div className="video-uploader-tabs">
            <button
              type="button"
              className={`video-tab-btn ${tab === 'upload' ? 'on' : ''}`}
              onClick={() => { setTab('upload'); setError('') }}
            >
              <AdminIcon name="upload" size={14} /> Upload File
            </button>
            <button
              type="button"
              className={`video-tab-btn ${tab === 'url' ? 'on' : ''}`}
              onClick={() => { setTab('url'); setError('') }}
            >
              <AdminIcon name="link" size={14} /> Video URL / YouTube
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="video-uploader-error">
          <AdminIcon name="alert" size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska,video/*"
        style={{ display: 'none' }}
        onChange={e => {
          if (e.target.files?.[0]) {
            handleFile(e.target.files[0])
          }
        }}
      />

      {/* When a video is present: show preview, player, details, and change/remove controls */}
      {value ? (
        <div className="video-preview-card">
          <div className="video-preview-player-wrap">
            <VideoPlayer url={value} autoPlay={false} />
          </div>

          <div className="video-preview-footer">
            <div className="video-preview-meta">
              <span className="video-meta-badge">
                <AdminIcon name="play" size={13} /> Active Video
              </span>
              <span className="video-meta-url" title={value}>
                {value}
              </span>
              {fileDetails && (
                <span className="video-meta-size">
                  ({fileDetails.size})
                </span>
              )}
            </div>

            <div className="video-preview-actions">
              <button
                type="button"
                className="video-action-btn video-change-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <AdminIcon name="upload" size={14} /> Change Video
              </button>
              <button
                type="button"
                className="video-action-btn video-delete-btn"
                onClick={handleRemove}
                disabled={uploading}
              >
                <AdminIcon name="trash" size={14} /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : tab === 'upload' ? (
        /* Drag & Drop Upload Dropzone */
        <div
          className={`video-dropzone ${dragOver ? 'dragover' : ''} ${uploading ? 'uploading' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="video-uploading-state">
              <div className="video-spinner-wrap">
                <span className="spinner md" />
              </div>
              <div className="video-progress-info">
                <strong>Uploading Video to Cloud Storage…</strong>
                {fileDetails && <span>{fileDetails.name} ({fileDetails.size})</span>}
                <div className="video-progress-bar-wrap">
                  <div className="video-progress-bar" style={{ width: `${progress}%` }} />
                </div>
                <span className="video-progress-text">{progress}% complete</span>
              </div>
            </div>
          ) : (
            <div className="video-dropzone-empty">
              <div className="video-dropzone-icon">
                <AdminIcon name="video" size={26} />
              </div>
              <strong>Choose a video file or drag & drop here</strong>
              <p>Supports MP4, WebM, OGG, MOV (up to 250 MB)</p>
              <button type="button" className="easy-btn easy-btn-primary video-select-btn" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                <AdminIcon name="upload" size={15} /> Select Video File
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Paste URL / YouTube Tab */
        <div className="video-url-input-wrap">
          <div className="video-url-input-row">
            <input
              type="url"
              className="easy-input"
              placeholder="Paste direct video URL (https://.../video.mp4) or YouTube link..."
              value={customUrl}
              onChange={e => setCustomUrl(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleApplyUrl()
                }
              }}
            />
            <button
              type="button"
              className="easy-btn easy-btn-primary"
              onClick={handleApplyUrl}
              disabled={!customUrl.trim()}
            >
              <AdminIcon name="check" size={15} /> Apply Video
            </button>
          </div>
          <p className="easy-field-hint" style={{ marginTop: 6 }}>
            Paste a direct .mp4/.webm video link, YouTube video/Shorts URL, or Vimeo URL.
          </p>
        </div>
      )}
    </div>
  )
}

