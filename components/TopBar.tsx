import Link from 'next/link'

export default function TopBar() {
  return (
    <div id="top-bar">
      <div className="container row top-bar-inner">
        <div className="top-bar-nav">
          <ul role="menu">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/p/about">About</Link></li>
            <li><Link href="/p/contact-us">Contact</Link></li>
            <li><Link href="/p/disclaimer">Disclaimer</Link></li>
            <li><Link href="/p/dmca">DMCA</Link></li>
            <li><Link href="/p/privacy-policy">Privacy Policy</Link></li>
          </ul>
        </div>
        <div className="top-bar-social social">
          <ul>
            <li className="facebook">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
              >
                <i className="fa-brands fa-facebook-f"></i>
              </a>
            </li>
            <li className="telegram">
              <a
                href="https://telegram.org"
                target="_blank"
                rel="noopener noreferrer"
                title="Telegram"
              >
                <i className="fa-brands fa-telegram"></i>
              </a>
            </li>
            <li className="github">
              <a
                href="https://github.com/Mahedihasanimam"
                target="_blank"
                rel="noopener noreferrer"
                title="Developer GitHub"
              >
                <i className="fa-brands fa-github"></i>
              </a>
            </li>
          </ul>
        </div>
        <div className="clearfix"></div>
      </div>
    </div>
  )
}
