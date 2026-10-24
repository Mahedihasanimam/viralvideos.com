import Script from 'next/script'

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
  return (
    <div className="adsterra-banner-ad" aria-label="Advertisement">
      <Script id="adsterra-banner-config">{`
        atOptions = {
          'key' : '6aee385fd7d8587b55e2df7c7f10bc8d',
          'format' : 'iframe',
          'height' : 250,
          'width' : 300,
          'params' : {}
        };
      `}</Script>
      <Script
        src="https://bancadeltempoidea.org/22/6aee385fd7d8587b55e2df7c7f10bc8d"
      />
    </div>
  )
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
