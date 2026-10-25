'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    atOptions?: Props['config']
  }
}

interface Props {
  slot: string
  scriptUrl: string
  config: {
    key: string
    format: 'iframe'
    height: number
    width: number
    params: Record<string, never>
  }
}

export default function AdsterraBannerScript({ slot, scriptUrl, config }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    const load = () => {
      const container = containerRef.current
      if (
        !container ||
        loadedRef.current ||
        container.getClientRects().length === 0 ||
        getComputedStyle(container).display === 'none'
      ) {
        return
      }

      loadedRef.current = true
      window.atOptions = config
      const script = document.createElement('script')
      script.src = scriptUrl
      script.async = true
      script.dataset.cfasync = 'false'
      container.appendChild(script)
    }

    load()
    window.addEventListener('resize', load)
    return () => window.removeEventListener('resize', load)
  }, [config, scriptUrl])

  return <span ref={containerRef} data-adsterra-slot={slot} />
}
