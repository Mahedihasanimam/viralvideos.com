import initialPostsData from './initialPosts.json'
import initialPagesData from './initialPages.json'
import { sb } from './supabase'

export interface MoviePost {
  id: string
  title: string
  slug: string
  originalUrl?: string
  published_at: string
  category: string
  categories: string[]
  image_url: string
  excerpt: string
  content: string
  imdb: string
  director?: string
  stars?: string
  genres?: string
  language?: string
  country?: string
  platform?: string
  download_url?: string
  video_url?: string
  featured?: boolean
  views: number
}

export interface VideoItem {
  id: string
  title: string
  slug: string
  description?: string
  video_url: string
  thumbnail_url?: string
  category_id?: string
  category?: string
  categories?: string[]
  duration?: string
  views: number
  published?: boolean
  featured?: boolean
  created_at: string
}

export interface StaticPage {
  slug: string
  title: string
  content: string
}

export interface CategoryInfo {
  id: string
  name: string
  slug: string
  count: number
}

// In-memory cache & fallback store initialized from scraped data
let inMemoryPosts: MoviePost[] = (initialPostsData as MoviePost[]) || []
let inMemoryPages: Record<string, StaticPage> = (initialPagesData as any) || {}

// Standard category definition matching ReviewBazarMovies
export const STANDARD_CATEGORIES: { name: string; slug: string; aliases: string[]; count: number }[] = [
  { name: 'বাংলা মুভি এবং ওয়েব সিরিজ', slug: 'bangla', aliases: ['bangla-movies', 'bangla-movie'], count: 518 },
  { name: 'হিন্দি মুভি ও ওয়েব সিরিজ', slug: 'hindi', aliases: ['hindi-movies', 'hindi-movie'], count: 304 },
  { name: 'হরর মুভি ও সিরিজ', slug: 'horror', aliases: ['horror-movies'], count: 69 },
  { name: 'ইংলিশ মুভি ও সিরিজ', slug: 'english', aliases: ['english-movies'], count: 68 },
  { name: 'প্রাপ্তবয়স্কদের মুভি ও সিরিজ', slug: 'adult', aliases: ['adult-18', 'adults'], count: 44 },
  { name: 'বাংলা ডাব মুভি ও সিরিজ', slug: 'bangla-dub', aliases: ['bangla-dubbed'], count: 24 },
  { name: 'কোরিয়ান মুভি ও সিরিজ', slug: 'korean', aliases: ['korean-movies'], count: 9 },
  { name: 'অ্যানিমেশন মুভি ও সিরিজ', slug: 'animation', aliases: ['animated-movies'], count: 5 },
]

export function getCategoryBySlug(slug: string) {
  const normalized = decodeURIComponent(slug).toLowerCase().trim()
  return STANDARD_CATEGORIES.find(
    c => c.slug === normalized || c.name === slug || c.aliases.includes(normalized)
  )
}

export async function getPosts({
  query,
  category,
  page = 1,
  limit = 6,
}: {
  query?: string
  category?: string
  page?: number
  limit?: number
}) {
  // Try Supabase first if configured
  try {
    const s = sb()
    let sbQuery = s.from('posts').select('*, categories(name,slug)').eq('published', true)
    if (query) sbQuery = sbQuery.ilike('title', `%${query}%`)
    const { data, error } = await sbQuery.order('created_at', { ascending: false }).range((page - 1) * limit, page * limit)
    if (!error && data && data.length > 0) {
      return {
        posts: data.map((p: any) => ({
          ...p,
          category: p.categories?.name || 'বাংলা মুভি এবং ওয়েব সিরিজ',
          categories: [p.categories?.name || 'বাংলা মুভি এবং ওয়েব সিরিজ'],
          published_at: p.created_at,
        })),
        total: 100,
        hasMore: data.length >= limit,
      }
    }
  } catch (e) {
    // fall through to in-memory store
  }

  // Filter in-memory
  let filtered = [...inMemoryPosts]

  if (category) {
    const catObj = getCategoryBySlug(category)
    const catName = catObj ? catObj.name : decodeURIComponent(category)
    filtered = filtered.filter(p =>
      p.categories.some(c => c.includes(catName) || catName.includes(c)) ||
      (catObj && (p.category.includes(catObj.name) || p.categories.includes(catObj.name)))
    )
  }

  if (query) {
    const qLower = query.toLowerCase().trim()
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(qLower) ||
      p.excerpt.toLowerCase().includes(qLower) ||
      (p.director && p.director.toLowerCase().includes(qLower)) ||
      (p.stars && p.stars.toLowerCase().includes(qLower)) ||
      (p.genres && p.genres.toLowerCase().includes(qLower))
    )
  }

  const offset = (page - 1) * limit
  const paginated = filtered.slice(offset, offset + limit)

  return {
    posts: paginated,
    total: filtered.length,
    hasMore: offset + limit < filtered.length,
  }
}

