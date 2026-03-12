import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { APP, NAVIGATION, SOCIAL } from '../config/constants'
import { ASSETS } from '../config/assets'
import { useIsScrolled } from '../hooks/useScrollAnimation'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [announcementVisible, setAnnouncementVisible] = useState(true)
  const scrolled  = useIsScrolled(60)
  const location  = useLocation()

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [location])

  // Prevent scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* ── ANNOUNCEMENT BAR ────────────────────────────────── */}
      {announcementVisible && (
        <div
          className="relative z-50 flex items-center justify-center gap-3 py-2 px-4 text-center"
          style={{ background: 'var(--c-primary)', color: 'var(--c-accent-light)' }}
        >
          <span className="text-xs tracking-widest uppercase font-medium">
            ✦ Free delivery on orders over ₦50,000 — Shop our new collection ✦
          </span>
          <button
            onClick={() => setAnnouncementVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss announcement"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── MAIN NAVBAR ─────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-40 transition-all duration-500 ${scrolled ? 'nav-scrolled' : 'bg-transparent'}`}
        style={!scrolled ? { background: 'transparent' } : {}}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-[72px]">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0" aria-label={APP.name}>
              {/* Text logo fallback — replace with img when logo is ready */}
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 flex items-center justify-center rounded-sm font-display font-bold text-white text-sm"
                  style={{ background: 'var(--c-primary)' }}
                >
                  MW
                </div>
                <span
                  className="font-display font-semibold tracking-wide text-lg hidden sm:block"
                  style={{ color: scrolled ? 'var(--c-primary)' : 'var(--c-primary)' }}
                >
                  {APP.name}
                </span>
              </div>
              {/* Uncomment when logo is ready:
              <img src={scrolled ? ASSETS.logo.main : ASSETS.logo.white} alt={APP.name} className="h-10 w-auto" />
              */}
            </Link>

            {/* Desktop Nav */}
            <ul className="hidden lg:flex items-center gap-8">
              {NAVIGATION.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`relative text-sm font-medium tracking-wide uppercase transition-colors duration-200 pb-1 group
                      ${isActive(item.path)
                        ? 'text-primary-DEFAULT'
                        : 'text-brand-text hover:text-primary-DEFAULT'
                      }`}
                    style={{
                      color: isActive(item.path) ? 'var(--c-primary)' : 'var(--c-text)',
                      fontSize: '0.8rem',
                      letterSpacing: '0.1em'
                    }}
                  >
                    {item.label}
                    <span
                      className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-300"
                      style={{ background: 'var(--c-accent)' }}
                    />
                    {isActive(item.path) && (
                      <span className="absolute bottom-0 left-0 h-0.5 w-full" style={{ background: 'var(--c-primary)' }} />
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Social icons (desktop) */}
              <div className="hidden lg:flex items-center gap-3">
                <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="opacity-60 hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--c-primary)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                </a>
                <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="opacity-60 hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--c-primary)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
              </div>

              {/* CTA */}
              <Link
                to="/contact"
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold tracking-widest uppercase text-white transition-all duration-300"
                style={{ background: 'var(--c-primary)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--c-accent)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--c-primary)'}
              >
                Shop Now
              </Link>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMenuOpen(prev => !prev)}
                className="lg:hidden flex flex-col gap-1.5 p-2 -mr-2"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
              >
                <span className={`block h-0.5 w-6 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} style={{ background: 'var(--c-primary)' }} />
                <span className={`block h-0.5 w-6 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} style={{ background: 'var(--c-primary)' }} />
                <span className={`block h-0.5 w-6 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} style={{ background: 'var(--c-primary)' }} />
              </button>
            </div>
          </div>
        </nav>

        {/* ── MOBILE MENU ──────────────────────────────────── */}
        <div
          className={`lg:hidden fixed inset-0 z-50 transition-all duration-500 ${
            menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          style={{ background: 'var(--c-primary)' }}
          role="dialog"
          aria-label="Navigation menu"
        >
          {/* Close button */}
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-6 right-6 text-white opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Close menu"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>

          <div className="flex flex-col h-full px-8 pt-24 pb-12">
            <nav>
              <ul className="space-y-2">
                {NAVIGATION.map((item, i) => (
                  <li key={item.path}
                    className="overflow-hidden"
                    style={{ transitionDelay: menuOpen ? `${i * 60}ms` : '0ms' }}
                  >
                    <Link
                      to={item.path}
                      className={`block py-3 border-b transition-all duration-300 ${
                        menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                      }`}
                      style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                    >
                      <span className="font-display text-3xl font-light text-white tracking-wide">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-auto">
              <div className="flex gap-4 mb-6">
                <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer"
                  className="text-white opacity-60 hover:opacity-100 text-sm tracking-widest uppercase">
                  Instagram
                </a>
                <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer"
                  className="text-white opacity-60 hover:opacity-100 text-sm tracking-widest uppercase">
                  Facebook
                </a>
              </div>
              <p className="text-white opacity-40 text-xs tracking-widest uppercase">
                © {new Date().getFullYear()} {APP.name}
              </p>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}