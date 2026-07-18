import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { CONTACT } from '../../config/constants'
const RECENT_BULK_ORDER_IDS_KEY = 'mw_recent_bulk_order_ids'

// ── Icons ──────────────────────────────────────────────────────────────────────
const SpinnerIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
    <circle cx="12" cy="12" r="10" strokeOpacity=".2"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
  </svg>
)
const PackageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)
const LockIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const AlertIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const CheckCircleIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const ClockIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const ExternalLinkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)
const ArrowRightIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
)
const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatDateFull(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function getRememberedBulkOrderIds() {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_BULK_ORDER_IDS_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch {
    return []
  }
}

async function fetchOrdersWithRemembered(apiOrders) {
  const existing = Array.isArray(apiOrders) ? apiOrders : []
  const knownIds = new Set(existing.map(order => order.id))
  const rememberedIds = getRememberedBulkOrderIds().filter(id => !knownIds.has(id))

  if (!rememberedIds.length) return existing

  const rememberedOrders = await Promise.allSettled(
    rememberedIds.map(id => api.get(`/bulk_orders/orders/${id}/`))
  )

  const recovered = rememberedOrders
    .filter(result => result.status === 'fulfilled' && result.value?.id)
    .map(result => result.value)

  return [...recovered, ...existing]
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function MyOrders() {
  const { isAuthenticated, loading: authLoading, user } = useAuth()
  const navigate = useNavigate()

  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [payingId, setPayingId] = useState(null)
  const [payError, setPayError] = useState('')

  useEffect(() => {
    document.title = 'My Orders — Material Wear'
    return () => { document.title = 'Material Wear Limited' }
  }, [])

  // Auth guard
  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      navigate('/login?next=/my-orders', { replace: true })
    }
  }, [authLoading, isAuthenticated, navigate])

  // Load orders
  useEffect(() => {
    if (authLoading || !isAuthenticated) return
    ;(async () => {
      try {
        const data = await api.get('/bulk_orders/orders/')
        const apiOrders = Array.isArray(data) ? data : (data?.results ?? [])
        setOrders(await fetchOrdersWithRemembered(apiOrders))
      } catch (err) {
        setError(err.message || 'Failed to load orders.')
      } finally {
        setLoading(false)
      }
    })()
  }, [authLoading, isAuthenticated])

  async function handlePay(order) {
    setPayingId(order.id)
    setPayError('')
    try {
      const data = await api.post(`/bulk_orders/orders/${order.id}/initialize_payment/`, {
        callback_url: `${window.location.origin}/payment/verify`,
      })
      window.location.href = data.authorization_url
    } catch (err) {
      setPayError(err.message || 'Payment initialization failed. Please try again.')
      setPayingId(null)
    }
  }

  async function reload() {
    setLoading(true)
    setError('')
    try {
      const data = await api.get('/bulk_orders/orders/')
      const apiOrders = Array.isArray(data) ? data : (data?.results ?? [])
      setOrders(await fetchOrdersWithRemembered(apiOrders))
    } catch (err) {
      setError(err.message || 'Failed to reload.')
    } finally {
      setLoading(false)
    }
  }

  // ──────────────────────────────────────────────────────────────────────────────
  //  LOADING / AUTH
  // ──────────────────────────────────────────────────────────────────────────────
  if (authLoading || (loading && !orders.length)) {
    return (
      <main className="page-transition flex-1 flex items-center justify-center py-40"
        style={{ background: 'var(--c-bg)' }}>
        <div className="text-center">
          <SpinnerIcon size={36} />
          <p className="text-sm mt-4" style={{ color: 'var(--c-text-muted)' }}>Loading your orders...</p>
        </div>
      </main>
    )
  }

  const paidOrders   = orders.filter(o => o.paid)
  const unpaidOrders = orders.filter(o => !o.paid)

  // ──────────────────────────────────────────────────────────────────────────────
  //  MAIN RENDER
  // ──────────────────────────────────────────────────────────────────────────────
  return (
    <main className="page-transition flex-1" style={{ background: 'var(--c-bg)' }}>

      {/* ── PAGE HEADER ───────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-28 pb-16 px-4"
        style={{ background: 'var(--c-primary)' }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg,rgba(255,255,255,0.03) 0,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,rgba(255,255,255,0.03) 0,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 40px)',
          }} />
        <div className="max-w-5xl mx-auto relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
                My Account
              </p>
              <h1 className="font-display text-4xl sm:text-5xl text-white">My Orders</h1>
              {user && (
                <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  Showing orders for <strong style={{ color: 'rgba(255,255,255,0.9)' }}>{user.email}</strong>
                </p>
              )}
            </div>

            {/* Summary pills */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
                <PackageIcon />
                <span>{orders.length} total</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                style={{ background: 'rgba(16,185,129,0.2)', color: '#6ee7b7' }}>
                <CheckCircleIcon />
                <span>{paidOrders.length} paid</span>
              </div>
              {unpaidOrders.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                  style={{ background: 'rgba(245,158,11,0.2)', color: '#fcd34d' }}>
                  <ClockIcon />
                  <span>{unpaidOrders.length} pending</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENT ───────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-12">

        {/* Global pay error */}
        {payError && (
          <div className="flex items-start gap-2 p-4 rounded-xl text-sm mb-6"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertIcon />
            <span>{payError}</span>
          </div>
        )}

        {/* Loading error */}
        {error && (
          <div className="flex items-center justify-between p-4 rounded-xl mb-6"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="flex items-center gap-2 text-sm">
              <AlertIcon /><span>{error}</span>
            </div>
            <button onClick={reload} className="text-sm underline flex items-center gap-1">
              <RefreshIcon /> Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && orders.length === 0 && !error && (
          <EmptyState />
        )}

        {/* Unpaid orders (action needed) */}
        {unpaidOrders.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="font-display text-xl" style={{ color: 'var(--c-primary)' }}>
                Awaiting Payment
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(245,158,11,0.15)', color: '#92400e' }}>
                {unpaidOrders.length}
              </span>
            </div>
            <div className="space-y-4">
              {unpaidOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onPay={handlePay}
                  paying={payingId === order.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Paid orders */}
        {paidOrders.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="font-display text-xl" style={{ color: 'var(--c-primary)' }}>
                Completed Orders
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(16,185,129,0.12)', color: '#065f46' }}>
                {paidOrders.length}
              </span>
            </div>
            <div className="space-y-4">
              {paidOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}

        {/* Refresh */}
        {orders.length > 0 && (
          <div className="text-center mt-10">
            <button
              onClick={reload}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ border: '1.5px solid var(--c-border)', color: 'var(--c-text-muted)', background: '#fff' }}
            >
              {loading ? <SpinnerIcon size={14} /> : <RefreshIcon />}
              <span>Refresh Orders</span>
            </button>
          </div>
        )}
      </section>
    </main>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  ORDER CARD
// ══════════════════════════════════════════════════════════════════════════════
function OrderCard({ order, onPay, paying }) {
  const [expanded, setExpanded] = useState(false)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

  const sourceOrder = detail || order
  const isPaid     = sourceOrder.paid
  const orgName    = sourceOrder.bulk_order?.organization_name   ?? '—'
  const orgSlug    = sourceOrder.bulk_order?.slug                ?? ''
  const deadline   = sourceOrder.bulk_order?.payment_deadline
  const isExpired  = sourceOrder.bulk_order?.is_expired

  const deadlineFormatted = deadline ? formatDateFull(deadline) : null
  const isDeadlineSoon    = deadline && !isExpired && ((new Date(deadline) - new Date()) < 86400000 * 3)

  useEffect(() => {
    if (!expanded || detail) return
    ;(async () => {
      setDetailLoading(true)
      setDetailError('')
      try {
        const data = await api.get(`/bulk_orders/orders/${order.id}/`)
        setDetail(data)
      } catch (err) {
        setDetailError(err.message || 'Could not load order details.')
      } finally {
        setDetailLoading(false)
      }
    })()
  }, [expanded, detail, order.id])

  return (
    <div
      className="rounded-2xl overflow-hidden transition-shadow hover:shadow-md"
      style={{ border: `1.5px solid ${isPaid ? 'rgba(16,185,129,0.25)' : isExpired ? 'rgba(239,68,68,0.25)' : 'var(--c-border)'}`, background: '#fff' }}
    >
      {/* Card header */}
      <div
        className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{
          background: isPaid
            ? 'rgba(16,185,129,0.04)'
            : isExpired
              ? 'rgba(239,68,68,0.04)'
              : 'var(--c-bg-warm)',
        }}
      >
        <div className="flex items-start gap-3 min-w-0">
          {/* Status indicator */}
          <div
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5"
            style={{
              background: isPaid ? 'rgba(16,185,129,0.12)' : isExpired ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.12)',
              color:       isPaid ? '#10b981'              : isExpired ? '#ef4444'              : '#f59e0b',
            }}
          >
            {isPaid
              ? <CheckCircleIcon size={18} />
              : isExpired
                ? <AlertIcon size={18} />
                : <ClockIcon size={18} />
            }
          </div>

          <div className="min-w-0">
            <p className="font-display text-base truncate" style={{ color: 'var(--c-primary)' }}>
              {orgName}
            </p>
            <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--c-text-muted)' }}>
              {order.reference}
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:flex-shrink-0">
          {/* Status badge */}
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: isPaid ? 'rgba(16,185,129,0.12)' : isExpired ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.12)',
              color:       isPaid ? '#065f46'              : isExpired ? '#b91c1c'              : '#92400e',
            }}
          >
            {isPaid ? 'Paid' : isExpired ? 'Expired' : 'Unpaid'}
          </span>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'var(--c-text-muted)', background: 'transparent', border: '1px solid var(--c-border)' }}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Quick info strip */}
      <div className="px-5 sm:px-6 py-3 flex flex-wrap gap-x-6 gap-y-1 text-sm border-b"
        style={{ borderColor: 'var(--c-border)' }}>
        <span style={{ color: 'var(--c-text-muted)' }}>
          Size: <strong style={{ color: 'var(--c-text)' }}>{order.size}</strong>
        </span>
        <span style={{ color: 'var(--c-text-muted)' }}>
          Name: <strong style={{ color: 'var(--c-text)' }}>{order.full_name}</strong>
        </span>
        <span style={{ color: 'var(--c-text-muted)' }}>
          Placed: <strong style={{ color: 'var(--c-text)' }}>{formatDate(order.created_at)}</strong>
        </span>
        {order.serial_number && (
          <span style={{ color: 'var(--c-text-muted)' }}>
            No: <strong style={{ color: 'var(--c-text)' }}>#{order.serial_number}</strong>
          </span>
        )}
      </div>

      {/* ── EXPANDED DETAILS ──── */}
      {expanded && (
        <div className="px-5 sm:px-6 py-5">
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Order details */}
            <div>
              <h4 className="text-xs uppercase tracking-widest mb-3 font-semibold" style={{ color: 'var(--c-text-muted)' }}>
                Order Details
              </h4>
              <div className="space-y-0">
                <DetailRow label="Reference"    value={<span className="font-mono text-xs">{sourceOrder.reference}</span>} />
                <DetailRow label="Full Name"    value={sourceOrder.full_name} />
                <DetailRow label="Email"        value={sourceOrder.email} />
                <DetailRow label="Size"         value={sourceOrder.size} />
                {sourceOrder.custom_name && (
                  <DetailRow label="Custom Text"  value={sourceOrder.custom_name} />
                )}
                <DetailRow label="Order #"      value={sourceOrder.serial_number ? `#${sourceOrder.serial_number}` : '—'} />
                <DetailRow label="Date Placed"  value={formatDateFull(sourceOrder.created_at)} />
                {isPaid && <DetailRow label="Paid On"     value={formatDateFull(sourceOrder.updated_at)} />}
              </div>
            </div>

            {/* Group order info */}
            <div>
              <h4 className="text-xs uppercase tracking-widest mb-3 font-semibold" style={{ color: 'var(--c-text-muted)' }}>
                Group Order Info
              </h4>
              <div className="space-y-0">
                <DetailRow label="Organisation" value={orgName} />
                <DetailRow label="Deadline"     value={deadlineFormatted} />
                <DetailRow label="Status"       value={
                  isExpired
                    ? <span style={{ color: '#ef4444', fontWeight: 600 }}>Closed</span>
                    : <span style={{ color: '#10b981', fontWeight: 600 }}>Active</span>
                } />
              </div>

              {/* View group order link */}
              {orgSlug && !isExpired && (
                <Link
                  to={`/bulk-order/${orgSlug}`}
                  className="inline-flex items-center gap-1.5 text-xs mt-4 underline"
                  style={{ color: 'var(--c-primary)' }}
                >
                  View Group Order Page <ExternalLinkIcon />
                </Link>
              )}
            </div>
          </div>

          {/* Deadline warning */}
          {!isPaid && !isExpired && isDeadlineSoon && (
            <div className="mt-5 p-3 rounded-xl flex items-start gap-2 text-sm"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#92400e' }}>
              <ClockIcon size={14} />
              <span>
                Deadline approaching — pay before{' '}
                <strong>{deadlineFormatted}</strong>
              </span>
            </div>
          )}

          {/* Expired warning */}
          {!isPaid && isExpired && (
            <div className="mt-5 p-3 rounded-xl flex items-start gap-2 text-sm"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#b91c1c' }}>
              <AlertIcon size={14} />
              <span>
                This order expired on {deadlineFormatted}. Payment is no longer accepted.
                Contact the organiser for assistance.
              </span>
            </div>
          )}

          {detailLoading && (
            <p className="text-xs mt-4" style={{ color: 'var(--c-text-muted)' }}>
              Loading latest order details...
            </p>
          )}
          {detailError && (
            <p className="text-xs mt-4" style={{ color: '#b91c1c' }}>{detailError}</p>
          )}
        </div>
      )}

      {/* ── PAY BUTTON ──────────────────────────────────────────────────────────── */}
      {!isPaid && !isExpired && (
        <div className="px-5 sm:px-6 pb-5 pt-4 border-t" style={{ borderColor: 'var(--c-border)' }}>
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            <button
              onClick={() => onPay(order)}
              disabled={paying}
              className="btn-primary flex items-center justify-center gap-2 py-3 px-6"
            >
              {paying
                ? <><SpinnerIcon size={15} /><span>Redirecting to Paystack...</span></>
                : <><LockIcon size={15} /><span>Pay Now</span><ArrowRightIcon /></>
              }
            </button>
            {deadlineFormatted && (
              <p className="text-xs pt-3" style={{ color: 'var(--c-text-muted)' }}>
                Pay before <strong style={{ color: 'var(--c-text)' }}>{deadlineFormatted}</strong>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Paid footer */}
      {isPaid && (
        <div className="px-5 sm:px-6 pb-4 pt-3 border-t flex items-center gap-2 text-xs"
          style={{ borderColor: 'rgba(16,185,129,0.15)', color: '#065f46' }}>
          <CheckCircleIcon size={13} />
          <span>Payment confirmed. A receipt was sent to your email.</span>
        </div>
      )}
    </div>
  )
}

// ── Detail row ─────────────────────────────────────────────────────────────────
function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3 py-2 border-b last:border-0 text-sm"
      style={{ borderColor: 'var(--c-border)' }}>
      <span style={{ color: 'var(--c-text-muted)' }}>{label}</span>
      <span className="font-medium text-right" style={{ color: 'var(--c-text)', maxWidth: '55%', wordBreak: 'break-all' }}>
        {value ?? '—'}
      </span>
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="text-center py-24">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ background: 'var(--c-bg-warm)', color: 'var(--c-text-muted)' }}>
        <PackageIcon />
      </div>
      <p className="section-eyebrow mb-2">Nothing here yet</p>
      <h2 className="font-display text-3xl mb-4" style={{ color: 'var(--c-primary)' }}>No Orders Found</h2>
      <p className="max-w-sm mx-auto mb-8" style={{ color: 'var(--c-text-muted)' }}>
        You have not placed any bulk orders yet. Ask your group organiser for a group order link to get started.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/" className="btn-primary inline-flex items-center justify-center gap-2">
          Back to Home
        </Link>
        <a href={`mailto:${CONTACT.email}`} className="btn-secondary inline-flex items-center justify-center gap-2">
          Contact Us
        </a>
      </div>
    </div>
  )
}
