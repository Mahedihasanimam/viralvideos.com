import CategoryPage from '@/app/(site)/category/[slug]/page'

export const dynamic = 'force-dynamic'

interface Props {
  params: {
    label: string[]
  }
  searchParams: {
    page?: string
  }
}

export default async function BloggerLabelPage({ params, searchParams }: Props) {
  const fullLabel = params.label.join('/')
  return <CategoryPage params={{ slug: fullLabel }} searchParams={searchParams} />
}
