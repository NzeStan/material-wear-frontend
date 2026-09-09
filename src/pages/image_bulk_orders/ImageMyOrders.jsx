import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { CONTACT } from '../../config/constants'

// ── Icons ──────────────────────────────────────────────────────────────────────
const SpinnerIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
    <circle cx="12" cy="12" r="10" strokeOpacity=".2"/>
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const ClockIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const ChevronUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
)
const LockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const ImageIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)
const EmptyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  </svg>
)

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(v) {
  return `₦${Number(v || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

function deadlineInfo(deadline) {
  if (!deadline) return null
  const diff = new Date(deadline) - new Date()
  const days  = Math.floor(diff / 86400000)
  if (diff <= 0) return { expired: true, days: 0 }
  return { expired: false, days }
}

// ── Order row ──────────────────────────────────────────────────────────────────
function OrderCard({ order, onPay, paying, onExpand, detailLoading }) {
  const [expanded, setExpanded] = useState(false)

  const dl        = deadlineInfo(order.bulk_order?.payment_deadline)
  const isExpired = dl?.expired
  const warnSoon  = !isExpired && dl?.days <= 3

  const orgName   = order.bulk_order?.organization_name ?? '—'
  const price     = order.bulk_order?.price_per_item
  const hasImage  = !!order.image_url

  const dateStr = new Date(order.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  function handleToggle() {
    const nextExpanded = !expanded
    setExpanded(nextExpanded)
    if (nextExpanded) onExpand(order.id)
  }

  return (
    <div
      className="rounded-2xl overflow-hidden transition-shadow duration-200"
      style={{
        border: `1.5px solid ${order.paid ? 'rgba(16,185,129,0.25)' : isExpired ? 'rgba(239,68,68,0.2)' : 'var(--c-border)'}`,
        background: 'var(--c-surface)',
        boxShadow: expanded ? '0 8px 32px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Card header */}
      <div
        className="px-5 py-4 flex items-center justify-between gap-4 cursor-pointer select-none"
        style={{ background: order.paid ? 'rgba(16,185,129,0.04)' : isExpired ? 'rgba(239,68,68,0.03)' : 'var(--c-bg-warm)', borderBottom: expanded ? '1px solid var(--c-border)' : 'none' }}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Status dot */}
          <div
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: order.paid ? 'rgba(16,185,129,0.12)' : isExpired ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.12)',
              color: order.paid ? '#10b981' : isExpired ? '#ef4444' : '#f59e0b',
            }}
          >
            {order.paid ? <CheckIcon /> : isExpired ? <AlertIcon /> : <ClockIcon />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm truncate" style={{ color: 'var(--c-text)' }}>
                {orgName}
              </p>
              {hasImage && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#92400e', border: '1px solid rgba(245,158,11,0.25)' }}>
                  <ImageIcon size={11} /> Image
                </span>
              )}
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>
              <span className="font-mono">{order.reference}</span>
              {' · '}{dateStr}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Status badge */}
          <span
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: order.paid ? 'rgba(16,185,129,0.1)' : isExpired ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.1)',
              color: order.paid ? '#065f46' : isExpired ? '#b91c1c' : '#92400e',
            }}
          >
            {order.paid ? 'Paid' : isExpired ? 'Expired' : 'Pending'}
          </span>
          <span style={{ color: 'var(--c-text-muted)' }}>
            {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </span>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="px-5 py-5 space-y-5">
          {detailLoading && (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--c-text-muted)' }}>
              <SpinnerIcon />
              <span>Refreshing order details...</span>
            </div>
          )}

          {/* Warnings */}
          {!order.paid && isExpired && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.07)', color: '#b91c1c', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertIcon />
              <span>
                This order&apos;s payment window has closed. Contact us if you still wish to pay.
              </span>
            </div>
          )}

          {!order.paid && !isExpired && warnSoon && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-sm"
              style={{ background: 'rgba(245,158,11,0.07)', color: '#92400e', border: '1px solid rgba(245,158,11,0.25)' }}>
              <ClockIcon size={14} />
              <span>
                Only <strong>{dl.days} day{dl.days !== 1 ? 's' : ''}</strong> left to pay.
                The deadline is{' '}
                <strong>
                  {new Date(order.bulk_order.payment_deadline).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </strong>.
              </span>
            </div>
          )}

          {/* Details grid */}
          <div className="grid sm:grid-cols-2 gap-x-8">
            {[
              ['Organisation', orgName],
              ['Full Name',    order.full_name],
              ['Email',        order.email],
              ['Size',         order.size],
              ['Reference',    <span key="reference-value" className="font-mono text-xs">{order.reference}</span>],
              ['Custom Text',  order.custom_name || null],
              ['Serial #',     `#${order.serial_number}`],
              ['Date Placed',  dateStr],
            ].filter(([, v]) => v !== null && v !== undefined && v !== '').map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 text-sm border-b" style={{ borderColor: 'var(--c-border)' }}>
                <span style={{ color: 'var(--c-text-muted)' }}>{label}</span>
                <span className="font-medium text-right" style={{ color: 'var(--c-text)' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Price row */}
          {price && (
            <div className="rounded-xl p-4 flex items-center justify-between"
              style={{ background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)' }}>
              <span className="text-sm" style={{ color: 'var(--c-text-muted)' }}>Price per item (+ 7.5% VAT)</span>
              <span className="font-display text-xl font-bold" style={{ color: 'var(--c-primary)' }}>
                {fmt(price)}
              </span>
            </div>
          )}

          {/* Image preview */}
          {hasImage && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--c-border)' }}>
              <div className="px-4 py-2.5 flex items-center gap-2"
                style={{ background: 'var(--c-bg-warm)', borderBottom: '1px solid var(--c-border)' }}>
                <ImageIcon size={14} />
                <span className="text-sm font-medium" style={{ color: 'var(--c-primary)' }}>Uploaded Image</span>
              </div>
              <img src={order.image_url} alt="Order image" className="w-full object-cover" style={{ maxHeight: 200 }} />
            </div>
          )}

          {/* Action row */}
          {!order.paid && !isExpired && (
            <button
              onClick={() => onPay(order)}
              disabled={paying === order.id}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {paying === order.id
                ? <><SpinnerIcon /><span>Redirecting...</span></>
                : <><LockIcon /><span>Pay Now</span></>
              }
            </button>
          )}

          {order.paid && (
            <div className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(16,185,129,0.08)', color: '#065f46', border: '1px solid rgba(16,185,129,0.2)' }}>
              <CheckIcon /> Payment Complete
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function ImageMyOrders() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [paying, setPaying]   = useState(null) // order.id being paid
  const [loadingOrderId, setLoadingOrderId] = useState(null)

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?next=/image-my-orders', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  useEffect(() => {
    document.title = 'My Image Orders — Material Wear'
    return () => { document.title = 'Material Wear Limited' }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    ;(async () => {
      try {
        const data = await api.get('/image_bulk_orders/orders/')
        setOrders(Array.isArray(data) ? data : (data?.results ?? []))
      } catch (err) {
        setError(err.message || 'Failed to load orders.')
      } finally {
        setLoading(false)
      }
    })()
  }, [isAuthenticated])

  async function handlePay(order) {
    setPaying(order.id)
    try {
      const data = await api.post(`/image_bulk_orders/orders/${order.id}/initialize_payment/`, {
        callback_url: `${window.location.origin}/image-payment/verify?order_id=${order.id}`,
      })
      window.location.href = data.authorization_url
    } catch (err) {
      setError(err.message || 'Payment initialization failed.')
      setPaying(null)
    }
  }

  async function handleExpand(orderId) {
    if (loadingOrderId === orderId) return

    const existing = orders.find(order => order.id === orderId)
    if (existing?.__detailLoaded) return

    setLoadingOrderId(orderId)
    try {
      const detail = await api.get(`/image_bulk_orders/orders/${orderId}/`)
      setOrders(prev => prev.map(order => (
        order.id === orderId ? { ...detail, __detailLoaded: true } : order
      )))
    } catch (err) {
      setError(err.message || 'Could not load this order detail.')
    } finally {
      setLoadingOrderId(null)
    }
  }

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <main className="page-transition flex-1 flex items-center justify-center py-40" style={{ background: 'var(--c-bg)' }}>
        <SpinnerIcon size={32} />
      </main>
    )
  }

  const unpaidOrders = orders.filter(o => !o.paid)
  const paidOrders   = orders.filter(o =>  o.paid)
  const withImages   = orders.filter(o => !!o.image_url)

  return (
    <main className="page-transition flex-1" style={{ background: 'var(--c-bg)' }}>

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-16 px-4" style={{ background: 'var(--c-primary)' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg,rgba(255,255,255,0.03) 0,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,rgba(255,255,255,0.03) 0,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 40px)',
          }}
        />
        <div className="max-w-4xl mx-auto relative">
          <p className="section-eyebrow mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>Account</p>
          <h1 className="font-display text-4xl sm:text-5xl text-white mb-3 tracking-tight">
            My Image Orders
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)' }}>
            Track all your image bulk order registrations and payments
          </p>

          {/* Summary pills */}
          {!loading && orders.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-7">
              {[
                { label: 'Total Orders',    val: orders.length,       color: 'rgba(255,255,255,0.12)', text: 'rgba(255,255,255,0.9)' },
                { label: 'Paid',            val: paidOrders.length,   color: 'rgba(16,185,129,0.25)',  text: '#6ee7b7' },
                { label: 'Pending Payment', val: unpaidOrders.length, color: 'rgba(245,158,11,0.2)',   text: '#fde68a' },
                { label: 'With Images',     val: withImages.length,   color: 'rgba(245,158,11,0.15)',  text: '#fde68a' },
              ].map(({ label, val, color, text }) => (
                <div key={label} className="px-4 py-2 rounded-full text-sm"
                  style={{ background: color, color: text, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span className="font-bold">{val}</span>
                  <span className="ml-1.5 text-xs opacity-80">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── BODY ──────────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-12">

        {/* Global error */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl mb-6 text-sm"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertIcon /> {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-24">
            <SpinnerIcon size={32} />
            <p className="text-sm mt-4" style={{ color: 'var(--c-text-muted)' }}>Loading your image orders...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && orders.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'var(--c-bg-warm)', color: 'var(--c-text-muted)' }}>
              <EmptyIcon />
            </div>
            <p className="section-eyebrow mb-2">Nothing Here Yet</p>
            <h2 className="font-display text-2xl mb-4" style={{ color: 'var(--c-primary)' }}>
              No Image Orders Found
            </h2>
            <p className="max-w-xs mx-auto mb-8" style={{ color: 'var(--c-text-muted)' }}>
              You have not placed any image bulk orders yet.
              If you have an order link, visit it to place your order.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/" className="btn-primary inline-flex items-center gap-2 justify-center">
                Back to Home
              </Link>
              <Link to="/my-orders" className="btn-secondary inline-flex items-center gap-2 justify-center">
                View Standard Orders
              </Link>
            </div>
          </div>
        )}

        {/* Orders list */}
        {!loading && orders.length > 0 && (
          <div className="space-y-10">

            {/* Unpaid orders */}
            {unpaidOrders.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="font-display text-xl" style={{ color: 'var(--c-primary)' }}>
                    Awaiting Payment
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(245,158,11,0.1)', color: '#92400e' }}>
                    {unpaidOrders.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {unpaidOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onPay={handlePay}
                      paying={paying}
                      onExpand={handleExpand}
                      detailLoading={loadingOrderId === order.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Paid orders */}
            {paidOrders.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="font-display text-xl" style={{ color: 'var(--c-primary)' }}>
                    Completed Orders
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(16,185,129,0.1)', color: '#065f46' }}>
                    {paidOrders.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {paidOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onPay={handlePay}
                      paying={paying}
                      onExpand={handleExpand}
                      detailLoading={loadingOrderId === order.id}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Navigation */}
        {!loading && (
          <div className="flex flex-wrap gap-4 justify-center mt-12 pt-8" style={{ borderTop: '1px solid var(--c-border)' }}>
            <Link to="/my-orders" className="text-sm underline" style={{ color: 'var(--c-text-muted)' }}>
              Standard Bulk Orders
            </Link>
            <span style={{ color: 'var(--c-border)' }}>|</span>
            <Link to="/profile" className="text-sm underline" style={{ color: 'var(--c-text-muted)' }}>
              My Profile
            </Link>
            <span style={{ color: 'var(--c-border)' }}>|</span>
            <a href={`mailto:${CONTACT.email}`} className="text-sm underline" style={{ color: 'var(--c-text-muted)' }}>
              Contact Support
            </a>
          </div>
        )}
      </section>
    </main>
  )
}
