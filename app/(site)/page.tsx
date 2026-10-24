import Link from 'next/link'
import PostCard from '@/components/PostCard'
import Sidebar from '@/components/Sidebar'
import { getPosts, getFeaturedPost } from '@/lib/data'

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

  const [{ posts, hasMore, total }, featuredPost] = await Promise.all([
    getPosts({ page, limit }),
    getFeaturedPost(),
  ])

  const displayPosts = showFeaturedOnly && featuredPost ? [featuredPost] : posts

  return (
    <>
      <div id="main-wrapper">
        <div className="main section" id="main">
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
