'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    atOptions?: Props['config']
    adsterraBannerQueue?: Promise<void>
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
      const previous = window.adsterraBannerQueue || Promise.resolve()
      window.adsterraBannerQueue = previous.then(
        () =>
          new Promise<void>((resolve, reject) => {
            window.atOptions = config
            const script = document.createElement('script')
            script.src = scriptUrl
            script.async = false
            script.dataset.cfasync = 'false'
            script.onload = () => resolve()
            script.onerror = () => reject(new Error(`Could not load ad script for ${slot}`))
            container.appendChild(script)
          }),
      ).catch(error => {
        loadedRef.current = false
        console.error(error)
      })
    }

    load()
    window.addEventListener('resize', load)
    return () => window.removeEventListener('resize', load)
  }, [config, scriptUrl])

  return <span ref={containerRef} data-adsterra-slot={slot} />
}