export async function getPostBySlug(slug: string): Promise<MoviePost | null> {
  const cleanSlug = decodeURIComponent(slug).replace(/\.html$/, '').trim()

  // Try Supabase first
  try {
    const s = sb()
    const { data } = await s
      .from('posts')
      .select('*, categories(name,slug)')
      .eq('slug', cleanSlug)
      .eq('published', true)
      .maybeSingle()
    if (data) {
      return {
        ...data,
        category: data.categories?.name || 'বাংলা মুভি এবং ওয়েব সিরিজ',
        categories: [data.categories?.name || 'বাংলা মুভি এবং ওয়েব সিরিজ'],
        published_at: data.created_at,
      }
    }
  } catch (e) {
    // fall through
  }

  // Search in memory
  const found = inMemoryPosts.find(p => {
    if (p.slug === cleanSlug) return true
    if (p.originalUrl && p.originalUrl.includes(cleanSlug)) return true
    const titleSlug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    if (titleSlug.includes(cleanSlug) || cleanSlug.includes(titleSlug)) return true
    return false
  })

  return found || inMemoryPosts[0] || null
}

export async function getPopularPosts(limit = 4): Promise<MoviePost[]> {
  try {
    const s = sb()
    const { data } = await s
      .from('posts')
      .select('*, categories(name, slug)')
      .eq('published', true)
      .order('views', { ascending: false })
      .limit(limit)
    if (data && data.length > 0) {
      return data.map((p: any) => ({
        ...p,
        category: p.categories?.name || 'বাংলা মুভি এবং ওয়েব সিরিজ',
        categories: [p.categories?.name || 'বাংলা মুভি এবং ওয়েব সিরিজ'],
        published_at: p.created_at,
      }))
    }
  } catch {
    // fallback
  }

  const sorted = [...inMemoryPosts].sort((a, b) => (b.views || 0) - (a.views || 0))
  return sorted.slice(0, limit)
}

export async function getFeaturedPost(): Promise<MoviePost | null> {
  try {
    const s = sb()
    const { data } = await s
      .from('posts')
      .select('*, categories(name, slug)')
      .eq('published', true)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (data) {
      return {
        ...data,
        category: data.categories?.name || 'বাংলা মুভি এবং ওয়েব সিরিজ',
        categories: [data.categories?.name || 'বাংলা মুভি এবং ওয়েব সিরিজ'],
        published_at: data.created_at,
      }
    }
  } catch {
    // fallback
  }

  return inMemoryPosts.find(p => p.featured) || inMemoryPosts[0] || null
}

export async function getRelatedPosts(currentPost: MoviePost, limit = 4): Promise<MoviePost[]> {
  const related = inMemoryPosts.filter(
    p => p.id !== currentPost.id && (p.category === currentPost.category || p.categories.some(c => currentPost.categories.includes(c)))
  )
  if (related.length >= limit) return related.slice(0, limit)
  // Fill with others
  const others = inMemoryPosts.filter(p => p.id !== currentPost.id && !related.includes(p))
  return [...related, ...others].slice(0, limit)
}

export async function getPrevAndNextPost(currentPost: MoviePost) {
  const idx = inMemoryPosts.findIndex(p => p.id === currentPost.id || p.slug === currentPost.slug)
  const newer = idx > 0 ? inMemoryPosts[idx - 1] : null
  const older = idx >= 0 && idx < inMemoryPosts.length - 1 ? inMemoryPosts[idx + 1] : null
  return { newer, older }
}

export async function getCategories(): Promise<CategoryInfo[]> {
  return STANDARD_CATEGORIES.map(c => {
    // count how many posts match this category
    const countInScraped = inMemoryPosts.filter(p =>
      p.categories.some(cat => cat.includes(c.name) || c.name.includes(cat))
    ).length
    return {
      id: c.slug,
      name: c.name,
      slug: c.slug,
      count: Math.max(c.count, countInScraped),
    }
  })
}

