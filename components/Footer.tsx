import Link from 'next/link'
import Logo from './Logo'
import { getPopularPosts, getFeaturedPost } from '@/lib/data'
import { formatBengaliDate } from '@/lib/date'

export default async function Footer() {
  const [popular, featured] = await Promise.all([
    getPopularPosts(2),
    getFeaturedPost(),
  ])

  const pop1 = popular[0]
  const pop2 = popular[1] || popular[0]

  return (
    <footer id="footer-wrapper">
      {/* Primary Footer */}
      <div className="primary-footer">
        <div className="container row footer-top-inner">
          <div className="footer-about-area">
            {/* Custom Brand Logo */}
            <div className="footer-logo-box">
              <Logo variant="dark" />
            </div>
            <p className="image-caption excerpt">
              Welcome to <strong>ViralVideo</strong>! Your premier destination for insightful reviews and story analysis of trending movies and web series across languages including Bengali, Hindi, English, and Korean. We provide unbiased critiques, IMDb insights, and where-to-watch information to help you pick your next binge.
            </p>

            {/* Developer Info Badge */}
            <div className="developer-info-card">
              <div className="dev-icon">
                <i className="fa-solid fa-laptop-code"></i>
              </div>
              <div className="dev-details">
                <span className="dev-title">Developer &amp; Creator</span>
                <span className="dev-name">
                  <strong>Mehedi Hasan</strong> (<a href="https://github.com/Mahedihasanimam" target="_blank" rel="noopener noreferrer">@Mahedihasanimam</a>)
                </span>
                <div className="dev-contacts">
                  <a href="mailto:mdmehedihasen678@gmail.com" className="dev-link" title="Email Developer">
                    <i className="fa-solid fa-envelope"></i> mdmehedihasen678@gmail.com
                  </a>
                  <span className="dev-sep">•</span>
                  <a href="https://github.com/Mahedihasanimam" target="_blank" rel="noopener noreferrer" className="dev-link" title="GitHub Profile">
                    <i className="fa-brands fa-github"></i> GitHub Profile
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="foot-bar-social social social-color">
            <ul>
              <li className="facebook">
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook">
                  <i className="fa-brands fa-facebook-f"></i>
                </a>
              </li>
              <li className="twitter">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" title="Twitter">
                  <i className="fa-brands fa-x-twitter"></i>
                </a>
              </li>
              <li className="instagram">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram">
                  <i className="fa-brands fa-instagram"></i>
                </a>
              </li>
              <li className="youtube">
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" title="YouTube">
                  <i className="fa-brands fa-youtube"></i>
                </a>
              </li>
              <li className="linkedin">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                  <i className="fa-brands fa-linkedin-in"></i>
                </a>
              </li>
              <li className="github">
                <a href="https://github.com/Mahedihasanimam" target="_blank" rel="noopener noreferrer" title="Developer GitHub">
                  <i className="fa-brands fa-github"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="clearfix"></div>

      {/* 3 Column Widgets */}
      <div className="container row footer-widgets-container">
        <div className="footer-widgets-wrap">
          {/* Section Left */}
          <div className="footer common-widget" id="footer-sec1">
            <div className="widget-title">
              <h3 className="title">Popular Reviews</h3>
            </div>
            <div className="widget-content">
              {pop1 && (
                <div className="post">
                  <div className="post-content">
                    <Link href={`/post/${pop1.slug}`} className="post-image-link">
                      <img
                        src={pop1.image_url || '/placeholder.svg'}
                        alt={pop1.title}
                        className="post-thumb"
                        width={72}
                        height={72}
                      />
                    </Link>
                    <div className="post-info">
                      <h2 className="post-title">
                        <Link href={`/post/${pop1.slug}`}>{pop1.title}</Link>
                      </h2>
                      <div className="post-meta">
                        <span className="post-date published">
                          {formatBengaliDate(pop1.published_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section Center */}
          <div className="footer common-widget" id="footer-sec2">
            <div className="widget-title">
              <h3 className="title">Featured Review</h3>
            </div>
            <div className="widget-content">
              {featured && (
                <div className="post">
                  <div className="post-content">
                    <Link href={`/post/${featured.slug}`} className="post-image-link">
                      <img
                        src={featured.image_url || '/placeholder.svg'}
                        alt={featured.title}
                        className="post-thumb"
                        width={72}
                        height={72}
                      />
                      <span className="post-tag">{featured.category}</span>
                    </Link>
                    <div className="post-info">
                      <h2 className="post-title">
                        <Link href={`/post/${featured.slug}`}>{featured.title}</Link>
                      </h2>
                      <div className="post-meta">
                        <span className="post-author">
                          <Link href="/p/about" title="ViralVideo Editorial">
                            ViralVideo
                          </Link>
                        </span>
                        <span className="post-date published">
                          {formatBengaliDate(featured.published_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section Right */}
          <div className="footer common-widget" id="footer-sec3">
            <div className="widget-title">
              <h3 className="title">Trending Now</h3>
            </div>
            <div className="widget-content">
              {pop2 && (
                <div className="post">
                  <div className="post-content">
                    <Link href={`/post/${pop2.slug}`} className="post-image-link">
                      <img
                        src={pop2.image_url || '/placeholder.svg'}
                        alt={pop2.title}
                        className="post-thumb"
                        width={72}
                        height={72}
                      />
                    </Link>
                    <div className="post-info">
                      <h2 className="post-title">
                        <Link href={`/post/${pop2.slug}`}>{pop2.title}</Link>
                      </h2>
                      <div className="post-meta">
                        <span className="post-date published">
                          {formatBengaliDate(pop2.published_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="clearfix"></div>
        </div>
      </div>

      <div className="clearfix"></div>

      {/* Sub Footer Wrapper */}
      <div id="sub-footer-wrapper">
        <div className="container row sub-footer-inner">
          <div className="menu-footer">
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/p/about">About</Link></li>
              <li><Link href="/p/contact-us">Contact Us</Link></li>
              <li><Link href="/p/privacy-policy">Privacy Policy</Link></li>
            </ul>
          </div>
          <div className="copyright-area">
            Crafted with <i className="fa-solid fa-heart" style={{ color: '#ef4444', margin: '0 3px' }}></i> for{' '}
            <Link href="/" title="ViralVideo">
              <strong>ViralVideo</strong>
            </Link>{' '}
            | Developed by{' '}
            <a
              href="https://github.com/Mahedihasanimam"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#4ade80', fontWeight: 600 }}
              title="Mehedi Hasan - Lead Developer"
            >
              Mehedi Hasan
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
