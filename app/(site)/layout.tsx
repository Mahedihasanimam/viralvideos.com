import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FloatingNightToggle from '@/components/FloatingNightToggle'

export const dynamic = 'force-dynamic'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div id="outer-wrapper">
      {/* Top Bar */}
      <TopBar />

      {/* Main Header */}
      <Header />
      <div className="clearfix"></div>

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
  )
}
