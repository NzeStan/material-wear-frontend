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

const STATUS_STYLE = {
  success: { bg: 'rgba(6,78,59,0.1)',    color: '#065F46', label: 'Success' },
  pending: { bg: 'rgba(245,158,11,0.1)', color: '#B45309', label: 'Pending' },
  failed:  { bg: 'rgba(220,38,38,0.1)',  color: '#991B1B', label: 'Failed'  },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { bg: '#F3F4F6', color: '#6B7280', label: status }
  return (
    <span className="px-2 py-0.5 text-xs font-semibold rounded" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

const ORDER_TYPE_LABEL = {
  NyscKitOrder:  'NYSC Kit',
  NyscTourOrder: 'NYSC Tour',
  ChurchOrder:   'Church Item',
}

function orderTypeLabel(t) {
  return ORDER_TYPE_LABEL[t] || t || 'Order'
}

// ── transaction card ──────────────────────────────────────────────────────────

function TransactionCard({ tx }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{ background: 'white', border: '1px solid var(--c-border)', borderRadius: 8, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-mono font-semibold truncate" style={{ color: 'var(--c-text)' }}>
            {tx.reference}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>
            {formatDate(tx.created)} · {tx.order_count} order{tx.order_count !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold mb-1" style={{ color: 'var(--c-primary)' }}>{fmt(tx.amount)}</p>
          <StatusBadge status={tx.status} />
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ color: 'var(--c-text-muted)', flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {expanded && (
        <div className="px-5 pb-4 pt-1 border-t" style={{ borderColor: 'var(--c-border)' }}>
          {(tx.orders || []).map(order => (
            <div key={order.id} className="flex items-center justify-between gap-3 text-xs py-2 border-b last:border-0"
              style={{ borderColor: 'var(--c-border)' }}>
              <div className="min-w-0">
                <p className="font-medium truncate" style={{ color: 'var(--c-text)' }}>
                  {orderTypeLabel(order.order_type)} — #{order.serial_number}
                </p>
                <p style={{ color: 'var(--c-text-muted)' }}>
                  {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold" style={{ color: 'var(--c-text)' }}>{fmt(order.total_cost)}</p>
                <p style={{ color: order.paid ? '#065F46' : '#B45309' }}>{order.paid ? 'Paid' : 'Unpaid'}</p>
              </div>
            </div>
          ))}
          <Link
            to="/orders"
            className="inline-block mt-3 text-xs font-semibold underline"
            style={{ color: 'var(--c-primary)' }}
          >
            View in My Orders →
          </Link>
        </div>
      )}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{ background: 'white', border: '1px solid var(--c-border)', borderRadius: 8, overflow: 'hidden' }}>
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="flex-1">
          <div className="skeleton h-3.5 w-40 mb-2 rounded" />
          <div className="skeleton h-3 w-28 rounded" />
        </div>
        <div className="text-right">
          <div className="skeleton h-4 w-20 mb-1.5 rounded" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>
      </div>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function PaymentHistory() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [page, setPage]       = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [nextUrl, setNextUrl] = useState(null)
  const [prevUrl, setPrevUrl] = useState(null)

  useEffect(() => {
    document.title = 'Payment History — Material Wear Limited'
  }, [])

  useEffect(() => {
    fetchTransactions(page)
  }, [page])

  async function fetchTransactions(pg) {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get(`/payment/transactions/?page=${pg}`)
      const items = Array.isArray(data) ? data : (data.results ?? [])
      setTransactions(items)
      setTotalCount(Array.isArray(data) ? items.length : (data.count ?? items.length))
      setNextUrl(Array.isArray(data) ? null : (data.next ?? null))
      setPrevUrl(Array.isArray(data) ? null : (data.previous ?? null))
    } catch (e) {
      setError(e.message || 'Failed to load payment history')
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
            <p className="section-eyebrow mb-1">Billing</p>
            <h1 className="font-display text-3xl" style={{ color: 'var(--c-primary)' }}>Payment History</h1>
          </div>
          {!loading && (
            <button
              onClick={() => fetchTransactions(page)}
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
            <button onClick={() => fetchTransactions(page)} className="text-xs font-semibold" style={{ color: '#DC2626' }}>Retry</button>
          </div>
        )}

        {/* Skeletons */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Transactions list */}
        {!loading && !error && (
          transactions.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 text-center"
              style={{ background: 'white', border: '1px solid var(--c-border)', borderRadius: 8 }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
                style={{ color: '#E5E7EB', marginBottom: 12 }}>
                <rect x="1" y="4" width="22" height="16" rx="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--c-text)' }}>No payments yet</p>
              <p className="text-xs mb-6" style={{ color: 'var(--c-text-muted)' }}>
                Your Paystack payment attempts will appear here once you check out.
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
            <div>
              <p className="text-sm mb-4" style={{ color: 'var(--c-text-muted)' }}>
                {totalCount} payment{totalCount !== 1 ? 's' : ''}
              </p>
              <div className="space-y-4">
                {transactions.map(tx => (
                  <TransactionCard key={tx.id} tx={tx} />
                ))}
              </div>
              {(prevUrl || nextUrl) && (
                <div className="flex items-center justify-between mt-5">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!prevUrl}
                    className="px-4 py-2 text-sm font-medium"
                    style={{ border: '1px solid var(--c-border)', background: 'white', color: 'var(--c-text)', opacity: prevUrl ? 1 : 0.45, cursor: prevUrl ? 'pointer' : 'not-allowed' }}
                  >
                    Previous
                  </button>
                  <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>Page {page}</p>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={!nextUrl}
                    className="px-4 py-2 text-sm font-medium"
                    style={{ border: '1px solid var(--c-border)', background: 'white', color: 'var(--c-text)', opacity: nextUrl ? 1 : 0.45, cursor: nextUrl ? 'pointer' : 'not-allowed' }}
                  >
                    Next
                  </button>
                </div>
              )}
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
      `}</style>
    </main>
  )
}
