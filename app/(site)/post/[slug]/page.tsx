import { notFound } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import {
  getPostBySlug,
  getRelatedPosts,
  getPrevAndNextPost,
  getCategoryBySlug,
  incrementPostViews,
} from '@/lib/data'
import { formatBengaliDate, toBengaliNumerals } from '@/lib/date'

export const dynamic = 'force-dynamic'

interface Props {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: Props) {
  const post = await getPostBySlug(params.slug)
  if (!post) return { title: 'Post Not Found' }
  return {
    title: `${post.title} | ViralVideo`,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | ViralVideo`,
      description: post.excerpt,
      images: [{ url: post.image_url }],
    },
  }
}

export default async function PostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  incrementPostViews(post.slug)

  const [relatedPosts, { newer, older }] = await Promise.all([
    getRelatedPosts(post, 3),
    getPrevAndNextPost(post),
  ])

  const catObj = getCategoryBySlug(post.category)
  const catSlug = catObj ? catObj.slug : 'bangla'
  const shareUrl = `/post/${post.slug}`
  const shareTitle = encodeURIComponent(post.title)

  return (
    <>
      <div id="main-wrapper">
        <div className="main section" id="main">
          {/* Breadcrumb */}
          <nav id="breadcrumb">
            <Link href="/">হোম</Link>
            <em className="delimiter"></em>
            <Link className="b-label" href={`/category/${catSlug}`}>
              {post.category}
            </Link>
            <em className="delimiter"></em>
            <span className="current">{post.title}</span>
          </nav>

          <article className="item-post hentry">
            {/* Title */}
            <h1 className="post-title">{post.title}</h1>

            {/* Post Meta */}
            <div className="post-meta single-meta">
              <span className="post-author">
                <Link href="/p/about" title="ViralVideo">
                  ViralVideo
                </Link>
              </span>
              <span className="post-date published">
                {formatBengaliDate(post.published_at)}
              </span>
              <span className="post-views">
                <i className="fa-solid fa-eye" style={{ marginRight: '4px' }}></i>
                {toBengaliNumerals(post.views)} ভিউ
              </span>
            </div>

            {/* Post Body */}
            <div className="post-body post-content" id="post-body">
              {/* Specs Box */}
              <div className="movie-specs-box">
                {post.imdb && (
                  <div className="spec-line">
                    <b><span className="spec-label">IMDb rating ➤</span> <span className="spec-val">{post.imdb}</span></b>
                  </div>
                )}
                {post.director && (
                  <div className="spec-line">
                    <b><span className="spec-label">Directors ➤</span> <span className="spec-val">{post.director}</span></b>
                  </div>
                )}
                {post.stars && (
                  <div className="spec-line">
                    <b><span className="spec-label">Stars ➤</span> <span className="spec-val">{post.stars}</span></b>
                  </div>
                )}
                {post.genres && (
                  <div className="spec-line">
                    <b><span className="spec-label">Genres ➤</span> <span className="spec-val">{post.genres}</span></b>
                  </div>
                )}
                {post.language && (
                  <div className="spec-line">
                    <b><span className="spec-label">Language ➤</span> <span className="spec-val">{post.language}</span></b>
                  </div>
                )}
                {post.country && (
                  <div className="spec-line">
                    <b><span className="spec-label">Country ➤</span> <span className="spec-val">{post.country}</span></b>
                  </div>
                )}
                {post.platform && (
                  <div className="spec-line">
                    <b><span className="spec-label">Platform ➤</span> <span className="spec-val">{post.platform}</span></b>
                  </div>
                )}
              </div>

              {/* Poster Image */}
              {post.image_url && (
                <div className="separator text-center my-4">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="single-post-poster"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Review Content HTML */}
              <div
                className="entry-content-text"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Prominent Watch/Download Button */}
              {post.download_url && (
                <div className="watch-download-cta">
                  <a
                    href={post.download_url}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="cta-button"
                  >
                    <i className="fa-solid fa-play" style={{ marginRight: '8px' }}></i>
                    এখান থেকে দেখুন
                  </a>
                </div>
              )}
            </div>

            {/* Post Labels */}
            <div className="post-labels">
              <div className="label-head Label">
                <Link className="label-link" href={`/category/${catSlug}`} rel="tag">
                  {post.category}
                </Link>
                {post.categories
                  .filter(c => c !== post.category)
                  .map((c, i) => (
                    <Link key={i} className="label-link" href={`/category/${catSlug}`} rel="tag">
                      {c}
                    </Link>
                  ))}
              </div>
            </div>

            {/* Post Share Links */}
            <div className="post-share">
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
                <li className="pinterest">
                  <a
                    className="pinterest"
                    href={`https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(post.image_url)}&description=${shareTitle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Pin on Pinterest"
                  >
                    <i className="fa-brands fa-pinterest-p"></i>
                  </a>
                </li>
                <li className="linkedin">
                  <a
                    className="linkedin"
                    href={`https://www.linkedin.com/shareArticle?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Share on LinkedIn"
                  >
                    <i className="fa-brands fa-linkedin-in"></i>
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
                <li className="email">
                  <a
                    className="email"
                    href={`mailto:?subject=${shareTitle}&body=${encodeURIComponent(shareUrl)}`}
                    title="Share via Email"
                  >
                    <i className="fa-solid fa-envelope"></i>
                  </a>
                </li>
              </ul>
            </div>

            {/* Post Nav (Newer / Older) */}
            <div className="post-footer">
              <ul className="post-nav">
                {newer && (
                  <li className="post-next">
                    <Link href={`/post/${newer.slug}`}>
                      <div className="post-nav-inner post-nav-active">
                        <span>নবীনতর</span>
                        <p>{newer.title}</p>
                      </div>
                    </Link>
                  </li>
                )}
                {older && (
                  <li className="post-prev">
                    <Link href={`/post/${older.slug}`} className="prev-post-link">
                      <div className="post-nav-inner">
                        <span>পূর্বতন</span>
                        <p>{older.title}</p>
                      </div>
                    </Link>
                  </li>
                )}
              </ul>

              {/* About Author Box */}
              <div className="about-author">
                <div className="avatar-container">
                  <img
                    alt="ViralVideo Editorial"
                    className="author-avatar"
                    src="/author-avatar.svg"
                    width={80}
                    height={80}
                  />
                </div>
                <h3 className="author-name">
                  <span>এর দ্বারা পোস্ট করা </span>
                  <Link href="/p/about" title="ViralVideo Editorial">
                    ViralVideo
                  </Link>
                </h3>
                <span className="author-description">
                  ViralVideo – বাংলা, হিন্দি এবং আন্তর্জাতিক মুভি ও ওয়েব সিরিজের সৎ ও নির্ভরযোগ্য রিভিউ হাব।
                </span>
              </div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div id="related-wrap">
                  <div className="title-wrap">
                    <h3>এই পোস্টগুলি আপনার ভাল লাগতে পারে</h3>
                  </div>
                  <div className="related-posts-grid">
                    {relatedPosts.map(rel => (
                      <div className="related-item" key={rel.id}>
                        <Link href={`/post/${rel.slug}`} className="related-thumb-link">
                          <img src={rel.image_url} alt={rel.title} />
                        </Link>
                        <h4 className="related-title">
                          <Link href={`/post/${rel.slug}`}>{rel.title}</Link>
                        </h4>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar />
      <div className="clearfix"></div>
    </>
  )
}
