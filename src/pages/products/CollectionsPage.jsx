import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../../services/api'

// ── helpers ───────────────────────────────────────────────────────────────────

function fmt(price) {
  return `₦${Number(price).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

// ── product card ──────────────────────────────────────────────────────────────

function ProductCard({ product, urlType }) {
  const img = product.thumbnail || product.image
  return (
    <Link
      to={`/products/${urlType}/${product.id}`}
      className="group block"
      style={{ textDecoration: 'none' }}
    >
      <div
        style={{
          background: 'white',
          border: '1px solid var(--c-border)',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          transition: 'box-shadow 0.2s, transform 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        {/* Image */}
        <div className="relative" style={{ paddingBottom: '100%', background: '#F3F4F6', overflow: 'hidden' }}>
          {img ? (
            <img
              src={img}
              alt={product.name}
              loading="lazy"
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%', objectFit: 'cover',
                transition: 'transform 0.4s',
              }}
              className="group-hover:scale-105"
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: '#D1D5DB' }}>
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          )}

          {product.out_of_stock && (
            <div style={{
              position: 'absolute', top: 8, left: 8,
              background: '#EF4444', color: 'white',
              fontSize: 10, fontWeight: 700, padding: '2px 8px',
              borderRadius: 4, letterSpacing: '0.05em',
            }}>
              OUT OF STOCK
            </div>
          )}

          {product.type_display && (
            <div style={{
              position: 'absolute', top: 8, right: 8,
              background: 'rgba(6,78,59,0.85)', color: 'white',
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
            }}>
              {product.type_display}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs font-medium mb-0.5 truncate" style={{ color: 'var(--c-text)' }}>
            {product.name}
          </p>
          {product.category_name && (
            <p style={{ fontSize: 11, color: 'var(--c-text-muted)', marginBottom: 8 }}>
              {product.category_name}
            </p>
          )}
          <div className="flex items-center justify-between">
            <p className="font-semibold" style={{ color: 'var(--c-primary)', fontSize: 15 }}>
              {fmt(product.price)}
            </p>
            {product.available && !product.out_of_stock && (
              <span style={{ fontSize: 10, color: '#10b981', fontWeight: 600, letterSpacing: '0.05em' }}>
                IN STOCK
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

function CardSkeleton() {
  return (
    <div style={{ background: 'white', border: '1px solid var(--c-border)', borderRadius: 8, overflow: 'hidden' }}>
      <div className="skeleton" style={{ paddingBottom: '100%' }} />
      <div className="p-3">
        <div className="skeleton h-3 rounded mb-2" style={{ width: '70%' }} />
        <div className="skeleton h-4 rounded" style={{ width: '40%' }} />
      </div>
    </div>
  )
}

// ── tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'all',       label: 'All Products' },
  { key: 'nysc_kit',  label: 'NYSC Kits',   urlType: 'nysc-kit' },
  { key: 'nysc_tour', label: 'NYSC Tours',   urlType: 'nysc-tour' },
  { key: 'church',    label: 'Church Items', urlType: 'church' },
]

// ── main page ─────────────────────────────────────────────────────────────────

export default function CollectionsPage() {
  const [data,      setData]      = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    document.title = 'Collections — Material Wear Limited'
    const tab = searchParams.get('type')
    if (tab && TABS.some(t => t.key === tab)) setActiveTab(tab)
    fetchProducts()
  }, []) // eslint-disable-line

  async function fetchProducts() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/products/all/')
      setData(res)
    } catch (e) {
      setError(e?.data?.detail || e?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  // Flatten all products with their URL type
  const allItems = []
  if (data) {
    ;(data.nysc_kits  || []).forEach(p => allItems.push({ product: p, urlType: 'nysc-kit',  pKey: 'nysc_kit' }))
    ;(data.nysc_tours || []).forEach(p => allItems.push({ product: p, urlType: 'nysc-tour', pKey: 'nysc_tour' }))
    ;(data.churches   || []).forEach(p => allItems.push({ product: p, urlType: 'church',    pKey: 'church' }))
  }

  const displayed = activeTab === 'all'
    ? allItems
    : allItems.filter(i => i.pKey === activeTab)

  return (
    <main className="flex-1 py-10 px-4" style={{ background: 'var(--c-bg)', minHeight: '80vh' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="section-eyebrow mb-2">Shop Our Range</p>
          <h1 className="font-display text-4xl mb-2" style={{ color: 'var(--c-primary)' }}>Collections</h1>
          <p style={{ color: 'var(--c-text-muted)' }}>
            Premium NYSC kits, tour merchandise and church items — crafted with care.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-shrink-0 text-xs font-semibold px-4 py-2 transition-all"
              style={{
                borderRadius: 20,
                background: activeTab === tab.key ? 'var(--c-primary)' : 'white',
                color:      activeTab === tab.key ? 'white' : 'var(--c-text-muted)',
                border:     `1px solid ${activeTab === tab.key ? 'var(--c-primary)' : 'var(--c-border)'}`,
                letterSpacing: '0.04em',
              }}
            >
              {tab.label}
              {data && tab.key !== 'all' && (
                <span style={{ opacity: 0.7, marginLeft: 4 }}>
                  ({tab.key === 'nysc_kit' ? (data.nysc_kits || []).length
                    : tab.key === 'nysc_tour' ? (data.nysc_tours || []).length
                    : (data.churches || []).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-3 p-4 mb-6"
            style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-sm flex-1" style={{ color: '#DC2626' }}>{error}</p>
            <button onClick={fetchProducts} className="text-xs font-semibold" style={{ color: '#DC2626' }}>Retry</button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
              style={{ color: 'var(--c-border)', margin: '0 auto 12px' }}>
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayed.map(({ product, urlType }) => (
              <ProductCard key={`${urlType}-${product.id}`} product={product} urlType={urlType} />
            ))}
          </div>
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
