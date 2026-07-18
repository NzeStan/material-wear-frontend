import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../../services/api'
import { CONTACT } from '../../config/constants'
const RECENT_BULK_ORDER_IDS_KEY = 'mw_recent_bulk_order_ids'

// ── Icons ──────────────────────────────────────────────────────────────────────
const SpinnerIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
    <circle cx="12" cy="12" r="10" strokeOpacity=".15"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const ClockIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const AlertIcon = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)
const ArrowRightIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
)
const ReceiptIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/>
    <line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="17" x2="12" y2="17"/>
  </svg>
)

// ── Helper ─────────────────────────────────────────────────────────────────────
function formatCurrency(amount) {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(amount)
}
function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b last:border-0 text-sm"
      style={{ borderColor: 'var(--c-border)' }}>
      <span style={{ color: 'var(--c-text-muted)' }}>{label}</span>
      <span className="font-medium text-right" style={{ color: 'var(--c-text)', maxWidth: '60%', wordBreak: 'break-all' }}>
        {value ?? '—'}
      </span>
    </div>
  )
}

function rememberBulkOrderId(orderId) {
  if (!orderId || typeof window === 'undefined') return

  const existing = JSON.parse(window.localStorage.getItem(RECENT_BULK_ORDER_IDS_KEY) || '[]')
  const next = [orderId, ...existing.filter(id => id !== orderId)].slice(0, 20)
  window.localStorage.setItem(RECENT_BULK_ORDER_IDS_KEY, JSON.stringify(next))
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function PaymentVerify() {
  const [searchParams] = useSearchParams()

  // Paystack passes either ?reference= or ?trxref=
  const reference = searchParams.get('reference') || searchParams.get('trxref') || ''

  const [status,    setStatus]    = useState('loading') // loading|success|pending|error|no-ref
  const [orderData, setOrderData] = useState(null)
  const [errorMsg,  setErrorMsg]  = useState('')
  const [retrying,  setRetrying]  = useState(false)

  useEffect(() => {
    document.title = 'Verifying Payment — Material Wear'
    return () => { document.title = 'Material Wear Limited' }
  }, [])

  useEffect(() => {
    if (!reference) {
      setStatus('no-ref')
      return
    }
    verify()
  }, [reference]) // eslint-disable-line

  async function verify() {
    setRetrying(true)
    setErrorMsg('')
    try {
      // Reference format: ORDER-{bulk_order_uuid}-{order_entry_uuid}
      // e.g. ORDER-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy
      // Split by '-': [ORDER, ...uuidA (8+4+4+4+12=5 groups), ...uuidB (5 groups)]
      const parts = reference.split('-')

      // Minimum: ORDER(1) + UUID1(5 parts) + UUID2(5 parts) = 11 parts
      if (parts[0] !== 'ORDER' || parts.length < 11) {
        setErrorMsg('Invalid payment reference format. Please contact support.')
        setStatus('error')
        return
      }

      // The order entry UUID is always the last 5 groups (parts 6-10)
      const orderUuid = parts.slice(6, 11).join('-')

      const data = await api.get(`/bulk_orders/orders/${orderUuid}/verify_payment/`)
      rememberBulkOrderId(data.order_id)
      setOrderData(data)
      setStatus(data.paid ? 'success' : 'pending')
    } catch (err) {
      setErrorMsg(err.message || 'Could not verify payment. Please try again or contact support.')
      setStatus('error')
    } finally {
      setRetrying(false)
    }
  }

  // ──────────────────────────────────────────────────────────────────────────────
  //  LOADING
  // ──────────────────────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <main className="page-transition flex-1 flex items-center justify-center py-40 px-4"
        style={{ background: 'var(--c-bg)' }}>
        <div className="text-center">
          <div className="flex justify-center mb-6" style={{ color: 'var(--c-primary)' }}>
            <SpinnerIcon />
          </div>
          <p className="section-eyebrow mb-2">Processing</p>
          <h1 className="font-display text-3xl mb-3" style={{ color: 'var(--c-primary)' }}>
            Verifying Your Payment
          </h1>
          <p style={{ color: 'var(--c-text-muted)' }}>Please wait while we confirm your payment status...</p>
        </div>
      </main>
    )
  }

  // ──────────────────────────────────────────────────────────────────────────────
  //  NO REFERENCE
  // ──────────────────────────────────────────────────────────────────────────────
  if (status === 'no-ref') {
    return (
      <main className="page-transition flex-1 flex items-center justify-center py-40 px-4"
        style={{ background: 'var(--c-bg)' }}>
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--c-accent)' }}>
            <AlertIcon />
          </div>
          <p className="section-eyebrow mb-2">Missing Reference</p>
          <h1 className="font-display text-3xl mb-4" style={{ color: 'var(--c-primary)' }}>
            No Payment Reference
          </h1>
          <p className="mb-8" style={{ color: 'var(--c-text-muted)' }}>
            This page requires a payment reference. If you have just completed a payment,
            please check your email for your order confirmation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/my-orders" className="btn-primary inline-flex items-center justify-center gap-2">
              <span>View My Orders</span>
            </Link>
            <Link to="/" className="btn-secondary inline-flex items-center justify-center gap-2">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // ──────────────────────────────────────────────────────────────────────────────
  //  SUCCESS
  // ──────────────────────────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <main className="page-transition flex-1 py-16 px-4" style={{ background: 'var(--c-bg)' }}>
        <div className="max-w-lg mx-auto">

          {/* Confetti-style success banner */}
          <div
            className="rounded-3xl p-8 mb-6 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,var(--c-primary),#065f46)', boxShadow: '0 8px 40px rgba(6,78,59,0.25)' }}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 10px)', backgroundSize: '14px 14px' }} />
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(255,255,255,0.15)' }}>
                <CheckIcon />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Payment Confirmed
              </p>
              <h1 className="font-display text-4xl text-white mb-2">
                Payment Successful!
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.75)' }}>
                Your order has been confirmed. Thank you!
              </p>
            </div>
          </div>

          {/* Order details */}
          <div
            className="rounded-2xl overflow-hidden mb-5"
            style={{ border: '1px solid var(--c-border)', background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}
          >
            <div className="px-6 py-4 flex items-center gap-2"
              style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-warm)' }}>
              <ReceiptIcon />
              <h2 className="font-display text-lg" style={{ color: 'var(--c-primary)' }}>Payment Receipt</h2>
            </div>
            <div className="px-6 py-4">
              <InfoRow label="Order Reference" value={
                <span className="font-mono font-bold" style={{ color: 'var(--c-primary)' }}>
                  {orderData?.reference}
                </span>
              } />
              <InfoRow label="Organisation"   value={orderData?.organization} />
              <InfoRow label="Name"           value={orderData?.full_name} />
              <InfoRow label="Email"          value={orderData?.email} />
              <InfoRow label="Size"           value={orderData?.size} />
              <InfoRow label="Base Amount"    value={formatCurrency(orderData?.base_amount)} />
              <InfoRow label={`VAT (${orderData?.vat_rate ?? ''})`} value={formatCurrency(orderData?.vat_amount)} />
              <InfoRow label="Total Paid"     value={
                <span className="font-bold text-base" style={{ color: 'var(--c-primary)' }}>
                  {formatCurrency(orderData?.amount)}
                </span>
              } />
              <InfoRow label="Status"         value={
                <span className="font-semibold" style={{ color: '#10b981' }}>Paid</span>
              } />
              <InfoRow label="Date"           value={formatDate(orderData?.updated_at)} />
            </div>
          </div>

          {/* Email note */}
          <div
            className="rounded-xl p-4 flex items-start gap-3 text-sm mb-6"
            style={{ background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5" style={{ color: 'var(--c-primary)' }}>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <p style={{ color: 'var(--c-text-muted)' }}>
              A payment receipt has been sent to{' '}
              <strong style={{ color: 'var(--c-text)' }}>{orderData?.email}</strong>.
              Please check your inbox (and spam folder).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/my-orders" className="btn-primary flex-1 flex items-center justify-center gap-2">
              <span>View My Orders</span><ArrowRightIcon />
            </Link>
            <Link to="/" className="btn-secondary flex-1 flex items-center justify-center gap-2">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // ──────────────────────────────────────────────────────────────────────────────
  //  PENDING (not yet confirmed by webhook)
  // ──────────────────────────────────────────────────────────────────────────────
  if (status === 'pending') {
    return (
      <main className="page-transition flex-1 py-16 px-4" style={{ background: 'var(--c-bg)' }}>
        <div className="max-w-md mx-auto text-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--c-accent)' }}
          >
            <ClockIcon />
          </div>
          <p className="section-eyebrow mb-2">Awaiting Confirmation</p>
          <h1 className="font-display text-3xl mb-4" style={{ color: 'var(--c-primary)' }}>
            Payment Pending
          </h1>
          <p className="mb-2" style={{ color: 'var(--c-text-muted)' }}>
            Your payment is being processed. This usually takes a few seconds.
            If you completed payment, please check again shortly.
          </p>
          <p className="text-sm mb-8" style={{ color: 'var(--c-text-muted)' }}>
            You will receive a confirmation email once the payment is verified.
          </p>

          {/* Order info */}
          {orderData && (
            <div className="rounded-2xl border p-5 text-left mb-6" style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-warm)' }}>
              <InfoRow label="Reference"    value={
                <span className="font-mono font-bold" style={{ color: 'var(--c-primary)' }}>
                  {orderData?.reference}
                </span>
              } />
              <InfoRow label="Organisation" value={orderData?.organization} />
              <InfoRow label="Email"        value={orderData?.email} />
              <InfoRow label="Status"       value={
                <span style={{ color: 'var(--c-accent)', fontWeight: 600 }}>Pending</span>
              } />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={verify}
              disabled={retrying}
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              {retrying
                ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><circle cx="12" cy="12" r="10" strokeOpacity=".2"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg><span>Checking...</span></>
                : <><RefreshIcon /><span>Check Again</span></>
              }
            </button>
            <Link to="/my-orders" className="btn-secondary inline-flex items-center justify-center gap-2">
              My Orders
            </Link>
          </div>

          <p className="text-xs mt-6" style={{ color: 'var(--c-text-muted)' }}>
            Still having issues?{' '}
            <a href={`mailto:${CONTACT.email}`} className="underline" style={{ color: 'var(--c-primary)' }}>
              Contact support
            </a>
          </p>
        </div>
      </main>
    )
  }

  // ──────────────────────────────────────────────────────────────────────────────
  //  ERROR
  // ──────────────────────────────────────────────────────────────────────────────
  return (
    <main className="page-transition flex-1 flex items-center justify-center py-40 px-4"
      style={{ background: 'var(--c-bg)' }}>
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
          <AlertIcon />
        </div>
        <p className="section-eyebrow mb-2">Verification Failed</p>
        <h1 className="font-display text-3xl mb-4" style={{ color: 'var(--c-primary)' }}>
          Could Not Verify
        </h1>
        <p className="mb-8" style={{ color: 'var(--c-text-muted)' }}>
          {errorMsg || 'We could not verify your payment at this time. Your payment may still have gone through.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={verify}
            disabled={retrying}
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            {retrying
              ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><circle cx="12" cy="12" r="10" strokeOpacity=".2"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg><span>Retrying...</span></>
              : <><RefreshIcon /><span>Try Again</span></>
            }
          </button>
          <a
            href={`mailto:${CONTACT.email}?subject=Payment Verification Issue&body=Reference: ${reference}`}
            className="btn-secondary inline-flex items-center justify-center gap-2"
          >
            Contact Support
          </a>
        </div>

        <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--c-border)' }}>
          <Link to="/my-orders" className="text-sm underline" style={{ color: 'var(--c-text-muted)' }}>
            Check My Orders
          </Link>
        </div>
      </div>
    </main>
  )
}
