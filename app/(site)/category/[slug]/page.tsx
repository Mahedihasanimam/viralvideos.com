import Link from 'next/link'
import PostCard from '@/components/PostCard'
import Sidebar from '@/components/Sidebar'
import { getPosts, getCategoryBySlug } from '@/lib/data'

export const dynamic = 'force-dynamic'

interface Props {
  params: {
    slug: string
  }
  searchParams: {
    page?: string
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const catObj = getCategoryBySlug(params.slug)
  const categoryName = catObj ? catObj.name : decodeURIComponent(params.slug)
  const page = Math.max(1, Number(searchParams.page || 1))
  const limit = 6

  const { posts, hasMore } = await getPosts({
    category: params.slug,
    page,
    limit,
  })

  return (
    <>
      <div id="main-wrapper">
        <div className="main section" id="main">
          {/* Breadcrumb */}
          <nav id="breadcrumb">
            <Link href="/">হোম</Link>
            <em className="delimiter"></em>
            <span>ক্যাটাগরি</span>
            <em className="delimiter"></em>
            <span className="current">{categoryName}</span>
          </nav>

          {/* Query Message Bar */}
          <div className="queryMessage">
            <span className="query-info">
              পোস্টগুলি দেখানো হচ্ছে লেবেল সহ{' '}
              <span className="search-label">{categoryName}</span>
            </span>
            <Link className="show-more" href="/">
              সকল পোস্ট দেখুন
            </Link>
          </div>

          {/* Posts Grid */}
          <div className="blog-posts hfeed container index-post-wrap">
            <div className="grid-posts">
              {posts.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                  এই ক্যাটাগরিতে কোন পোস্ট পাওয়া যায়নি।
                </div>
              ) : (
                posts.map(post => <PostCard key={post.id} post={post} />)
              )}
            </div>
          </div>

          {/* Pager */}
          {posts.length > 0 && (
            <div className="blog-pager container" id="blog-pager">
              {hasMore ? (
                <Link
                  className="blog-pager-older-link load-more"
                  href={`/category/${params.slug}?page=${page + 1}`}
                >
                  আরও পোস্ট লোড করুন
                </Link>
              ) : (
                <span className="no-more load-more">কোন ফলাফল পাওয়া যায়নি</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar />
      <div className="clearfix"></div>
    </>
  )
}
