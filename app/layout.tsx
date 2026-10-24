import './globals.css'
import Script from 'next/script'
import { getTexts } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const t = await getTexts()
  const title = t('site_name') || 'ViralVideo | Trending Movies & Series Reviews'
  const description =
    t('site_description') ||
    'ViralVideo – Get trending movie and series reviews in Bengali, English, and Hindi. Discover detailed insights on the latest releases.'
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title,
    description,
    icons: {
      icon: '/favicon.svg',
    },
    openGraph: {
      title,
      description,
      type: 'website',
      images: [
        {
          url: '/logo.svg',
        },
      ],
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" dir="ltr">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />
        <meta name="theme-color" content="#31942e" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {/* Google Fonts: Fira Sans & Hind Siliguri */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Hind+Siliguri:wght@400;500;600;700&display=swap"
        />
        {/* Font Awesome 6 */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <Script
          id="adsterra-popunder"
          data-cfasync="false"
          src="https://aarems.org/1/f023ee03cd0e81f8ac94c7462316d8ba"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        {children}
        <Script
          data-cfasync="false"
          src="https://bancadeltempoidea.org/14/7ca7d3009b54e2e6eb42f9b429b26800"
        />
      </body>
    </html>
  )
}
