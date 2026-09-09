import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { ASSETS } from '../config/assets'
import { APP, BRAND, CONTACT, SOCIAL } from '../config/constants'
import { useScrollRevealGroup, useParallax, useIsScrolled, useCounter } from '../hooks/useScrollAnimation'
import { api } from '../services/api'

// ── HERO ─────────────────────────────────────────────────────
function Hero() {
  const [slide, setSlide] = useState(0)
  const slides = [
    {
      bg: ASSETS.hero.slide1,
      eyebrow: 'New Arrivals 2025',
      headline: 'Wear the\nDifference',
      sub: 'Premium clothing crafted for the distinguished individual who demands quality in every thread.',
    },
    {
      bg: ASSETS.hero.slide2,
      eyebrow: 'The Essentials Edit',
      headline: 'Timeless\nElegance',
      sub: 'Wardrobe staples engineered to last — from boardroom to boulevard.',
    },
    {
      bg: ASSETS.hero.slide3,
      eyebrow: 'Formal Collection',
      headline: 'Dressed to\nInspire',
      sub: 'Impeccably tailored pieces that speak before you do.',
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => setSlide(p => (p + 1) % slides.length), 6000)
    return () => clearInterval(timer)
  }, [])

  const parallaxRef = useParallax(0.25)
  const current = slides[slide]

  return (
    <section className="relative h-screen min-h-[600px] max-h-[960px] overflow-hidden flex items-center" aria-label="Hero">

      {/* Background */}
      <div ref={parallaxRef} className="absolute inset-0 hero-bg will-change-transform">
        {/* Fallback gradient — sits BEHIND the image div below. A
            background-image paints nothing until it finishes loading, so
            this shows through during that window. It must stay behind (not
            after) the image div, or it permanently hides the image once
            loaded — which is what was happening before. */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #064E3B 0%, #0a7c5f 50%, #1a3a2a 100%)'
          }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{ backgroundImage: `url(${current.bg})` }}
          aria-hidden="true"
        />
      </div>

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to right, rgba(3,55,41,0.82) 0%, rgba(6,78,59,0.4) 60%, transparent 100%)' }}
        aria-hidden="true"
      />

      {/* Decorative vertical line */}
      <div className="absolute left-[10%] top-0 bottom-0 w-px opacity-20" style={{ background: 'var(--c-accent)' }} aria-hidden="true"/>

      {/* Content */}
      <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="hero-text-1 section-eyebrow" style={{ color: 'var(--c-accent)' }}>
            ✦ {current.eyebrow}
          </p>

          <h1
            className="hero-text-2 font-display font-light text-white mt-4 mb-6 whitespace-pre-line"
            style={{ fontSize: 'clamp(3.5rem, 8vw, 7rem)', lineHeight: '1.0', letterSpacing: '-0.02em' }}
          >
            {current.headline}
          </h1>

          <div className="divider-gold hero-text-3" />

          <p className="hero-text-3 text-base sm:text-lg text-white opacity-80 mt-4 mb-10 leading-relaxed max-w-md">
            {current.sub}
          </p>

          <div className="hero-text-4 flex flex-wrap gap-4">
            <Link to="/collections" className="btn-primary">
              <span>Explore Collections</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link to="/about" className="btn-outline">
              <span>Our Story</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="transition-all duration-300"
            style={{
              width: i === slide ? '32px' : '8px',
              height: '3px',
              background: i === slide ? 'var(--c-accent)' : 'rgba(255,255,255,0.4)',
              border: 'none',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 right-10 hidden lg:flex flex-col items-center gap-2 text-white opacity-50">
        <span className="text-xs tracking-widest uppercase writing-mode-vertical" style={{ writingMode: 'vertical-rl', letterSpacing: '0.2em' }}>
          Scroll
        </span>
        <div className="w-px h-12 overflow-hidden" style={{ background: 'rgba(255,255,255,0.3)' }}>
          <div className="w-full h-1/2" style={{ background: 'var(--c-surface)', animation: 'scrollLine 2s ease-in-out infinite' }} />
        </div>
        <style>{`@keyframes scrollLine { 0%{transform:translateY(-100%)} 100%{transform:translateY(200%)} }`}</style>
      </div>
    </section>
  )
}

