import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const BACKEND = (import.meta.env.VITE_API_BASE_URL || '').replace('/api', '')

// ── Tool definitions ───────────────────────────────────────────────────────────

const TOOL_GROUPS = [
  {
    group: 'Product Orders',
    color: '#0369a1',
    bgColor: 'rgba(3,105,161,0.06)',
    tools: [
      {
        label: 'All Product Orders',
        desc: 'View, search, and track NYSC kit, tour, and church orders',
        path: '/orders',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 2H15l-1 4H10L9 2z"/>
            <path d="M2 6h20v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z"/>
            <line x1="9" y1="10" x2="15" y2="10"/>
            <line x1="9" y1="14" x2="15" y2="14"/>
          </svg>
        ),
      },
    ],
  },
  {
    group: 'Bulk Orders',
    color: '#7c3aed',
    bgColor: 'rgba(124,58,237,0.06)',
    tools: [
      {
        label: 'Organiser Dashboard',
        desc: 'Manage bulk order campaigns and participant lists',
        path: '/organiser',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        ),
      },
      {
        label: 'Image Organiser',
        desc: 'Manage image-based bulk order campaigns',
        path: '/image-organiser',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        ),
      },
      {
        label: 'Live Form Organiser',
        desc: 'Manage live order collection forms',
        path: '/live-form-organiser',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>
          </svg>
        ),
      },
      {
        label: 'Excel Bulk Orders',
        desc: 'View and manage Excel-based bulk order uploads',
        path: '/excel-my-orders',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="3" y1="15" x2="21" y2="15"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
        ),
      },
    ],
  },
  {
    group: 'Customer Reviews',
    color: '#e11d48',
    bgColor: 'rgba(225,29,72,0.06)',
    tools: [
      {
        label: 'Moderate Reviews',
        desc: 'Approve, feature, or reject pending customer testimonials',
        path: '/admin/testimonials',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        ),
      },
      {
        label: 'All Reviews (Public)',
        desc: 'See the testimonials page as customers see it',
        path: '/testimonials',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        ),
      },
    ],
  },
  {
    group: 'Academic Directory',
    color: '#d97706',
    bgColor: 'rgba(217,119,6,0.06)',
    tools: [
      {
        label: 'Directory Admin',
        desc: 'Verify, dispute, and manage academic directory submissions',
        path: '/academic-directory/admin',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
        ),
      },
    ],
  },
]

