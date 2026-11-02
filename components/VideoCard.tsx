import React from 'react'
import Link from 'next/link'
import { VideoItem } from '@/lib/data'
import { formatBengaliDate, toBengaliNumerals } from '@/lib/date'

export default function VideoCard({ video }: { video: VideoItem }) {
  const videoUrl = `/video/${video.slug}`
  const catSlug = video.category ? encodeURIComponent(video.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')) : 'all'

  return (
    <article className="video-card-item">
      <div className="video-thumb-container">
        <Link href={videoUrl} className="video-thumb-link" title={video.title}>
          <img
            src={video.thumbnail_url || '/placeholder.jpg'}
            alt={video.title}
            className="video-thumb-img"
            loading="lazy"
          />
          <div className="video-play-overlay">
            <span className="video-play-button">
              <i className="fa-solid fa-play"></i>
            </span>
          </div>
          {video.duration && (
            <span className="video-duration-badge">
              {video.duration}
            </span>
          )}
        </Link>
      </div>

      <div className="video-card-content">
        {video.category && (
          <span className="video-card-cat">
            {video.category}
          </span>
        )}
        <h3 className="video-card-title">
          <Link href={videoUrl} title={video.title}>
            {video.title}
          </Link>
        </h3>
        <div className="video-card-meta">
          {video.created_at && (
            <span className="video-card-date">
              <i className="fa-regular fa-clock" style={{ marginRight: '4px' }}></i>
              {formatBengaliDate(video.created_at)}
            </span>
          )}
          {video.views != null && (
            <span className="video-card-views">
              <i className="fa-solid fa-eye" style={{ marginRight: '4px' }}></i>
              {toBengaliNumerals(video.views)} ভিউ
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

