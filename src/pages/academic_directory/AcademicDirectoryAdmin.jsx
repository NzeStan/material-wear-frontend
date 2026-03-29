// pages/academic_directory/AcademicDirectoryAdmin.jsx
// Admin-only dashboard — IsAuthenticated + IsAdminUser
import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const API = '/v1/academic-directory'

const STATUS_COLORS = {
  UNVERIFIED: { bg: 'rgba(245,158,11,0.1)', color: '#B45309', label: 'Unverified' },
  VERIFIED:   { bg: 'rgba(6,78,59,0.1)',    color: '#065F46', label: 'Verified' },
  DISPUTED:   { bg: 'rgba(220,38,38,0.1)',  color: '#991B1B', label: 'Disputed' },
}

const ROLE_LABELS = {
  CLASS_REP:         'Class Rep',
  DEPT_PRESIDENT:    'Dept. President',
  FACULTY_PRESIDENT: 'Faculty President',
}

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || { bg: '#F3F4F6', color: '#6B7280', label: status }
  return (
    <span className="px-2 py-0.5 text-xs font-semibold" style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  )
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="p-5" style={{ border: '1px solid var(--c-border)', background: 'white' }}>
      <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--c-text-muted)' }}>{label}</p>
      <p className="font-display text-3xl font-bold" style={{ color: accent || 'var(--c-primary)' }}>{value ?? '—'}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--c-text-muted)' }}>{sub}</p>}
    </div>
  )
}

