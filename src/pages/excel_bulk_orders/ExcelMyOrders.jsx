import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

/* ─── helpers ──────────────────────────────────────────────── */
function fmt(val) {
  const n = parseFloat(val)
  if (isNaN(n)) return '—'
  return '₦ ' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
function fmtDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmtDateTime(str) {
  if (!str) return '—'
  return new Date(str).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const STATUS_META = {
  pending:    { label: 'Pending',    color: '#ca8a04', bg: 'rgba(234,179,8,0.1)',   border: 'rgba(234,179,8,0.3)' },
  uploaded:   { label: 'Uploaded',   color: '#2563eb', bg: 'rgba(37,99,235,0.1)',   border: 'rgba(37,99,235,0.3)' },
  valid:      { label: 'Valid',      color: '#15803d', bg: 'rgba(22,163,74,0.1)',   border: 'rgba(22,163,74,0.3)' },
  invalid:    { label: 'Invalid',    color: '#dc2626', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)' },
  processing: { label: 'Processing', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.3)' },
  completed:  { label: 'Completed',  color: '#15803d', bg: 'rgba(22,163,74,0.12)', border: 'rgba(22,163,74,0.4)' },
  paid:       { label: 'Paid',       color: '#15803d', bg: 'rgba(22,163,74,0.12)', border: 'rgba(22,163,74,0.4)' },
}

/* ─── icons ────────────────────────────────────────────────── */
const IconTable = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="3" x2="9" y2="21" />
  </svg>
)
const IconChevron = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const IconCash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
)
const IconExternalLink = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const IconRefresh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
  </svg>
)
const IconEmpty = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 48, height: 48 }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="15" x2="15" y2="15" />
    <line x1="9" y1="11" x2="11" y2="11" />
  </svg>
)
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
)
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)
const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

/* ─── pill badge ───────────────────────────────────────────── */
function StatusBadge({ status }) {
  const isPaid = status === 'completed' || status === 'paid'
  const meta   = STATUS_META[status] || STATUS_META['pending']
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, borderRadius: 9999, padding: '0.25rem 0.7rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.03em' }}>
      {isPaid ? <IconCheck /> : <IconClock />}
      {meta.label}
    </span>
  )
}

/* ─── step progress bar ────────────────────────────────────── */
const STEPS = ['pending', 'uploaded', 'valid', 'processing', 'completed']
function StepProgress({ status }) {
  const idx = STEPS.indexOf(status)
  const cur  = idx === -1 ? 0 : idx
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, margin: '0.5rem 0' }}>
      {STEPS.map((s, i) => {
        const done    = i < cur
        const active  = i === cur
        const invalid = status === 'invalid' && s === 'valid'
        const clr     = invalid ? '#dc2626' : done || active ? '#15803d' : 'var(--c-border)'
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: clr, flexShrink: 0, border: active ? `2px solid ${clr}` : 'none', outline: active ? `2px solid rgba(22,163,74,0.25)` : 'none' }} />
            {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: done ? '#15803d' : 'var(--c-border)' }} />}
          </div>
        )
      })}
    </div>
  )
}

