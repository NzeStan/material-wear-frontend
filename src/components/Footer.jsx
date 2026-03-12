import { Link } from 'react-router-dom'
import { APP, CONTACT, SOCIAL, FOOTER_LINKS, BRAND } from '../config/constants'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: 'var(--c-primary)', color: 'var(--c-white)' }}>

      {/* ── NEWSLETTER STRIP ──────────────────────────────── */}
      <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <p className="section-eyebrow" style={{ color: 'var(--c-accent)' }}>Stay Connected</p>
              <h3 className="font-display text-3xl text-white font-light">
                Join the Material Wear Family
              </h3>
              <p className="text-sm mt-2 opacity-60">
                Exclusive collections, styling tips, and early access to new drops.
              </p>
            </div>
            <form
              className="flex w-full md:w-auto gap-0"
              onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing!') }}
              aria-label="Newsletter signup"
            >
              <input
                type="email"
                required
                placeholder="Your email address"
                className="px-4 py-3.5 text-sm outline-none w-full md:w-72 text-gray-800"
                style={{ background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: 0 }}
                aria-label="Email address"
              />
              <button
                type="submit"
                className="px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-white whitespace-nowrap transition-all duration-300"
                style={{ background: 'var(--c-accent)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--c-accent-dark)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--c-accent)'}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── MAIN FOOTER BODY ────────────────────────────────── */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-5">
              <span className="font-display text-2xl font-light tracking-widest text-white">
                {APP.name}
              </span>
            </Link>
            <p className="text-sm leading-relaxed opacity-60 max-w-xs mb-6">
              Crafted for the distinguished individual. Premium clothing that blends timeless elegance
              with modern sensibility — made to last, designed to impress.
            </p>

            {/* Contact */}
            <div className="space-y-2 text-sm opacity-70">
              <p className="flex items-center gap-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                {CONTACT.phone}
              </p>
              <p className="flex items-center gap-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                {CONTACT.email}
              </p>
              <p className="flex items-start gap-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {CONTACT.address}
              </p>
            </div>

            {/* Social */}
            <div className="flex gap-4 mt-6">
              {[
                { href: SOCIAL.instagram, label: 'Instagram', icon: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></> },
                { href: SOCIAL.facebook,  label: 'Facebook',  icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/> },
                { href: SOCIAL.twitter,   label: 'Twitter',   icon: <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/> },
                { href: SOCIAL.tiktok,    label: 'TikTok',    icon: <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/> },
              ].map(({ href, label, icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 border flex items-center justify-center opacity-50 hover:opacity-100 hover:border-accent-DEFAULT transition-all duration-300"
                  style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--c-accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    {icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {[
            { title: 'Company',  links: FOOTER_LINKS.company },
            { title: 'Shop',     links: FOOTER_LINKS.shop },
            { title: 'Legal',    links: FOOTER_LINKS.legal },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-xs font-semibold tracking-widest uppercase mb-5 opacity-50">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm opacity-60 hover:opacity-100 transition-opacity duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM BAR ────────────────────────────────────────── */}
      <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs opacity-40">
            <p>© {year} {APP.name}. All rights reserved. Founded {BRAND.founded}.</p>
            <div className="flex items-center gap-6">
              <Link to="/privacy-policy" className="hover:opacity-100 transition-opacity">Privacy</Link>
              <Link to="/terms" className="hover:opacity-100 transition-opacity">Terms</Link>
              <Link to="/cookie-policy" className="hover:opacity-100 transition-opacity">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}