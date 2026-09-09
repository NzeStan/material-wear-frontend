import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { APP, BRAND } from '../config/constants'
import { ASSETS } from '../config/assets'
import { useScrollRevealGroup } from '../hooks/useScrollAnimation'

function PageHero() {
  return (
    <section className="page-hero">
      {/* Fallback gradient — sits behind the image div below, so it only
          shows if the image fails to load, instead of covering it. */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #064E3B 0%, #0a5c45 100%)' }}
        aria-hidden="true"
      />
      <div
        className="page-hero-bg"
        style={{ backgroundImage: `url(${ASSETS.about.hero})` }}
        aria-hidden="true"
      />
      <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="section-eyebrow" style={{ color: 'var(--c-accent)' }}>✦ Our Story</p>
        <h1 className="font-display font-light text-white mt-3" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
          Who We Are
        </h1>
        <div style={{ width: '60px', height: '2px', background: 'var(--c-accent)', marginTop: '16px' }} />
      </div>
    </section>
  )
}

function MissionSection() {
  const groupRef = useScrollRevealGroup(150)
  return (
    <section className="py-24" style={{ background: 'var(--c-bg)' }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={groupRef} className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <p className="reveal section-eyebrow">Our Purpose</p>
            <h2 className="reveal section-title delay-100 mt-2 mb-6">
              Crafted for the<br/>
              <em style={{ fontStyle: 'italic', color: 'var(--c-accent)' }}>Distinguished</em>
            </h2>
            <div className="divider-gold reveal delay-200" />
            <div className="space-y-5 mt-6 reveal delay-300">
              <p className="leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>
                Material Wear Limited was founded on a bold premise: that Africa's fashion scene deserved
                a brand that combined international quality standards with authentic Nigerian identity.
                We are not just selling clothes — we are building a legacy.
              </p>
              <p className="leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>
                Every collection we release carries a piece of our story — the late nights perfecting
                a cut, the hours spent sourcing the right fabric, the relentless pursuit of garments
                that make our customers feel truly extraordinary.
              </p>
              <p className="leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>
                Based in Nigeria, inspired by the world — Material Wear Limited stands at the intersection
                of global fashion sensibility and home-grown pride.
              </p>
            </div>
          </div>
          <div className="reveal-right relative">
            <div
              className="aspect-square overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #064E3B, #0a7c5f)' }}
            >
              <img
                src={ASSETS.about.story}
                alt="Our brand story"
                className="w-full h-full object-cover opacity-0 transition-opacity duration-700"
                onLoad={e => e.target.style.opacity = 1}
              />
            </div>
            <div
              className="absolute -bottom-6 -right-6 p-8 hidden lg:block"
              style={{ background: 'var(--c-primary)' }}
            >
              <p className="font-display text-5xl font-light text-white">{BRAND.founded}</p>
              <p className="text-xs tracking-widest uppercase mt-1" style={{ color: 'var(--c-accent-light)' }}>
                Est.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Timeline() {
  const groupRef = useScrollRevealGroup(100)
  const milestones = [
    { year: '2020', title: 'The Beginning', desc: 'Material Wear Limited is founded with a vision to redefine premium fashion in Nigeria.' },
    { year: '2021', title: 'First Collection', desc: 'Our debut Essentials collection launches to overwhelming demand and critical acclaim.' },
    { year: '2022', title: 'Expanding Reach', desc: 'We open our flagship showroom and begin shipping across West Africa.' },
    { year: '2023', title: 'Award Recognition', desc: 'Named "Best Emerging Fashion Brand" at the Lagos Style Awards.' },
    { year: '2024', title: 'Digital Expansion', desc: 'Launch of our e-commerce platform, bringing Material Wear to customers nationwide.' },
    { year: '2025', title: 'New Heights', desc: 'Our 12th collection drops — our most ambitious and celebrated to date.' },
  ]

  return (
    <section className="py-24" style={{ background: 'var(--c-primary)' }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={groupRef} className="text-center mb-16">
          <p className="reveal section-eyebrow" style={{ color: 'var(--c-accent)' }}>Our Journey</p>
          <h2 className="reveal section-title light delay-200" style={{ color: 'white' }}>
            Building a Legacy
          </h2>
          <div className="divider-gold reveal delay-300 mx-auto" />
        </div>

        <div ref={groupRef} className="relative">
          {/* Center line */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-px hidden md:block"
            style={{ background: 'rgba(245,158,11,0.25)' }}
            aria-hidden="true"
          />
          <div className="space-y-8">
            {milestones.map(({ year, title, desc }, i) => (
              <div
                key={year}
                className={`reveal delay-${(i % 3 + 1) * 100} flex flex-col md:flex-row gap-8 items-center ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className={`flex-1 ${i % 2 === 1 ? 'md:text-left' : 'md:text-right'}`}>
                  <div
                    className="inline-block p-6 max-w-sm"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}
                  >
                    <p className="font-display text-4xl font-light mb-2" style={{ color: 'var(--c-accent)' }}>
                      {year}
                    </p>
                    <h3 className="font-display text-xl text-white mb-2">{title}</h3>
                    <p className="text-sm opacity-60 text-white leading-relaxed">{desc}</p>
                  </div>
                </div>
                {/* Center dot */}
                <div
                  className="w-4 h-4 rounded-full border-2 flex-shrink-0 hidden md:block"
                  style={{ background: 'var(--c-accent)', borderColor: 'var(--c-primary)' }}
                  aria-hidden="true"
                />
                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function TeamSection() {
  const groupRef = useScrollRevealGroup(100)
  const { teamMembers } = ASSETS.about

  return (
    <section className="py-24" style={{ background: 'var(--c-bg-warm)' }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={groupRef} className="text-center mb-16">
          <p className="reveal section-eyebrow">The People</p>
          <h2 className="reveal section-title delay-200">Meet Our Team</h2>
          <div className="divider-gold reveal delay-300 mx-auto" />
          <p className="reveal delay-400 section-subtitle mx-auto mt-4 text-center">
            The passionate individuals behind every stitch and strategy.
          </p>
        </div>
        <div ref={groupRef} className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {teamMembers.map(({ name, role, img }, i) => (
            <div key={name} className={`reveal team-card delay-${(i+1)*100}`}>
              <div
                className="team-card-img overflow-hidden"
                style={{
                  background: `hsl(${150 + i * 20}, 35%, 30%)`,
                  width: '160px',
                  height: '160px',
                  borderRadius: '50%',
                  margin: '0 auto 20px',
                  border: '4px solid #FEF3C7',
                }}
              >
                <img
                  src={img}
                  alt={name}
                  className="w-full h-full object-cover opacity-0 transition-opacity duration-500"
                  onLoad={e => e.target.style.opacity = 1}
                />
              </div>
              <h3 className="font-display text-lg" style={{ color: 'var(--c-primary)' }}>{name}</h3>
              <p className="text-xs tracking-widest uppercase mt-1" style={{ color: 'var(--c-accent)' }}>{role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CraftsmanshipSection() {
  const groupRef = useScrollRevealGroup(100)
  return (
    <section className="py-24" style={{ background: 'var(--c-bg)' }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={groupRef} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="reveal section-eyebrow">Our Process</p>
            <h2 className="reveal section-title delay-100 mt-2">
              Craftsmanship at<br/>Every Step
            </h2>
            <div className="divider-gold reveal delay-200" />
            <div className="space-y-8 mt-8">
              {[
                { step: '01', title: 'Material Selection', desc: 'We travel globally to source premium fabrics that meet our exacting standards for texture, durability, and feel.' },
                { step: '02', title: 'Design & Pattern',   desc: 'Our design team spends weeks refining each pattern, ensuring the perfect silhouette for every body type.' },
                { step: '03', title: 'Expert Tailoring',   desc: 'Skilled artisans hand-cut and assemble each garment with precision stitching and meticulous attention to detail.' },
                { step: '04', title: 'Quality Control',    desc: 'Every piece passes a 28-point quality check before earning the Material Wear label and reaching you.' },
              ].map(({ step, title, desc }, i) => (
                <div key={step} className={`reveal delay-${(i+1)*100} flex gap-5`}>
                  <span
                    className="font-display text-4xl font-light flex-shrink-0"
                    style={{ color: 'var(--c-accent)', opacity: 0.4 }}
                  >
                    {step}
                  </span>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: 'var(--c-primary)' }}>{title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal-right">
            <div className="grid grid-cols-2 gap-4">
              {[ASSETS.about.craft, ASSETS.about.fabric, ASSETS.about.team, ASSETS.about.founder].map((src, i) => (
                <div
                  key={i}
                  className="overflow-hidden"
                  style={{
                    background: `hsl(${140 + i * 15}, 40%, ${20 + i * 8}%)`,
                    aspectRatio: i === 0 || i === 3 ? '4/5' : '1',
                  }}
                >
                  <img
                    src={src}
                    alt={`Craftsmanship detail ${i + 1}`}
                    className="w-full h-full object-cover opacity-0 transition-opacity duration-700"
                    onLoad={e => e.target.style.opacity = 1}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-24 text-center" style={{ background: 'var(--c-primary)' }}>
      <div className="container mx-auto max-w-3xl px-4">
        <p className="section-eyebrow" style={{ color: 'var(--c-accent)' }}>Ready to Elevate?</p>
        <h2 className="font-display font-light text-white mt-4 mb-6" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
          Experience Material Wear
        </h2>
        <p className="text-white opacity-60 mb-10 leading-relaxed">
          Discover our curated collections and find pieces that speak to who you are.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/collections" className="btn-gold">
            <span>Shop Collections</span>
          </Link>
          <Link to="/contact" className="btn-outline">
            <span>Get in Touch</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function About() {
  useEffect(() => { document.title = `About Us — ${APP.name}` }, [])
  return (
    <main className="page-transition">
      <PageHero />
      <MissionSection />
      {/* <Timeline /> */}
      {/* <TeamSection /> */}
      <CraftsmanshipSection />
      <CTASection />
    </main>
  )
}