import Link from 'next/link'
import PostCard from '@/components/PostCard'
import Sidebar from '@/components/Sidebar'
import { getPosts } from '@/lib/data'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: {
    q?: string
    page?: string
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q || ''
  const page = Math.max(1, Number(searchParams.page || 1))
  const limit = 6

  const { posts, hasMore, total } = await getPosts({
    query,
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
            <span>অনুসন্ধান</span>
            {query && (
              <>
                <em className="delimiter"></em>
                <span className="current">{query}</span>
              </>
            )}
          </nav>

          {/* Query Message Bar */}
          <div className="queryMessage">
            <span className="query-info">
              {query ? (
                <>
                  অনুসন্ধানের ফলাফল: <span className="search-query">{query}</span> ({total} টি ফলাফল)
                </>
              ) : (
                'সকল সাম্প্রতিক পোস্ট'
              )}
            </span>
            <Link className="show-more" href="/">
              হোমে ফিরে যান
            </Link>
          </div>

          {/* Posts Grid */}
          <div className="blog-posts hfeed container index-post-wrap">
            <div className="grid-posts">
              {posts.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#777' }}>
                  <i
                    className="fa-solid fa-magnifying-glass"
                    style={{ fontSize: '32px', marginBottom: '12px', display: 'block', color: '#ccc' }}
                  ></i>
                  <p style={{ fontSize: '16px', fontWeight: 600 }}>কোন ফলাফল পাওয়া যায়নি</p>
                  <p style={{ fontSize: '13px', color: '#999' }}>
                    ভিন্ন কোনো নাম দিয়ে আবার অনুসন্ধান করুন।
                  </p>
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
                  href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
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
