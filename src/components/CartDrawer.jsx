import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

// ── helpers ───────────────────────────────────────────────────────────────────

function fmt(amount) {
  if (amount == null) return '—'
  return `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

function extraLabel(extra) {
  if (!extra) return null
  const parts = []
  if (extra.size === 'measurement')  parts.push('Custom fitted')
  else if (extra.size === 'free_size') parts.push('Free size')
  else if (extra.size)               parts.push(`Size: ${extra.size}`)
  if (extra.custom_name_text)        parts.push(`Name: ${extra.custom_name_text}`)
  if (extra.call_up_number)          parts.push(extra.call_up_number)
  return parts.length ? parts.join(' · ') : null
}

function typeLabel(t) {
  return { nysc_kit: 'NYSC Kit', nysc_tour: 'NYSC Tour', church: 'Church' }[t] || t
}

// ── cart item row ─────────────────────────────────────────────────────────────

function CartItem({ item }) {
  const { removeItem, updateQuantity } = useCart()
  const [removing,   setRemoving]   = useState(false)
  const [qtyLoading, setQtyLoading] = useState(false)

  const img    = item.product?.thumbnail || item.product?.image
  const label  = extraLabel(item.extra_fields)

  async function handleRemove() {
    setRemoving(true)
    try { await removeItem(item.item_key) } catch { setRemoving(false) }
  }

  async function handleQty(newQty) {
    if (newQty < 1) return handleRemove()
    setQtyLoading(true)
    try { await updateQuantity(item.item_key, newQty) } finally { setQtyLoading(false) }
  }

  return (
    <div
      className="flex gap-3 py-3 border-b transition-opacity"
      style={{ borderColor: 'var(--c-border)', opacity: removing ? 0.4 : 1 }}
    >
      {/* Image */}
      <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden" style={{ background: '#F3F4F6' }}>
        {img ? (
          <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#D1D5DB' }}>
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate" style={{ color: 'var(--c-text)' }}>
          {item.product?.name || 'Product'}
        </p>
        <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{typeLabel(item.product_type)}</p>
        {label && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)', fontSize: 11 }}>{label}</p>
        )}

        {/* Qty + price row */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleQty(item.quantity - 1)}
              disabled={qtyLoading || removing}
              className="w-6 h-6 flex items-center justify-center rounded text-sm font-bold"
              style={{ border: '1px solid var(--c-border)', background: 'var(--c-bg)', color: 'var(--c-text)' }}
            >−</button>
            <span className="text-sm font-semibold w-5 text-center" style={{ color: 'var(--c-text)' }}>
              {item.quantity}
            </span>
            <button
              onClick={() => handleQty(item.quantity + 1)}
              disabled={qtyLoading || removing}
              className="w-6 h-6 flex items-center justify-center rounded text-sm font-bold"
              style={{ border: '1px solid var(--c-border)', background: 'var(--c-bg)', color: 'var(--c-text)' }}
            >+</button>
          </div>
          <p className="text-sm font-semibold" style={{ color: 'var(--c-primary)' }}>
            {fmt(item.total_price)}
          </p>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={handleRemove}
        disabled={removing}
        className="flex-shrink-0 self-start p-1 opacity-40 hover:opacity-100 transition-opacity"
        aria-label="Remove item"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  )
}

// ── drawer ────────────────────────────────────────────────────────────────────

export default function CartDrawer() {
  const { cart, summary, cartLoading, drawerOpen, setDrawerOpen, clearCart } = useCart()
  const navigate = useNavigate()
  const [clearing, setClearing] = useState(false)

  const items   = cart?.items || []
  const isEmpty = items.length === 0
  const subtotal = summary?.subtotal ?? cart?.subtotal
  const vatAmount = summary?.vat_amount ?? cart?.vat_amount
  const vatRate = summary?.vat_rate ?? cart?.vat_rate
  const total = summary?.total ?? cart?.total_cost

  async function handleClear() {
    setClearing(true)
    try { await clearCart() } finally { setClearing(false) }
  }

  function handleCheckout() {
    setDrawerOpen(false)
    navigate('/checkout')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] transition-opacity duration-300 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.45)' }}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full z-[101] flex flex-col transition-transform duration-300 ease-in-out ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: '100%', maxWidth: 400, background: 'var(--c-surface)', boxShadow: '-4px 0 32px rgba(0,0,0,0.14)' }}
        role="dialog"
        aria-label="Shopping cart"
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0 border-b"
          style={{ borderColor: 'var(--c-border)' }}
        >
          <div className="flex items-center gap-2.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              style={{ color: 'var(--c-primary)' }}>
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <h2 className="font-display text-lg" style={{ color: 'var(--c-primary)' }}>
              Your Cart
              {items.length > 0 && (
                <span className="text-sm font-normal ml-1.5" style={{ color: 'var(--c-text-muted)' }}>
                  ({items.length} item{items.length !== 1 ? 's' : ''})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 opacity-50 hover:opacity-100 transition-opacity"
            aria-label="Close cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* ── Items ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5">
          {cartLoading ? (
            <div className="flex justify-center py-12">
              <div style={{
                width: 28, height: 28,
                border: '3px solid var(--c-border)', borderTopColor: 'var(--c-primary)',
                borderRadius: '50%', animation: 'spin 0.7s linear infinite',
              }} />
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
                style={{ color: '#E5E7EB', marginBottom: 12 }}>
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--c-text)' }}>Your cart is empty</p>
              <p className="text-xs mb-6" style={{ color: 'var(--c-text-muted)' }}>
                Browse our collections and add items to get started.
              </p>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-xs font-semibold px-5 py-2"
                style={{ background: 'var(--c-primary)', color: 'white', borderRadius: 4 }}
              >
                Browse Collections
              </button>
            </div>
          ) : (
            <div>
              {items.map(item => <CartItem key={item.item_key} item={item} />)}
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        {!isEmpty && (
          <div
            className="flex-shrink-0 border-t px-5 py-4"
            style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-warm)' }}
          >
            {/* Totals */}
            <div className="space-y-1.5 mb-4 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--c-text-muted)' }}>Subtotal</span>
                <span style={{ color: 'var(--c-text)' }}>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--c-text-muted)' }}>
                  VAT ({vatRate != null ? `${(vatRate * 100).toFixed(0)}%` : '15%'})
                </span>
                <span style={{ color: 'var(--c-text)' }}>{fmt(vatAmount)}</span>
              </div>
              <div
                className="flex justify-between font-bold pt-2 border-t"
                style={{ borderColor: 'var(--c-border)' }}
              >
                <span style={{ color: 'var(--c-text)' }}>Total</span>
                <span style={{ color: 'var(--c-primary)', fontSize: 17 }}>{fmt(total)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full btn-primary flex items-center justify-center gap-2 mb-2"
            >
              <span>Proceed to Checkout</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

            <button
              onClick={handleClear}
              disabled={clearing}
              className="w-full text-xs py-1.5 transition-opacity"
              style={{ color: 'var(--c-text-muted)', opacity: clearing ? 0.5 : 0.6 }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = clearing ? '0.5' : '0.6'}
            >
              {clearing ? 'Clearing…' : 'Clear cart'}
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
