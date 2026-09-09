import { useState } from 'react'
import { Link } from 'react-router-dom'
import { APP, CONTACT, SOCIAL, FOOTER_LINKS, BRAND } from '../config/constants'
import { api } from '../services/api'

export default function Footer() {
  const year = new Date().getFullYear()

  const [email, setEmail] = useState('')
  const [subStatus, setSubStatus] = useState('idle') // idle | sending | success | error
  const [subMsg, setSubMsg] = useState('')

  const handleSubscribe = async (e) => {
    e.preventDefault()
    setSubStatus('sending')
    setSubMsg('')
    try {
      // 201 = newly subscribed, 200 = already subscribed — both fine, the
      // backend returns a friendly `detail` either way.
      const data = await api.post('/contact/subscribe/', { email: email.trim() })
      setSubMsg(data?.detail || 'Thanks for subscribing!')
      setSubStatus('success')
      setEmail('')
    } catch (err) {
      setSubMsg(err.message || 'Could not subscribe. Please try again.')
      setSubStatus('error')
    }
  }

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
            <div className="w-full md:w-auto">
              <form
                className="flex w-full md:w-auto gap-0"
                onSubmit={handleSubscribe}
                aria-label="Newsletter signup"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="px-4 py-3.5 text-sm outline-none w-full md:w-72 text-gray-800"
                  style={{ background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: 0 }}
                  aria-label="Email address"
                />
                <button
                  type="submit"
                  disabled={subStatus === 'sending'}
                  className="px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-white whitespace-nowrap transition-all duration-300"
                  style={{ background: 'var(--c-accent)', opacity: subStatus === 'sending' ? 0.7 : 1 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--c-accent-dark)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--c-accent)'}
                >
                  {subStatus === 'sending' ? 'Subscribing…' : 'Subscribe'}
                </button>
              </form>
              {subMsg && (
                <p
                  className="text-xs mt-2"
                  style={{ color: subStatus === 'error' ? '#fca5a5' : 'var(--c-accent-light, #fcd34d)' }}
                  role="status"
                >
                  {subMsg}
                </p>
              )}
            </div>
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
                { href: SOCIAL.twitter,   label: 'X',         icon: <path fill="currentColor" stroke="none" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/> },
                { href: SOCIAL.tiktok,    label: 'TikTok',    icon: <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/> },
                ...(SOCIAL.youtube ? [{ href: SOCIAL.youtube, label: 'YouTube', icon: <path fill="currentColor" stroke="none" d="M23.498 6.186a2.999 2.999 0 0 0-2.112-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.386.55A2.999 2.999 0 0 0 .502 6.186 31.26 31.26 0 0 0 0 12a31.26 31.26 0 0 0 .502 5.814 2.999 2.999 0 0 0 2.112 2.136C4.495 20.5 12 20.5 12 20.5s7.505 0 9.386-.55a2.999 2.999 0 0 0 2.112-2.136A31.26 31.26 0 0 0 24 12a31.26 31.26 0 0 0-.502-5.814zM9.75 15.568V8.432L15.818 12z"/> }] : []),
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
            { title: 'Account',  links: FOOTER_LINKS.account },
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
            <p>
              © {year} {APP.name}. All rights reserved. Founded {BRAND.founded}.
              {BRAND.rcNumber && ` RC ${BRAND.rcNumber}.`}
            </p>
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