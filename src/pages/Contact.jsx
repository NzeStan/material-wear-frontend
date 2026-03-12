import { useEffect, useState } from 'react'
import { APP, CONTACT, SOCIAL } from '../config/constants'
import { ASSETS } from '../config/assets'
import { useScrollRevealGroup } from '../hooks/useScrollAnimation'

function PageHero() {
  return (
    <section className="page-hero">
      <div
        className="page-hero-bg"
        style={{ background: 'linear-gradient(135deg, #064E3B 0%, #033729 100%)' }}
        aria-hidden="true"
      />
      <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="section-eyebrow" style={{ color: 'var(--c-accent)' }}>✦ Reach Out</p>
        <h1 className="font-display font-light text-white mt-3" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
          Contact Us
        </h1>
        <div style={{ width: '60px', height: '2px', background: 'var(--c-accent)', marginTop: '16px' }} />
      </div>
    </section>
  )
}

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const groupRef = useScrollRevealGroup(100)

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    // Simulate API call — replace with actual fetch to VITE_API_BASE_URL
    await new Promise(r => setTimeout(r, 1500))
    setStatus('success')
  }

  return (
    <section className="py-24" style={{ background: 'var(--c-bg)' }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={groupRef} className="grid grid-cols-1 lg:grid-cols-5 gap-16">

          {/* ── CONTACT INFO ────────────────────────────── */}
          <div className="lg:col-span-2">
            <p className="reveal section-eyebrow">Let's Talk</p>
            <h2 className="reveal section-title delay-100 mt-2 mb-4">
              We'd Love to<br/>Hear From You
            </h2>
            <div className="divider-gold reveal delay-200" />
            <p className="reveal delay-300 mt-6 leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>
              Whether you have questions about a product, need styling advice, or just want to say hello —
              our team is here and happy to help.
            </p>

            <div className="space-y-6 mt-10">
              {[
                {
                  icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>,
                  label: 'Phone', value: CONTACT.phone, href: `tel:${CONTACT.phone}`
                },
                {
                  icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
                  label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}`
                },
                {
                  icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
                  label: 'Address', value: CONTACT.address
                },
                {
                  icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
                  label: 'Hours', value: CONTACT.hours
                },
              ].map(({ icon, label, value, href }, i) => (
                <div key={label} className={`reveal delay-${(i+1)*100} flex gap-4`}>
                  <div
                    className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--c-bg-warm)', color: 'var(--c-primary)' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      {icon}
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--c-accent)' }}>
                      {label}
                    </p>
                    {href ? (
                      <a href={href} className="text-sm hover:underline" style={{ color: 'var(--c-text)' }}>
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm" style={{ color: 'var(--c-text)' }}>{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="mt-10 pt-8 border-t" style={{ borderColor: 'rgba(6,78,59,0.1)' }}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--c-text-muted)' }}>
                Follow Us
              </p>
              <div className="flex gap-3">
                {[
                  { href: SOCIAL.instagram, label: 'Instagram' },
                  { href: SOCIAL.facebook,  label: 'Facebook' },
                  { href: SOCIAL.twitter,   label: 'Twitter' },
                  { href: SOCIAL.tiktok,    label: 'TikTok' },
                ].map(({ href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-medium border transition-all duration-200"
                    style={{ borderColor: 'var(--c-primary)', color: 'var(--c-primary)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-primary)'; e.currentTarget.style.color = 'white' }}
                    onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--c-primary)' }}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ── FORM ────────────────────────────────────── */}
          <div className="reveal lg:col-span-3 delay-200">
            {status === 'success' ? (
              <div
                className="flex flex-col items-center justify-center h-full min-h-96 text-center p-12"
                style={{ background: 'var(--c-bg-warm)', border: '1px solid rgba(6,78,59,0.1)' }}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                  style={{ background: 'var(--c-primary)' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3 className="font-display text-2xl mb-3" style={{ color: 'var(--c-primary)' }}>
                  Message Received!
                </h3>
                <p style={{ color: 'var(--c-text-muted)' }}>
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => { setStatus('idle'); setForm({ name:'', email:'', phone:'', subject:'', message:'' }) }}
                  className="mt-6 text-sm underline"
                  style={{ color: 'var(--c-primary)' }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="p-8 sm:p-10"
                style={{ background: 'var(--c-bg-warm)', border: '1px solid rgba(6,78,59,0.08)' }}
                aria-label="Contact form"
              >
                <h3 className="font-display text-2xl mb-8" style={{ color: 'var(--c-primary)' }}>
                  Send Us a Message
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="form-label" htmlFor="name">Full Name *</label>
                    <input
                      id="name" name="name" type="text" required
                      value={form.name} onChange={handleChange}
                      className="form-input"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="email">Email Address *</label>
                    <input
                      id="email" name="email" type="email" required
                      value={form.email} onChange={handleChange}
                      className="form-input"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="form-label" htmlFor="phone">Phone Number</label>
                    <input
                      id="phone" name="phone" type="tel"
                      value={form.phone} onChange={handleChange}
                      className="form-input"
                      placeholder="+234 000 000 0000"
                    />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="subject">Subject *</label>
                    <select
                      id="subject" name="subject" required
                      value={form.subject} onChange={handleChange}
                      className="form-input"
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="">Select a subject</option>
                      <option>Order Enquiry</option>
                      <option>Product Information</option>
                      <option>Sizing & Fit</option>
                      <option>Returns & Exchange</option>
                      <option>Wholesale / Partnership</option>
                      <option>Media / Press</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="form-label" htmlFor="message">Message *</label>
                  <textarea
                    id="message" name="message" required rows={5}
                    value={form.message} onChange={handleChange}
                    className="form-input resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="btn-primary w-full justify-center"
                  style={{ cursor: status === 'sending' ? 'wait' : 'pointer' }}
                >
                  <span>{status === 'sending' ? 'Sending...' : 'Send Message'}</span>
                  {status !== 'sending' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  )}
                </button>

                <p className="text-xs mt-4 text-center" style={{ color: 'var(--c-text-muted)' }}>
                  We respect your privacy. Your information will never be shared.{' '}
                  <a href="/privacy-policy" className="underline" style={{ color: 'var(--c-primary)' }}>
                    Privacy Policy
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function MapSection() {
  return (
    <section className="pb-0" style={{ background: 'var(--c-bg)' }}>
      {/* Replace this with an actual Google Maps embed */}
      <div
        className="w-full h-80 flex items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #064E3B22, #F59E0B11)' }}
        role="img"
        aria-label="Store location map"
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--c-primary)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <p className="font-display text-xl" style={{ color: 'var(--c-primary)' }}>Visit Our Showroom</p>
          <p className="text-sm mt-2" style={{ color: 'var(--c-text-muted)' }}>{CONTACT.address}</p>
          <p className="text-xs mt-1 opacity-60" style={{ color: 'var(--c-text-muted)' }}>
            — Replace this section with a Google Maps embed iframe —
          </p>
        </div>
      </div>
    </section>
  )
}

export default function Contact() {
  useEffect(() => { document.title = `Contact Us — ${APP.name}` }, [])
  return (
    <main className="page-transition">
      <PageHero />
      <ContactForm />
      <MapSection />
    </main>
  )
}