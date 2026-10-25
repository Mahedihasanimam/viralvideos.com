import Script from 'next/script'
import type { CSSProperties } from 'react'
import { sb } from '@/lib/supabase'
import AdsterraBannerScript from '@/components/AdsterraBannerScript'

interface AdSetting {
  slot: string
  ad_type: 'banner' | 'native' | 'smartlink'
  key_value: string
  script_url: string
  target_url: string
  width: number
  height: number
  enabled: boolean
}

const SLOT_ALIASES: Record<string, string[]> = {
  native_sidebar: ['native_sidebar', 'Native_Banner', 'Native_Banner '],
  banner_300x250: ['banner_300x250', 'Banner 300x250'],
  banner_468x60: ['banner_468x60', '468x60'],
  banner_160x300: ['banner_160x300', 'Banner 160x300'],
  banner_160x600: ['banner_160x600', 'Banner 160x600'],
  banner_320x50: ['banner_320x50', 'Banner 320x50'],
  banner_728x90: ['banner_728x90', 'Banner 728x90'],
  smartlink_global: ['smartlink_global', 'Smart link'],
  popunder_global: ['popunder_global', 'Popunder ads', 'Popunder ads '],
  socialbar_global: ['socialbar_global', 'Social Bar', 'Social Bar '],
}

async function getAd(slot: string): Promise<AdSetting | null> {
  const slots = SLOT_ALIASES[slot] || [slot]
  const { data, error } = await sb()
    .from('ad_settings')
    .select('slot,ad_type,key_value,script_url,target_url,width,height,enabled')
    .in('slot', slots)
    .limit(1)

  if (error) {
    console.error(`Could not load ad setting "${slot}":`, error.message)
    return null
  }
  const ad = data?.[0]
  if (!ad || !ad.enabled) return null
  return ad as AdSetting
}

function BannerAd({ ad }: { ad: AdSetting }) {
  if (!ad.key_value || !ad.script_url || !ad.width || !ad.height) return null

  const config = {
    key: ad.key_value,
    format: 'iframe' as const,
    height: ad.height,
    width: ad.width,
    params: {},
  }

  return (
    <div
      className="adsterra-banner-ad"
      data-ad-slot={ad.slot}
      style={{ '--ad-width': `${ad.width}px`, '--ad-height': `${ad.height}px` } as CSSProperties}
      aria-label="Advertisement"
    >
      <AdsterraBannerScript slot={ad.slot} scriptUrl={ad.script_url} config={config} />
    </div>
  )
}

export async function NativeBannerAd() {
  const ad = await getAd('native_sidebar')
  if (!ad || !ad.script_url || !ad.key_value) return null

  return (
    <div className="adsterra-native-ad" aria-label="Advertisement">
      <Script async data-cfasync="false" src={ad.script_url} />
      <div id={`container-${ad.key_value}`}></div>
    </div>
  )
}

async function configuredBanner(slot: string) {
  const ad = await getAd(slot)
  return ad && ad.ad_type === 'banner' ? <BannerAd ad={ad} /> : null
}

export async function Banner300x250Ad() {
  return configuredBanner('banner_300x250')
}

export async function Banner468x60Ad() {
  return configuredBanner('banner_468x60')
}

export async function Banner160x300Ad() {
  return configuredBanner('banner_160x300')
}

export async function Banner160x600Ad() {
  return configuredBanner('banner_160x600')
}

export async function Banner320x50Ad() {
  return configuredBanner('banner_320x50')
}

export async function Banner728x90Ad() {
  return configuredBanner('banner_728x90')
}

export async function SmartlinkAd() {
  const ad = await getAd('smartlink_global')
  if (!ad || ad.ad_type !== 'smartlink' || !ad.target_url) return null

  return (
    <div className="adsterra-smartlink" aria-label="Advertisement">
      <a href={ad.target_url} target="_blank" rel="sponsored nofollow noopener noreferrer">
        Discover more entertainment
      </a>
    </div>
  )
}

export async function PopunderAd() {
  const ad = await getAd('popunder_global')
  // If row exists in database and is disabled, don't show
  if (ad && !ad.enabled) return null

  const scriptUrl = ad?.script_url || 'https://aarems.org/1/f023ee03cd0e81f8ac94c7462316d8ba'
  if (!scriptUrl) return null

  return (
    <Script
      id="adsterra-popunder"
      data-cfasync="false"
      src={scriptUrl}
      strategy="afterInteractive"
    />
  )
}

export async function SocialbarAd() {
  const ad = await getAd('socialbar_global')
  // If row exists in database and is disabled, don't show
  if (ad && !ad.enabled) return null

  const scriptUrl = ad?.script_url || 'https://bancadeltempoidea.org/14/7ca7d3009b54e2e6eb42f9b429b26800'
  if (!scriptUrl) return null

  return (
    <Script
      id="adsterra-socialbar"
      data-cfasync="false"
      src={scriptUrl}
      strategy="lazyOnload"
    />
  )
}
