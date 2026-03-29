import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

// ── helpers ───────────────────────────────────────────────────────────────────

function fmt(amount) {
  if (amount == null) return '—'
  return `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const ORDER_TYPE_LABEL = {
  NyscKit:    'NYSC Kit',
  NyscTour:   'NYSC Tour',
  ChurchOrder: 'Church Item',
  Church:     'Church Item',
}

function orderTypeLabel(t) {
  return ORDER_TYPE_LABEL[t] || t || 'Order'
}

function orderTypeColor(t) {
  if (!t) return 'var(--c-primary)'
  if (t.includes('Nysc')) return '#0369a1'
  if (t.includes('Church')) return '#7c3aed'
  return 'var(--c-primary)'
}

// ── order card ────────────────────────────────────────────────────────────────

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false)
  const [detail,   setDetail]   = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  async function toggleExpand() {
    if (!expanded && !detail) {
      setDetailLoading(true)
      try {
        const data = await api.get(`/order/${order.id}/`)
        setDetail(data)
      } catch { /* silent — just use list data */ }
      finally { setDetailLoading(false) }
    }
    setExpanded(p => !p)
  }

  const typeColor = orderTypeColor(order.order_type)

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid var(--c-border)',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}
    >
      {/* Header row */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none"
        onClick={toggleExpand}
        style={{ borderBottom: expanded ? '1px solid var(--c-border)' : 'none' }}
      >
        {/* Type badge */}
        <div
          className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded"
          style={{ background: `${typeColor}18`, color: typeColor, letterSpacing: '0.04em' }}
        >
          {orderTypeLabel(order.order_type)}
        </div>

        {/* Serial / ID */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>
            Order #{order.serial_number}
          </p>
          <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
            {formatDate(order.created)} · {order.item_count ?? '—'} item{order.item_count !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Amount + status */}
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold" style={{ color: 'var(--c-primary)' }}>
            {fmt(order.total_cost)}
          </p>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded"
            style={{
              background: order.paid ? '#d1fae5' : '#fef3c7',
              color:      order.paid ? '#065f46' : '#92400e',
            }}
          >
            {order.paid ? 'Paid' : 'Unpaid'}
          </span>
        </div>

        {/* Chevron */}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          style={{ color: 'var(--c-text-muted)' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 py-4">
          {detailLoading ? (
            <div className="flex justify-center py-4">
              <div style={{
                width: 22, height: 22,
                border: '2px solid var(--c-border)', borderTopColor: 'var(--c-primary)',
                borderRadius: '50%', animation: 'spin 0.7s linear infinite',
              }} />
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              {/* Order fields from detail */}
              {detail?.call_up_number && (
                <InfoRow label="Call-Up Number" value={detail.call_up_number} mono />
              )}
              {detail?.state && (
                <InfoRow label="State" value={detail.state} />
              )}
              {detail?.local_government && (
                <InfoRow label="LGA" value={detail.local_government} />
              )}
              {detail?.pickup_on_camp != null && (
                <InfoRow label="Delivery" value={detail.pickup_on_camp ? 'Pick up on camp' : 'Home delivery'} />
              )}
              {detail?.delivery_state && (
                <InfoRow label="Delivery State" value={`${detail.delivery_state}${detail.delivery_lga ? `, ${detail.delivery_lga}` : ''}`} />
              )}

              {/* Items */}
              {detail?.items && detail.items.length > 0 && (
                <div className="pt-3 border-t" style={{ borderColor: 'var(--c-border)' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--c-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Items
                  </p>
                  <div className="space-y-2">
                    {detail.items.map((item, i) => (
                      <div key={i} className="flex justify-between gap-3 text-xs py-2 border-b last:border-0"
                        style={{ borderColor: 'var(--c-border)' }}>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--c-text)' }}>
                            {item.product_name || item.product?.name || 'Product'}
                          </p>
                          {item.extra_fields && Object.keys(item.extra_fields).length > 0 && (
                            <p style={{ color: 'var(--c-text-muted)' }}>
                              {Object.entries(item.extra_fields)
                                .filter(([k]) => !['measurement_id'].includes(k))
                                .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
                                .join(' · ')}
                            </p>
                          )}
                          <p style={{ color: 'var(--c-text-muted)' }}>Qty {item.quantity}</p>
                        </div>
                        <span className="font-semibold" style={{ color: 'var(--c-text)' }}>
                          {fmt(Number(item.price) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Retry payment if unpaid */}
              {!order.paid && (
                <div className="pt-3 border-t" style={{ borderColor: 'var(--c-border)' }}>
                  <div className="flex items-start gap-2 p-3 rounded text-xs mb-3"
                    style={{ background: '#fef3c7', border: '1px solid #fde68a' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2"
                      style={{ flexShrink: 0, marginTop: 1 }}>
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p style={{ color: '#92400e' }}>
                      This order has not been paid for yet. If you already made a payment,
                      contact support with your reference number.
                    </p>
                  </div>
                  <a
                    href={`mailto:${''}`}
                    className="text-xs font-semibold underline"
                    style={{ color: 'var(--c-primary)' }}
                  >
                    Contact support →
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-4 text-xs py-1.5 border-b last:border-0"
      style={{ borderColor: 'var(--c-border)' }}>
      <span style={{ color: 'var(--c-text-muted)', flexShrink: 0 }}>{label}</span>
      <span
        className={mono ? 'font-mono' : ''}
        style={{ color: 'var(--c-text)', fontWeight: 500, wordBreak: 'break-all', textAlign: 'right' }}
      >
        {value ?? '—'}
      </span>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{ background: 'white', border: '1px solid var(--c-border)', borderRadius: 8, overflow: 'hidden' }}>
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="skeleton h-6 w-20 rounded" />
        <div className="flex-1">
          <div className="skeleton h-3.5 w-32 mb-2 rounded" />
          <div className="skeleton h-3 w-24 rounded" />
        </div>
        <div className="text-right">
          <div className="skeleton h-4 w-20 mb-1.5 rounded" />
          <div className="skeleton h-4 w-12 rounded" />
        </div>
      </div>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    document.title = 'My Orders — Material Wear Limited'
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/order/')
      // Handle both array and paginated response
      setOrders(Array.isArray(data) ? data : (data.results || []))
    } catch (e) {
      setError(e.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <main className="flex-1 py-10 px-4" style={{ background: 'var(--c-bg-warm)', minHeight: '80vh' }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="section-eyebrow mb-1">Purchase History</p>
            <h1 className="font-display text-3xl" style={{ color: 'var(--c-primary)' }}>My Orders</h1>
          </div>
          {!loading && (
            <button
              onClick={fetchOrders}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5"
              style={{
                border: '1px solid var(--c-border)', borderRadius: 6,
                color: 'var(--c-text-muted)', background: 'white',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--c-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-muted)'}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Refresh
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 mb-6"
            style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-sm flex-1" style={{ color: '#DC2626' }}>{error}</p>
            <button onClick={fetchOrders} className="text-xs font-semibold" style={{ color: '#DC2626' }}>Retry</button>
          </div>
        )}

        {/* Skeletons */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Orders list */}
        {!loading && !error && (
          orders.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 text-center"
              style={{ background: 'white', border: '1px solid var(--c-border)', borderRadius: 8 }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
                style={{ color: '#E5E7EB', marginBottom: 12 }}>
                <path d="M9 2H15l-1 4H10L9 2z"/>
                <path d="M2 6h20v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z"/>
                <line x1="9" y1="10" x2="15" y2="10"/>
                <line x1="9" y1="14" x2="15" y2="14"/>
              </svg>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--c-text)' }}>No orders yet</p>
              <p className="text-xs mb-6" style={{ color: 'var(--c-text-muted)' }}>
                Your product orders will appear here once you complete a purchase.
              </p>
              <Link
                to="/collections"
                className="text-xs font-semibold px-5 py-2"
                style={{ background: 'var(--c-primary)', color: 'white', borderRadius: 4 }}
              >
                Browse Collections
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )
        )}
      </div>

      <style>{`
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  )
}
