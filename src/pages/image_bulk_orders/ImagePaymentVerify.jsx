import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../../services/api'
import { CONTACT } from '../../config/constants'

// ── Icons ──────────────────────────────────────────────────────────────────────
const CheckCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const ClockIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const AlertIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const SpinnerIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
    <circle cx="12" cy="12" r="10" strokeOpacity=".2"/>
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
  </svg>
)
const ReceiptIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/>
    <line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="17" x2="12" y2="17"/>
  </svg>
)
const ImageIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)
const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
)

// ── Row helper ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b last:border-0 text-sm"
      style={{ borderColor: 'var(--c-border)' }}>
      <span style={{ color: 'var(--c-text-muted)' }}>{label}</span>
      <span className="font-medium text-right" style={{ color: 'var(--c-text)', wordBreak: 'break-all' }}>{value ?? '—'}</span>
    </div>
  )
}

// ── VAT row ────────────────────────────────────────────────────────────────────
function VatRow({ label, value, bold, accent, muted }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span style={{ color: muted ? 'var(--c-text-muted)' : 'var(--c-text)' }}>{label}</span>
      <span
        className={bold ? 'font-bold text-base' : 'font-medium'}
        style={{ color: accent ? 'var(--c-primary)' : 'var(--c-text)' }}
      >
        {value}
      </span>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function ImagePaymentVerify() {
  const [searchParams] = useSearchParams()
  const orderId   = searchParams.get('order_id')
  const reference = searchParams.get('reference') || searchParams.get('trxref')

  const [status, setStatus]   = useState('loading') // loading|success|pending|error|no-ref
  const [order, setOrder]     = useState(null)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    document.title = 'Payment Verification — Material Wear'
    return () => { document.title = 'Material Wear Limited' }
  }, [])

  useEffect(() => {
    if (!orderId) {
      setStatus('no-ref')
      return
    }
    verify()
  }, [orderId])

  async function verify() {
    setRetrying(true)
    try {
      const data = await api.get(`/image_bulk_orders/orders/${orderId}/verify_payment/`)
      setOrder(data)
      setStatus(data.paid ? 'success' : 'pending')
    } catch {
      setStatus('error')
    } finally {
      setRetrying(false)
    }
  }

  async function handleRetry() {
    setStatus('loading')
    await verify()
  }

  // ── No order_id in URL ────────────────────────────────────────────────────────
  if (status === 'no-ref') return (
    <main className="page-transition flex-1 flex items-center justify-center py-40 px-4" style={{ background: 'var(--c-bg)' }}>
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
          <AlertIcon size={28} />
        </div>
        <p className="section-eyebrow mb-2">Invalid Link</p>
        <h1 className="font-display text-3xl mb-3" style={{ color: 'var(--c-primary)' }}>
          No Order Found
        </h1>
        <p className="mb-8" style={{ color: 'var(--c-text-muted)' }}>
          This verification link is missing order information. Please check your email for the correct link.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/image-my-orders" className="btn-primary inline-flex items-center gap-2 justify-center">
            My Image Orders
          </Link>
          <Link to="/" className="btn-secondary inline-flex items-center gap-2 justify-center">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (status === 'loading') return (
    <main className="page-transition flex-1 flex items-center justify-center py-40" style={{ background: 'var(--c-bg)' }}>
      <div className="text-center">
        <div className="flex justify-center mb-4" style={{ color: 'var(--c-primary)' }}>
          <SpinnerIcon />
        </div>
        <p className="font-display text-xl mb-2" style={{ color: 'var(--c-primary)' }}>Verifying Payment</p>
        <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
          Please wait while we confirm your payment with Paystack...
        </p>
      </div>
    </main>
  )

  // ── Pending ───────────────────────────────────────────────────────────────────
  if (status === 'pending') return (
    <main className="page-transition flex-1 flex items-center justify-center py-24 px-4" style={{ background: 'var(--c-bg)' }}>
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
          <ClockIcon />
        </div>
        <p className="section-eyebrow mb-2">Not Yet Confirmed</p>
        <h1 className="font-display text-3xl mb-4" style={{ color: 'var(--c-primary)' }}>
          Payment Pending
        </h1>
        <p className="mb-8" style={{ color: 'var(--c-text-muted)' }}>
          Your payment has not yet been confirmed. This can take a few moments.
          Click retry below to check again.
        </p>

        {order && (
          <div className="rounded-2xl border p-5 text-left mb-8"
            style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-warm)' }}>
            <InfoRow label="Reference"    value={<span className="font-mono font-bold">{order.reference}</span>} />
            <InfoRow label="Organisation" value={order.organization} />
            <InfoRow label="Name"         value={order.full_name} />
            <InfoRow label="Size"         value={order.size} />
            <InfoRow label="Status"       value={<span style={{ color: '#f59e0b', fontWeight: 600 }}>Pending</span>} />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="btn-primary inline-flex items-center gap-2 justify-center"
          >
            <RefreshIcon />
            {retrying ? 'Checking...' : 'Retry Verification'}
          </button>
          <a href={`mailto:${CONTACT.email}`} className="btn-secondary inline-flex items-center gap-2 justify-center">
            Contact Support
          </a>
        </div>
        <p className="text-xs mt-4" style={{ color: 'var(--c-text-muted)' }}>
          Reference: <span className="font-mono">{reference}</span>
        </p>
      </div>
    </main>
  )

  // ── Error ─────────────────────────────────────────────────────────────────────
  if (status === 'error') return (
    <main className="page-transition flex-1 flex items-center justify-center py-24 px-4" style={{ background: 'var(--c-bg)' }}>
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
          <AlertIcon size={40} />
        </div>
        <p className="section-eyebrow mb-2">Verification Failed</p>
        <h1 className="font-display text-3xl mb-4" style={{ color: 'var(--c-primary)' }}>
          Something Went Wrong
        </h1>
        <p className="mb-8" style={{ color: 'var(--c-text-muted)' }}>
          We could not verify your payment. Please contact our support team with your
          payment reference and we will resolve it promptly.
        </p>
        <div className="rounded-xl p-4 mb-8 text-sm"
          style={{ background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)' }}>
          <p style={{ color: 'var(--c-text-muted)' }}>Order ID:</p>
          <p className="font-mono font-semibold mt-0.5" style={{ color: 'var(--c-text)' }}>{orderId}</p>
          {reference && (
            <>
              <p className="mt-3" style={{ color: 'var(--c-text-muted)' }}>Payment Reference:</p>
              <p className="font-mono font-semibold mt-0.5" style={{ color: 'var(--c-text)' }}>{reference}</p>
            </>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="btn-primary inline-flex items-center gap-2 justify-center"
          >
            <RefreshIcon />
            {retrying ? 'Retrying...' : 'Try Again'}
          </button>
          <a href={`mailto:${CONTACT.email}?subject=Payment Verification Issue — ${reference || orderId}`}
            className="btn-secondary inline-flex items-center gap-2 justify-center">
            Email Support
          </a>
        </div>
      </div>
    </main>
  )

  // ── Success ───────────────────────────────────────────────────────────────────
  const fmt = v => `₦${Number(v || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
  const dateStr = order?.updated_at
    ? new Date(order.updated_at).toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  return (
    <main className="page-transition flex-1 py-16 px-4" style={{ background: 'var(--c-bg)' }}>
      <div className="max-w-lg mx-auto">

        {/* Success hero */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
              <CheckCircleIcon />
            </div>
            {order?.has_image && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'var(--c-accent)', color: '#fff', border: '2px solid #fff' }}>
                <ImageIcon size={14} />
              </div>
            )}
          </div>
          <p className="section-eyebrow mb-2">Payment Confirmed</p>
          <h1 className="font-display text-4xl mb-3" style={{ color: 'var(--c-primary)' }}>
            Order Complete!
          </h1>
          <p style={{ color: 'var(--c-text-muted)' }}>
            Payment received. A receipt has been sent to{' '}
            <strong style={{ color: 'var(--c-text)' }}>{order?.email}</strong>.
          </p>
        </div>

        {/* Receipt card */}
        <div className="rounded-2xl overflow-hidden mb-6"
          style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface)', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>

          {/* Card header */}
          <div className="px-6 py-4 flex items-center gap-3"
            style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-warm)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--c-primary)', color: '#fff' }}>
              <ReceiptIcon />
            </div>
            <div>
              <h2 className="font-display text-lg leading-tight" style={{ color: 'var(--c-primary)' }}>
                Payment Receipt
              </h2>
              {dateStr && (
                <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{dateStr}</p>
              )}
            </div>
          </div>

          {/* Order details */}
          <div className="px-6 pt-5 pb-2">
            <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: 'var(--c-text-muted)' }}>
              Order Details
            </p>
            <InfoRow label="Payment Reference" value={<span className="font-mono text-xs font-bold" style={{ color: 'var(--c-primary)' }}>{order?.reference}</span>} />
            <InfoRow label="Organisation"      value={order?.organization} />
            <InfoRow label="Name"              value={order?.full_name} />
            <InfoRow label="Email"             value={order?.email} />
            <InfoRow label="Size"              value={order?.size} />
            {order?.custom_name && (
              <InfoRow label="Custom Text"     value={order.custom_name} />
            )}
            {order?.coupon_code && (
              <InfoRow label="Coupon Code"     value={<span className="font-mono">{order.coupon_code}</span>} />
            )}
            <InfoRow label="Image Uploaded"    value={
              order?.has_image
                ? <span style={{ color: '#10b981', fontWeight: 600 }}>Yes</span>
                : <span style={{ color: 'var(--c-text-muted)' }}>No</span>
            } />
            <InfoRow label="Status"            value={<span style={{ color: '#10b981', fontWeight: 600 }}>Paid</span>} />
          </div>

          {/* Price breakdown */}
          <div className="mx-6 mb-5 mt-3 rounded-xl p-4" style={{ background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)' }}>
            <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--c-text-muted)' }}>
              Payment Breakdown
            </p>
            <VatRow label="Base Amount" value={fmt(order?.base_amount)} muted />
            <VatRow label={`VAT (${((order?.vat_rate ?? 0.075) * 100).toFixed(1)}%)`} value={fmt(order?.vat_amount)} muted />
            <div className="my-2 border-t" style={{ borderColor: 'var(--c-border)' }} />
            <VatRow label="Total Paid" value={fmt(order?.amount)} bold accent />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/image-my-orders" className="btn-primary flex-1 inline-flex items-center justify-center gap-2">
            View My Image Orders
          </Link>
          <Link to="/" className="btn-secondary flex-1 inline-flex items-center justify-center gap-2">
            Back to Home
          </Link>
        </div>

        {/* Support note */}
        <p className="text-xs text-center mt-6" style={{ color: 'var(--c-text-muted)' }}>
          Questions about your order? Contact us at{' '}
          <a href={`mailto:${CONTACT.email}`} className="underline" style={{ color: 'var(--c-primary)' }}>
            {CONTACT.email}
          </a>
        </p>
      </div>
    </main>
  )
}
