import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import CustomCursor from './components/CustomCursor'
import { ScrollProgress, BackToTop, CookieConsent, LoadingScreen } from './components/UI'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

import Home    from './pages/Home'
import About   from './pages/About'
import Contact from './pages/Contact'
import { PrivacyPolicy, TermsConditions, NotFound } from './pages/Legal'

import Login          from './pages/accounts/Login'
import Register       from './pages/accounts/Register'
import ForgotPassword from './pages/accounts/ForgotPassword'
import ResetPassword  from './pages/accounts/ResetPassword'
import Profile        from './pages/accounts/Profile'
import Referrals      from './pages/referrals/Referrals'
import BulkOrderPage       from './pages/bulk_orders/BulkOrderPage'
import PaymentVerify       from './pages/bulk_orders/PaymentVerify'
import MyOrders            from './pages/bulk_orders/MyOrders'
import OrganizerDashboard  from './pages/bulk_orders/OrganizerDashboard'
import ImageBulkOrderPage      from './pages/image_bulk_orders/ImageBulkOrderPage'
import ImagePaymentVerify      from './pages/image_bulk_orders/ImagePaymentVerify'
import ImageMyOrders           from './pages/image_bulk_orders/ImageMyOrders'
import ImageOrganizerDashboard from './pages/image_bulk_orders/ImageOrganizerDashboard'
import ExcelBulkOrderCreate  from './pages/excel_bulk_orders/ExcelBulkOrderCreate'
import ExcelBulkOrderFlow    from './pages/excel_bulk_orders/ExcelBulkOrderFlow'
import ExcelPaymentVerify    from './pages/excel_bulk_orders/ExcelPaymentVerify'
import ExcelMyOrders         from './pages/excel_bulk_orders/ExcelMyOrders'
import LiveFormPage               from './pages/live_forms/LiveFormPage'
import LiveFormOrganizerDashboard from './pages/live_forms/LiveFormOrganizerDashboard'
import MeasurementPage            from './pages/measurement/MeasurementPage'
import AcademicDirectorySubmit    from './pages/academic_directory/AcademicDirectorySubmit'
import AcademicDirectoryAdmin     from './pages/academic_directory/AcademicDirectoryAdmin'
import FeedPage                   from './pages/feed/FeedPage'
import CollectionsPage            from './pages/products/CollectionsPage'
import ProductDetail              from './pages/products/ProductDetail'
import CheckoutPage               from './pages/checkout/CheckoutPage'
import ProductPaymentVerify       from './pages/checkout/ProductPaymentVerify'
import OrdersPage                 from './pages/orders/OrdersPage'
import AdminDashboard             from './pages/admin/AdminDashboard'
import TestimonialsPage           from './pages/testimonials/TestimonialsPage'
import TestimonialsAdmin          from './pages/admin/TestimonialsAdmin'

// Scroll to top on route change
function ScrollReset() {
  const { pathname, search, hash } = useLocation()
  useEffect(() => {
    if (hash) return

    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })

    return () => cancelAnimationFrame(frame)
  }, [pathname, search, hash])
  return null
}

// Redirect already-authenticated users away from auth pages
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return isAuthenticated ? <Navigate to="/profile" replace /> : children
}

