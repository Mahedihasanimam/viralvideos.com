import Script from 'next/script'
import type { CSSProperties } from 'react'

interface BannerAdProps {
  id: string
  keyValue: string
  width: number
  height: number
}

export function BannerAd({ id, keyValue, width, height }: BannerAdProps) {
  return (
    <div
      className="adsterra-banner-ad"
      data-ad-slot={id}
      style={{ '--ad-width': `${width}px`, '--ad-height': `${height}px` } as CSSProperties}
      aria-label="Advertisement"
    >
      <script dangerouslySetInnerHTML={{ __html: `
        atOptions = {
          'key' : '${keyValue}',
          'format' : 'iframe',
          'height' : ${height},
          'width' : ${width},
          'params' : {}
        };
      ` }} />
      <script src={`https://bancadeltempoidea.org/22/${keyValue}`} />
    </div>
  )
}

export function NativeBannerAd() {
  return (
    <div className="adsterra-native-ad" aria-label="Advertisement">
      <Script
        async
        data-cfasync="false"
        src="https://bancadeltempoidea.org/21/6fb853f324c105cabb940b068bf675d0"
      />
      <div id="container-6fb853f324c105cabb940b068bf675d0"></div>
    </div>
  )
}

export function Banner300x250Ad() {
  return <BannerAd id="banner-300x250" keyValue="6aee385fd7d8587b55e2df7c7f10bc8d" width={300} height={250} />
}

export function Banner468x60Ad() {
  return <BannerAd id="banner-468x60" keyValue="a76fd710f7a27301e5c4e5a6a10ed59d" width={468} height={60} />
}

export function Banner160x300Ad() {
  return <BannerAd id="banner-160x300" keyValue="92d17c94bab006dd97e6cb8ae3e5d36c" width={160} height={300} />
}

export function Banner160x600Ad() {
  return <BannerAd id="banner-160x600" keyValue="a47386859ce7da6adccf870dd7f0aae6" width={160} height={600} />
}

export function Banner320x50Ad() {
  return <BannerAd id="banner-320x50" keyValue="439ae85f24a41e503f4433dcf29bfdb3" width={320} height={50} />
}

export function Banner728x90Ad() {
  return <BannerAd id="banner-728x90" keyValue="92befdeb1f92f13a75cdd637578617e7" width={728} height={90} />
}

export function SmartlinkAd() {
  return (
    <div className="adsterra-smartlink" aria-label="Advertisement">
      <a
        href="https://directyp.org/4/d74988ed07d2e9cf1ebf1e68fcddcb89"
        target="_blank"
        rel="sponsored nofollow noopener noreferrer"
      >
        Discover more entertainment
      </a>
    </div>
  )
}
