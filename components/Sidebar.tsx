import Link from 'next/link'
import LiveSearchBox from './LiveSearchBox'
import { getPopularPosts, getCategories } from '@/lib/data'
import { formatBengaliDate } from '@/lib/date'
import { Banner300x250Ad, NativeBannerAd, SmartlinkAd } from './AdsterraAds'

export default async function Sidebar() {
  const [popularPosts, categories] = await Promise.all([
    getPopularPosts(4),
    getCategories(),
  ])

  return (
    <aside id="sidebar-wrapper">
      <div className="sidebar common-widget">
        {/* Widget 1: Custom Live Search */}
        <div className="widget HTML" id="HTML2">
          <div className="widget-title">
            <h3 className="title">এখানে সার্চ করুনঃ</h3>
          </div>
          <div className="widget-content">
            <LiveSearchBox />
          </div>
        </div>

        {/* Paid placements follow search and stay inside the sidebar flow. */}
        <div className="widget adsterra-widget" id="AdsterraNative">
          <NativeBannerAd />
        </div>

        <div className="widget adsterra-widget" id="AdsterraBanner">
          <Banner300x250Ad />
        </div>

        {/* Widget 2: Most Popular */}
        <div className="widget PopularPosts" id="PopularPosts3">
          <div className="widget-title">
            <h3 className="title">Most Popular</h3>
          </div>
          <div className="widget-content">
            {popularPosts.map(post => (
              <div className="post" key={post.id}>
                <div className="post-content">
                  <Link href={`/post/${post.slug}`} className="post-image-link" title={post.title}>
                    <img
                      src={post.image_url || '/placeholder.jpg'}
                      alt={post.title}
                      className="post-thumb lazy-yard"
                      width={72}
                      height={72}
                    />
                  </Link>
                  <div className="post-info">
                    <h2 className="post-title">
                      <Link href={`/post/${post.slug}`}>{post.title}</Link>
                    </h2>
                    <div className="post-meta">
                      <span className="post-date published">
                        {formatBengaliDate(post.published_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 3: Categories */}
        <div className="widget Label" id="Label3">
          <div className="widget-title">
            <h3 className="title">Categories</h3>
          </div>
          <div className="widget-content list-label">
            <ul>
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`} className="label-name">
                    {cat.name}
                    <span className="label-count">({cat.count})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="widget adsterra-widget adsterra-smartlink-widget" id="AdsterraSmartlink">
          <SmartlinkAd />
        </div>
      </div>
    </aside>
  )
}
