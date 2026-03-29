import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

// ── constants ─────────────────────────────────────────────────────────────────

const TYPE_ENDPOINT = {
  'nysc-kit':  '/products/nysc-kits/',
  'nysc-tour': '/products/nysc-tours/',
  'church':    '/products/churches/',
}

const API_PRODUCT_TYPE = {
  'nysc-kit':  'nysc_kit',
  'nysc-tour': 'nysc_tour',
  'church':    'church',
}

const TYPE_LABEL = {
  'nysc-kit':  'NYSC Kit',
  'nysc-tour': 'NYSC Tour',
  'church':    'Church Item',
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

function fmt(price) {
  return `₦${Number(price).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

// ── sub-components ────────────────────────────────────────────────────────────

function SizeGrid({ selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {SIZES.map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onSelect(s)}
          className="text-xs font-semibold px-3 py-1.5 transition-all"
          style={{
            border: `1.5px solid ${selected === s ? 'var(--c-primary)' : 'var(--c-border)'}`,
            background: selected === s ? 'var(--c-primary)' : 'white',
            color: selected === s ? 'white' : 'var(--c-text)',
            borderRadius: 4,
          }}
        >
          {s}
        </button>
      ))}
    </div>
  )
}

function QtyControl({ qty, setQty }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => setQty(q => Math.max(1, q - 1))}
        className="w-9 h-9 flex items-center justify-center text-lg font-bold transition-colors"
        style={{ border: '1.5px solid var(--c-border)', borderRadius: 4, background: 'white' }}
      >−</button>
      <span className="text-lg font-semibold w-8 text-center" style={{ color: 'var(--c-text)' }}>{qty}</span>
      <button
        type="button"
        onClick={() => setQty(q => q + 1)}
        className="w-9 h-9 flex items-center justify-center text-lg font-bold transition-colors"
        style={{ border: '1.5px solid var(--c-border)', borderRadius: 4, background: 'white' }}
      >+</button>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function ProductDetail() {
  const { type, id } = useParams()
  const navigate     = useNavigate()
  const { addToCart }      = useCart()
  const { isAuthenticated } = useAuth()

  const [product,    setProduct]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [activeImg,  setActiveImg]  = useState(0)
  const [qty,        setQty]        = useState(1)
  const [size,       setSize]       = useState('')
  const [callUpNo,   setCallUpNo]   = useState('')
  const [customName, setCustomName] = useState('')
  const [adding,     setAdding]     = useState(false)
  const [addError,   setAddError]   = useState(null)
  const [addSuccess, setAddSuccess] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [type, id]) // eslint-disable-line

  async function fetchProduct() {
    setLoading(true)
    setError(null)
    setActiveImg(0)
    const endpoint = TYPE_ENDPOINT[type]
    if (!endpoint) { setError('Unknown product type'); setLoading(false); return }
    try {
      const data = await api.get(`${endpoint}${id}/`)
      setProduct(data)
      document.title = `${data.name} — Material Wear Limited`
    } catch (e) {
      setError(e?.data?.detail || e?.message || 'Product not found')
    } finally {
      setLoading(false)
    }
  }

  // Collect all non-null images
  const images = product
    ? [product.image, product.image_1, product.image_2, product.image_3].filter(Boolean)
    : []

  // Product-type logic
  const isKakhi      = type === 'nysc-kit' && product?.type === 'kakhi'
  const isCap        = type === 'nysc-kit' && product?.type === 'cap'
  const isVest       = type === 'nysc-kit' && product?.type === 'vest'
  const needsSize    = isVest || type === 'church'
  const needsCallUp  = type === 'nysc-tour'
  const isUnavailable = product && (!product.available || product.out_of_stock)

  async function handleAddToCart() {
    setAddError(null)
    if (!isAuthenticated) { navigate('/login'); return }
    if (needsSize && !size)   { setAddError('Please select a size'); return }
    if (needsCallUp && !callUpNo.trim()) { setAddError('Please enter your NYSC call-up number'); return }

    const payload = {
      product_type: API_PRODUCT_TYPE[type],
      product_id:   id,
      quantity:     qty,
    }
    if (isVest)        payload.size = size
    if (type === 'church') {
      payload.size = size
      if (customName.trim()) payload.custom_name_text = customName.trim().toUpperCase()
    }
    if (needsCallUp)   payload.call_up_number = callUpNo.trim()

    setAdding(true)
    try {
      await addToCart(payload)
      setAddSuccess(true)
      setTimeout(() => setAddSuccess(false), 2500)
    } catch (e) {
      setAddError(e?.data?.detail || e?.message || 'Failed to add to cart')
    } finally {
      setAdding(false)
    }
  }

  // ── loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <main className="flex-1 py-10 px-4" style={{ background: 'var(--c-bg)', minHeight: '80vh' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="skeleton" style={{ paddingBottom: '100%', borderRadius: 8 }} />
            <div className="space-y-4 pt-4">
              <div className="skeleton h-3 rounded" style={{ width: '30%' }} />
              <div className="skeleton h-8 rounded" style={{ width: '65%' }} />
              <div className="skeleton h-6 rounded" style={{ width: '25%' }} />
              <div className="skeleton h-20 rounded w-full" />
            </div>
          </div>
        </div>
        <style>{`.skeleton{background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center py-20 px-4" style={{ background: 'var(--c-bg)' }}>
        <div className="text-center">
          <p className="text-sm mb-4" style={{ color: '#DC2626' }}>{error}</p>
          <Link to="/collections" className="btn-primary">Back to Collections</Link>
        </div>
      </main>
    )
  }

  // ── main render ────────────────────────────────────────────────────────────

  return (
    <main className="flex-1 py-10 px-4" style={{ background: 'var(--c-bg)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs mb-8" style={{ color: 'var(--c-text-muted)' }}>
          <Link to="/collections" style={{ color: 'var(--c-text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--c-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-muted)'}>
            Collections
          </Link>
          <span>›</span>
          <span style={{ color: 'var(--c-text-muted)' }}>{TYPE_LABEL[type]}</span>
          <span>›</span>
          <span style={{ color: 'var(--c-text)' }}>{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Gallery ─────────────────────────────────────────── */}
          <div>
            <div style={{
              position: 'relative', paddingBottom: '100%',
              background: '#F9FAFB', borderRadius: 8, overflow: 'hidden',
              border: '1px solid var(--c-border)',
            }}>
              {images.length > 0 ? (
                <img
                  src={images[activeImg]}
                  alt={product.name}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: '#D1D5DB' }}>
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
              )}
              {isUnavailable && (
                <div style={{
                  position: 'absolute', top: 12, left: 12,
                  background: '#EF4444', color: 'white',
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 4,
                }}>
                  OUT OF STOCK
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    style={{
                      width: 64, height: 64, flexShrink: 0, borderRadius: 6,
                      overflow: 'hidden', padding: 0, cursor: 'pointer',
                      border: `2px solid ${activeImg === i ? 'var(--c-primary)' : 'var(--c-border)'}`,
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info & Add to Cart ───────────────────────────────── */}
          <div>
            <p className="section-eyebrow mb-2">{product.category_name || TYPE_LABEL[type]}</p>
            <h1 className="font-display text-3xl mb-1" style={{ color: 'var(--c-primary)' }}>{product.name}</h1>
            {product.type_display && (
              <p className="text-sm mb-3" style={{ color: 'var(--c-text-muted)' }}>{product.type_display}</p>
            )}
            <p className="text-3xl font-bold mb-5" style={{ color: 'var(--c-accent)' }}>
              {fmt(product.price)}
            </p>

            {product.description && (
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--c-text-muted)', borderBottom: '1px solid var(--c-border)', paddingBottom: 20 }}>
                {product.description}
              </p>
            )}

            {/* ── Kakhi note ─────────────────────────────────── */}
            {isKakhi && (
              <div className="flex items-start gap-2 p-3 rounded mb-5"
                style={{ background: 'rgba(6,78,59,0.05)', border: '1px solid rgba(6,78,59,0.12)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ color: 'var(--c-primary)', flexShrink: 0, marginTop: 2 }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--c-text)' }}>
                  This item is <strong>custom-fitted</strong> to your body measurements.{' '}
                  <Link to="/measurements" style={{ color: 'var(--c-primary)' }}
                    className="underline">Add your measurements</Link>{' '}
                  if you haven't already.
                </p>
              </div>
            )}

            {/* ── Cap note ───────────────────────────────────── */}
            {isCap && (
              <div className="flex items-center gap-2 p-3 rounded mb-5"
                style={{ background: 'rgba(6,78,59,0.05)', border: '1px solid rgba(6,78,59,0.12)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ color: 'var(--c-primary)', flexShrink: 0 }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <p className="text-xs" style={{ color: 'var(--c-text)' }}>One size fits all — no size selection needed.</p>
              </div>
            )}

            {/* ── Size selector ──────────────────────────────── */}
            {needsSize && (
              <div className="mb-5">
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--c-text)' }}>
                  Size <span style={{ color: '#DC2626' }}>*</span>
                </p>
                <SizeGrid selected={size} onSelect={setSize} />
              </div>
            )}

            {/* ── Custom name (church) ───────────────────────── */}
            {type === 'church' && (
              <div className="mb-5">
                <label className="text-sm font-semibold mb-1.5 block" style={{ color: 'var(--c-text)' }}>
                  Custom Name{' '}
                  <span className="font-normal text-xs" style={{ color: 'var(--c-text-muted)' }}>
                    (optional — printed on the item)
                  </span>
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="e.g. PASTOR JOHN"
                  maxLength={40}
                  className="form-input w-full text-sm"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            )}

            {/* ── Call-up number (NYSC tour) ─────────────────── */}
            {needsCallUp && (
              <div className="mb-5">
                <label className="text-sm font-semibold mb-1.5 block" style={{ color: 'var(--c-text)' }}>
                  NYSC Call-Up Number <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={callUpNo}
                  onChange={e => setCallUpNo(e.target.value)}
                  placeholder="e.g. AB/22C/1234"
                  className="form-input w-full text-sm"
                />
                <p className="text-xs mt-1" style={{ color: 'var(--c-text-muted)' }}>
                  Found on your NYSC call-up letter
                </p>
              </div>
            )}

            {/* ── Quantity ───────────────────────────────────── */}
            <div className="mb-5">
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--c-text)' }}>Quantity</p>
              <QtyControl qty={qty} setQty={setQty} />
            </div>

            {/* ── Error ─────────────────────────────────────── */}
            {addError && (
              <div className="flex items-start gap-2 p-3 rounded mb-4"
                style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"
                  style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-xs leading-relaxed" style={{ color: '#DC2626' }}>
                  {addError}
                  {addError.toLowerCase().includes('measurement') && (
                    <Link to="/measurements" style={{ color: '#DC2626' }} className="underline ml-1 font-semibold">
                      Add Measurements →
                    </Link>
                  )}
                </p>
              </div>
            )}

            {/* ── Add to cart button ─────────────────────────── */}
            {isUnavailable ? (
              <div className="p-3 text-center text-sm"
                style={{ background: '#F9FAFB', border: '1px solid var(--c-border)', borderRadius: 6, color: 'var(--c-text-muted)' }}>
                Currently unavailable
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="w-full btn-primary flex items-center justify-center gap-2 mb-3"
                style={{ opacity: adding ? 0.7 : 1 }}
              >
                {adding ? (
                  <>
                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Adding to cart…
                  </>
                ) : addSuccess ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Added to cart!
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>
            )}

            <Link
              to="/collections"
              className="flex items-center justify-center gap-1.5 text-xs"
              style={{ color: 'var(--c-text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--c-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-muted)'}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Collections
            </Link>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}
