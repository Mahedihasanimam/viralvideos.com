import PostPage, { generateMetadata as postMetadata } from '@/app/(site)/post/[slug]/page'

export const dynamic = 'force-dynamic'

interface Props {
  params: {
    year: string
    month: string
    slug: string
  }
}

export async function generateMetadata({ params }: Props) {
  const cleanSlug = params.slug.replace(/\.html$/, '')
  return postMetadata({ params: { slug: cleanSlug } })
}

export default async function LegacyBloggerPostPage({ params }: Props) {
  const cleanSlug = params.slug.replace(/\.html$/, '')
  return <PostPage params={{ slug: cleanSlug }} />
}
