import { NextResponse } from 'next/server'
import initialPosts from '@/lib/initialPosts.json'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.toLowerCase().trim() || ''

  if (!q) {
    return NextResponse.json([])
  }

  const posts = (initialPosts as any[])
  const matches = posts
    .filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
      (p.stars && p.stars.toLowerCase().includes(q)) ||
      (p.director && p.director.toLowerCase().includes(q))
    )
    .slice(0, 10)
    .map(p => ({
      title: p.title,
      url: `/post/${p.slug}`,
      thumbnail: p.image_url || '/placeholder.jpg',
    }))

  return NextResponse.json(matches)
}
