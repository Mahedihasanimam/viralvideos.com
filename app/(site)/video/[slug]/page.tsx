import { notFound } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import VideoPlayer from '@/components/VideoPlayer'
import VideoCard from '@/components/VideoCard'
import { getVideoBySlug, getRecentVideos, incrementVideoViews } from '@/lib/data'
import { formatBengaliDate, toBengaliNumerals } from '@/lib/date'

export const dynamic = 'force-dynamic'

interface Props {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: Props) {
  const video = await getVideoBySlug(params.slug)
  if (!video) return { title: 'Video Not Found | ViralVideo' }
  return {
    title: `${video.title} | ViralVideo`,
    description: video.description || video.title,
    openGraph: {
      title: `${video.title} | ViralVideo`,
      description: video.description || video.title,
      images: video.thumbnail_url ? [{ url: video.thumbnail_url }] : [],
    },
  }
}

export default async function SingleVideoPage({ params }: Props) {
  const video = await getVideoBySlug(params.slug)
  if (!video) notFound()

  incrementVideoViews(video.slug)

  const recentVideos = (await getRecentVideos(4)).filter(v => v.slug !== video.slug).slice(0, 3)
  const shareUrl = `/video/${video.slug}`
  const shareTitle = encodeURIComponent(video.title)

  return (
    <>
      <div id="main-wrapper">
        <div className="main section" id="main">
          {/* Breadcrumb */}
          <nav id="breadcrumb">
            <Link href="/">হোম</Link>
            <em className="delimiter"></em>
            <Link className="b-label" href="/videos">
              ভিডিও ও ট্রেলার
            </Link>
            <em className="delimiter"></em>
            <span className="current">{video.title}</span>
          </nav>

          <article className="item-post hentry single-video-article">
            {/* Title */}
            <h1 className="post-title" style={{ marginBottom: '12px' }}>{video.title}</h1>

            {/* Post Meta */}
            <div className="post-meta single-meta" style={{ marginBottom: '18px' }}>
              <span className="post-author">
                <Link href="/p/about" title="ViralVideo">
                  ViralVideo
                </Link>
              </span>
              {video.created_at && (
                <span className="post-date published">
                  {formatBengaliDate(video.created_at)}
                </span>
              )}
              {video.category && (
                <span className="video-meta-category">
                  <i className="fa-solid fa-tag" style={{ marginRight: '4px' }}></i>
                  {video.category}
                </span>
              )}
              <span className="post-views">
                <i className="fa-solid fa-eye" style={{ marginRight: '4px' }}></i>
                {toBengaliNumerals(video.views || 0)} ভিউ
              </span>
            </div>

            {/* Large Full-Width Video Player */}
            <div className="single-video-player-container">
              <VideoPlayer
                url={video.video_url}
                poster={video.thumbnail_url}
                title={video.title}
                autoPlay={false}
              />
            </div>

            {/* Video Description */}
            {video.description && (
              <div className="single-video-desc-box">
                <h3 className="single-video-desc-title">ভিডিও বিবরণ / Description</h3>
                <p className="single-video-desc-text">{video.description}</p>
              </div>
            )}

            {/* Social Share Links */}
            <div className="post-share" style={{ marginTop: '24px' }}>
              <span className="share-text" style={{ fontSize: '13px', fontWeight: 700, marginRight: '10px' }}>
                শেয়ার করুন:
              </span>
              <ul className="share-links social social-color">
                <li className="facebook">
                  <a
                    className="facebook"
                    href={`https://www.facebook.com/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Share on Facebook"
                  >
                    <i className="fa-brands fa-facebook-f"></i>
                  </a>
                </li>
                <li className="twitter">
                  <a
                    className="twitter"
                    href={`https://twitter.com/share?url=${encodeURIComponent(shareUrl)}&text=${shareTitle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Share on Twitter"
                  >
                    <i className="fa-brands fa-x-twitter"></i>
                  </a>
                </li>
                <li className="whatsapp">
                  <a
                    className="whatsapp"
                    href={`https://api.whatsapp.com/send?text=${shareTitle}%20|%20${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Share on WhatsApp"
                  >
                    <i className="fa-brands fa-whatsapp"></i>
                  </a>
                </li>
              </ul>
            </div>

            {/* More Videos Section */}
            {recentVideos.length > 0 && (
              <div className="related-videos-section" style={{ marginTop: '36px' }}>
                <div className="title-wrap Label" style={{ marginBottom: '16px' }}>
                  <h3 className="title">আরও ভিডিও</h3>
                  <Link className="view-all" href="/videos">
                    সবগুলো দেখুন »
                  </Link>
                </div>
                <div className="videos-grid-container" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                  {recentVideos.map(rv => (
                    <VideoCard key={rv.id} video={rv} />
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </div>

      <Sidebar />
      <div className="clearfix"></div>
    </>
  )
}

