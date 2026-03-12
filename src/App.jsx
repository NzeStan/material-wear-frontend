import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CustomCursor from './components/CustomCursor'
import { ScrollProgress, BackToTop, CookieConsent, LoadingScreen } from './components/UI'

import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import { PrivacyPolicy, TermsConditions, NotFound } from './pages/Legal'

// Scroll to top on route change
function ScrollReset() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <LoadingScreen />
      <CustomCursor />
      <ScrollProgress />

      <div className="flex flex-col min-h-screen" style={{ background: 'var(--c-bg)' }}>
        <Navbar />

        <ScrollReset />

        <Routes>
          <Route path="/"                element={<Home />} />
          <Route path="/about"           element={<About />} />
          <Route path="/contact"         element={<Contact />} />
          <Route path="/privacy-policy"  element={<PrivacyPolicy />} />
          <Route path="/terms"           element={<TermsConditions />} />
          {/* Placeholder routes — build these pages when backend is ready */}
          <Route path="/collections"     element={<ComingSoon title="Collections" />} />
          <Route path="/collections/:id" element={<ComingSoon title="Collection" />} />
          <Route path="/faq"             element={<ComingSoon title="FAQs" />} />
          <Route path="/size-guide"      element={<ComingSoon title="Size Guide" />} />
          <Route path="/shipping"        element={<ComingSoon title="Shipping Policy" />} />
          <Route path="/returns"         element={<ComingSoon title="Returns Policy" />} />
          <Route path="/cookie-policy"   element={<ComingSoon title="Cookie Policy" />} />
          <Route path="/careers"         element={<ComingSoon title="Careers" />} />
          <Route path="/press"           element={<ComingSoon title="Press" />} />
          <Route path="*"               element={<NotFound />} />
        </Routes>

        <Footer />
      </div>

      <BackToTop />
      <CookieConsent />
    </>
  )
}

// ── COMING SOON PLACEHOLDER ──────────────────────────────────
function ComingSoon({ title }) {
  useEffect(() => { document.title = `${title} — Coming Soon` }, [title])
  return (
    <main
      className="page-transition flex-1 flex items-center justify-center py-40 text-center px-4"
      style={{ background: 'var(--c-bg)', minHeight: '60vh' }}
    >
      <div>
        <div
          className="w-16 h-16 flex items-center justify-center mx-auto mb-6"
          style={{ background: 'var(--c-bg-warm)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--c-primary)' }}>
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <p className="section-eyebrow mb-2">Under Construction</p>
        <h1 className="font-display text-4xl mb-4" style={{ color: 'var(--c-primary)' }}>
          {title} — Coming Soon
        </h1>
        <p className="max-w-xs mx-auto" style={{ color: 'var(--c-text-muted)' }}>
          We're putting the finishing touches on this page. Check back soon!
        </p>
        <a
          href="/"
          className="btn-primary mt-8 inline-flex"
        >
          <span>Back to Home</span>
        </a>
      </div>
    </main>
  )
}