/* ─── order card ───────────────────────────────────────────── */
function OrderCard({ order, onDownload }) {
  const [open, setOpen] = useState(false)
  const isPaid    = order.validation_status === 'completed' || order.is_paid
  const needsPay  = order.validation_status === 'valid' && !order.is_paid

  return (
    <div style={{ background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)', borderRadius: 14, overflow: 'hidden', transition: 'box-shadow 0.2s' }}>
      {/* card header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', textAlign: 'left' }}
      >
        {/* left icon */}
        <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 10, background: isPaid ? 'rgba(22,163,74,0.1)' : 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isPaid ? '#15803d' : '#2563eb' }}>
          <IconTable />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--c-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.title}</span>
            <StatusBadge status={isPaid ? 'completed' : order.validation_status} />
          </div>
          <StepProgress status={isPaid ? 'completed' : order.validation_status} />
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--c-text-muted)' }}>
              <IconUsers /> {order.participants_count ?? '—'} participants
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--c-text-muted)' }}>
              <IconCash /> {fmt(order.total_amount || order.base_amount)}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--c-text-muted)' }}>{fmtDate(order.created_at)}</span>
          </div>
        </div>
        <div style={{ flexShrink: 0, color: 'var(--c-text-muted)', marginTop: 4 }}><IconChevron open={open} /></div>
      </button>

      {/* expanded body */}
      {open && (
        <div style={{ borderTop: '1px solid var(--c-border)', padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <InfoRow label="Coordinator" value={order.coordinator_name} />
            <InfoRow label="Email" value={order.coordinator_email} />
            {order.coordinator_phone && <InfoRow label="Phone" value={order.coordinator_phone} />}
            <InfoRow label="Price / person" value={fmt(order.price_per_participant)} />
            <InfoRow label="VAT" value={order.vat_amount ? fmt(order.vat_amount) : '—'} />
            <InfoRow label="Total" value={fmt(order.total_amount || order.base_amount)} bold />
            {order.participants_count != null && <InfoRow label="Participants" value={order.participants_count} />}
            <InfoRow label="Custom Names" value={order.requires_custom_name ? 'Yes' : 'No'} />
            {order.reference && <InfoRow label="Reference" value={order.reference} mono />}
            <InfoRow label="Created" value={fmtDateTime(order.created_at)} />
          </div>

          {/* validation errors */}
          {order.validation_status === 'invalid' && order.validation_errors?.length > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Validation Errors</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: 160, overflowY: 'auto' }}>
                {order.validation_errors.map((e, i) => (
                  <div key={i} style={{ fontSize: '0.78rem', color: '#dc2626' }}>
                    Row {e.row}: <strong>{e.field}</strong> — {e.error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* action row */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link
              to={`/excel-bulk-order/${order.id}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--c-primary)', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: 9, textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}
            >
              <IconExternalLink /> Open Order
            </Link>
            {order.template_file && (
              <button
                onClick={() => onDownload(order)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--c-bg)', border: '1px solid var(--c-border)', color: 'var(--c-text)', padding: '0.6rem 1.2rem', borderRadius: 9, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
              >
                <IconDownload /> Template
              </button>
            )}
            {needsPay && (
              <Link
                to={`/excel-bulk-order/${order.id}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#15803d', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: 9, textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem' }}
              >
                <IconCash /> Pay Now
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value, bold, mono }) {
  return (
    <div>
      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--c-text-muted)', letterSpacing: '0.04em', marginBottom: 2 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: '0.9rem', fontWeight: bold ? 700 : 500, color: bold ? 'var(--c-primary)' : 'var(--c-text)', fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>{value || '—'}</div>
    </div>
  )
}

/* ─── stat pill ────────────────────────────────────────────── */
function StatPill({ label, value, color }) {
  return (
    <div style={{ background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)', borderRadius: 12, padding: '1rem 1.5rem', textAlign: 'center', minWidth: 120 }}>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: color || 'var(--c-text)' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  )
}

/* ─── main page ────────────────────────────────────────────── */
export default function ExcelMyOrders() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [filter,  setFilter]  = useState('all') // all | pending | valid | completed | invalid

  /* auth guard */
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?next=/excel-my-orders', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  /* fetch orders */
  const fetchOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/excel-bulk-orders/')
      const list = Array.isArray(res) ? res : (res.results || [])
      setOrders(list)
    } catch (e) {
      setError(e.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) fetchOrders()
  }, [isAuthenticated])

  /* download template */
  const handleDownload = async (order) => {
    try {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const res = await fetch(`${BASE_URL}/api/excel-bulk-orders/${order.id}/download-template/`, {
        headers: api.getAuthHeader(),
      })
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `template_${order.title.replace(/\s+/g, '_')}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      if (order.template_file) window.open(order.template_file, '_blank')
    }
  }

  /* derived stats */
  const total      = orders.length
  const completed  = orders.filter(o => o.validation_status === 'completed' || o.is_paid).length
  const pending    = orders.filter(o => ['pending', 'uploaded'].includes(o.validation_status)).length
  const readyToPay = orders.filter(o => o.validation_status === 'valid' && !o.is_paid).length
  const invalid    = orders.filter(o => o.validation_status === 'invalid').length

  /* filter */
  const filtered = filter === 'all' ? orders :
    filter === 'completed' ? orders.filter(o => o.validation_status === 'completed' || o.is_paid) :
    filter === 'pending'   ? orders.filter(o => ['pending', 'uploaded'].includes(o.validation_status)) :
    filter === 'valid'     ? orders.filter(o => o.validation_status === 'valid' && !o.is_paid) :
    filter === 'invalid'   ? orders.filter(o => o.validation_status === 'invalid') :
    orders

  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 48, height: 48, border: '3px solid var(--c-border)', borderTopColor: 'var(--c-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div className="page-transition" style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>
      {/* hero */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #2563eb 100%)', padding: '3rem 1.5rem 4rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: 9999, padding: '0.35rem 1rem', marginBottom: '1.25rem' }}>
            <IconTable />
            <span style={{ color: '#bfdbfe', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' }}>EXCEL BULK ORDERS</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', fontFamily: 'var(--font-display, inherit)' }}>My Excel Orders</h1>
          <p style={{ color: '#bfdbfe', fontSize: '1rem', marginBottom: '2rem' }}>Manage your coordinator bulk orders — track progress from upload to payment.</p>

          {/* stats */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <StatPill label="Total Orders"  value={total}      />
            <StatPill label="Completed"     value={completed}  color="#4ade80" />
            <StatPill label="In Progress"   value={pending}    color="#fde68a" />
            <StatPill label="Ready to Pay"  value={readyToPay} color="#86efac" />
            {invalid > 0 && <StatPill label="Invalid"  value={invalid} color="#fca5a5" />}
          </div>
        </div>
      </div>

      {/* main content */}
      <div style={{ maxWidth: 900, margin: '-2rem auto 0', padding: '0 1rem 4rem', position: 'relative', zIndex: 1 }}>

        {/* toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {/* filters */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { key: 'all',       label: `All (${total})` },
              { key: 'completed', label: `Paid (${completed})` },
              { key: 'valid',     label: `Ready to Pay (${readyToPay})` },
              { key: 'pending',   label: `In Progress (${pending})` },
              ...(invalid > 0 ? [{ key: 'invalid', label: `Invalid (${invalid})` }] : []),
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '0.4rem 0.9rem', borderRadius: 9999, border: '1px solid',
                  fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                  background: filter === f.key ? 'var(--c-primary)' : 'var(--c-bg-warm)',
                  color: filter === f.key ? '#fff' : 'var(--c-text-muted)',
                  borderColor: filter === f.key ? 'var(--c-primary)' : 'var(--c-border)',
                  transition: 'all 0.15s',
                }}
              >{f.label}</button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={fetchOrders} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)', color: 'var(--c-text-muted)', padding: '0.5rem 0.9rem', borderRadius: 9, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
              <IconRefresh /> Refresh
            </button>
            <Link to="/excel-bulk-order/new" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--c-primary)', color: '#fff', padding: '0.5rem 1rem', borderRadius: 9, textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem' }}>
              <IconPlus /> New Order
            </Link>
          </div>
        </div>

        {/* content states */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 90, background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)', borderRadius: 14, animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>
            <button onClick={fetchOrders} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <IconRefresh /> Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--c-text-muted)' }}>
            <div style={{ marginBottom: '1rem', opacity: 0.5 }}><IconEmpty /></div>
            {total === 0 ? (
              <>
                <p style={{ fontWeight: 600, color: 'var(--c-text)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Excel Orders Yet</p>
                <p style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>Create your first coordinator bulk order to get started.</p>
                <Link to="/excel-bulk-order/new" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                  <IconPlus /> Create Excel Order
                </Link>
              </>
            ) : (
              <>
                <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>No orders match this filter.</p>
                <button onClick={() => setFilter('all')} style={{ color: 'var(--c-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Show all orders</button>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map(order => (
              <OrderCard key={order.id} order={order} onDownload={handleDownload} />
            ))}
          </div>
        )}

        {/* guide panel */}
        {!loading && !error && total > 0 && (
          <div style={{ marginTop: '2rem', background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)', borderRadius: 14, padding: '1.5rem' }}>
            <div style={{ fontWeight: 700, color: 'var(--c-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem' }}>📋</span> Excel Order Status Guide
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
              {[
                { s: 'pending',    desc: 'Order created, template ready to download' },
                { s: 'uploaded',   desc: 'Excel uploaded, awaiting validation' },
                { s: 'valid',      desc: 'File valid — ready for payment' },
                { s: 'invalid',    desc: 'Errors found — re-upload required' },
                { s: 'processing', desc: 'Payment received, orders being created' },
                { s: 'completed',  desc: 'All done! Orders created successfully' },
              ].map(({ s, desc }) => {
                return (
                  <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <StatusBadge status={s} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)', lineHeight: 1.4 }}>{desc}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