// Restrict to staff-only pages
function StaffRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: { pathname: '/admin' } }} replace />
  if (!user?.is_staff) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
      <LoadingScreen />
      <CustomCursor />
      <ScrollProgress />

      <div className="flex flex-col min-h-screen" style={{ background: 'var(--c-bg)' }}>
        <Navbar />
        <CartDrawer />

        <ScrollReset />

        <Routes>
          {/* ── Static pages ─────────────────────────────────── */}
          <Route path="/"               element={<Home />} />
          <Route path="/about"          element={<About />} />
          <Route path="/contact"        element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms"          element={<TermsConditions />} />

          {/* ── Account pages ────────────────────────────────── */}
          <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
          <Route path="/profile"  element={<Profile />} />

          {/* ── Referrals ────────────────────────────────────── */}
          <Route path="/referrals" element={<Referrals />} />

          {/* ── Bulk Orders ──────────────────────────────────── */}
          <Route path="/bulk-order/:slug"   element={<BulkOrderPage />} />
          <Route path="/payment/verify"     element={<PaymentVerify />} />
          <Route path="/my-orders"          element={<MyOrders />} />
          <Route path="/organiser"          element={<OrganizerDashboard />} />

          {/* ── Image Bulk Orders ────────────────────────────── */}
          <Route path="/image-bulk-order/:slug" element={<ImageBulkOrderPage />} />
          <Route path="/image-payment/verify"   element={<ImagePaymentVerify />} />
          <Route path="/image-my-orders"        element={<ImageMyOrders />} />
          <Route path="/image-organiser"        element={<ImageOrganizerDashboard />} />

          {/* ── Excel Bulk Orders ────────────────────────────── */}
          <Route path="/excel-bulk-order/new"  element={<ExcelBulkOrderCreate />} />
          <Route path="/excel-bulk-order/:id"  element={<ExcelBulkOrderFlow />} />
          <Route path="/excel-payment/verify"  element={<ExcelPaymentVerify />} />
          <Route path="/excel-my-orders"       element={<ExcelMyOrders />} />

          {/* ── Live Forms ───────────────────────────────────── */}
          <Route path="/live-form/:slug"        element={<LiveFormPage />} />
          <Route path="/live-form-organiser"    element={<LiveFormOrganizerDashboard />} />

          {/* ── Measurements ─────────────────────────────────── */}
          <Route path="/measurements"           element={<MeasurementPage />} />

          {/* ── Academic Directory ───────────────────────────── */}
          <Route path="/academic-directory/submit" element={<AcademicDirectorySubmit />} />
          <Route path="/academic-directory/admin"  element={<AcademicDirectoryAdmin />} />

          {/* ── Feed ─────────────────────────────────────────── */}
          <Route path="/feed" element={<FeedPage />} />

          {/* ── Testimonials ─────────────────────────────────── */}
          <Route path="/testimonials" element={<TestimonialsPage />} />

          {/* ── Admin ────────────────────────────────────────── */}
          <Route path="/admin"               element={<StaffRoute><AdminDashboard /></StaffRoute>} />
          <Route path="/admin/testimonials"  element={<StaffRoute><TestimonialsAdmin /></StaffRoute>} />

          {/* ── Products / Cart / Checkout / Orders ──────────── */}
          <Route path="/collections"              element={<CollectionsPage />} />
          <Route path="/products/:type/:id"       element={<ProductDetail />} />
          <Route path="/checkout"                 element={<CheckoutPage />} />
          <Route path="/checkout/verify"          element={<ProductPaymentVerify />} />
          <Route path="/orders"                   element={<OrdersPage />} />

          {/* ── Coming soon placeholders ─────────────────────── */}
          <Route path="/faq"             element={<ComingSoon title="FAQs" />} />
          <Route path="/size-guide"      element={<ComingSoon title="Size Guide" />} />
          <Route path="/shipping"        element={<ComingSoon title="Shipping Policy" />} />
          <Route path="/returns"         element={<ComingSoon title="Returns Policy" />} />
          <Route path="/cookie-policy"   element={<ComingSoon title="Cookie Policy" />} />
          <Route path="/careers"         element={<ComingSoon title="Careers" />} />
          <Route path="/press"           element={<ComingSoon title="Press" />} />

          <Route path="*" element={<NotFound />} />
        </Routes>

        <Footer />
      </div>

      <BackToTop />
      <CookieConsent />
      </CartProvider>
    </AuthProvider>
  )
}

// ── COMING SOON PLACEHOLDER ───────────────────────────────────────────────────
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
          We&apos;re putting the finishing touches on this page. Check back soon!
        </p>
        <a href="/" className="btn-primary mt-8 inline-flex">
          <span>Back to Home</span>
        </a>
      </div>
    </main>
  )
}
