import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { APP, NAVIGATION, SOCIAL } from '../config/constants'

// Rendered through a portal into <body> on purpose: the sticky header gets
// `backdrop-filter` once the page is scrolled, and an ancestor with a filter
// becomes the containing block for `position: fixed` children — so a menu
// nested in the header collapsed to the 72px header bar (white text on a cream
// page = "empty" menu) whenever the page was scrolled.
//
// z-index sits above the floating buttons (7000/8000) but below the cookie
// banner (9999), which must stay reachable.

const Svg = ({ children, color }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    style={{ color }}>{children}</svg>
)

const ICON = {
  admin: <Svg color="#fde68a"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></Svg>,
  user: <Svg color="rgba(255,255,255,0.75)"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Svg>,
  box: <Svg color="rgba(255,255,255,0.75)">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
  </Svg>,
  pen: <Svg color="rgba(255,255,255,0.75)"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></Svg>,
  image: <Svg color="#fde68a"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></Svg>,
  grid: <Svg color="#86efac"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /></Svg>,
  plus: <Svg color="#86efac"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Svg>,
  live: <Svg color="#fca5a5"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" /></Svg>,
  ruler: <Svg color="#c7d2fe"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></Svg>,
  cap: <Svg color="#fde68a"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></Svg>,
  star: <Svg color="#fde68a"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></Svg>,
}

const ACCOUNT_GROUPS = [
  {
    title: 'Account',
    links: [
      { to: '/profile', label: 'My Account', icon: 'user' },
      { to: '/my-orders', label: 'My Orders', icon: 'box' },
    ],
  },
  {
    title: 'Group orders',
    links: [
      { to: '/organiser', label: 'Organiser', icon: 'pen' },
      { to: '/image-my-orders', label: 'Image Orders', icon: 'image' },
      { to: '/image-organiser', label: 'Image Organiser', icon: 'image' },
      { to: '/excel-my-orders', label: 'Excel Orders', icon: 'grid' },
      { to: '/excel-bulk-order/new', label: 'New Excel Order', icon: 'plus' },
      { to: '/live-form-organiser', label: 'Live Forms', icon: 'live' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { to: '/measurements', label: 'Measurements', icon: 'ruler' },
      { to: '/academic-directory/submit', label: 'Academic Directory', icon: 'cap' },
    ],
  },
]

const ADMIN_LINKS = [
  { to: '/admin', label: 'Admin Dashboard', icon: 'admin' },
  { to: '/academic-directory/admin', label: 'Directory Admin', icon: 'cap' },
]

export default function MobileMenu({ open, onClose, isAuthenticated, isStaff, initials, onLogout }) {
  // Lock page scroll while open (the menu itself scrolls).
  useEffect(() => {
    if (!open) return undefined
    const { body, documentElement: html } = document
    const prev = [body.style.overflow, html.style.overflow]
    body.style.overflow = 'hidden'
    html.style.overflow = 'hidden'
    return () => { body.style.overflow = prev[0]; html.style.overflow = prev[1] }
  }, [open])

  // Esc closes; growing to desktop width closes.
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    const mq = window.matchMedia('(min-width: 1024px)')
    const onResize = (e) => { if (e.matches) onClose() }
    document.addEventListener('keydown', onKey)
    mq.addEventListener('change', onResize)
    return () => {
      document.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', onResize)
    }
  }, [open, onClose])

  const item = (i) => ({
    className: `transition-all duration-300 ${open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`,
    style: { transitionDelay: open ? `${Math.min(i, 12) * 35}ms` : '0ms' },
  })

  const rowClass = 'flex items-center gap-3 py-2.5 border-b'
  const rowStyle = { borderColor: 'rgba(255,255,255,0.1)' }
  let n = 0

  return createPortal(
    <div
      className="lg:hidden fixed inset-0 overflow-y-auto overscroll-contain"
      style={{
        zIndex: 8500,
        background: 'var(--c-primary)',
        opacity: open ? 1 : 0,
        visibility: open ? 'visible' : 'hidden',
        transition: open ? 'opacity 300ms ease' : 'opacity 300ms ease, visibility 0s linear 300ms',
        WebkitOverflowScrolling: 'touch',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      aria-hidden={!open}
    >
      {/* Sticky top bar keeps the close button reachable while scrolling */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 h-16"
        style={{ background: 'var(--c-primary)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span className="font-display text-lg tracking-wide text-white">{APP.name}</span>
        <button onClick={onClose} aria-label="Close menu"
          className="flex items-center justify-center w-11 h-11 -mr-2 text-white opacity-80 hover:opacity-100 transition-opacity">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col min-h-[calc(100%-4rem)] px-6 pt-4 pb-32">
        <nav aria-label="Main">
          <ul>
            {NAVIGATION.map((link) => (
              <li key={link.path} {...item(n++)}>
                <Link to={link.path} onClick={onClose} className="block py-3 border-b" style={rowStyle}>
                  <span className="font-display text-3xl font-light text-white tracking-wide">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div {...item(n++)} className={`mt-5 ${item(0).className}`}>
          <Link to="/collections" onClick={onClose}
            className="flex items-center justify-center py-3.5 text-xs font-semibold tracking-widest uppercase text-white"
            style={{ background: 'var(--c-accent)' }}>
            Shop Now
          </Link>
        </div>

        {isAuthenticated ? (
          <div className="mt-8 space-y-6">
            {isStaff && (
              <div>
                <p className="mb-1 text-[11px] font-semibold tracking-widest uppercase" style={{ color: 'var(--c-accent-light)' }}>Admin</p>
                {ADMIN_LINKS.map((link) => (
                  <div key={link.to} {...item(n++)}>
                    <Link to={link.to} onClick={onClose} className={rowClass} style={rowStyle}>
                      <span className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(245,158,11,0.25)' }}>{ICON[link.icon]}</span>
                      <span className="font-display text-xl font-light text-white tracking-wide">{link.label}</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
            {ACCOUNT_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="mb-1 text-[11px] font-semibold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>{group.title}</p>
                {group.links.map((link, idx) => (
                  <div key={link.to} {...item(n++)}>
                    <Link to={link.to} onClick={onClose} className={rowClass} style={rowStyle}>
                      <span className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
                        style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--c-accent-light)' }}>
                        {group.title === 'Account' && idx === 0 ? initials : ICON[link.icon]}
                      </span>
                      <span className="font-display text-xl font-light text-white tracking-wide">{link.label}</span>
                    </Link>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8" {...item(n++)}>
            <Link to="/login" onClick={onClose} className="block py-3 border-b" style={rowStyle}>
              <span className="font-display text-3xl font-light text-white tracking-wide">Sign In</span>
            </Link>
            <Link to="/register" onClick={onClose} className="block py-3 border-b" style={rowStyle}>
              <span className="font-display text-3xl font-light text-white tracking-wide">Create Account</span>
            </Link>
          </div>
        )}

        <div className="mt-auto pt-10">
          {isAuthenticated && (
            <button onClick={onLogout} className="flex items-center gap-2 mb-6 text-sm font-medium py-2"
              style={{ color: 'rgba(255,255,255,0.6)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          )}
          <div className="flex gap-5 mb-6">
            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer"
              className="text-white opacity-60 hover:opacity-100 text-sm tracking-widest uppercase py-1">Instagram</a>
            <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer"
              className="text-white opacity-60 hover:opacity-100 text-sm tracking-widest uppercase py-1">Facebook</a>
          </div>
          <p className="text-white opacity-40 text-xs tracking-widest uppercase">© {new Date().getFullYear()} {APP.name}</p>
        </div>
      </div>
    </div>,
    document.body,
  )
}
