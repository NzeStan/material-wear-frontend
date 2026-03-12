import { useState, useEffect } from 'react'
import { useScrollProgress, useIsScrolled } from '../hooks/useScrollAnimation'

// ── SCROLL PROGRESS BAR ─────────────────────────────────────
export function ScrollProgress() {
  const progress = useScrollProgress()
  return (
    <div
      className="scroll-progress"
      style={{ width: `${progress * 100}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page scroll progress"
    />
  )
}

// ── BACK TO TOP ─────────────────────────────────────────────
export function BackToTop() {
  const scrolled = useIsScrolled(400)

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <button
      onClick={scrollToTop}
      className={`back-to-top ${scrolled ? 'visible' : ''}`}
      aria-label="Back to top"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    </button>
  )
}

// ── COOKIE CONSENT BANNER ───────────────────────────────────
export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('mw_cookies_accepted')
    if (!accepted) setTimeout(() => setVisible(true), 2500)
  }, [])

  const accept = () => {
    localStorage.setItem('mw_cookies_accepted', 'true')
    setVisible(false)
  }
  const decline = () => {
    localStorage.setItem('mw_cookies_accepted', 'false')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium mb-1">🍪 We use cookies</p>
        <p className="text-xs opacity-70 leading-relaxed">
          We use cookies to improve your experience and for analytics. By continuing, you agree to our{' '}
          <a href="/privacy-policy" className="underline hover:no-underline" style={{ color: 'var(--c-accent-light)' }}>
            Privacy Policy
          </a>.
        </p>
      </div>
      <div className="flex gap-3 flex-shrink-0">
        <button
          onClick={decline}
          className="text-xs px-4 py-2.5 border border-white border-opacity-30 text-white opacity-70 hover:opacity-100 transition-opacity"
        >
          Decline
        </button>
        <button
          onClick={accept}
          className="text-xs px-5 py-2.5 font-semibold text-primary-DEFAULT transition-all"
          style={{ background: 'var(--c-accent)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--c-accent-dark)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--c-accent)'}
        >
          Accept All
        </button>
      </div>
    </div>
  )
}

// ── LOADING SCREEN ───────────────────────────────────────────
export function LoadingScreen() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2400)
    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <div className="loading-screen">
      <div>
        <p className="loading-logo">Material Wear</p>
        <div className="flex justify-center mt-4 gap-1.5">
          {[0,1,2].map(i => (
            <span
              key={i}
              className="block w-1.5 h-1.5 rounded-full opacity-60"
              style={{
                background: 'var(--c-accent)',
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`
              }}
            />
          ))}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  )
}