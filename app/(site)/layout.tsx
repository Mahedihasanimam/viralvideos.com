import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FloatingNightToggle from '@/components/FloatingNightToggle'
import { SmartlinkAd } from '@/components/AdsterraAds'
import Script from 'next/script'

export const dynamic = 'force-dynamic'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div id="outer-wrapper">
      {/* Top Bar */}
      <TopBar />

      {/* Main Header */}
      <Header />
      <div className="clearfix"></div>

      <div className="container site-header-ad">
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
      </div>
      <Script
        data-cfasync="false"
        src="https://bancadeltempoidea.org/14/7ca7d3009b54e2e6eb42f9b429b26800"
      />
    </>
  )
}
