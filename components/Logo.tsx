import Link from 'next/link'

interface LogoProps {
  variant?: 'light' | 'dark'
  className?: string
}

export default function Logo({ variant = 'light', className = '' }: LogoProps) {
  return (
    <Link href="/" className={`brand-logo-wrap ${className}`} title="ViralVideo - Movie & Series Reviews">
      <img
        src={variant === 'dark' ? '/logo-footer.svg' : '/logo.svg'}
        alt="ViralVideo Logo"
        width={210}
        height={46}
        style={{ height: '46px', width: 'auto', display: 'block' }}
      />
    </Link>
  )
}
