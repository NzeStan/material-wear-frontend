import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../../services/api'
import { useCart } from '../../context/CartContext'
import { CONTACT } from '../../config/constants'

// ── icons ─────────────────────────────────────────────────────────────────────

const SpinnerIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
    <circle cx="12" cy="12" r="10" strokeOpacity=".15"/>
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const ClockIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)
const AlertIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)

// ── helpers ───────────────────────────────────────────────────────────────────

function fmt(amount) {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', minimumFractionDigits: 2,
  }).format(amount)
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

// ── main ──────────────────────────────────────────────────────────────────────

export default function ProductPaymentVerify() {
  const [searchParams] = useSearchParams()
  const reference      = searchParams.get('reference') || searchParams.get('trxref') || ''
  const { fetchCart }  = useCart()

  const [status,   setStatus]   = useState('loading')
  const [data,     setData]     = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    document.title = 'Verifying Payment — Material Wear'
    if (!reference) { setStatus('no-ref'); return }
    verify()
  }, [reference]) // eslint-disable-line

  async function verify() {
    setRetrying(true)
    setErrorMsg('')
    try {
      const res = await api.get(`/payment/verify/?reference=${encodeURIComponent(reference)}`)
      setData(res)
      if (res.paid || res.status === 'success') {
        setStatus('success')
        fetchCart() // cart is now cleared after successful payment
      } else if (res.status === 'pending') {
        setStatus('pending')
      } else {
        setStatus('failed')
        setErrorMsg('Payment was not successful.')
      }
    } catch (e) {
      setErrorMsg(e.message || 'Could not verify payment. Please try again.')
      setStatus('error')
    } finally {
      setRetrying(false)
    }
  }

  // ── loading ────────────────────────────────────────────────────────────────

  if (status === 'loading') {
    return (
      <main className="page-transition flex-1 flex items-center justify-center py-40 px-4" style={{ background: 'var(--c-bg)' }}>
        <div className="text-center">
          <div className="flex justify-center mb-6" style={{ color: 'var(--c-primary)' }}>
            <SpinnerIcon />
          </div>
          <p className="section-eyebrow mb-2">Processing</p>
          <h1 className="font-display text-3xl mb-3" style={{ color: 'var(--c-primary)' }}>Verifying Your Payment</h1>
          <p style={{ color: 'var(--c-text-muted)' }}>Please wait while we confirm your payment status…</p>
        </div>
      </main>
    )
  }

  // ── no reference ───────────────────────────────────────────────────────────

  if (status === 'no-ref') {
    return (
      <main className="page-transition flex-1 flex items-center justify-center py-40 px-4" style={{ background: 'var(--c-bg)' }}>
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--c-accent)' }}>
            <AlertIcon />
          </div>
          <p className="section-eyebrow mb-2">Missing Reference</p>
          <h1 className="font-display text-3xl mb-4" style={{ color: 'var(--c-primary)' }}>No Payment Reference</h1>
          <p className="mb-8" style={{ color: 'var(--c-text-muted)' }}>
            This page requires a payment reference. If you just completed a payment, please check
            your email for your order confirmation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/orders" className="btn-primary inline-flex items-center justify-center gap-2">
              View My Orders
            </Link>
            <Link to="/" className="btn-secondary inline-flex items-center justify-center gap-2">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // ── success ────────────────────────────────────────────────────────────────

  if (status === 'success') {
    return (
      <main className="page-transition flex-1 py-16 px-4" style={{ background: 'var(--c-bg)' }}>
        <div className="max-w-lg mx-auto">

          {/* Success banner */}
          <div
            className="rounded-2xl p-8 mb-6 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,var(--c-primary),#065f46)', boxShadow: '0 8px 40px rgba(6,78,59,0.25)' }}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 10px)', backgroundSize: '14px 14px' }} />
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                <CheckIcon />
              </div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Payment Confirmed
              </p>
              <h1 className="font-display text-4xl text-white mb-2">Payment Successful!</h1>
              <p style={{ color: 'rgba(255,255,255,0.75)' }}>
                Your order has been confirmed. Thank you!
              </p>
            </div>
          </div>

          {/* Receipt */}
          <div className="rounded-2xl overflow-hidden mb-5"
            style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface)', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
            <div className="px-6 py-4 flex items-center gap-2"
              style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-warm)' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                style={{ color: 'var(--c-primary)' }}>
                <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/>
                <line x1="8" y1="7" x2="16" y2="7"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
                <line x1="8" y1="17" x2="12" y2="17"/>
              </svg>
              <h2 className="font-display text-lg" style={{ color: 'var(--c-primary)' }}>Payment Receipt</h2>
            </div>
            <div className="px-6 py-4">
              <InfoRow label="Reference" value={
                <span className="font-mono font-bold" style={{ color: 'var(--c-primary)' }}>
                  {data?.reference}
                </span>
              } />
              <InfoRow label="Customer" value={data?.customer_name} />
              <InfoRow label="Email"    value={data?.email} />
              <InfoRow label="Orders"   value={`${data?.order_count ?? 1} order(s)`} />
              <InfoRow label="Amount Paid" value={
                <span className="font-bold text-base" style={{ color: 'var(--c-primary)' }}>
                  {fmt(data?.amount)}
                </span>
              } />
              <InfoRow label="Status" value={
                <span className="font-semibold" style={{ color: '#10b981' }}>Paid ✓</span>
              } />
            </div>
          </div>

          {/* Email note */}
          <div className="rounded-xl p-4 flex items-start gap-3 text-sm mb-6"
            style={{ background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="flex-shrink-0 mt-0.5" style={{ color: 'var(--c-primary)' }}>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <p style={{ color: 'var(--c-text-muted)' }}>
              A receipt has been sent to{' '}
              <strong style={{ color: 'var(--c-text)' }}>{data?.email}</strong>.
              Please check your inbox (and spam folder).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/orders" className="btn-primary flex-1 flex items-center justify-center gap-2">
              View My Orders
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link to="/collections" className="btn-secondary flex-1 flex items-center justify-center gap-2">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // ── pending ────────────────────────────────────────────────────────────────

  if (status === 'pending') {
    return (
      <main className="page-transition flex-1 py-16 px-4" style={{ background: 'var(--c-bg)' }}>
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--c-accent)' }}>
            <ClockIcon />
          </div>
          <p className="section-eyebrow mb-2">Awaiting Confirmation</p>
          <h1 className="font-display text-3xl mb-4" style={{ color: 'var(--c-primary)' }}>Payment Pending</h1>
          <p className="mb-2" style={{ color: 'var(--c-text-muted)' }}>
            Your payment is being processed. This usually takes a few seconds.
          </p>
          <p className="text-sm mb-8" style={{ color: 'var(--c-text-muted)' }}>
            You will receive a confirmation email once verified.
          </p>

          {data && (
            <div className="rounded-2xl border p-5 text-left mb-6"
              style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-warm)' }}>
              <InfoRow label="Reference" value={
                <span className="font-mono font-bold" style={{ color: 'var(--c-primary)' }}>{data?.reference}</span>
              } />
              <InfoRow label="Email"  value={data?.email} />
              <InfoRow label="Status" value={<span style={{ color: 'var(--c-accent)', fontWeight: 600 }}>Pending</span>} />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={verify} disabled={retrying} className="btn-primary inline-flex items-center justify-center gap-2">
              {retrying
                ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><circle cx="12" cy="12" r="10" strokeOpacity=".2"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>Checking…</>
                : <><RefreshIcon />Check Again</>
              }
            </button>
            <Link to="/orders" className="btn-secondary inline-flex items-center justify-center gap-2">My Orders</Link>
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

  // ── error / failed ─────────────────────────────────────────────────────────

  return (
    <main className="page-transition flex-1 flex items-center justify-center py-40 px-4" style={{ background: 'var(--c-bg)' }}>
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
          <AlertIcon />
        </div>
        <p className="section-eyebrow mb-2">Verification Failed</p>
        <h1 className="font-display text-3xl mb-4" style={{ color: 'var(--c-primary)' }}>Could Not Verify</h1>
        <p className="mb-8" style={{ color: 'var(--c-text-muted)' }}>
          {errorMsg || 'We could not verify your payment at this time. Your payment may still have gone through.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={verify} disabled={retrying} className="btn-primary inline-flex items-center justify-center gap-2">
            {retrying
              ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><circle cx="12" cy="12" r="10" strokeOpacity=".2"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>Retrying…</>
              : <><RefreshIcon />Try Again</>
            }
          </button>
          <a
            href={`mailto:${CONTACT.email}?subject=Payment Verification Issue&body=Reference: ${reference}`}
            className="btn-secondary inline-flex items-center justify-center gap-2"
          >
            Contact Support
          </a>
        </div>

        <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--c-border)' }}>
          <Link to="/orders" className="text-sm underline" style={{ color: 'var(--c-text-muted)' }}>
            Check My Orders
          </Link>
        </div>
      </div>
    </main>
  )
}
