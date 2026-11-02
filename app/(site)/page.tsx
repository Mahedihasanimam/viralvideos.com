import Link from 'next/link'
import PostCard from '@/components/PostCard'
import VideoCard from '@/components/VideoCard'
import Sidebar from '@/components/Sidebar'
import { Banner468x60Ad } from '@/components/AdsterraAds'
import { getPosts, getFeaturedPost, getRecentVideos } from '@/lib/data'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: {
    page?: string
    n?: string
    featured?: string
    q?: string
  }
}

export default async function Home({ searchParams }: Props) {
  const page = Math.max(1, Number(searchParams.page || 1))
  const limit = Math.max(6, Number(searchParams.n || 6))
  const showFeaturedOnly = searchParams.featured === '1'

  const [{ posts, hasMore, total }, featuredPost, recentVideos] = await Promise.all([
    getPosts({ page, limit }),
    getFeaturedPost(),
    getRecentVideos(4),
  ])

  const displayPosts = showFeaturedOnly && featuredPost ? [featuredPost] : posts

  return (
    <>
      <div id="main-wrapper">
        <div className="main section" id="main">
          {/* Latest Videos Section */}
          {recentVideos && recentVideos.length > 0 && page === 1 && !showFeaturedOnly && (
            <div className="home-videos-section" style={{ marginBottom: '24px' }}>
              <div className="home-posts-headline title-wrap Label">
                <h3 className="title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-circle-play" style={{ color: '#e50914' }}></i>
                  ভিডিও ও ট্রেলার
                </h3>
                <Link className="view-all" href="/videos">
                  সবগুলো দেখুন »
                </Link>
              </div>
              <div className="clearfix"></div>
              <div className="videos-grid-container">
                {recentVideos.slice(0, 4).map(v => (
                  <VideoCard key={v.id} video={v} />
                ))}
              </div>
            </div>
          )}

          {/* Section Headline */}
          <div className="home-posts-headline title-wrap Label">
            <h3 className="title">
              {showFeaturedOnly ? 'ফিচার' : 'সাম্প্রতিক পোস্টগুলি'}
            </h3>
            <Link className="view-all" href="/search">
              আরও দেখুন
            </Link>
          </div>
          <div className="clearfix"></div>

          <div className="content-banner-ad">
            <Banner468x60Ad />
          </div>

          {/* Posts List */}
          <div className="blog-posts hfeed container index-post-wrap">
            <div className="grid-posts">
              {displayPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>

          {/* Pager / Load More */}
          <div className="blog-pager container" id="blog-pager">
            {hasMore ? (
              <Link
                className="blog-pager-older-link load-more"
                href={`/?page=${page + 1}`}
                id="load-more-link"
              >
                আরও পোস্ট লোড করুন
              </Link>
            ) : (
              <span className="no-more load-more">কোন ফলাফল পাওয়া যায়নি</span>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar />
      <div className="clearfix"></div>
    </>
  )
}
