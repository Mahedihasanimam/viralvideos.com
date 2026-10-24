import Link from 'next/link'
import { MoviePost, getCategoryBySlug } from '@/lib/data'

export default function PostCard({ post }: { post: MoviePost }) {
  const catObj = getCategoryBySlug(post.category)
  const catSlug = catObj ? catObj.slug : 'bangla'
  const postUrl = `/post/${post.slug}`

  // Construct snippet with IMDb and cast if available
  let snippet = post.excerpt
  if (post.imdb || post.director || post.stars || post.genres) {
    const parts: string[] = []
    if (post.imdb && post.imdb !== 'N/A') parts.push(`IMDb rating ➤ ${post.imdb}`)
    if (post.director) parts.push(`Directors ➤ ${post.director}`)
    if (post.stars) parts.push(`Stars ➤ ${post.stars}`)
    if (post.genres) parts.push(`Genres ➤ ${post.genres}`)
    if (parts.length > 0) {
      snippet = parts.join(' ')
      if (snippet.length > 180) snippet = snippet.slice(0, 180) + '...'
    }
  }

  return (
    <article className="blog-post hentry index-post">
      <div className="post-image-wrap">
        <Link href={postUrl} className="post-image-link" title={post.title}>
          <img
            src={post.image_url || '/placeholder.jpg'}
            alt={post.title}
            className="post-thumb lazy-yard"
            loading="lazy"
          />
        </Link>
      </div>
      <div className="post-info">
        <Link href={`/category/${catSlug}`} className="post-tag">
          {post.category}
        </Link>
        <h2 className="post-title">
          <Link href={postUrl}>{post.title}</Link>
        </h2>
        <div className="index-post-footer">
          <div className="post-meta"></div>
          <p className="post-snippet">{snippet}</p>
          <Link href={postUrl} className="read-more">
            <span>Read more »</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
