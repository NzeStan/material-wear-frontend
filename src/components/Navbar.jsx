import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { APP, NAVIGATION, SOCIAL } from '../config/constants'
import { ASSETS } from '../config/assets'
import { useIsScrolled } from '../hooks/useScrollAnimation'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

function getInitials(user) {
  if (!user) return '?'
  if (user.first_name && user.last_name)
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
  if (user.username) return user.username.slice(0, 2).toUpperCase()
  return user.email?.[0]?.toUpperCase() || '?'
}

export default function Navbar() {
  const [menuOpen, setMenuOpen]               = useState(false)
  const [announcementVisible, setAnnouncementVisible] = useState(true)
  const [accountOpen, setAccountOpen]         = useState(false)
  const scrolled   = useIsScrolled(60)
  const location   = useLocation()
  const navigate   = useNavigate()
  const { user, isAuthenticated, logout }     = useAuth()
  const { itemCount, setDrawerOpen }          = useCart()
  const { isDark, toggleTheme, enabled: themeEnabled } = useTheme()
  const dropdownRef = useRef(null)

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); setAccountOpen(false) }, [location])

  // Prevent scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Close account dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const handleLogout = async () => {
    setAccountOpen(false)
    await logout()
    navigate('/')
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
            ✦ Nation wide delivery  — Shop our new collection ✦
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
              <div className="flex items-center gap-2">
                <img
                  src={ASSETS.logo.main}
                  alt=""
                  width="32"
                  height="32"
                  className="w-8 h-8 rounded-sm object-contain"
                  loading="eager"
                />
                <span
                  className="font-display font-semibold tracking-wide text-lg hidden sm:block"
                  style={{ color: 'var(--c-primary)' }}
                >
                  {APP.name}
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <ul className="hidden lg:flex items-center gap-8">
              {NAVIGATION.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="relative text-sm font-medium tracking-wide uppercase transition-colors duration-200 pb-1 group"
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
            <div className="flex items-center gap-3 sm:gap-4">

              {/* Theme toggle — only rendered when VITE_ENABLE_DARK_MODE is on */}
              {themeEnabled && (
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="opacity-70 hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--c-primary)' }}
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? (
                    /* sun */
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                    </svg>
                  ) : (
                    /* moon */
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  )}
                </button>
              )}

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

              {/* ── ACCOUNT BUTTON ──────────────────────────────── */}
              {isAuthenticated ? (
                /* Authenticated: avatar + dropdown */
                <div className="relative hidden sm:block" ref={dropdownRef}>
                  <button
                    onClick={() => setAccountOpen(p => !p)}
                    className="flex items-center gap-2 group"
                    aria-label="Account menu"
                    aria-expanded={accountOpen}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white transition-all duration-200 group-hover:ring-2 group-hover:ring-offset-1"
                      style={{
                        background: 'var(--c-primary)',
                        ringColor: 'var(--c-accent)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 0 2px var(--c-bg), 0 0 0 4px var(--c-accent)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                    >
                      {getInitials(user)}
                    </div>
                    <svg
                      width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className={`transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`}
                      style={{ color: 'var(--c-text-muted)' }}
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {accountOpen && (
                    <div
                      className="absolute right-0 top-full mt-3 w-52 py-2 shadow-lg z-50"
                      style={{ background: 'var(--c-surface)', border: '1px solid rgba(6,78,59,0.1)', boxShadow: 'var(--shadow-lg)' }}
                    >
                      {/* User info header */}
                      <div className="px-4 py-3 border-b" style={{ borderColor: '#F3F4F6' }}>
                        <p className="text-xs font-semibold tracking-wide" style={{ color: 'var(--c-primary)' }}>
                          {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username}
                        </p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--c-text-muted)' }}>
                          {user?.email}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium tracking-wide transition-colors"
                        style={{ color: 'var(--c-text)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-bg)'; e.currentTarget.style.color = 'var(--c-primary)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        My Account
                      </Link>

                      <Link
                        to="/my-orders"
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium tracking-wide transition-colors"
                        style={{ color: 'var(--c-text)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-bg)'; e.currentTarget.style.color = 'var(--c-primary)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                          <line x1="12" y1="22.08" x2="12" y2="12"/>
                        </svg>
                        My Orders
                      </Link>

                      <Link
                        to="/organiser"
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium tracking-wide transition-colors"
                        style={{ color: 'var(--c-text)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-bg)'; e.currentTarget.style.color = 'var(--c-primary)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                        </svg>
                        Organiser Dashboard
                      </Link>

                      <div className="border-t my-1" style={{ borderColor: '#F3F4F6' }} />

                      <Link
                        to="/image-my-orders"
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium tracking-wide transition-colors"
                        style={{ color: 'var(--c-text)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-bg)'; e.currentTarget.style.color = 'var(--c-primary)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        My Image Orders
                      </Link>

                      <Link
                        to="/image-organiser"
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium tracking-wide transition-colors"
                        style={{ color: 'var(--c-text)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-bg)'; e.currentTarget.style.color = 'var(--c-primary)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        Image Organiser
                      </Link>

                      <div className="border-t my-1" style={{ borderColor: '#F3F4F6' }} />

                      <Link
                        to="/excel-my-orders"
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium tracking-wide transition-colors"
                        style={{ color: 'var(--c-text)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-bg)'; e.currentTarget.style.color = 'var(--c-primary)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
                          <line x1="9" y1="3" x2="9" y2="21"/>
                        </svg>
                        My Excel Orders
                      </Link>

                      <Link
                        to="/excel-bulk-order/new"
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium tracking-wide transition-colors"
                        style={{ color: 'var(--c-text)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-bg)'; e.currentTarget.style.color = 'var(--c-primary)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        New Excel Order
                      </Link>

                      <div className="border-t my-1" style={{ borderColor: '#F3F4F6' }} />

                      <Link
                        to="/live-form-organiser"
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium tracking-wide transition-colors"
                        style={{ color: 'var(--c-text)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-bg)'; e.currentTarget.style.color = 'var(--c-primary)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>
                        </svg>
                        Live Form Organiser
                      </Link>

                      <Link
                        to="/measurements"
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium tracking-wide transition-colors"
                        style={{ color: 'var(--c-text)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-bg)'; e.currentTarget.style.color = 'var(--c-primary)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                        </svg>
                        My Measurements
                      </Link>

                      <div className="border-t my-1" style={{ borderColor: '#F3F4F6' }} />

                      <Link
                        to="/academic-directory/submit"
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium tracking-wide transition-colors"
                        style={{ color: 'var(--c-text)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-bg)'; e.currentTarget.style.color = 'var(--c-primary)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                        </svg>
                        Academic Directory
                      </Link>

                      {user?.is_staff && (
                        <>
                          <div className="border-t my-1" style={{ borderColor: '#F3F4F6' }} />
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium tracking-wide transition-colors"
                            style={{ color: 'var(--c-primary)', background: 'rgba(6,78,59,0.04)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(6,78,59,0.1)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(6,78,59,0.04)' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                            Admin Dashboard
                          </Link>
                          <Link
                            to="/academic-directory/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium tracking-wide transition-colors"
                            style={{ color: 'var(--c-text)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-bg)'; e.currentTarget.style.color = 'var(--c-primary)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text)' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                            </svg>
                            Directory Admin
                          </Link>
                        </>
                      )}

                      <div className="border-t my-1" style={{ borderColor: '#F3F4F6' }} />

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-medium tracking-wide text-left transition-colors"
                        style={{ color: 'var(--c-text-muted)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text-muted)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                          <polyline points="16 17 21 12 16 7"/>
                          <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Guest: Sign In icon */
                <Link
                  to="/login"
                  className="hidden sm:flex items-center gap-2 text-xs font-semibold tracking-widest uppercase transition-colors duration-200"
                  style={{ color: 'var(--c-text)' }}
                  aria-label="Sign in"
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--c-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text)'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span className="hidden xl:inline">Sign In</span>
                </Link>
              )}

              {/* Cart icon */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="relative flex items-center justify-center p-2 transition-colors"
                aria-label="Open cart"
                style={{ color: 'var(--c-text)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--c-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text)'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {itemCount > 0 && (
                  <span
                    style={{
                      position: 'absolute', top: 0, right: 0,
                      minWidth: 17, height: 17, borderRadius: 9,
                      background: 'var(--c-accent)',
                      color: 'white',
                      fontSize: 10, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      lineHeight: 1,
                    }}
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>

              {/* CTA — Shop Now */}
              <Link
                to="/collections"
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

                {/* Account links in mobile menu */}
                <li className="overflow-hidden pt-2" style={{ transitionDelay: menuOpen ? `${NAVIGATION.length * 60}ms` : '0ms' }}>
                  {isAuthenticated ? (
                    <>
                      {user?.is_staff && (
                        <Link
                          to="/admin"
                          className={`flex items-center gap-3 py-3 border-b transition-all duration-300 ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                        >
                          <div className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(245,158,11,0.25)' }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#fde68a' }}>
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                          </div>
                          <span className="font-display text-2xl font-light text-white tracking-wide">Admin Dashboard</span>
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        className={`flex items-center gap-3 py-3 border-b transition-all duration-300 ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                          style={{ background: 'rgba(245,158,11,0.2)', color: 'var(--c-accent-light)' }}>
                          {getInitials(user)}
                        </div>
                        <span className="font-display text-2xl font-light text-white tracking-wide">My Account</span>
                      </Link>
                      <Link
                        to="/my-orders"
                        className={`flex items-center gap-3 py-3 border-b transition-all duration-300 ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(255,255,255,0.1)' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                            <line x1="12" y1="22.08" x2="12" y2="12"/>
                          </svg>
                        </div>
                        <span className="font-display text-2xl font-light text-white tracking-wide">My Orders</span>
                      </Link>
                      <Link
                        to="/organiser"
                        className={`flex items-center gap-3 py-3 border-b transition-all duration-300 ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(255,255,255,0.1)' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                          </svg>
                        </div>
                        <span className="font-display text-2xl font-light text-white tracking-wide">Organiser</span>
                      </Link>
                      <Link
                        to="/image-my-orders"
                        className={`flex items-center gap-3 py-3 border-b transition-all duration-300 ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(245,158,11,0.2)' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#fde68a' }}>
                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                        <span className="font-display text-2xl font-light text-white tracking-wide">Image Orders</span>
                      </Link>
                      <Link
                        to="/image-organiser"
                        className={`flex items-center gap-3 py-3 border-b transition-all duration-300 ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(245,158,11,0.2)' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#fde68a' }}>
                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                        <span className="font-display text-2xl font-light text-white tracking-wide">Image Organiser</span>
                      </Link>
                      <Link
                        to="/excel-my-orders"
                        className={`flex items-center gap-3 py-3 border-b transition-all duration-300 ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(22,163,74,0.2)' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#86efac' }}>
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
                            <line x1="9" y1="3" x2="9" y2="21"/>
                          </svg>
                        </div>
                        <span className="font-display text-2xl font-light text-white tracking-wide">Excel Orders</span>
                      </Link>
                      <Link
                        to="/excel-bulk-order/new"
                        className={`flex items-center gap-3 py-3 border-b transition-all duration-300 ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(22,163,74,0.2)' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#86efac' }}>
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                        </div>
                        <span className="font-display text-2xl font-light text-white tracking-wide">New Excel Order</span>
                      </Link>
                      <Link
                        to="/live-form-organiser"
                        className={`flex items-center gap-3 py-3 border-b transition-all duration-300 ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(239,68,68,0.2)' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#fca5a5' }}>
                            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>
                          </svg>
                        </div>
                        <span className="font-display text-2xl font-light text-white tracking-wide">Live Forms</span>
                      </Link>
                      <Link
                        to="/measurements"
                        className={`flex items-center gap-3 py-3 border-b transition-all duration-300 ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(99,102,241,0.2)' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#c7d2fe' }}>
                            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                          </svg>
                        </div>
                        <span className="font-display text-2xl font-light text-white tracking-wide">Measurements</span>
                      </Link>
                      <Link
                        to="/academic-directory/submit"
                        className={`flex items-center gap-3 py-3 border-b transition-all duration-300 ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(251,191,36,0.2)' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#fde68a' }}>
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                          </svg>
                        </div>
                        <span className="font-display text-2xl font-light text-white tracking-wide">Academic Directory</span>
                      </Link>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      className={`block py-3 border-b transition-all duration-300 ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                      style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                    >
                      <span className="font-display text-3xl font-light text-white tracking-wide">Sign In</span>
                    </Link>
                  )}
                </li>
              </ul>
            </nav>

            <div className="mt-auto">
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 mb-6 text-sm font-medium"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sign Out
                </button>
              )}
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
