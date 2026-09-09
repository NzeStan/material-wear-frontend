import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../services/api'
import { CONTACT } from '../../config/constants'

// ── Icons ──────────────────────────────────────────────────────────────────────
const CheckCircleIcon = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const TagIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
)
const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
)
const AlertIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const LockIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const SpinnerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
    <circle cx="12" cy="12" r="10" strokeOpacity=".2"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
  </svg>
)
const ReceiptIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/>
    <line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="17" x2="12" y2="17"/>
  </svg>
)
const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const ImageIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)
const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
)
const XIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// ── Constants ──────────────────────────────────────────────────────────────────
const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL']
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE_MB = 10
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

// ── Countdown unit ─────────────────────────────────────────────────────────────
function CountdownUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center min-w-0">
      <div
        className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center font-display text-xl sm:text-3xl font-bold rounded-lg"
        style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(4px)' }}
      >
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-xs mt-1.5 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.6)' }}>
        {label}
      </span>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b last:border-0 text-sm"
      style={{ borderColor: 'var(--c-border)' }}>
      <span style={{ color: 'var(--c-text-muted)' }}>{label}</span>
      <span className="font-medium text-right" style={{ color: 'var(--c-text)', wordBreak: 'break-all' }}>{value ?? '—'}</span>
    </div>
  )
}

function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl text-sm"
      style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
      <AlertIcon /><span>{message}</span>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  IMAGE UPLOAD FIELD