const BACKEND_LINKS = [
  {
    label: 'Django Admin Panel',
    desc: 'Full backend administration — users, orders, products, settings',
    href: `${BACKEND}/i_must_win/`,
    color: '#059669',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
  {
    label: 'Generate Order PDFs',
    desc: 'Generate NYSC Kit, Tour, and Church order item PDFs by state',
    href: `${BACKEND}/i_must_win/orderitem_generation/`,
    color: '#dc2626',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    label: 'API Documentation',
    desc: 'Interactive Swagger/OpenAPI documentation for all endpoints',
    href: `${BACKEND}/api/docs/`,
    color: '#0369a1',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

// ── Tool card ─────────────────────────────────────────────────────────────────

function ToolCard({ label, desc, path, icon, color }) {
  return (
    <Link
      to={path}
      className="flex items-start gap-4 p-4 rounded-lg border transition-all duration-150"
      style={{ background: 'white', borderColor: 'var(--c-border)' }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color
        e.currentTarget.style.boxShadow = `0 0 0 3px ${color}12`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--c-border)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div
        className="flex-shrink-0 w-9 h-9 rounded flex items-center justify-center"
        style={{ background: `${color}12`, color }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--c-text)' }}>{label}</p>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>{desc}</p>
      </div>
      <svg
        className="flex-shrink-0 self-center ml-auto"
        width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        style={{ color: 'var(--c-text-muted)' }}
      >
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </Link>
  )
}

function BackendCard({ label, desc, href, color, icon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-4 p-4 rounded-lg border transition-all duration-150"
      style={{ background: 'white', borderColor: 'var(--c-border)' }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color
        e.currentTarget.style.boxShadow = `0 0 0 3px ${color}12`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--c-border)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div
        className="flex-shrink-0 w-9 h-9 rounded flex items-center justify-center"
        style={{ background: `${color}12`, color }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--c-text)' }}>{label}</p>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>{desc}</p>
      </div>
      <svg
        className="flex-shrink-0 self-center ml-auto"
        width="13" height="13" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        style={{ color: 'var(--c-text-muted)' }}
      >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
        <polyline points="15 3 21 3 21 9"/>
        <line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
    </a>
  )
}

function GenerationPanel() {
  const [filters, setFilters] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    async function loadFilters() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/generate/available-filters/`, {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(response.status === 403
            ? 'Staff admin session required to load available PDF filters.'
            : 'Could not load order-item generation filters.')
        }

        const data = await response.json()
        if (mounted) setFilters(data)
      } catch (err) {
        if (mounted) setError(err.message || 'Could not load order-item generation filters.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadFilters()
    return () => { mounted = false }
  }, [])

  function renderLinks(items, buildHref, emptyLabel) {
    if (!items?.length) {
      return <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{emptyLabel}</p>
    }

    return (
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <a
            key={item}
            href={buildHref(item)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{
              background: '#f8fafc',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
            }}
          >
            {item}
          </a>
        ))}
      </div>
    )
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: '#dc2626' }}>
          Order Item PDFs
        </h2>
        <div className="flex-1 h-px" style={{ background: '#fecaca' }} />
      </div>

      <div
        className="rounded-xl p-4"
        style={{ background: 'white', border: '1px solid var(--c-border)' }}
      >
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--c-text)' }}>
          Generate fulfilment PDFs from the frontend
        </p>
        <p className="text-xs mb-4" style={{ color: 'var(--c-text-muted)' }}>
          These links use the `available-filters` endpoint and open the staff-protected PDF generation endpoints directly.
        </p>

        {loading ? (
          <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Loading available filters...</p>
        ) : error ? (
          <div
            className="text-xs rounded-lg px-3 py-2"
            style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}
          >
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--c-text)' }}>NYSC Kit States</p>
              {renderLinks(
                filters?.nysc_kit_states,
                value => `${BACKEND}/api/generate/nysc-kit/pdf/?state=${encodeURIComponent(value)}`,
                'No kit states available yet.',
              )}
            </div>
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--c-text)' }}>NYSC Tour States</p>
              {renderLinks(
                filters?.nysc_tour_states,
                value => `${BACKEND}/api/generate/nysc-tour/pdf/?state=${encodeURIComponent(value)}`,
                'No tour states available yet.',
              )}
            </div>
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--c-text)' }}>Churches</p>
              {renderLinks(
                filters?.churches,
                value => `${BACKEND}/api/generate/church/pdf/?church=${encodeURIComponent(value)}`,
                'No church fulfilment filters available yet.',
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth()

  useEffect(() => {
    document.title = 'Admin Dashboard — Material Wear'
  }, [])

  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: { pathname: '/admin' } }} replace />
  if (!user?.is_staff) return <Navigate to="/" replace />

  const displayName = user.first_name
    ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`
    : user.username || user.email

  return (
    <main className="flex-1 py-10 px-4" style={{ background: 'var(--c-bg-warm)', minHeight: '80vh' }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="section-eyebrow mb-1">Staff Portal</p>
          <h1 className="font-display text-3xl mb-1" style={{ color: 'var(--c-primary)' }}>
            Admin Dashboard
          </h1>
          <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
            Welcome back, <span className="font-medium" style={{ color: 'var(--c-text)' }}>{displayName}</span>.
            You have staff access.
          </p>
        </div>

        {/* Staff badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded mb-8 text-xs font-semibold"
          style={{ background: 'rgba(6,78,59,0.08)', color: 'var(--c-primary)', border: '1px solid rgba(6,78,59,0.15)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          {user.is_superuser ? 'Superuser · Full Access' : 'Staff Member · Admin Access'}
        </div>

        {/* Tool groups */}
        <div className="space-y-8">
          {TOOL_GROUPS.map(group => (
            <section key={group.group}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: group.color }}>
                  {group.group}
                </h2>
                <div className="flex-1 h-px" style={{ background: `${group.color}20` }} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {group.tools.map(tool => (
                  <ToolCard key={tool.path} {...tool} color={group.color} />
                ))}
              </div>
            </section>
          ))}

          <GenerationPanel />

          {/* Backend admin section */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: '#6b7280' }}>
                Backend & System
              </h2>
              <div className="flex-1 h-px" style={{ background: '#e5e7eb' }} />
            </div>
            <div
              className="flex items-start gap-3 p-3 rounded mb-3 text-xs"
              style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p>
                Backend links open the Django admin panel. You must be separately logged in to the Django admin
                through the hardened `i_must_win` path. Access there is protected by two-factor authentication,
                and production deployments may also enforce an IP whitelist before the admin can even load.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {BACKEND_LINKS.map(link => (
                <BackendCard key={link.href} {...link} />
              ))}
            </div>
          </section>
        </div>

        {/* Quick links footer */}
        <div className="mt-10 pt-6 border-t flex flex-wrap gap-4" style={{ borderColor: 'var(--c-border)' }}>
          <Link to="/" className="text-xs" style={{ color: 'var(--c-text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--c-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-muted)'}
          >← Back to site</Link>
          <Link to="/profile" className="text-xs" style={{ color: 'var(--c-text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--c-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-muted)'}
          >My Profile</Link>
          <Link to="/orders" className="text-xs" style={{ color: 'var(--c-text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--c-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-muted)'}
          >Product Orders</Link>
        </div>
      </div>
    </main>
  )
}