export async function getPage(slug: string): Promise<StaticPage | null> {
  const clean = slug.replace(/\.html$/, '')
  // Normalize contact / contact-us
  const key = clean === 'contact' ? 'contact-us' : clean
  if (inMemoryPages[key]) return inMemoryPages[key]
  if (inMemoryPages[clean]) return inMemoryPages[clean]

  // Default content
  return {
    slug: clean,
    title: clean.toUpperCase(),
    content: `<p>Welcome to ${clean} page of Viral Videos Movies.</p>`,
  }
}

export function incrementPostViews(slug: string) {
  const post = inMemoryPosts.find(p => p.slug === slug || (p.originalUrl && p.originalUrl.includes(slug)))
  if (post) {
    post.views = (post.views || 0) + 1
  }
}

export async function getVideos({
  query,
  category,
  page = 1,
  limit = 12,
}: {
  query?: string
  category?: string
  page?: number
  limit?: number
} = {}) {
  // 1. Try fetching from videos table in Supabase
  try {
    const s = sb()
    let q = s.from('videos').select('*, categories(name, slug)', { count: 'exact' }).eq('published', true)
    if (query) q = q.ilike('title', `%${query}%`)
    const { data, count, error } = await q.order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1)
    if (!error && data && data.length > 0) {
      return {
        videos: data.map((v: any) => ({
          ...v,
          category: v.categories?.name || 'মুভি ও ট্রেলার',
          categories: [v.categories?.name || 'মুভি ও ট্রেলার'],
        })),
        total: count || data.length,
        hasMore: (count ?? 0) > page * limit,
      }
    }
  } catch {
    // ignore
  }

  // 2. Also check if any posts in Supabase have video_url
  try {
    const s = sb()
    let pq = s.from('posts').select('*, categories(name, slug)').eq('published', true).not('video_url', 'is', null)
    if (query) pq = pq.ilike('title', `%${query}%`)
    const { data: postVideos, error: postErr } = await pq.order('created_at', { ascending: false }).limit(limit)
    if (!postErr && postVideos && postVideos.length > 0) {
      return {
        videos: postVideos.map((p: any) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          description: p.excerpt,
          video_url: p.video_url,
          thumbnail_url: p.image_url,
          category: p.categories?.name || 'মুভি ও ট্রেলার',
          categories: [p.categories?.name || 'মুভি ও ট্রেলার'],
          views: p.views || 0,
          created_at: p.created_at,
          published: p.published,
          featured: p.featured,
        })),
        total: postVideos.length,
        hasMore: false,
      }
    }
  } catch {
    // ignore
  }

  return { videos: [] as VideoItem[], total: 0, hasMore: false }
}

export async function getVideoBySlug(slug: string): Promise<VideoItem | null> {
  const cleanSlug = decodeURIComponent(slug).replace(/\.html$/, '').trim()
  try {
    const s = sb()
    const { data } = await s
      .from('videos')
      .select('*, categories(name, slug)')
      .eq('slug', cleanSlug)
      .eq('published', true)
      .maybeSingle()
    if (data) {
      return {
        ...data,
        category: data.categories?.name || 'মুভি ও ট্রেলার',
        categories: [data.categories?.name || 'মুভি ও ট্রেলার'],
      }
    }

    // Check posts table if a post has video_url with this slug
    const { data: postData } = await s
      .from('posts')
      .select('*, categories(name, slug)')
      .eq('slug', cleanSlug)
      .not('video_url', 'is', null)
      .maybeSingle()
    if (postData) {
      return {
        id: postData.id,
        title: postData.title,
        slug: postData.slug,
        description: postData.excerpt,
        video_url: postData.video_url,
        thumbnail_url: postData.image_url,
        category: postData.categories?.name || 'মুভি ও ট্রেলার',
        categories: [postData.categories?.name || 'মুভি ও ট্রেলার'],
        views: postData.views || 0,
        created_at: postData.created_at,
        published: postData.published,
        featured: postData.featured,
      }
    }
  } catch {
    // ignore
  }
  return null
}

export async function getRecentVideos(limit = 4): Promise<VideoItem[]> {
  const { videos } = await getVideos({ limit })
  return videos
}

export async function incrementVideoViews(slug: string) {
  try {
    const s = sb()
    await s.rpc('increment_video_views', { p_slug: slug })
  } catch {
    // ignore
  }
}
