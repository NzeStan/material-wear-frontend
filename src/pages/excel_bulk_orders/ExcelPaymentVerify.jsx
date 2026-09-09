import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../../services/api'

/* ─── helpers ─────────────────────────────────────────────── */
function fmt(val) {
  const n = parseFloat(val)
  if (isNaN(n)) return '—'
  return '₦ ' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
function fmtDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/* ─── icons ────────────────────────────────────────────────── */
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
)
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)
const IconXCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)
const IconTable = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="3" x2="9" y2="21" />
  </svg>
)
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <polyline points="2,4 12,13 22,4" />
  </svg>
)
const IconPrinter = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
)
const IconRefresh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
  </svg>
)
const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)
const IconList = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)

/* ─── main component ───────────────────────────────────────── */
export default function ExcelPaymentVerify() {
  const [params] = useSearchParams()
  const orderId   = params.get('order_id')
  const reference = params.get('reference')

  const [status, setStatus] = useState('loading') // loading | success | pending | error | no-ref
  const [data,   setData]   = useState(null)
  const [err,    setErr]    = useState('')

  const verify = useCallback(async () => {
    if (!orderId) { setStatus('no-ref'); return }
    setStatus('loading')
    try {
      const res = await api.get(`/excel-bulk-orders/${orderId}/verify-payment/`)
      setData(res)
      setStatus(res.paid ? 'success' : 'pending')
    } catch (e) {
      setErr(e.message || 'Verification failed')
      setStatus('error')
    }
  }, [orderId])

  useEffect(() => { verify() }, [verify])

  /* ── no reference ── */
  if (status === 'no-ref') return (
    <div className="page-transition" style={{ minHeight: '100vh', background: 'var(--c-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#ef4444' }}>
          <IconXCircle />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: '0.75rem' }}>Missing Order Reference</h1>
        <p style={{ color: 'var(--c-text-muted)', marginBottom: '2rem' }}>No order ID was provided. Please use the link from your payment confirmation email.</p>
        <Link to="/excel-my-orders" className="btn-primary" style={{ textDecoration: 'none' }}>View My Orders</Link>
      </div>
    </div>
  )

  /* ── loading ── */
  if (status === 'loading') return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, border: '3px solid var(--c-border)', borderTopColor: 'var(--c-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--c-text-muted)', fontWeight: 500 }}>Verifying your payment…</p>
      </div>
    </div>
  )

  /* ── success ── */
  if (status === 'success' && data) {
    const perPerson = data.participants_count > 0
      ? (parseFloat(data.base_amount) / data.participants_count).toFixed(2)
      : '—'
    return (
      <div className="page-transition" style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>
        {/* hero */}
        <div style={{ background: 'linear-gradient(135deg, #14532d 0%, #15803d 60%, #16a34a 100%)', padding: '3rem 1.5rem 4rem', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto 1.5rem' }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 48, height: 48 }}>
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            {/* excel badge */}
            <div style={{ position: 'absolute', bottom: -4, right: -4, width: 32, height: 32, borderRadius: '50%', background: '#166534', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80', fontWeight: 800, fontSize: '0.7rem' }}>XLS</div>
          </div>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 9999, padding: '0.35rem 1rem', marginBottom: '1rem', color: '#bbf7d0', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' }}>PAYMENT CONFIRMED</div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', fontFamily: 'var(--font-display, inherit)' }}>
            {data.title}
          </h1>
          <p style={{ color: '#bbf7d0', fontSize: '1rem' }}>Excel bulk order — coordinator payment received</p>
        </div>

        {/* receipt card */}
        <div style={{ maxWidth: 720, margin: '-2rem auto 0', padding: '0 1rem 3rem', position: 'relative', zIndex: 1 }}>
          <div style={{ background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>

            {/* reference bar */}
            <div style={{ background: 'linear-gradient(135deg, #15803d, #16a34a)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 2 }}>PAYMENT REFERENCE</div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{data.reference || reference || '—'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 2 }}>PAID ON</div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>{fmtDate(data.updated_at)}</div>
              </div>
            </div>

            {/* coordinator info */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--c-border)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--c-text-muted)', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>COORDINATOR DETAILS</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <div style={{ color: 'var(--c-text-muted)', fontSize: '0.78rem', marginBottom: 2 }}>Name</div>
                  <div style={{ color: 'var(--c-text)', fontWeight: 600 }}>{data.coordinator_name || '—'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--c-text-muted)', fontSize: '0.78rem', marginBottom: 2 }}>Email</div>
                  <div style={{ color: 'var(--c-text)', fontWeight: 600, wordBreak: 'break-all' }}>{data.coordinator_email || '—'}</div>
                </div>
                {data.coordinator_phone && (
                  <div>
                    <div style={{ color: 'var(--c-text-muted)', fontSize: '0.78rem', marginBottom: 2 }}>Phone</div>
                    <div style={{ color: 'var(--c-text)', fontWeight: 600 }}>{data.coordinator_phone}</div>
                  </div>
                )}
              </div>
            </div>

            {/* participant summary */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--c-border)', background: 'rgba(22,163,74,0.04)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--c-text-muted)', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>PARTICIPANT SUMMARY</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 10, padding: '0.75rem 1.25rem' }}>
                  <span style={{ color: '#15803d' }}><IconUsers /></span>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)' }}>Participants</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d' }}>{data.participants_count ?? '—'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '0.75rem 1.25rem' }}>
                  <span style={{ color: 'var(--c-text-muted)' }}><IconTable /></span>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)' }}>Per Person</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--c-text)' }}>₦ {perPerson}</div>
                    </div>
                </div>
                {data.validation_status && (
                  <div style={{ marginLeft: 'auto' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#dcfce7', color: '#15803d', borderRadius: 9999, padding: '0.35rem 0.9rem', fontSize: '0.8rem', fontWeight: 700 }}>
                      <IconCheck /> {data.validation_status.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* payment breakdown */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--c-border)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--c-text-muted)', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>PAYMENT BREAKDOWN</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--c-text-muted)', fontSize: '0.9rem' }}>
                  <span>Subtotal ({data.participants_count ?? 0} × ₦ {perPerson})</span>
                  <span style={{ fontWeight: 600, color: 'var(--c-text)' }}>{fmt(data.base_amount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--c-text-muted)', fontSize: '0.9rem' }}>
                  <span>VAT ({data.vat_rate ? `${(parseFloat(data.vat_rate) * 100).toFixed(0)}%` : '—'})</span>
                  <span style={{ fontWeight: 600, color: 'var(--c-text)' }}>{fmt(data.vat_amount)}</span>
                </div>
                <div style={{ height: 1, background: 'var(--c-border)', margin: '0.25rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'var(--c-text)', fontSize: '1rem' }}>Total Paid</span>
                  <span style={{ fontWeight: 800, color: '#15803d', fontSize: '1.25rem' }}>{fmt(data.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* confirmation notice */}
            <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(22,163,74,0.06)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0, color: '#15803d', marginTop: 2 }}><IconMail /></div>
              <p style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                A payment confirmation and participant summary will be sent to <strong style={{ color: 'var(--c-text)' }}>{data.coordinator_email}</strong>. Keep your reference number for records.
              </p>
            </div>
          </div>

          {/* action buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)', color: 'var(--c-text)', padding: '0.75rem 1.5rem', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
              <IconPrinter /> Print Receipt
            </button>
            <Link to="/excel-my-orders" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)', color: 'var(--c-text)', padding: '0.75rem 1.5rem', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
              <IconList /> My Excel Orders
            </Link>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', background: '#15803d', color: '#fff' }}>
              <IconHome /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  /* ── pending ── */
  if (status === 'pending') return (
    <div className="page-transition" style={{ minHeight: '100vh', background: 'var(--c-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 520 }}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(234,179,8,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#ca8a04' }}>
          <IconClock />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--c-text)', marginBottom: '0.75rem' }}>Payment Pending</h1>
        <p style={{ color: 'var(--c-text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
          Your payment for <strong style={{ color: 'var(--c-text)' }}>{data?.title || 'this excel order'}</strong> is being processed.
        </p>
        <p style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Reference: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--c-text)' }}>{data?.reference || reference || '—'}</span>
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={verify} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconRefresh /> Check Again
          </button>
          <Link to="/excel-my-orders" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)', color: 'var(--c-text)', padding: '0.75rem 1.5rem', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
            <IconList /> My Orders
          </Link>
        </div>
        <p style={{ color: 'var(--c-text-muted)', fontSize: '0.78rem', marginTop: '1.5rem' }}>Payments typically confirm within 1–3 minutes.</p>
      </div>
    </div>
  )

  /* ── error ── */
  const subject = encodeURIComponent(`Payment Verification Issue — ${reference || orderId || 'Excel Order'}`)
  const body    = encodeURIComponent(`Hi,\n\nI'm having trouble verifying my payment.\n\nOrder ID: ${orderId || '—'}\nReference: ${reference || '—'}\nError: ${err}\n\nPlease help.`)
  return (
    <div className="page-transition" style={{ minHeight: '100vh', background: 'var(--c-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 520 }}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#ef4444' }}>
          <IconXCircle />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--c-text)', marginBottom: '0.75rem' }}>Verification Failed</h1>
        <p style={{ color: 'var(--c-text-muted)', marginBottom: '0.5rem' }}>{err || 'Something went wrong while verifying your payment.'}</p>
        {(orderId || reference) && (
          <p style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Reference: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--c-text)' }}>{reference || orderId}</span>
          </p>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <button onClick={verify} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconRefresh /> Retry
          </button>
          <a href={`mailto:support@materialwear.com?subject=${subject}&body=${body}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)', color: 'var(--c-text)', padding: '0.75rem 1.5rem', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
            <IconMail /> Email Support
          </a>
        </div>
        <Link to="/" style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem', textDecoration: 'underline' }}>Return to Home</Link>
      </div>
    </div>
  )
}