// ══════════════════════════════════════════════════════════════════════════════
function ImageUploadField({ value, onChange, error }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  function handleFile(file) {
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type)) {
      onChange(null, 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      onChange(null, `File is too large. Maximum size is ${MAX_SIZE_MB}MB.`)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    onChange(file, null)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function handleRemove() {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    onChange(null, null)
    if (inputRef.current) inputRef.current.value = ''
  }

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview) }
  }, [preview])

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden"
        style={{ border: `1.5px solid ${error ? '#ef4444' : 'var(--c-primary)'}` }}>
        <img src={preview} alt="Preview" className="w-full object-cover" style={{ maxHeight: 220 }} />
        <div className="absolute inset-0 flex items-end p-3" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 60%)' }}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 text-white text-xs">
              <ImageIcon size={14} />
              <span>{value?.name}</span>
              <span style={{ opacity: 0.7 }}>({(value?.size / 1024).toFixed(0)} KB)</span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white"
              style={{ background: 'rgba(239,68,68,0.85)' }}
            >
              <XIcon size={12} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl flex flex-col items-center justify-center gap-3 py-8 px-4 cursor-pointer transition-all duration-150"
      style={{
        border: `1.5px dashed ${error ? '#ef4444' : dragOver ? 'var(--c-primary)' : 'var(--c-border)'}`,
        background: dragOver ? 'rgba(6,78,59,0.04)' : 'var(--c-bg)',
      }}
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: 'var(--c-bg-warm)', color: 'var(--c-primary)' }}>
        <UploadIcon />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>
          Click to upload or drag & drop
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--c-text-muted)' }}>
          JPEG, PNG, GIF, WebP — max {MAX_SIZE_MB}MB
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={e => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function ImageBulkOrderPage() {
  const { slug } = useParams()

  const [stats, setStats]           = useState(null)
  const [pageState, setPageState]   = useState('loading')
  const [order, setOrder]           = useState(null)
  const [error, setError]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [paying, setPaying]         = useState(false)
  const [timeLeft, setTimeLeft]     = useState(null)

  const [form, setForm] = useState({
    full_name: '', email: '', size: '', custom_name: '', coupon_code: '',
  })
  const [imageFile, setImageFile]       = useState(null)
  const [imageError, setImageError]     = useState('')
  const [formErrors, setFormErrors]     = useState({})

  useEffect(() => {
    document.title = stats
      ? `${stats.organization_name} Group Order — Material Wear`
      : 'Image Group Order — Material Wear'
    return () => { document.title = 'Material Wear Limited' }
  }, [stats])

  // ── Load stats ───────────────────────────────────────────────────────────────
  useEffect(() => {
    ;(async () => {
      try {
        const data = await api.get(`/image_bulk_orders/links/${slug}/stats/`)
        setStats(data)
        setPageState('form')
      } catch (err) {
        setError(err.message || 'This order link could not be found.')
        setPageState('error')
      }
    })()
  }, [slug])

  // ── Countdown ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!stats?.payment_deadline) return
    const deadline = new Date(stats.payment_deadline)
    const tick = () => {
      const diff = deadline - new Date()
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true })
        return
      }
      setTimeLeft({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000)  / 60000),
        seconds: Math.floor((diff % 60000)    / 1000),
        expired: false,
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [stats?.payment_deadline])

  // ── Validation ───────────────────────────────────────────────────────────────
  function validate() {
    const errs = {}
    if (!form.full_name.trim())  errs.full_name  = 'Full name is required'
    if (!form.email.trim())      errs.email      = 'Email address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address'
    if (!form.size)              errs.size       = 'Please select your size'
    return errs
  }

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }))
    setFormErrors(fe => ({ ...fe, [key]: '' }))
  }

  function handleImageChange(file, err) {
    setImageFile(file)
    setImageError(err || '')
  }

  // ── Submit order (multipart/form-data) ───────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    if (imageError) return

    const errs = validate()
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }

    setSubmitting(true)
    setError('')
    setFormErrors({})

    try {
      const fd = new FormData()
      fd.append('full_name', form.full_name)
      fd.append('email',     form.email)
      fd.append('size',      form.size)
      if (form.coupon_code.trim())
        fd.append('coupon_code', form.coupon_code.trim().toUpperCase())
      if (stats?.custom_branding_enabled && form.custom_name.trim())
        fd.append('custom_name', form.custom_name)
      if (imageFile)
        fd.append('image', imageFile)

      const data = await api.post(`/image_bulk_orders/links/${slug}/submit_order/`, fd)
      setOrder(data)
      setPageState(data.paid ? 'coupon-paid' : 'submitted')
    } catch (err) {
      if (err.message?.includes('expired') || err.message?.includes('no longer accepting')) {
        setPageState('expired')
        return
      }
      if (err.data && typeof err.data === 'object') {
        const errs = {}
        Object.entries(err.data).forEach(([k, v]) => {
          errs[k] = Array.isArray(v) ? v[0] : v
        })
        setFormErrors(errs)
        setError(errs.detail || errs.non_field_errors || '')
      } else {
        setError(err.message || 'Failed to submit order. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Initialize payment ───────────────────────────────────────────────────────
  async function handlePay() {
    if (!order) return
    setPaying(true)
    setError('')
    try {
      const data = await api.post(`/image_bulk_orders/orders/${order.id}/initialize_payment/`, {
        callback_url: `${window.location.origin}/image-payment/verify?order_id=${order.id}`,
      })
      window.location.href = data.authorization_url
    } catch (err) {
      setError(err.message || 'Payment initialization failed. Please try again.')
      setPaying(false)
    }
  }

  // ── Route states ─────────────────────────────────────────────────────────────
  if (pageState === 'loading') return <LoadingState />

  if (pageState === 'error') return (
    <CenteredState icon="error">
      <p className="section-eyebrow mb-2">Not Found</p>
      <h1 className="font-display text-3xl mb-3" style={{ color: 'var(--c-primary)' }}>Order Link Invalid</h1>
      <p className="mb-8 max-w-sm mx-auto" style={{ color: 'var(--c-text-muted)' }}>
        {error || 'This bulk order link is invalid or has been removed.'}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href={`mailto:${CONTACT.email}`} className="btn-primary inline-flex items-center gap-2 justify-center">
          Contact Us
        </a>
        <Link to="/" className="btn-secondary inline-flex items-center gap-2 justify-center">
          Back to Home
        </Link>
      </div>
    </CenteredState>
  )

  if (pageState === 'expired') return (
    <CenteredState icon="clock">
      <p className="section-eyebrow mb-2">Closed</p>
      <h1 className="font-display text-3xl mb-3" style={{ color: 'var(--c-primary)' }}>
        {stats?.organization_name} — Order Closed
      </h1>
      <p className="mb-8 max-w-sm mx-auto" style={{ color: 'var(--c-text-muted)' }}>
        The payment window for this group order has closed. If you believe this is an error,
        please reach out to the organiser or contact us.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href={`mailto:${CONTACT.email}`} className="btn-primary inline-flex items-center gap-2 justify-center">
          Contact Us
        </a>
        <Link to="/" className="btn-secondary inline-flex items-center gap-2 justify-center">
          Back to Home
        </Link>
      </div>
    </CenteredState>
  )

  if (pageState === 'coupon-paid') return <CouponSuccessView order={order} />
  if (pageState === 'submitted')  return (
    <PaymentView order={order} paying={paying} error={error} onPay={handlePay} />
  )

  // ── Main form ─────────────────────────────────────────────────────────────────
  const paidPct = stats
    ? Math.round((stats.paid_orders / Math.max(stats.total_orders, 1)) * 100)
    : 0
  const unpaidOrders = (stats?.total_orders ?? 0) - (stats?.paid_orders ?? 0)

  return (
    <main className="page-transition flex-1" style={{ background: 'var(--c-bg)' }}>

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-20 px-4" style={{ background: 'var(--c-primary)' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg,rgba(255,255,255,0.03) 0,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,rgba(255,255,255,0.03) 0,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 40px)',
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(245,158,11,0.12) 0%,transparent 70%)' }} />

        <div className="max-w-3xl mx-auto text-center relative">
          {/* Badges */}
          <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest"
              style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Group Order — Active
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest"
              style={{ background: 'rgba(245,158,11,0.18)', color: '#fde68a', border: '1px solid rgba(245,158,11,0.3)' }}>
              <ImageIcon size={12} />
              Image Upload Enabled
            </div>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white mb-4 leading-tight tracking-tight">
            {stats?.organization_name}
          </h1>
          <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Secure your spot and upload your personalisation image
          </p>

          {/* Countdown */}
          {timeLeft && !timeLeft.expired && (
            <div>
              <p className="text-xs uppercase tracking-widest mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Payment Deadline Countdown
              </p>
              <div className="flex items-end justify-center gap-3 sm:gap-4">
                <CountdownUnit value={timeLeft.days}    label="Days" />
                <span className="font-display text-3xl text-white pb-7">:</span>
                <CountdownUnit value={timeLeft.hours}   label="Hours" />
                <span className="font-display text-3xl text-white pb-7">:</span>
                <CountdownUnit value={timeLeft.minutes} label="Mins" />
                <span className="font-display text-3xl text-white pb-7">:</span>
                <CountdownUnit value={timeLeft.seconds} label="Secs" />
              </div>
            </div>
          )}
          {timeLeft?.expired && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
              style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}>
              <AlertIcon /> Payment window has closed
            </div>
          )}
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--c-bg-warm)', borderBottom: '1px solid var(--c-border)' }}>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="grid grid-cols-3 gap-4 text-center mb-5">
            <div>
              <p className="font-display text-3xl sm:text-4xl font-bold" style={{ color: 'var(--c-primary)' }}>
                {stats?.paid_orders ?? '—'}
              </p>
              <p className="text-xs uppercase tracking-widest mt-1" style={{ color: 'var(--c-text-muted)' }}>Paid</p>
            </div>
            <div>
              <p className="font-display text-3xl sm:text-4xl font-bold" style={{ color: 'var(--c-primary)' }}>
                {stats?.total_orders ?? '—'}
              </p>
              <p className="text-xs uppercase tracking-widest mt-1" style={{ color: 'var(--c-text-muted)' }}>Registered</p>
            </div>
            <div>
              <p className="font-display text-3xl sm:text-4xl font-bold" style={{ color: 'var(--c-accent)' }}>
                {paidPct}%
              </p>
              <p className="text-xs uppercase tracking-widest mt-1" style={{ color: 'var(--c-text-muted)' }}>Complete</p>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--c-border)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${paidPct}%`, background: 'linear-gradient(90deg,var(--c-primary),var(--c-accent))' }}
            />
          </div>
          <p className="text-xs text-right mt-1.5" style={{ color: 'var(--c-text-muted)' }}>
            {stats?.paid_orders} of {stats?.total_orders} registrations paid
          </p>
        </div>
      </section>

      {/* ── FORM + SIDEBAR ────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="grid lg:grid-cols-5 gap-8 items-start">

          {/* ORDER FORM */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface)', boxShadow: '0 4px 32px rgba(0,0,0,0.06)' }}>

              <div className="px-7 pt-7 pb-5" style={{ borderBottom: '1px solid var(--c-border)' }}>
                <h2 className="font-display text-2xl" style={{ color: 'var(--c-primary)' }}>Place Your Order</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--c-text-muted)' }}>
                  Fill in your details and optionally upload a personalisation image
                </p>
              </div>

              <form onSubmit={handleSubmit} className="px-7 py-7 space-y-6" noValidate>
                {error && <ErrorBanner message={error} />}

                {/* Full Name */}
                <FormField label="Full Name" required error={formErrors.full_name}
                  hint="Enter your name exactly as you want it processed">
                  <input
                    type="text" value={form.full_name}
                    onChange={e => setField('full_name', e.target.value)}
                    placeholder="e.g. JOHN ADEYEMI"
                    style={inputStyle(formErrors.full_name)}
                  />
                </FormField>

                {/* Email */}
                <FormField label="Email Address" required error={formErrors.email}
                  hint="Your receipt and confirmation will be sent here">
                  <input
                    type="email" value={form.email}
                    onChange={e => setField('email', e.target.value)}
                    placeholder="you@example.com"
                    style={inputStyle(formErrors.email)}
                  />
                </FormField>

                {/* Size */}
                <div>
                  <label className="block text-sm font-medium mb-2.5" style={{ color: 'var(--c-text)' }}>
                    Size <span style={{ color: 'var(--c-accent)' }}>*</span>
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {SIZE_OPTIONS.map(s => (
                      <button key={s} type="button" onClick={() => setField('size', s)}
                        className="h-11 rounded-xl text-sm font-semibold transition-all duration-150 hover:shadow-md"
                        style={{
                          background: form.size === s ? 'var(--c-primary)' : 'var(--c-bg)',
                          color:      form.size === s ? '#fff'             : 'var(--c-text)',
                          border:     `2px solid ${form.size === s ? 'var(--c-primary)' : 'var(--c-border)'}`,
                          transform:  form.size === s ? 'scale(1.05)' : 'scale(1)',
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {formErrors.size && <p className="text-xs mt-2" style={{ color: '#ef4444' }}>{formErrors.size}</p>}
                  <p className="text-xs mt-2" style={{ color: 'var(--c-text-muted)' }}>
                    Not sure?{' '}
                    <Link to="/size-guide" className="underline" style={{ color: 'var(--c-primary)' }}>
                      View size guide
                    </Link>
                  </p>
                </div>

                {/* Custom Name (conditional) */}
                {stats?.custom_branding_enabled && (
                  <FormField label="Custom Name / Text" optional error={formErrors.custom_name}
                    hint="This text will be printed or embroidered on your item">
                    <input
                      type="text" value={form.custom_name}
                      onChange={e => setField('custom_name', e.target.value)}
                      placeholder="Text to be printed on your item"
                      maxLength={255}
                      style={inputStyle(formErrors.custom_name)}
                    />
                  </FormField>
                )}

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--c-text)' }}>
                    Personalisation Image
                    <span className="ml-1.5 font-normal text-xs" style={{ color: 'var(--c-text-muted)' }}>(optional)</span>
                  </label>
                  <p className="text-xs mb-3" style={{ color: 'var(--c-text-muted)' }}>
                    Upload a photo or graphic to be used in personalising your order (e.g. face photo, logo)
                  </p>
                  <ImageUploadField value={imageFile} onChange={handleImageChange} error={imageError} />
                  {imageError && <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>{imageError}</p>}
                  {formErrors.image && <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>{formErrors.image}</p>}
                </div>

                {/* Coupon Code */}
                <FormField label="Coupon Code" optional error={formErrors.coupon_code}
                  hint="If you have a coupon, your order will be automatically marked as paid">
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--c-text-muted)' }}>
                      <TagIcon />
                    </div>
                    <input
                      type="text" value={form.coupon_code}
                      onChange={e => setField('coupon_code', e.target.value.toUpperCase())}
                      placeholder="ENTER COUPON CODE"
                      className="tracking-widest"
                      style={{ ...inputStyle(formErrors.coupon_code), paddingLeft: '2.25rem' }}
                    />
                  </div>
                </FormField>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !!imageError}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
                  >
                    {submitting
                      ? <><SpinnerIcon /><span>Submitting Order...</span></>
                      : <><span>Submit Order</span><ArrowRightIcon /></>
                    }
                  </button>
                  <p className="text-xs text-center mt-3" style={{ color: 'var(--c-text-muted)' }}>
                    By submitting you agree to our{' '}
                    <Link to="/terms" className="underline" style={{ color: 'var(--c-primary)' }}>Terms & Conditions</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-2 space-y-4">

            {/* Image upload guide */}
            <div className="rounded-2xl p-5" style={{ border: '1px solid rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.06)' }}>
              <div className="flex items-center gap-2 mb-3" style={{ color: '#92400e' }}>
                <ImageIcon size={16} />
                <h3 className="text-sm font-semibold">Image Upload Guide</h3>
              </div>
              <ul className="space-y-1.5 text-xs" style={{ color: '#78350f' }}>
                {[
                  'Use a clear, high-resolution photo',
                  'Face photos: front-facing, well-lit',
                  'Logos: transparent or white background preferred',
                  'Supported: JPEG, PNG, GIF, WebP',
                  'Maximum file size: 10MB',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="mt-0.5 flex-shrink-0">•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* How it works */}
            <div className="rounded-2xl p-6" style={{ border: '1px solid var(--c-border)', background: 'var(--c-bg-warm)' }}>
              <h3 className="font-display text-lg mb-5" style={{ color: 'var(--c-primary)' }}>How It Works</h3>
              <ol className="space-y-4">
                {[
                  ['Upload',   'Optionally upload your personalisation image'],
                  ['Reserve',  'Fill in your details and select your size'],
                  ['Pay',      'Complete payment via our secure checkout'],
                  ['Confirm',  'Receive email confirmation with your details'],
                ].map(([title, desc], i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                      style={{ background: 'var(--c-primary)' }}>
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>{title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Secure payment */}
            <div className="rounded-2xl p-5 flex items-start gap-3" style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface)' }}>
              <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--c-bg-warm)', color: 'var(--c-primary)' }}>
                <ShieldIcon />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>Secure Checkout</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>
                  All payments processed securely by Paystack. Your financial data is never stored on our servers.
                </p>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="rounded-2xl p-5" style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface)' }}>
                <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--c-primary)' }}>
                  <UsersIcon />
                  <h3 className="text-sm font-semibold">Order Progress</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--c-text-muted)' }}>Total registrations</span>
                    <span className="font-semibold" style={{ color: 'var(--c-text)' }}>{stats.total_orders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--c-text-muted)' }}>Paid</span>
                    <span className="font-semibold" style={{ color: '#10b981' }}>{stats.paid_orders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--c-text-muted)' }}>Awaiting payment</span>
                    <span className="font-semibold" style={{ color: 'var(--c-accent)' }}>{unpaidOrders}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl p-5" style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface)' }}>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--c-text-muted)' }}>Community proof</p>
              <p className="text-sm mb-3" style={{ color: 'var(--c-text-muted)' }}>
                See the public wall of confirmed paid image orders for this group.
              </p>
              <a
                href={`${API_BASE}/image_bulk_orders/links/${slug}/paid_orders/`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full inline-flex items-center justify-center gap-2"
              >
                <UsersIcon />
                View Paid Orders
              </a>
            </div>

            {/* Price */}
            {stats?.price_per_item && (
              <div className="rounded-2xl p-5" style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface)' }}>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--c-text-muted)' }}>Price per item</p>
                <p className="font-display text-2xl font-bold" style={{ color: 'var(--c-primary)' }}>
                  ₦{Number(stats.price_per_item).toLocaleString()}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--c-text-muted)' }}>
                  + VAT (7.5%) added at checkout
                </p>
              </div>
            )}

            {/* Help */}
            <div className="rounded-2xl p-5" style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface)' }}>
              <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                Need help? Contact us at{' '}
                <a href={`mailto:${CONTACT.email}`} className="underline" style={{ color: 'var(--c-primary)' }}>
                  {CONTACT.email}
                </a>{' '}or call{' '}
                <a href={`tel:${CONTACT.phone}`} className="underline" style={{ color: 'var(--c-primary)' }}>
                  {CONTACT.phone}
                </a>
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  PAYMENT VIEW
// ══════════════════════════════════════════════════════════════════════════════
function PaymentView({ order, paying, error, onPay }) {
  useEffect(() => {
    document.title = 'Complete Payment — Material Wear'
    return () => { document.title = 'Material Wear Limited' }
  }, [])

  const orgName = order?.bulk_order?.organization_name ?? '—'
  const hasImage = !!order?.image_url

  return (
    <main className="page-transition flex-1 py-16 px-4" style={{ background: 'var(--c-bg)' }}>
      <div className="max-w-md mx-auto">

        <div className="rounded-2xl p-6 mb-5 text-center"
          style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
            <CheckCircleIcon size={40} />
          </div>
          <h1 className="font-display text-2xl mb-1" style={{ color: 'var(--c-primary)' }}>
            Order Registered!
          </h1>
          <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
            Your spot is reserved. Complete payment below to confirm your order.
          </p>
        </div>

        {/* Image preview (if uploaded) */}
        {hasImage && (
          <div className="rounded-2xl overflow-hidden mb-5" style={{ border: '1px solid var(--c-border)' }}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-warm)' }}>
              <ImageIcon size={15} />
              <span className="text-sm font-medium" style={{ color: 'var(--c-primary)' }}>Uploaded Image</span>
            </div>
            <img src={order.image_url} alt="Uploaded" className="w-full object-cover" style={{ maxHeight: 180 }} />
          </div>
        )}

        <div className="rounded-2xl overflow-hidden mb-5"
          style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface)', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
          <div className="px-6 py-4 flex items-center gap-2"
            style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-warm)' }}>
            <ReceiptIcon />
            <h2 className="font-display text-lg" style={{ color: 'var(--c-primary)' }}>Order Summary</h2>
          </div>
          <div className="px-6 py-4">
            <InfoRow label="Reference"    value={<span className="font-mono font-bold" style={{ color: 'var(--c-primary)' }}>{order?.reference}</span>} />
            <InfoRow label="Organisation" value={orgName} />
            <InfoRow label="Name"         value={order?.full_name} />
            <InfoRow label="Email"        value={order?.email} />
            <InfoRow label="Size"         value={order?.size} />
            {order?.bulk_order?.custom_branding_enabled && order?.custom_name && (
              <InfoRow label="Custom Text" value={order.custom_name} />
            )}
            <InfoRow label="Image"        value={hasImage ? '✓ Uploaded' : 'Not provided'} />
            <InfoRow label="Status"       value={<span style={{ color: '#f59e0b', fontWeight: 600 }}>Awaiting Payment</span>} />
          </div>
        </div>

        <ErrorBanner message={error} />
        {error && <div className="mb-4" />}

        <button
          onClick={onPay}
          disabled={paying}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
        >
          {paying
            ? <><SpinnerIcon /><span>Redirecting to Paystack...</span></>
            : <><LockIcon size={16} /><span>Proceed to Secure Payment</span></>
          }
        </button>

        <p className="text-xs text-center mt-3" style={{ color: 'var(--c-text-muted)' }}>
          You will be redirected to Paystack to complete payment securely.
          <br />A receipt will be emailed to <strong style={{ color: 'var(--c-text)' }}>{order?.email}</strong>.
        </p>

        <div className="flex items-center justify-center gap-4 mt-6 pt-6" style={{ borderTop: '1px solid var(--c-border)' }}>
          <Link to="/" className="text-sm underline" style={{ color: 'var(--c-text-muted)' }}>Back to Home</Link>
          <span style={{ color: 'var(--c-border)' }}>|</span>
          <Link to="/image-my-orders" className="text-sm underline" style={{ color: 'var(--c-text-muted)' }}>My Image Orders</Link>
        </div>
      </div>
    </main>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  COUPON SUCCESS VIEW
// ══════════════════════════════════════════════════════════════════════════════
function CouponSuccessView({ order }) {
  useEffect(() => {
    document.title = 'Order Confirmed — Material Wear'
    return () => { document.title = 'Material Wear Limited' }
  }, [])

  return (
    <main className="page-transition flex-1 flex items-center justify-center py-16 px-4" style={{ background: 'var(--c-bg)' }}>
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
          <CheckCircleIcon size={40} />
        </div>

        <p className="section-eyebrow mb-2">Coupon Applied & Paid</p>
        <h1 className="font-display text-4xl mb-4" style={{ color: 'var(--c-primary)' }}>
          Order Confirmed!
        </h1>
        <p className="mb-8" style={{ color: 'var(--c-text-muted)' }}>
          Your coupon code was accepted and your order is confirmed.
          A confirmation has been sent to{' '}
          <strong style={{ color: 'var(--c-text)' }}>{order?.email}</strong>.
        </p>

        <div className="rounded-2xl border p-6 text-left mb-8"
          style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-warm)' }}>
          <InfoRow label="Reference"    value={<span className="font-mono font-bold" style={{ color: 'var(--c-primary)' }}>{order?.reference}</span>} />
          <InfoRow label="Organisation" value={order?.bulk_order?.organization_name} />
          <InfoRow label="Name"         value={order?.full_name} />
          <InfoRow label="Size"         value={order?.size} />
          <InfoRow label="Image"        value={order?.image_url ? '✓ Uploaded' : 'Not provided'} />
          <InfoRow label="Status"       value={<span style={{ color: '#10b981', fontWeight: 600 }}>Paid</span>} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/image-my-orders" className="btn-primary inline-flex items-center justify-center gap-2">
            View My Image Orders
          </Link>
          <Link to="/" className="btn-secondary inline-flex items-center justify-center gap-2">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  SHARED HELPERS
// ══════════════════════════════════════════════════════════════════════════════
function LoadingState() {
  return (
    <main className="page-transition flex-1 flex items-center justify-center py-40" style={{ background: 'var(--c-bg)' }}>
      <div className="text-center">
        <SpinnerIcon />
        <p className="text-sm mt-4" style={{ color: 'var(--c-text-muted)' }}>Loading order details...</p>
      </div>
    </main>
  )
}

function CenteredState({ icon, children }) {
  const iconMap = {
    error: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    clock: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  }
  return (
    <main className="page-transition flex-1 flex items-center justify-center py-40 px-4" style={{ background: 'var(--c-bg)' }}>
      <div className="text-center max-w-sm w-full">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'var(--c-bg-warm)', color: 'var(--c-primary)' }}>
          {iconMap[icon]}
        </div>
        {children}
      </div>
    </main>
  )
}

function FormField({ label, required, optional, error, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--c-text)' }}>
        {label}
        {required && <span className="ml-1" style={{ color: 'var(--c-accent)' }}>*</span>}
        {optional && <span className="ml-1.5 font-normal text-xs" style={{ color: 'var(--c-text-muted)' }}>(optional)</span>}
      </label>
      {children}
      {error && <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>{error}</p>}
      {hint && !error && <p className="text-xs mt-1.5" style={{ color: 'var(--c-text-muted)' }}>{hint}</p>}
    </div>
  )
}

function inputStyle(hasError) {
  return {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem',
    border: `1.5px solid ${hasError ? '#ef4444' : 'var(--c-border)'}`,
    background: 'var(--c-bg)', color: 'var(--c-text)', fontSize: '0.875rem',
    outline: 'none', transition: 'border-color 0.15s', display: 'block',
  }
}
