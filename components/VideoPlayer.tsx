'use client'

import React, { useState } from 'react'

interface VideoPlayerProps {
  url: string
  poster?: string
  title?: string
  className?: string
  autoPlay?: boolean
}

// Extract YouTube ID from various YouTube URL formats
function getYouTubeId(url: string): string | null {
  if (!url) return null
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  const match = url.match(regExp)
  return match && match[1] ? match[1] : null
}

// Extract Vimeo ID
function getVimeoId(url: string): string | null {
  if (!url) return null
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i)
  return match && match[1] ? match[1] : null
}

export default function VideoPlayer({
  url,
  poster,
  title,
  className = '',
  autoPlay = false,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [videoError, setVideoError] = useState(false)

  if (!url) return null

  const trimmedUrl = url.trim()
  const ytId = getYouTubeId(trimmedUrl)
  const vimeoId = getVimeoId(trimmedUrl)

  // YouTube Embed
  if (ytId) {
    return (
      <div className={`rb-video-wrapper ${className}`}>
        <div className="rb-video-responsive">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1${autoPlay ? '&autoplay=1' : ''}`}
            title={title || 'YouTube video player'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="rb-video-iframe"
          />
        </div>
      </div>
    )
  }

  // Vimeo Embed
  if (vimeoId) {
    return (
      <div className={`rb-video-wrapper ${className}`}>
        <div className="rb-video-responsive">
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0`}
            title={title || 'Vimeo video player'}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="rb-video-iframe"
          />
        </div>
      </div>
    )
  }

  // Native HTML5 Video
  return (
    <div className={`rb-video-wrapper ${className}`}>
      <div className="rb-video-responsive">
        <video
          controls
          playsInline
          poster={poster}
          preload="metadata"
          autoPlay={autoPlay}
          className="rb-video-element"
          onError={() => setVideoError(true)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src={trimmedUrl} type="video/mp4" />
          <source src={trimmedUrl} type="video/webm" />
          <source src={trimmedUrl} type="video/ogg" />
          Your browser does not support the video tag.
        </video>

        {videoError && (
          <div className="rb-video-error-overlay">
            <p>Could not load video.</p>
            <a href={trimmedUrl} target="_blank" rel="noopener noreferrer" className="rb-video-direct-link">
              Open Video File Directly
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

