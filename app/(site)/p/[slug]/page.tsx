import { notFound } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import ContactForm from '@/components/ContactForm'
import { getPage } from '@/lib/data'

export const dynamic = 'force-dynamic'

interface Props {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: Props) {
  const page = await getPage(params.slug)
  if (!page) return { title: 'Page Not Found' }
  return {
    title: `${page.title} | Review Bazar Movies`,
    description: `Official ${page.title} page of Review Bazar Movies.`,
  }
}

export default async function StaticPage({ params }: Props) {
  const page = await getPage(params.slug)
  if (!page) notFound()

  const cleanSlug = params.slug.replace(/\.html$/, '')
  const isContact = cleanSlug === 'contact' || cleanSlug === 'contact-us'

  return (
    <>
      <div id="main-wrapper">
        <div className="main section" id="main">
          {/* Breadcrumb */}
          <nav id="breadcrumb">
            <Link href="/">হোম</Link>
            <em className="delimiter"></em>
            <span>পৃষ্ঠা</span>
            <em className="delimiter"></em>
            <span className="current">{page.title}</span>
          </nav>

          <article className="item-post static_page hentry">
            <h1 className="post-title">{page.title}</h1>
            <div className="post-body post-content" id="post-body">
              <div
                className="entry-content-text"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
              {isContact && <ContactForm />}
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