// ── Notifications Panel ────────────────────────────────────────────────────
function NotificationsPanel({ onClose }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)
  const [marking, setMarking]             = useState(false)

  useEffect(() => {
    api.get(`${API}/notifications/`)
      .then(data => setNotifications(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function markAll() {
    setMarking(true)
    try {
      await api.post(`${API}/notifications/mark-all-read/`)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch {}
    setMarking(false)
  }

  async function markOne(id) {
    try {
      await api.post(`${API}/notifications/${id}/mark-read/`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch {}
  }

  const unread = notifications.filter(n => !n.is_read).length

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="h-full w-full max-w-sm flex flex-col shadow-2xl overflow-hidden"
        style={{ background: 'white' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--c-border)' }}>
          <div>
            <h3 className="font-display text-lg font-semibold" style={{ color: 'var(--c-primary)' }}>Notifications</h3>
            {unread > 0 && <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{unread} unread</p>}
          </div>
          <div className="flex items-center gap-3">
            {unread > 0 && (
              <button
                onClick={markAll}
                disabled={marking}
                className="text-xs font-semibold transition-colors"
                style={{ color: 'var(--c-primary)' }}
              >
                {marking ? 'Marking…' : 'Mark all read'}
              </button>
            )}
            <button onClick={onClose} style={{ color: 'var(--c-text-muted)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--c-primary)', borderTopColor: 'transparent' }} />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--c-text-muted)', opacity: 0.4 }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>No notifications yet</p>
            </div>
          ) : (
            notifications.map(n => {
              // SubmissionNotificationSerializer returns FLAT fields — not a nested rep object:
              //   n.representative       = UUID (just the ID)
              //   n.representative_name  = display name
              //   n.representative_role  = human-readable role (e.g. "Faculty President")
              //   n.university_name      = university name
              //   n.created_at           = notification created timestamp
              const repName   = n.representative_name  || 'Unknown'
              const repRole   = n.representative_role  || ''
              const repUni    = n.university_name       || ''
              const notifDate = n.created_at
              return (
                <div
                  key={n.id}
                  className="flex items-start gap-3 px-5 py-4 border-b cursor-pointer transition-colors"
                  style={{ borderColor: 'var(--c-border)', background: n.is_read ? 'white' : 'rgba(6,78,59,0.04)' }}
                  onClick={() => !n.is_read && markOne(n.id)}
                >
                  {!n.is_read && (
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--c-primary)' }} />
                  )}
                  {n.is_read && <div className="w-2 h-2 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--c-text)' }}>
                      {repName}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>
                      {[repRole, repUni].filter(Boolean).join(' · ')}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)', opacity: 0.7 }}>
                      {notifDate
                        ? new Date(notifDate).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </p>
                  </div>
                  {!n.is_read && (
                    <span className="text-xs px-2 py-0.5 flex-shrink-0" style={{ background: 'rgba(6,78,59,0.1)', color: 'var(--c-primary)' }}>New</span>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

// ── Representative Row ─────────────────────────────────────────────────────
// RepresentativeListSerializer returns FLAT strings:
//   department_name, faculty_name, university_name — NOT nested objects
// On expand, we fetch the detail endpoint to get full fields.
function RepRow({ rep, onVerify, onDispute, actionLoading }) {
  const [expanded, setExpanded]     = useState(false)
  const [detail, setDetail]         = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const isLoading = actionLoading === rep.id

  async function toggleExpand() {
    setExpanded(p => !p)
    if (!expanded && !detail) {
      setDetailLoading(true)
      try {
        const data = await api.get(`${API}/representatives/${rep.id}/`)
        setDetail(data)
      } catch {}
      setDetailLoading(false)
    }
  }

  // Detail serializer fields
  const d = detail

  return (
    <>
      <tr
        className="border-b cursor-pointer hover:bg-gray-50 transition-colors"
        style={{ borderColor: 'var(--c-border)' }}
        onClick={toggleExpand}
      >
        {/* Name — display_name is the preferred name (nickname if set, else full_name).
             Show display_name as primary. If they differ, show full_name as smaller label. */}
        <td className="px-4 py-3">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>
              {rep.display_name || rep.full_name}
            </p>
            {rep.display_name && rep.full_name && rep.display_name !== rep.full_name && (
              <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{rep.full_name}</p>
            )}
          </div>
        </td>
        {/* Phone */}
        <td className="px-4 py-3 hidden sm:table-cell">
          <p className="text-xs font-mono" style={{ color: 'var(--c-text-muted)' }}>{rep.phone_number}</p>
        </td>
        {/* Department — use flat string fields from list serializer */}
        <td className="px-4 py-3 hidden md:table-cell">
          <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{rep.department_name || '—'}</p>
          <p className="text-xs" style={{ color: 'var(--c-text-muted)', opacity: 0.6 }}>{rep.university_name || ''}</p>
        </td>
        {/* Role */}
        <td className="px-4 py-3 hidden lg:table-cell">
          <div>
            <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
              {ROLE_LABELS[rep.role] || rep.role_display || rep.role}
            </span>
            {rep.current_level_display && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--c-primary)', opacity: 0.8 }}>
                {rep.current_level_display}
              </p>
            )}
          </div>
        </td>
        {/* Status */}
        <td className="px-4 py-3">
          <StatusBadge status={rep.verification_status} />
        </td>
        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
            {rep.verification_status !== 'VERIFIED' && (
              <button
                onClick={() => onVerify(rep.id, rep.verification_status)}
                disabled={isLoading}
                className="px-2.5 py-1 text-xs font-semibold transition-colors"
                style={{ border: '1px solid #065F46', color: '#065F46', opacity: isLoading ? 0.5 : 1 }}
                onMouseEnter={e => { e.currentTarget.style.background = '#065F46'; e.currentTarget.style.color = 'white' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#065F46' }}
              >
                ✓ Verify
              </button>
            )}
            {rep.verification_status !== 'DISPUTED' && (
              <button
                onClick={() => onDispute(rep.id, rep.verification_status)}
                disabled={isLoading}
                className="px-2.5 py-1 text-xs font-semibold transition-colors"
                style={{ border: '1px solid #991B1B', color: '#991B1B', opacity: isLoading ? 0.5 : 1 }}
                onMouseEnter={e => { e.currentTarget.style.background = '#991B1B'; e.currentTarget.style.color = 'white' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#991B1B' }}
              >
                ✗ Dispute
              </button>
            )}
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`transition-transform duration-200 ml-1 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
              style={{ color: 'var(--c-text-muted)' }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr style={{ background: 'rgba(6,78,59,0.02)' }}>
          <td colSpan={6} className="px-6 py-4 border-b" style={{ borderColor: 'var(--c-border)' }}>
            {detailLoading ? (
              <div className="flex items-center gap-2 py-2">
                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--c-primary)', borderTopColor: 'transparent' }} />
                <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Loading details…</span>
              </div>
            ) : d ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                {[
                  ['Full Name',     d.full_name],
                  ['Nickname',      d.nickname || '—'],
                  ['Phone',         d.phone_number],
                  ['WhatsApp',      d.whatsapp_number || '—'],
                  ['Email',         d.email || '—'],
                  ['University',    d.university_name || '—'],
                  ['Faculty',       d.faculty_name || '—'],
                  ['Department',    d.department_detail?.name || d.department_name || '—'],
                  ['Role',          d.role_display || ROLE_LABELS[d.role] || d.role],
                  ['Entry Year',    d.entry_year || '—'],
                  ['Tenure Year',   d.tenure_start_year || '—'],
                  ['Level',         d.current_level_display || '—'],
                  ['Final Year?',   d.is_final_year ? 'Yes' : 'No'],
                  ['Grad. Year',    d.expected_graduation_year || '—'],
                  ['Source',        d.submission_source_display || d.submission_source || '—'],
                  ['Verified By',   d.verified_by_username || '—'],
                  ['Verified At',   d.verified_at ? new Date(d.verified_at).toLocaleDateString('en-GB') : '—'],
                  ['Submitted',     d.created_at ? new Date(d.created_at).toLocaleDateString('en-GB') : '—'],
                  ['Last Updated',  d.updated_at ? new Date(d.updated_at).toLocaleDateString('en-GB') : '—'],
                  ['Active',        d.is_active ? 'Yes' : 'No'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p style={{ color: 'var(--c-text-muted)', opacity: 0.7 }}>{k}</p>
                    <p className="font-medium mt-0.5 break-words" style={{ color: 'var(--c-text)' }}>{v}</p>
                  </div>
                ))}
                {d.notes && (
                  <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                    <p style={{ color: 'var(--c-text-muted)', opacity: 0.7 }}>Notes</p>
                    <p className="font-medium mt-0.5" style={{ color: 'var(--c-text)' }}>{d.notes}</p>
                  </div>
                )}
                {d.submission_source_other && (
                  <div className="col-span-2">
                    <p style={{ color: 'var(--c-text-muted)', opacity: 0.7 }}>Source (other)</p>
                    <p className="font-medium mt-0.5" style={{ color: 'var(--c-text)' }}>{d.submission_source_other}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs py-1" style={{ color: 'var(--c-text-muted)' }}>Could not load details.</p>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function AcademicDirectoryAdmin() {
  const { isAuthenticated, loading: authLoading, user } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats]               = useState(null)
  const [reps, setReps]                 = useState([])
  const [count, setCount]               = useState(0)
  const [nextUrl, setNextUrl]           = useState(null)
  const [prevUrl, setPrevUrl]           = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingReps, setLoadingReps]   = useState(true)
  const [repsError, setRepsError]       = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  // Filters
  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterRole, setFilterRole]     = useState('')
  const [page, setPage]                 = useState(1)

  const [showNotifications, setShowNotifications] = useState(false)

  const searchTimeout = useRef(null)

  useEffect(() => {
    document.title = 'Academic Directory Admin'
    return () => clearTimeout(searchTimeout.current)
  }, [])

  // Auth guard
  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) { navigate('/login', { replace: true }); return }
    if (!user?.is_staff)  { navigate('/', { replace: true }); return }
  }, [authLoading, isAuthenticated, user, navigate])

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const data = await api.get(`${API}/dashboard/`)
      setStats(data)
    } catch {}
    setLoadingStats(false)
  }, [])

  // Fetch representatives
  const fetchReps = useCallback(async (pg = 1, q = '', status = '', role = '') => {
    setLoadingReps(true)
    setRepsError(null)
    try {
      const params = new URLSearchParams({ page: pg })
      if (q)      params.set('search', q)
      if (status) params.set('verification_status', status)
      if (role)   params.set('role', role)
      const data = await api.get(`${API}/representatives/?${params}`)
      setReps(data.results ?? [])
      setCount(data.count ?? 0)
      setNextUrl(data.next)
      setPrevUrl(data.previous)
    } catch (err) {
      setRepsError(err.data?.detail || err.message || 'Failed to load representatives.')
      setReps([])
    }
    setLoadingReps(false)
  }, [])

  useEffect(() => {
    if (isAuthenticated && user?.is_staff) {
      fetchStats()
      fetchReps(1, '', '', '')
    }
  }, [isAuthenticated, user]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  function handleSearch(val) {
    setSearch(val)
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setPage(1)
      fetchReps(1, val, filterStatus, filterRole)
    }, 350)
  }

  function applyFilter(newStatus, newRole) {
    setPage(1)
    fetchReps(1, search, newStatus, newRole)
  }

  // Fix: pass oldStatus so we decrement the correct counter
  async function handleVerify(id, oldStatus) {
    setActionLoading(id)
    try {
      await api.post(`${API}/representatives/${id}/verify/`)
      setReps(prev => prev.map(r => r.id === id ? { ...r, verification_status: 'VERIFIED' } : r))
      setStats(prev => {
        if (!prev) return prev
        const next = { ...prev, verified_count: (prev.verified_count || 0) + 1 }
        if (oldStatus === 'UNVERIFIED') next.unverified_count = Math.max(0, (prev.unverified_count || 0) - 1)
        if (oldStatus === 'DISPUTED')   next.disputed_count   = Math.max(0, (prev.disputed_count   || 0) - 1)
        return next
      })
    } catch {}
    setActionLoading(null)
  }

  // Fix: pass oldStatus so we decrement the correct counter
  async function handleDispute(id, oldStatus) {
    setActionLoading(id)
    try {
      await api.post(`${API}/representatives/${id}/dispute/`)
      setReps(prev => prev.map(r => r.id === id ? { ...r, verification_status: 'DISPUTED' } : r))
      setStats(prev => {
        if (!prev) return prev
        const next = { ...prev, disputed_count: (prev.disputed_count || 0) + 1 }
        if (oldStatus === 'VERIFIED')   next.verified_count   = Math.max(0, (prev.verified_count   || 0) - 1)
        if (oldStatus === 'UNVERIFIED') next.unverified_count = Math.max(0, (prev.unverified_count || 0) - 1)
        return next
      })
    } catch {}
    setActionLoading(null)
  }

  if (authLoading) {
    return (
      <main className="flex-1 flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--c-primary)', borderTopColor: 'transparent' }} />
      </main>
    )
  }

  const totalPages = Math.ceil(count / 20) || 1

  return (
    <main className="page-transition flex-1 py-10 px-4 sm:px-6" style={{ background: 'var(--c-bg)', minHeight: '60vh' }}>
      <div className="max-w-7xl mx-auto">

        {/* ── Page Header ───────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="section-eyebrow mb-1">Admin Panel</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: 'var(--c-primary)' }}>
              Academic Directory
            </h1>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Notifications bell */}
            <button
              onClick={() => setShowNotifications(true)}
              className="relative flex items-center justify-center w-10 h-10 transition-colors"
              style={{ border: '1px solid var(--c-border)', background: 'white' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--c-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
              title="Notifications"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--c-primary)' }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {stats?.unread_notifications > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-white font-bold rounded-full px-1"
                  style={{ background: '#DC2626', fontSize: '10px' }}
                >
                  {stats.unread_notifications}
                </span>
              )}
            </button>
            {/* Fix: <Link> not <a> to avoid full page reload */}
            <Link to="/academic-directory/submit" className="btn-secondary text-sm">
              View Submit Form
            </Link>
          </div>
        </div>

        {/* ── Stats Grid ────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {loadingStats ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-5 animate-pulse" style={{ border: '1px solid var(--c-border)', background: 'white' }}>
                <div className="h-3 w-16 mb-3 rounded" style={{ background: '#E5E7EB' }} />
                <div className="h-8 w-10 rounded" style={{ background: '#E5E7EB' }} />
              </div>
            ))
          ) : (
            <>
              <StatCard label="Representatives" value={stats?.total_representatives}    sub="Active" />
              <StatCard label="Universities"     value={stats?.total_universities} />
              <StatCard label="Verified"         value={stats?.verified_count}    accent="#065F46" sub="Confirmed" />
              <StatCard label="Unverified"       value={stats?.unverified_count}  accent="#B45309" sub="Pending review" />
              <StatCard label="Disputed"         value={stats?.disputed_count}    accent="#991B1B" />
              <StatCard label="Last 24h"         value={stats?.recent_submissions_24h} sub={`${stats?.recent_submissions_7d ?? 0} this week`} />
            </>
          )}
        </div>

        {/* ── Role breakdown ────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Class Reps',        value: stats.class_reps_count,        color: 'var(--c-primary)' },
              { label: 'Dept. Presidents',  value: stats.dept_presidents_count,   color: '#065F46' },
              { label: 'Faculty Presidents',value: stats.faculty_presidents_count, color: '#7C3AED' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-4 px-5 py-4" style={{ border: '1px solid var(--c-border)', background: 'white' }}>
                <div className="w-1 h-10 flex-shrink-0 rounded" style={{ background: color }} />
                <div>
                  <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{label}</p>
                  <p className="font-display text-2xl font-bold mt-0.5" style={{ color }}>{value ?? 0}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Search + Filters ──────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--c-text-muted)' }}
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search name, phone, email…"
              className="w-full pl-9 pr-4 py-2.5 text-sm"
              style={{
                border: '1px solid var(--c-border)',
                background: 'white',
                color: 'var(--c-text)',
                outline: 'none',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6,78,59,0.08)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--c-border)'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>

          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); applyFilter(e.target.value, filterRole) }}
            className="py-2.5 px-3 text-sm appearance-none"
            style={{ border: '1px solid var(--c-border)', background: 'white', color: 'var(--c-text)', outline: 'none', minWidth: '140px' }}
          >
            <option value="">All Statuses</option>
            <option value="UNVERIFIED">Unverified</option>
            <option value="VERIFIED">Verified</option>
            <option value="DISPUTED">Disputed</option>
          </select>

          <select
            value={filterRole}
            onChange={e => { setFilterRole(e.target.value); applyFilter(filterStatus, e.target.value) }}
            className="py-2.5 px-3 text-sm appearance-none"
            style={{ border: '1px solid var(--c-border)', background: 'white', color: 'var(--c-text)', outline: 'none', minWidth: '160px' }}
          >
            <option value="">All Roles</option>
            <option value="CLASS_REP">Class Reps</option>
            <option value="DEPT_PRESIDENT">Dept. Presidents</option>
            <option value="FACULTY_PRESIDENT">Faculty Presidents</option>
          </select>
        </div>

        {/* Result count + clear */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
            {loadingReps ? 'Loading…' : `${count} representative${count !== 1 ? 's' : ''}`}
          </p>
          {(filterStatus || filterRole || search) && (
            <button
              className="text-xs font-semibold"
              style={{ color: 'var(--c-primary)' }}
              onClick={() => {
                setSearch(''); setFilterStatus(''); setFilterRole(''); setPage(1)
                fetchReps(1, '', '', '')
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ── Representatives Table ─────────────────────────── */}
        <div className="overflow-x-auto" style={{ border: '1px solid var(--c-border)', background: 'white' }}>
          {loadingReps ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--c-primary)', borderTopColor: 'transparent' }} />
            </div>
          ) : repsError ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-4">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: '#DC2626', opacity: 0.5 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>{repsError}</p>
              <button onClick={() => fetchReps(page, search, filterStatus, filterRole)} className="btn-secondary text-sm">
                Retry
              </button>
            </div>
          ) : reps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--c-text-muted)', opacity: 0.5 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
                {search || filterStatus || filterRole ? 'No representatives match your filters.' : 'No representatives yet.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr style={{ background: 'var(--c-bg-warm)', borderBottom: '1px solid var(--c-border)' }}>
                  {[
                    { label: 'Name',       cls: '' },
                    { label: 'Phone',      cls: 'hidden sm:table-cell' },
                    { label: 'Department', cls: 'hidden md:table-cell' },
                    { label: 'Role',       cls: 'hidden lg:table-cell' },
                    { label: 'Status',     cls: '' },
                    { label: 'Actions',    cls: '' },
                  ].map(({ label, cls }) => (
                    <th
                      key={label}
                      className={`px-4 py-3 text-xs font-semibold tracking-wide uppercase ${cls}`}
                      style={{ color: 'var(--c-text-muted)' }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reps.map(rep => (
                  <RepRow
                    key={rep.id}
                    rep={rep}
                    onVerify={handleVerify}
                    onDispute={handleDispute}
                    actionLoading={actionLoading}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination ────────────────────────────────────── */}
        {!loadingReps && !repsError && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => { const p = page - 1; setPage(p); fetchReps(p, search, filterStatus, filterRole) }}
              disabled={!prevUrl}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
              style={{ border: '1px solid var(--c-border)', background: 'white', color: 'var(--c-text)', opacity: prevUrl ? 1 : 0.4, cursor: prevUrl ? 'pointer' : 'not-allowed' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              Previous
            </button>
            <span className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => { const p = page + 1; setPage(p); fetchReps(p, search, filterStatus, filterRole) }}
              disabled={!nextUrl}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
              style={{ border: '1px solid var(--c-border)', background: 'white', color: 'var(--c-text)', opacity: nextUrl ? 1 : 0.4, cursor: nextUrl ? 'pointer' : 'not-allowed' }}
            >
              Next
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        )}
      </div>

      {/* Notifications drawer */}
      {showNotifications && (
        <NotificationsPanel onClose={() => { setShowNotifications(false); fetchStats() }} />
      )}
    </main>
  )
}
