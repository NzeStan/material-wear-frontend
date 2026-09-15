import { useEffect, useMemo, useState } from 'react'
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
          background: 'var(--c-surface)',
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
    <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 8, overflow: 'hidden' }}>
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

// Keeps count/next/previous alongside results — normalizeListResponse used
// to throw these away, keeping only the current page's array. That's what
// made "Showing 4 of 37" (from the separate /products/all/ featured-preview
// endpoint) drift out of sync with the grid, which was silently stuck on
// page 1 (DRF's default PAGE_SIZE=20) of a *different*, fully-paginated
// endpoint, with no way to reach the rest.
function normalizePaginated(data) {
  if (Array.isArray(data)) return { results: data, count: data.length }
  return {
    results: data?.results || [],
    count: typeof data?.count === 'number' ? data.count : (data?.results || []).length,
  }
}

const TYPE_ENDPOINTS = {
  nysc_kit: { dataKey: 'nysc_kits', path: 'nysc-kits' },
  nysc_tour: { dataKey: 'nysc_tours', path: 'nysc-tours' },
  church: { dataKey: 'churches', path: 'churches' },
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function CollectionsPage() {
  const [data, setData] = useState(null)
  const [categories, setCategories] = useState([])
  const [currentCategory, setCurrentCategory] = useState(null)
  const [typedData, setTypedData] = useState({
    nysc_kits: { results: [], count: 0 },
    nysc_tours: { results: [], count: 0 },
    churches: { results: [], count: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [pageLoading, setPageLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    document.title = 'Collections — Material Wear Limited'
    const tab = searchParams.get('type')
    const category = searchParams.get('category')
    const nextTab = tab && TABS.some(t => t.key === tab) ? tab : 'all'
    setActiveTab(nextTab)
    fetchProducts(category)
  }, []) // eslint-disable-line

  useEffect(() => {
    const nextType = searchParams.get('type') || 'all'
    const nextCategory = searchParams.get('category')
    if (TABS.some(t => t.key === nextType) && nextType !== activeTab) {
      setActiveTab(nextType)
    }
    if ((nextCategory || null) !== (currentCategory?.slug || null)) {
      fetchProducts(nextCategory)
    }
  }, [searchParams]) // eslint-disable-line

  // Switching tabs doesn't refetch (each type's page-1 data is already
  // loaded), but it does need to drop back to page 1 of whichever type
  // becomes active — otherwise flipping from a NYSC Tours page 2 to Church
  // Items would silently show church items' (nonexistent) page 2.
  useEffect(() => {
    setPage(1)
  }, [activeTab, currentCategory])

  async function fetchProducts(categorySlug = searchParams.get('category')) {
    setLoading(true)
    setError(null)
    try {
      const [
        allData,
        categoriesData,
        kitsData,
        toursData,
        churchesData,
        categoryData,
      ] = await Promise.all([
        api.get(`/products/all/${categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : ''}`),
        api.get('/products/categories/'),
        api.get('/products/nysc-kits/'),
        api.get('/products/nysc-tours/'),
        api.get('/products/churches/'),
        categorySlug ? api.get(`/products/categories/${categorySlug}/`) : Promise.resolve(null),
      ])

      setData(allData)
      setCategories(Array.isArray(categoriesData) ? categoriesData : categoriesData?.results || allData?.categories || [])
      setCurrentCategory(categoryData || allData?.current_category || null)
      setTypedData({
        nysc_kits: normalizePaginated(kitsData),
        nysc_tours: normalizePaginated(toursData),
        churches: normalizePaginated(churchesData),
      })
      setPage(1)
    } catch (e) {
      setError(e?.data?.detail || e?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  // Targeted re-fetch of just the active tab's type at a given page — used
  // by the Prev/Next buttons below. Only meaningful for a single-type tab
  // (not "all", not category-filtered — that path still goes through the
  // separate /products/all/ featured-preview endpoint, which doesn't
  // support real pagination on the backend).
  async function fetchTypePage(typeKey, pageNum) {
    const endpoint = TYPE_ENDPOINTS[typeKey]
    if (!endpoint) return
    setPageLoading(true)
    setError(null)
    try {
      const pageData = await api.get(`/products/${endpoint.path}/?page=${pageNum}`)
      setTypedData(prev => ({ ...prev, [endpoint.dataKey]: normalizePaginated(pageData) }))
      setPage(pageNum)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setError(e?.data?.detail || e?.message || 'Failed to load page')
    } finally {
      setPageLoading(false)
    }
  }

  function updateFilters(nextType, nextCategory) {
    const params = new URLSearchParams(searchParams)

    if (nextType && nextType !== 'all') params.set('type', nextType)
    else params.delete('type')

    if (nextCategory) params.set('category', nextCategory)
    else params.delete('category')

    setSearchParams(params)
  }

  // Flatten all products with their URL type
  const displayed = useMemo(() => {
    const source = activeTab === 'all'
      ? {
          nysc_kits: currentCategory ? data?.nysc_kits || [] : typedData.nysc_kits.results,
          nysc_tours: currentCategory ? data?.nysc_tours || [] : typedData.nysc_tours.results,
          churches: currentCategory ? data?.churches || [] : typedData.churches.results,
        }
      : {
          nysc_kits: activeTab === 'nysc_kit' ? (currentCategory ? data?.nysc_kits || [] : typedData.nysc_kits.results) : [],
          nysc_tours: activeTab === 'nysc_tour' ? (currentCategory ? data?.nysc_tours || [] : typedData.nysc_tours.results) : [],
          churches: activeTab === 'church' ? (currentCategory ? data?.churches || [] : typedData.churches.results) : [],
        }

    const items = []
    source.nysc_kits.forEach(product => items.push({ product, urlType: 'nysc-kit', pKey: 'nysc_kit' }))
    source.nysc_tours.forEach(product => items.push({ product, urlType: 'nysc-tour', pKey: 'nysc_tour' }))
    source.churches.forEach(product => items.push({ product, urlType: 'church', pKey: 'church' }))
    return items
  }, [activeTab, currentCategory, data, typedData])

  const counts = {
    nysc_kit: currentCategory ? (data?.nysc_kits || []).length : typedData.nysc_kits.count,
    nysc_tour: currentCategory ? (data?.nysc_tours || []).length : typedData.nysc_tours.count,
    church: currentCategory ? (data?.churches || []).length : typedData.churches.count,
  }

  // Pagination only applies to a single-type tab with no category filter —
  // that's the only combination backed by a real, page-able endpoint (the
  // "all" view and category-filtered views come from the separate
  // /products/all/ featured-preview endpoint, which the backend caps with
  // its own [:limit] slice and no next/previous cursors).
  const paginatedType = !currentCategory && activeTab !== 'all' ? activeTab : null
  const activeTypeData = paginatedType ? typedData[TYPE_ENDPOINTS[paginatedType].dataKey] : null
  const totalPages = activeTypeData ? Math.max(1, Math.ceil(activeTypeData.count / 20)) : 1

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
          {currentCategory?.description && (
            <p className="mt-3 text-sm" style={{ color: 'var(--c-text)' }}>
              {currentCategory.description}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => updateFilters(tab.key, currentCategory?.slug || null)}
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
                  ({counts[tab.key]})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--c-text-muted)' }}>
              Browse by Category
            </p>
            {currentCategory && (
              <button
                type="button"
                onClick={() => updateFilters(activeTab, null)}
                className="text-xs font-semibold"
                style={{ color: 'var(--c-primary)' }}
              >
                Clear category
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => updateFilters(activeTab, null)}
              className="flex-shrink-0 text-xs font-semibold px-4 py-2 transition-all"
              style={{
                borderRadius: 999,
                background: currentCategory ? 'white' : 'var(--c-primary)',
                color: currentCategory ? 'var(--c-text-muted)' : 'white',
                border: `1px solid ${currentCategory ? 'var(--c-border)' : 'var(--c-primary)'}`,
              }}
            >
              Everything
            </button>
            {categories.map(category => {
              const selected = currentCategory?.slug === category.slug
              return (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => updateFilters(activeTab, category.slug)}
                  className="flex-shrink-0 text-xs font-semibold px-4 py-2 transition-all"
                  style={{
                    borderRadius: 999,
                    background: selected ? '#ecfdf5' : 'white',
                    color: selected ? 'var(--c-primary)' : 'var(--c-text-muted)',
                    border: `1px solid ${selected ? '#a7f3d0' : 'var(--c-border)'}`,
                  }}
                >
                  {category.name} ({category.product_count ?? 0})
                </button>
              )
            })}
          </div>
        </div>

        {/* Only shown in the combined "All Products" view — this reflects
            the separate featured-preview endpoint's own real numbers, so it
            stays out of the way once a single-type tab (with its own,
            actually-paginated "Showing X-Y of Z" caption below) is active,
            instead of showing two conflicting counts on screen at once. */}
        {activeTab === 'all' && data?.pagination && (
          <div
            className="grid md:grid-cols-3 gap-3 mb-8"
            style={{ color: 'var(--c-text-muted)' }}
          >
            {[
              ['NYSC Kits', data.pagination.nysc_kits],
              ['NYSC Tours', data.pagination.nysc_tours],
              ['Church Items', data.pagination.churches],
            ].map(([label, meta]) => (
              <div
                key={label}
                className="rounded-lg px-4 py-3"
                style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--c-text)' }}>{label}</p>
                <p className="text-xs">
                  Showing {meta?.showing ?? 0} of {meta?.total ?? 0}
                  {meta?.has_more ? ' in featured storefront view' : ''}
                </p>
              </div>
            ))}
          </div>
        )}

        {paginatedType && activeTypeData && activeTypeData.count > 0 && (
          <p className="text-xs mb-4" style={{ color: 'var(--c-text-muted)' }}>
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, activeTypeData.count)} of {activeTypeData.count}
          </p>
        )}

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

        {/* Pagination — only meaningful for a single-type tab (kits/tours/
            churches) with no category filter; "All Products" and
            category-filtered views come from the separate, non-paginated
            featured-preview endpoint. */}
        {paginatedType && activeTypeData && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => fetchTypePage(paginatedType, page - 1)}
              disabled={page <= 1 || pageLoading}
              className="px-4 py-2 text-sm font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
            >
              ← Prev
            </button>
            <span className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => fetchTypePage(paginatedType, page + 1)}
              disabled={page >= totalPages || pageLoading}
              className="px-4 py-2 text-sm font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
            >
              Next →
            </button>
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
