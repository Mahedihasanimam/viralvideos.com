import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FloatingNightToggle from '@/components/FloatingNightToggle'
import {
  Banner320x50Ad,
  Banner468x60Ad,
  Banner728x90Ad,
  PopunderAd,
  SocialbarAd,
  SmartlinkAd,
} from '@/components/AdsterraAds'

export const dynamic = 'force-dynamic'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="outer-wrapper">
      {/* Dynamic Popunder (controlled from Admin Dashboard) */}
      <PopunderAd />

      {/* Top Bar */}
      <TopBar />

      {/* Main Header */}
      <Header />
      <div className="clearfix"></div>

      <div className="site-top-ad">
        <div className="desktop-top-ad"><Banner728x90Ad /></div>
        <div className="mobile-top-ad"><Banner320x50Ad /></div>
      </div>
      <div className="site-secondary-ad">
        <Banner468x60Ad />
        <SmartlinkAd />
      </div>

      {/* Content Wrapper */}
      <div id="content-wrapper" className="row">
        <div className="container">
          {children}
        </div>
      </div>
      <div className="clearfix"></div>

      {/* Footer */}
      <Footer />

      {/* Floating Night Mode Toggle Button */}
      <FloatingNightToggle />

      {/* Dynamic Social Bar (controlled from Admin Dashboard) */}
      <SocialbarAd />
    </div>
  )
}

