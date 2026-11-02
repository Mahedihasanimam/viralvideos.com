import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import VideoCard from '@/components/VideoCard'
import { getVideos, STANDARD_CATEGORIES } from '@/lib/data'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: {
    page?: string
    q?: string
    cat?: string
  }
}

export const metadata = {
  title: 'ভিডিও ও ট্রেলার | ViralVideo',
  description: 'সকল ট্রেন্ডিং বাংলা, হিন্দি, ইংলিশ এবং আন্তর্জাতিক মুভি ও ওয়েব সিরিজের ট্রেলার ও ভিডিও দেখুন।',
}

export default async function VideosPage({ searchParams }: Props) {
  const page = Math.max(1, Number(searchParams.page || 1))
  const limit = 12
  const query = searchParams.q
  const cat = searchParams.cat

  const { videos, total, hasMore } = await getVideos({
    page,
    limit,
    query,
    category: cat,
  })

  return (
    <>
      <div id="main-wrapper">
        <div className="main section" id="main">
          {/* Breadcrumb */}
          <nav id="breadcrumb">
            <Link href="/">হোম</Link>
            <em className="delimiter"></em>
            <span className="current">ভিডিও ও ট্রেলার</span>
          </nav>

          {/* Section Headline */}
          <div className="home-posts-headline title-wrap Label">
            <h1 className="title" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-play" style={{ color: '#e50914' }}></i>
              ভিডিও ও ট্রেলার {cat ? `(${cat})` : ''}
            </h1>
            <span className="videos-count-badge">
              {total} টি ভিডিও
            </span>
          </div>
          <div className="clearfix"></div>

          {/* Video Category Filter Pills */}
          <div className="video-filter-bar">
            <Link
              href="/videos"
              className={`video-filter-pill ${!cat ? 'active' : ''}`}
            >
              সবগুলো
            </Link>
            {STANDARD_CATEGORIES.map(c => (
              <Link
                key={c.slug}
                href={`/videos?cat=${encodeURIComponent(c.name)}`}
                className={`video-filter-pill ${cat === c.name ? 'active' : ''}`}
              >
                {c.name}
              </Link>
            ))}
          </div>

          {/* Video Grid */}
          {videos.length > 0 ? (
            <div className="videos-grid-container">
              {videos.map(v => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          ) : (
            <div className="empty-videos-state">
              <div className="empty-videos-icon">
                <i className="fa-solid fa-film"></i>
              </div>
              <h3>কোন ভিডিও পাওয়া যায়নি</h3>
              <p>
                এখনও কোনো ভিডিও আপলোড করা হয়নি। এডমিন প্যানেল থেকে ভিডিও আপলোড করুন।
              </p>
              <Link href="/admin/videos" className="cta-button" style={{ display: 'inline-flex', marginTop: '12px' }}>
                <i className="fa-solid fa-upload" style={{ marginRight: '8px' }}></i> এডমিন থেকে ভিডিও আপলোড করুন
              </Link>
            </div>
          )}

          {/* Pager */}
          {hasMore && (
            <div className="blog-pager container" id="blog-pager">
              <Link
                className="blog-pager-older-link load-more"
                href={`/videos?page=${page + 1}${cat ? `&cat=${encodeURIComponent(cat)}` : ''}`}
              >
                আরও ভিডিও লোড করুন
              </Link>
            </div>
          )}
        </div>
      </div>

      <Sidebar />
      <div className="clearfix"></div>
    </>
  )
}