// ── MARQUEE STRIP ──────────────────────────────────────────
function MarqueeStrip() {
  const items = ['Premium Quality', 'Sustainable Fashion', 'Made in Nigeria', 'Crafted with Passion', 'Timeless Style', 'Dressed to Impress', '✦']
  const repeated = [...items, ...items]
  return (
    <div
      className="overflow-hidden py-4"
      style={{ background: 'var(--c-primary)' }}
      aria-hidden="true"
    >
      <div className="marquee-track">
        {repeated.map((item, i) => (
          <span key={i} className="flex-shrink-0 mx-8 text-sm tracking-widest uppercase font-medium" style={{ color: 'var(--c-accent-light)' }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── STATS ───────────────────────────────────────────────────
function Stats() {
  const ref = useRef(null)
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setTriggered(true); observer.unobserve(el) }
    }, { threshold: 0.4 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Derived from VITE_FOUNDED_YEAR instead of a hardcoded number, so it
  // doesn't need a manual bump every year.
  const yearsOfExcellence = Math.max(0, new Date().getFullYear() - Number(BRAND.founded))

  const c1 = useCounter(5000, 2000, triggered)
  const c2 = useCounter(98, 2000, triggered)
  const c3 = useCounter(12, 1800, triggered)
  const c4 = useCounter(yearsOfExcellence, 1500, triggered)

  const stats = [
    { value: c1, suffix: '+', label: 'Happy Customers' },
    { value: c2, suffix: '%', label: 'Satisfaction Rate' },
    { value: c3, suffix: '+', label: 'Collections Launched' },
    { value: c4, suffix: ' yrs', label: 'Years of Excellence' },
  ]

  return (
    <section ref={ref} className="py-16" style={{ background: 'var(--c-bg-warm)' }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ value, suffix, label }) => (
            <div key={label} className="text-center">
              <p className="font-display font-light" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--c-primary)' }}>
                {value}{suffix}
              </p>
              <p className="text-xs tracking-widest uppercase mt-2" style={{ color: 'var(--c-text-muted)' }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── FEATURED COLLECTIONS ────────────────────────────────────
function FeaturedCollections() {
  const groupRef = useScrollRevealGroup(150)
  const collections = [
    { key: 'newArrivals', label: 'New Arrivals',  badge: 'Just In',   desc: 'Fresh styles for the modern wardrobe.' },
    { key: 'essentials',  label: 'Essentials',    badge: 'Bestseller', desc: 'Timeless pieces that never go out of style.' },
    { key: 'formal',      label: 'Formal Wear',   badge: 'Premium',   desc: 'Tailored excellence for every occasion.' },
  ]

  return (
    <section className="py-24" style={{ background: 'var(--c-bg)' }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={groupRef} className="text-center mb-16">
          <p className="reveal section-eyebrow">Curated for You</p>
          <h2 className="reveal section-title delay-200">Our Collections</h2>
          <div className="divider-gold reveal delay-300 mx-auto" />
          <p className="reveal delay-400 section-subtitle mx-auto mt-4 text-center">
            Each piece tells a story of craftsmanship, quality, and timeless design.
          </p>
        </div>

        <div ref={groupRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.map(({ key, label, badge, desc }) => (
            <div key={key} className="reveal collection-card">
              {/* Placeholder bg until images are set */}
              <div
                className="absolute inset-0"
                style={{
                  background: key === 'newArrivals'
                    ? 'linear-gradient(135deg, #064E3B, #0a7c5f)'
                    : key === 'essentials'
                    ? 'linear-gradient(135deg, #1a3a2a, #064E3B)'
                    : 'linear-gradient(135deg, #033729, #1a5c44)',
                }}
              />
              <img
                src={ASSETS.collections[key]}
                alt={label}
                className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500"
                onLoad={e => e.target.style.opacity = 1}
              />
              <div className="collection-card-overlay" aria-hidden="true" />
              <div className="collection-card-content">
                <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase mb-3"
                  style={{ background: 'var(--c-accent)', color: 'white' }}>
                  {badge}
                </span>
                <h3 className="font-display text-3xl text-white font-light mb-2">{label}</h3>
                <p className="text-sm text-white opacity-70 mb-4">{desc}</p>
                <Link to="/collections" className="text-xs font-semibold tracking-widest uppercase text-white flex items-center gap-2 group">
                  <span>Shop Now</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className="transition-transform group-hover:translate-x-1">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── GALLERY ──────────────────────────────────────────────────
function Gallery() {
  const [lightbox, setLightbox] = useState(null)
  const groupRef = useScrollRevealGroup(60)

  // Lock background scroll while the lightbox is open, and let Escape close
  // it — standard behaviour for a full-screen dialog, matching the scroll
  // lock the Navbar's mobile menu already does.
  useEffect(() => {
    if (!lightbox) return
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e) => { if (e.key === 'Escape') setLightbox(null) }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [lightbox])

  return (
    <section id="gallery" className="py-24" style={{ background: 'var(--c-primary)' }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={groupRef} className="text-center mb-16">
          <p className="reveal section-eyebrow" style={{ color: 'var(--c-accent)' }}>Visual Story</p>
          <h2 className="reveal section-title light delay-200" style={{ color: 'white' }}>
            The Material Wear Gallery
          </h2>
          <div className="divider-gold reveal delay-300 mx-auto" />
          <p className="reveal delay-400 text-white opacity-60 text-sm mt-4">
            Every piece, every frame — a testament to premium craftsmanship.
          </p>
        </div>

        <div className="gallery-grid">
          {ASSETS.gallery.map((item) => (
            <div
              key={item.id}
              className={`gallery-item ${item.span}`}
              onClick={() => setLightbox(item)}
              data-cursor
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setLightbox(item)}
              aria-label={`View image: ${item.alt}`}
            >
              {/* Placeholder gradient */}
              <div
                className="w-full h-full"
                style={{
                  background: `hsl(${(item.id * 37) % 60 + 140}, 40%, ${20 + (item.id % 3) * 8}%)`,
                }}
              />
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500"
                onLoad={e => e.target.style.opacity = 1}
              />
              <div className="gallery-overlay">
                <div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="mb-2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/>
                  </svg>
                  <p className="text-white text-xs opacity-80">{item.alt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox — rendered via a portal straight onto <body>, deliberately
          NOT as a normal descendant here. `fixed` only positions relative to
          the true viewport if no ancestor has a transform/filter/perspective
          applied — this page's <main className="page-transition"> was one
          such ancestor (see index.css for the full story), and something
          else could become one again in future. A portal makes this
          structurally immune to that whole bug class regardless of what any
          ancestor ever does, rather than relying on remembering not to
          reintroduce it. */}
      {lightbox && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.alt}
        >
          {/* min-w-0 min-h-0 matters here: flex items default to
              min-width/min-height "auto" (their natural content size),
              which silently OVERRIDES max-w-full/max-h — without this, a
              large raw image (these gallery URLs have no Cloudinary size
              transform) can overflow the viewport instead of being
              contained, and since it comes after the close button in DOM
              order it then visually buries the button under itself. */}
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className="min-w-0 min-h-0 max-w-full max-h-[85vh] object-contain"
            onClick={e => e.stopPropagation()}
          />
          {/* Placed after the image and given a solid backing circle so it
              stays visibly on top and clickable no matter what's behind it,
              instead of a bare icon that can blend into a light image. */}
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center justify-center w-10 h-10 rounded-full text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.12)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.24)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            aria-label="Close preview"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>,
        document.body
      )}
    </section>
  )
}

// ── BRAND STORY SPLIT ────────────────────────────────────────
// No scroll-triggered reveal here on purpose — it previously used an
// IntersectionObserver gating opacity via .reveal-left/.reveal-right, and
// two rounds of retuning its trigger margin (200px, then 60% of viewport
// height) still weren't reliably early enough. Rather than keep guessing at
// timing values, the text and image now just render immediately — no
// mechanism left to mistune.
function BrandStory() {
  return (
    <section className="py-24 overflow-hidden" style={{ background: 'var(--c-bg)' }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Image */}
          <div className="relative">
            <div
              className="aspect-[4/5] overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #064E3B, #1a5c44)' }}
            >
              <img
                src={ASSETS.home.story}
                alt="Our craftsmanship story"
                className="w-full h-full object-cover opacity-0 transition-opacity duration-700"
                onLoad={e => e.target.style.opacity = 1}
              />
            </div>
            {/* Gold accent box */}
            <div
              className="absolute -bottom-8 -right-8 w-48 h-48 hidden lg:block"
              style={{ background: 'var(--c-accent)', opacity: 0.15 }}
              aria-hidden="true"
            />
            <div
              className="absolute -top-4 -left-4 w-24 h-24 border-2 hidden lg:block"
              style={{ borderColor: 'var(--c-accent)' }}
              aria-hidden="true"
            />
          </div>

          {/* Text */}
          <div>
            <p className="section-eyebrow">Who We Are</p>
            <h2 className="section-title mt-2 mb-6">
              More Than a Brand —<br />
              <em style={{ fontStyle: 'italic', color: 'var(--c-accent)' }}>A Statement</em>
            </h2>
            <div className="divider-gold" />
            <div className="space-y-4 mt-6 text-base leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>
              <p>
                Material Wear Limited was born from a simple belief: that premium clothing shouldn't be reserved
                for a select few. We set out to craft garments that combine world-class quality with distinctly
                Nigerian pride — pieces that tell your story before you speak.
              </p>
              <p>
                Every stitch is intentional. Every fabric is sourced for its quality. Every design is refined
                through dozens of iterations before it earns the Material Wear label. This is fashion with a purpose.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-10 pt-10 border-t" style={{ borderColor: 'rgba(6,78,59,0.1)' }}>
              {[
                { stat: 'Ethically', label: 'Sourced Materials' },
                { stat: 'Premium', label: 'Quality Guaranteed' },
                { stat: 'Locally', label: 'Crafted with Pride' },
                { stat: 'Globally', label: 'Inspired Design' },
              ].map(({ stat, label }) => (
                <div key={label}>
                  <p className="font-display text-xl font-semibold" style={{ color: 'var(--c-primary)' }}>{stat}</p>
                  <p className="text-xs tracking-wide uppercase mt-1" style={{ color: 'var(--c-text-muted)' }}>{label}</p>
                </div>
              ))}
            </div>

            <Link to="/about" className="btn-primary mt-10 inline-flex">
              <span>Read Our Full Story</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── VALUES ───────────────────────────────────────────────────
function Values() {
  const groupRef = useScrollRevealGroup(120)
  const values = [
    { icon: '♦', title: 'Premium Materials', desc: 'We source only the finest fabrics globally — breathable, durable, and beautifully textured.' },
    { icon: '✦', title: 'Expert Tailoring',  desc: 'Every garment is crafted by skilled artisans who take pride in precision and finishing.' },
    { icon: '◈', title: 'Sustainable Ethos', desc: 'We are committed to reducing our environmental footprint through responsible practices.' },
    { icon: '⬡', title: 'Timeless Design',   desc: 'We create pieces that transcend seasons — investments in style, not just clothing.' },
  ]

  return (
    <section className="py-24" style={{ background: 'var(--c-bg-warm)' }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={groupRef} className="text-center mb-16">
          <p className="reveal section-eyebrow">What Sets Us Apart</p>
          <h2 className="reveal section-title delay-200">Our Core Values</h2>
          <div className="divider-gold reveal delay-300 mx-auto" />
        </div>
        <div ref={groupRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map(({ icon, title, desc }, i) => (
            <div key={title} className={`reveal value-card delay-${(i+1)*100}`} style={{ background: 'var(--c-surface)' }}>
              <div className="text-4xl mb-5" style={{ color: 'var(--c-accent)' }}>{icon}</div>
              <h3 className="font-display text-xl mb-3" style={{ color: 'var(--c-primary)' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── BULK / GROUP ORDERS CTA ───────────────────────────────────
function BulkOrdersCTA() {
  const groupRef = useScrollRevealGroup(100)
  const perks = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      title: 'Schools & Universities',
      desc: 'Uniforms, jerseys and custom branded wear for institutions of all sizes.',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
        </svg>
      ),
      title: 'Corporate Teams',
      desc: 'Branded staff uniforms and workwear that projects professionalism.',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
      title: 'Churches & NGOs',
      desc: 'Matching outfits for conventions, outreaches and special events.',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/>
        </svg>
      ),
      title: 'Associations & Clubs',
      desc: 'Coordinated apparel for social, professional and sports groups.',
    },
  ]

  return (
    <section className="relative py-24 overflow-hidden" style={{ background: 'var(--c-primary)' }}>
      {/* Background pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg,currentColor 0,currentColor 1px,transparent 0,transparent 50%)',
          backgroundSize: '20px 20px',
          color: '#fff',
        }}
      />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div ref={groupRef} className="text-center mb-16">
          <p className="reveal section-eyebrow" style={{ color: 'var(--c-accent)' }}>
            Group &amp; Bulk Orders
          </p>
          <h2 className="reveal section-title delay-200" style={{ color: '#fff' }}>
            Dress Your Entire Team
          </h2>
          <div className="divider-gold reveal delay-300 mx-auto" />
          <p className="reveal delay-400 mt-6 max-w-xl mx-auto text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
            From 10 to 10,000 pieces — we handle group uniform orders for organisations across Nigeria.
            Your organiser shares a unique link; you pick your size and pay securely online.
          </p>
        </div>

        {/* Perks grid */}
        <div ref={groupRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {perks.map(({ icon, title, desc }, i) => (
            <div
              key={title}
              className={`reveal delay-${(i + 1) * 100} p-6 rounded-2xl`}
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <div className="mb-4" style={{ color: 'var(--c-accent)' }}>{icon}</div>
              <h3 className="font-display text-lg mb-2" style={{ color: '#fff' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* How it works strip */}
        <div
          className="reveal rounded-2xl p-8 mb-12"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p className="text-center text-xs uppercase tracking-widest mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
            How It Works
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-center">
            {[
              ['01', 'Organiser Creates', 'Your group leader sets up the bulk order and gets a unique link'],
              ['02', 'Share the Link',    'The link is shared with all group members to fill in their details'],
              ['03', 'Pick Your Size',    'Each member selects their size and pays securely via Paystack'],
              ['04', 'We Deliver',        'We produce and deliver all items together on your agreed date'],
            ].map(([num, title, desc]) => (
              <div key={num} className="relative">
                <div className="font-display text-5xl font-light mb-3" style={{ color: 'rgba(255,255,255,0.15)' }}>
                  {num}
                </div>
                <p className="text-sm font-semibold mb-1.5" style={{ color: '#fff' }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="reveal text-center flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/my-orders" className="btn-primary inline-flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            <span>View My Orders</span>
          </Link>
          <Link to="/contact" className="btn-outline inline-flex items-center gap-2">
            <span>Enquire About Bulk Orders</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
        <p className="reveal text-center text-xs mt-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Already have a group order link? Visit it directly in your browser to place your order.
        </p>
      </div>
    </section>
  )
}

// ── TESTIMONIALS ─────────────────────────────────────────────
const FALLBACK_TESTIMONIALS = [
  { id: 1, author_display: 'Adaeze O.', location: 'Lagos', rating: 5, content: "The quality of Material Wear's shirts is unmatched. I've been wearing them for over a year and they still look brand new. Worth every naira.", is_verified: false },
  { id: 2, author_display: 'Emeka C.',  location: 'Abuja', rating: 5, content: "I wore their formal collection to a client meeting and got three compliments within the first hour. This brand understands what it means to dress well.", is_verified: false },
  { id: 3, author_display: 'Fatima A.', location: 'Kano',  rating: 5, content: "Finally a Nigerian brand that doesn't compromise on quality. The fabric feels premium, the cut is perfect. I'm a customer for life.", is_verified: false },
]

function Testimonials() {
  const headerRef  = useScrollRevealGroup(120)
  const cardsRef   = useRef(null)
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/testimonials/testimonials/featured/')
      .then(data => {
        const list = Array.isArray(data) ? data : (data.results || [])
        setItems(list.slice(0, 3).length ? list.slice(0, 3) : FALLBACK_TESTIMONIALS)
      })
      .catch(() => setItems(FALLBACK_TESTIMONIALS))
      .finally(() => setLoading(false))
  }, [])

  // Trigger reveal animation once cards are in the DOM
  useEffect(() => {
    if (!cardsRef.current || loading) return
    const cards = cardsRef.current.querySelectorAll('.testimonial-card')
    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), i * 120)
    })
  }, [loading, items])

  return (
    <section className="py-24" style={{ background: 'var(--c-bg)' }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div ref={headerRef} className="text-center mb-16">
          <p className="reveal section-eyebrow">Social Proof</p>
          <h2 className="reveal section-title delay-200">What Our Customers Say</h2>
          <div className="divider-gold reveal delay-300 mx-auto" />
        </div>

        {/* Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {loading
            ? [1, 2, 3].map(i => (
                <div key={i} className="testimonial-card" style={{ opacity: 1 }}>
                  <div style={{ background: '#F3F4F6', borderRadius: 4, height: 14, width: '40%', marginBottom: 16, marginTop: 24, animation: 'shimmer 1.4s infinite', backgroundSize: '200% 100%',
                    backgroundImage: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)' }} />
                  <div style={{ background: '#F3F4F6', borderRadius: 4, height: 12, width: '100%', marginBottom: 8, animation: 'shimmer 1.4s infinite', backgroundSize: '200% 100%',
                    backgroundImage: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)' }} />
                  <div style={{ background: '#F3F4F6', borderRadius: 4, height: 12, width: '80%', marginBottom: 24, animation: 'shimmer 1.4s infinite', backgroundSize: '200% 100%',
                    backgroundImage: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)' }} />
                  <div className="flex items-center gap-3">
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F3F4F6', animation: 'shimmer 1.4s infinite', backgroundSize: '200% 100%',
                      backgroundImage: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)' }} />
                    <div style={{ background: '#F3F4F6', borderRadius: 4, height: 12, width: 80, animation: 'shimmer 1.4s infinite', backgroundSize: '200% 100%',
                      backgroundImage: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)' }} />
                  </div>
                </div>
              ))
            : items.map((t) => (
                <div
                  key={t.id}
                  className="testimonial-card"
                  style={{ opacity: 0, transition: 'opacity 0.5s ease, transform 0.5s ease', transform: 'translateY(12px)' }}
                >
                  <div className="flex items-center justify-between mb-4 mt-6">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span key={j} style={{ color: j < t.rating ? 'var(--c-accent)' : '#E5E7EB', fontSize: '14px' }}>★</span>
                      ))}
                    </div>
                    {t.is_verified && (
                      <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ background: 'rgba(6,78,59,0.08)', color: 'var(--c-primary)' }}>
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--c-text-muted)' }}>
                    "{t.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    {t.avatar ? (
                      <img src={t.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                        style={{ background: 'var(--c-primary)' }}
                      >
                        {(t.author_display || t.author_name || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>
                        {t.author_display || t.author_name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                        {[t.location, t.company].filter(Boolean).join(' · ') || 'Customer'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
          }
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/testimonials"
            className="flex items-center gap-2 text-sm font-semibold px-6 py-2.5 transition-all duration-200"
            style={{ border: '1.5px solid var(--c-primary)', color: 'var(--c-primary)', borderRadius: 4 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-primary)'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-primary)' }}
          >
            Read All Reviews
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <Link
            to="/testimonials#submit"
            className="flex items-center gap-2 text-sm font-semibold px-6 py-2.5 text-white transition-all duration-200"
            style={{ background: 'var(--c-primary)', borderRadius: 4 }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--c-accent)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--c-primary)'}
          >
            Share Your Experience
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── INSTAGRAM ────────────────────────────────────────────────
function InstagramFeed() {
  const { instagram } = ASSETS

  return (
    <section className="py-16" style={{ background: 'var(--c-bg)' }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <p className="section-eyebrow">Follow Along</p>
        <a
          href={SOCIAL.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="font-display text-2xl font-light hover:underline transition-all"
          style={{ color: 'var(--c-primary)' }}
        >
          @materialwearlimited
        </a>
      </div>
      <div className="ig-grid">
        {instagram.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="ig-item"
            aria-label={`View Instagram post ${i + 1}`}
          >
            <div
              className="w-full h-full"
              style={{ background: `hsl(${140 + i * 15}, 35%, ${25 + i * 5}%)` }}
            />
            <img
              src={item.src}
              alt={`Instagram post ${i + 1}`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500"
              onLoad={e => e.target.style.opacity = 1}
            />
            <div className="ig-overlay">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none"/>
              </svg>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

// ── MAIN HOME PAGE ────────────────────────────────────────────
export default function Home() {
  useEffect(() => {
    document.title = `${APP.name} — Premium Clothing Brand`
  }, [])

  return (
    <main className="page-transition">
      <Hero />
      <MarqueeStrip />
      <Stats />
      <FeaturedCollections />
      <BrandStory />
      <Gallery />
      <Values />
      <BulkOrdersCTA />
      <Testimonials />
      <InstagramFeed />
    </main>
  )
}