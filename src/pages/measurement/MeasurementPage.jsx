// pages/measurement/MeasurementPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

// ── Field definitions ────────────────────────────────────────────────────────
const UPPER_BODY_FIELDS = [
  { key: 'chest',         label: 'Chest',         unit: 'in', min: 20, max: 70,  hint: 'Fullest part of your chest' },
  { key: 'shoulder',      label: 'Shoulder',      unit: 'in', min: 12, max: 30,  hint: 'Tip to tip across shoulders' },
  { key: 'neck',          label: 'Neck',          unit: 'in', min: 10, max: 30,  hint: 'Around the base of your neck' },
  { key: 'sleeve_length', label: 'Sleeve Length', unit: 'in', min: 20, max: 40,  hint: 'Shoulder to wrist' },
  { key: 'sleeve_round',  label: 'Sleeve Round',  unit: 'in', min: 8,  max: 20,  hint: 'Around the upper arm' },
  { key: 'top_length',    label: 'Top Length',    unit: 'in', min: 20, max: 40,  hint: 'Neck to desired hem' },
]

const LOWER_BODY_FIELDS = [
  { key: 'waist',          label: 'Waist',          unit: 'in', min: 20, max: 60,  hint: 'Natural waistline' },
  { key: 'hips',           label: 'Hips',           unit: 'in', min: 25, max: 70,  hint: 'Fullest part of your hips' },
  { key: 'thigh',          label: 'Thigh',          unit: 'in', min: 12, max: 40,  hint: 'Around your upper thigh' },
  { key: 'knee',           label: 'Knee',           unit: 'in', min: 10, max: 30,  hint: 'Around the knee' },
  { key: 'ankle',          label: 'Ankle',          unit: 'in', min: 7,  max: 20,  hint: 'Around the ankle' },
  { key: 'trouser_length', label: 'Trouser Length', unit: 'in', min: 25, max: 50,  hint: 'Waist to ankle' },
]

const ALL_FIELDS = [...UPPER_BODY_FIELDS, ...LOWER_BODY_FIELDS]
const SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest first' },
  { value: 'created_at', label: 'Oldest first' },
  { value: '-updated_at', label: 'Recently updated' },
  { value: 'updated_at', label: 'Least recently updated' },
]

const emptyForm = () =>
  Object.fromEntries(ALL_FIELDS.map((f) => [f.key, '']))

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function filledCount(record) {
  return ALL_FIELDS.filter((f) => record[f.key] !== null && record[f.key] !== '').length
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldInput({ field, value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--c-text-muted)' }}>
        {field.label}
      </label>
      <div className="relative flex items-center">
        <input
          type="number"
          step="0.1"
          min={field.min}
          max={field.max}
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={`${field.min}–${field.max}`}
          className="w-full pr-10 py-2.5 px-3 text-sm transition-colors"
          style={{
            background: 'var(--c-bg)',
            border: `1px solid ${error ? '#DC2626' : 'var(--c-border)'}`,
            color: 'var(--c-text)',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error ? '#DC2626' : 'var(--c-primary)'
            e.currentTarget.style.boxShadow = `0 0 0 3px ${error ? 'rgba(220,38,38,0.1)' : 'rgba(6,78,59,0.08)'}`
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? '#DC2626' : 'var(--c-border)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
        <span
          className="absolute right-3 text-xs font-medium pointer-events-none select-none"
          style={{ color: 'var(--c-text-muted)' }}
        >
          in
        </span>
      </div>
      <p className="text-xs" style={{ color: 'var(--c-text-muted)', opacity: 0.75 }}>
        {field.hint} ({field.min}–{field.max} in)
      </p>
      {error && <p className="text-xs font-medium" style={{ color: '#DC2626' }}>{error}</p>}
    </div>
  )
}

function FieldGroup({ title, icon, fields, values, onChange, errors }) {
  return (
    <div className="p-6" style={{ border: '1px solid var(--c-border)', background: 'white' }}>
      <div className="flex items-center gap-2 mb-5">
        <div
          className="w-8 h-8 flex items-center justify-center"
          style={{ background: 'var(--c-bg-warm)' }}
        >
          {icon}
        </div>
        <h3 className="font-display text-lg font-semibold" style={{ color: 'var(--c-primary)' }}>
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {fields.map((f) => (
          <FieldInput
            key={f.key}
            field={f}
            value={values[f.key] ?? ''}
            onChange={onChange}
            error={errors?.[f.key]}
          />
        ))}
      </div>
    </div>
  )
}

function MeasurementCard({ record, onOpen, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const filled = filledCount(record)

  return (
    <div
      className="transition-shadow duration-200"
      style={{ border: '1px solid var(--c-border)', background: 'white' }}
    >
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'var(--c-primary)' }}
          >
            {filled}
            <span className="text-xs font-normal opacity-70 ml-0.5">/{ALL_FIELDS.length}</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>
              Measurement #{record.id?.slice(0, 8) ?? '—'}
            </p>
            <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
              Saved {formatDate(record.created_at)}
              {record.updated_at !== record.created_at && (
                <span className="ml-2 opacity-70">· Updated {formatDate(record.updated_at)}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <button
            onClick={(e) => { e.stopPropagation(); onOpen(record) }}
            className="px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors"
            style={{ border: '1px solid var(--c-primary)', color: 'var(--c-primary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--c-primary)'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-primary)' }}
          >
            View
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(record) }}
            className="px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors"
            style={{ border: '1px solid #DC2626', color: '#DC2626' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#DC2626'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#DC2626' }}
          >
            Delete
          </button>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            style={{ color: 'var(--c-text-muted)' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5 border-t" style={{ borderColor: 'var(--c-border)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Upper Body */}
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--c-text-muted)' }}>
                Upper Body
              </p>
              <div className="space-y-2">
                {UPPER_BODY_FIELDS.map((f) => (
                  <div key={f.key} className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{f.label}</span>
                    <span className="text-sm font-medium" style={{ color: record[f.key] ? 'var(--c-text)' : 'var(--c-text-muted)', opacity: record[f.key] ? 1 : 0.4 }}>
                      {record[f.key] ? `${record[f.key]} in` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* Lower Body */}
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--c-text-muted)' }}>
                Lower Body
              </p>
              <div className="space-y-2">
                {LOWER_BODY_FIELDS.map((f) => (
                  <div key={f.key} className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{f.label}</span>
                    <span className="text-sm font-medium" style={{ color: record[f.key] ? 'var(--c-text)' : 'var(--c-text-muted)', opacity: record[f.key] ? 1 : 0.4 }}>
                      {record[f.key] ? `${record[f.key]} in` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailModal({ id, onClose, onEdit }) {
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    api.get(`/measurement/measurements/${id}/`)
      .then(data => {
        if (!cancelled) setRecord(data)
      })
      .catch(err => {
        if (!cancelled) setError(err.data?.detail || err.message || 'Could not load this measurement record.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-xl" style={{ background: 'white' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="section-eyebrow mb-1">Measurement Detail</p>
            <h3 className="font-display text-xl font-semibold" style={{ color: 'var(--c-primary)' }}>Measurement Record</h3>
          </div>
          <button onClick={onClose} className="text-sm font-semibold" style={{ color: 'var(--c-text-muted)' }}>Close</button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--c-primary)', borderTopColor: 'transparent' }} />
            <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>Loading measurement…</p>
          </div>
        ) : error ? (
          <div className="px-4 py-3 text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>{error}</div>
        ) : record ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
              {[
                ['Record ID', record.id?.slice(0, 8) || '—'],
                ['Saved', formatDate(record.created_at)],
                ['Updated', formatDate(record.updated_at)],
                ['Filled Fields', `${filledCount(record)}/${ALL_FIELDS.length}`],
              ].map(([label, value]) => (
                <div key={label} className="p-4" style={{ background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)' }}>
                  <p className="text-xs font-semibold tracking-wide uppercase mb-1" style={{ color: 'var(--c-text-muted)' }}>{label}</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>{value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--c-text-muted)' }}>Upper Body</p>
                <div className="space-y-2">
                  {UPPER_BODY_FIELDS.map(field => (
                    <div key={field.key} className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--c-border)' }}>
                      <span className="text-sm" style={{ color: 'var(--c-text-muted)' }}>{field.label}</span>
                      <span className="text-sm font-semibold" style={{ color: record[field.key] ? 'var(--c-text)' : 'var(--c-text-muted)', opacity: record[field.key] ? 1 : 0.45 }}>
                        {record[field.key] ? `${record[field.key]} in` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--c-text-muted)' }}>Lower Body</p>
                <div className="space-y-2">
                  {LOWER_BODY_FIELDS.map(field => (
                    <div key={field.key} className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--c-border)' }}>
                      <span className="text-sm" style={{ color: 'var(--c-text-muted)' }}>{field.label}</span>
                      <span className="text-sm font-semibold" style={{ color: record[field.key] ? 'var(--c-text)' : 'var(--c-text-muted)', opacity: record[field.key] ? 1 : 0.45 }}>
                        {record[field.key] ? `${record[field.key]} in` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => onEdit(record)} className="btn-primary">Edit Record</button>
              <button onClick={onClose} className="btn-secondary">Done</button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

function DeleteModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-sm p-6 shadow-xl" style={{ background: 'white' }}>
        <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4" style={{ background: '#FEF2F2' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>
        <h3 className="text-center font-display text-lg font-semibold mb-2" style={{ color: 'var(--c-text)' }}>
          Delete Measurement?
        </h3>
        <p className="text-center text-sm mb-6" style={{ color: 'var(--c-text-muted)' }}>
          This measurement record will be permanently removed. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-semibold tracking-wide transition-colors"
            style={{ border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--c-bg)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-semibold tracking-wide text-white transition-opacity"
            style={{ background: '#DC2626', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function MeasurementPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [records, setRecords]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [sortOrder, setSortOrder] = useState('-created_at')
  const [page, setPage]           = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [nextUrl, setNextUrl]     = useState(null)
  const [prevUrl, setPrevUrl]     = useState(null)
  const [detailId, setDetailId]   = useState(null)

  // Form state
  const [formMode, setFormMode]   = useState(null) // null | 'create' | 'edit'
  const [editingId, setEditingId] = useState(null)
  const [formValues, setFormValues] = useState(emptyForm())
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError]   = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => { document.title = 'My Measurements — Material Wear' }, [])

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/login', { replace: true })
  }, [authLoading, isAuthenticated, navigate])

  const fetchRecords = useCallback(async (pg = page, ordering = sortOrder) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: pg, ordering })
      const data = await api.get(`/measurement/measurements/?${params}`)
      const items = Array.isArray(data) ? data : (data.results ?? [])
      setRecords(items)
      setTotalCount(Array.isArray(data) ? items.length : (data.count ?? items.length))
      setNextUrl(Array.isArray(data) ? null : (data.next ?? null))
      setPrevUrl(Array.isArray(data) ? null : (data.previous ?? null))
    } catch (err) {
      setError(err.data?.detail || err.message || 'Could not load measurements.')
    } finally {
      setLoading(false)
    }
  }, [page, sortOrder])

  useEffect(() => {
    if (isAuthenticated) fetchRecords(page, sortOrder)
  }, [isAuthenticated, fetchRecords, page, sortOrder])

  // ── Form handlers ────────────────────────────────────────────────────────

  function handleFieldChange(key, val) {
    setFormValues((prev) => ({ ...prev, [key]: val }))
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: null }))
  }

  function openCreate() {
    setFormValues(emptyForm())
    setFieldErrors({})
    setFormError(null)
    setEditingId(null)
    setFormMode('create')
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }

  function openEdit(record) {
    const vals = Object.fromEntries(
      ALL_FIELDS.map((f) => [f.key, record[f.key] != null ? String(record[f.key]) : ''])
    )
    setFormValues(vals)
    setFieldErrors({})
    setFormError(null)
    setEditingId(record.id)
    setFormMode('edit')
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }

  function cancelForm() {
    setFormMode(null)
    setEditingId(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFieldErrors({})
    setFormError(null)

    // Build payload — only include non-empty fields
    const createPayload = {}
    const replacePayload = {}
    ALL_FIELDS.forEach((f) => {
      const raw = formValues[f.key]
      replacePayload[f.key] = raw === '' ? null : raw
      if (raw !== '') createPayload[f.key] = raw
    })

    if (Object.keys(createPayload).length === 0) {
      setFormError('Please fill in at least one measurement field.')
      return
    }

    setSubmitting(true)
    try {
      if (formMode === 'create') {
        await api.post('/measurement/measurements/', createPayload)
        setSuccessMsg('Measurement saved successfully.')
      } else {
        await api.put(`/measurement/measurements/${editingId}/`, replacePayload)
        setSuccessMsg('Measurement updated successfully.')
      }
      setFormMode(null)
      setEditingId(null)
      await fetchRecords(page, sortOrder)
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err) {
      const data = err.data
      if (data && typeof data === 'object') {
        const fieldErrs = {}
        let general = null
        for (const [k, v] of Object.entries(data)) {
          const msg = Array.isArray(v) ? v[0] : String(v)
          if (ALL_FIELDS.find((f) => f.key === k)) {
            fieldErrs[k] = msg
          } else {
            general = msg
          }
        }
        if (Object.keys(fieldErrs).length) setFieldErrors(fieldErrs)
        if (general) setFormError(general)
      } else {
        setFormError('Failed to save. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Delete handlers ──────────────────────────────────────────────────────

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await api.delete(`/measurement/measurements/${deleteTarget.id}/`)
      setDeleteTarget(null)
      setSuccessMsg('Measurement deleted successfully.')
      const nextPage = page > 1 && records.length === 1 ? page - 1 : page
      setPage(nextPage)
      await fetchRecords(nextPage, sortOrder)
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err) {
      setError(err.data?.detail || err.message || 'Could not delete this measurement.')
      setDeleteTarget(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <main className="flex-1 flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--c-primary)', borderTopColor: 'transparent' }} />
      </main>
    )
  }

  return (
    <main className="page-transition flex-1 py-12 px-4 sm:px-6" style={{ background: 'var(--c-bg)', minHeight: '60vh' }}>
      <div className="max-w-4xl mx-auto">
        {detailId && (
          <DetailModal
            id={detailId}
            onClose={() => setDetailId(null)}
            onEdit={(record) => {
              setDetailId(null)
              openEdit(record)
            }}
          />
        )}

        {/* ── Page Header ───────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="section-eyebrow mb-1">Body Measurements</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: 'var(--c-primary)' }}>
              My Measurements
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--c-text-muted)' }}>
              Store your body measurements for accurate custom clothing orders.
            </p>
          </div>
          {formMode === null && (
            <button
              onClick={openCreate}
              className="btn-primary flex items-center gap-2 self-start sm:self-auto"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Measurements
            </button>
          )}
        </div>

        {/* ── Success banner ────────────────────────────────── */}
        {successMsg && (
          <div
            className="flex items-center gap-3 px-4 py-3 mb-6"
            style={{ background: 'rgba(6,78,59,0.08)', border: '1px solid rgba(6,78,59,0.2)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-primary)" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <p className="text-sm font-medium" style={{ color: 'var(--c-primary)' }}>{successMsg}</p>
          </div>
        )}

        {/* ── Form (Create / Edit) ───────────────────────────── */}
        {formMode !== null && (
          <form
            onSubmit={handleSubmit}
            className="mb-10"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--c-primary)' }}>
                {formMode === 'create' ? 'Add New Measurements' : 'Edit Measurements'}
              </h2>
              <button
                type="button"
                onClick={cancelForm}
                className="text-xs font-semibold tracking-wide transition-colors"
                style={{ color: 'var(--c-text-muted)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--c-text)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--c-text-muted)'}
              >
                ✕ Cancel
              </button>
            </div>

            {/* Tip */}
            <div
              className="flex items-start gap-3 px-4 py-3 mb-5"
              style={{ background: 'rgba(6,78,59,0.06)', border: '1px solid rgba(6,78,59,0.15)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-primary)" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                Fill in the fields you know. All measurements are in <strong>inches</strong>. Leave fields blank if you&apos;re unsure, and you can always update later.
                At least one field must be filled.
              </p>
            </div>

            <div className="space-y-4">
              <FieldGroup
                title="Upper Body"
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-primary)" strokeWidth="1.5">
                    <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                    <path d="M12 7V3m0 0L9 6m3-3l3 3"/>
                  </svg>
                }
                fields={UPPER_BODY_FIELDS}
                values={formValues}
                onChange={handleFieldChange}
                errors={fieldErrors}
              />
              <FieldGroup
                title="Lower Body"
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-primary)" strokeWidth="1.5">
                    <path d="M5 3h14l-2 10H7L5 3z"/>
                    <path d="M7 13l-3 8h6l2-8"/><path d="M17 13l3 8h-6l-2-8"/>
                  </svg>
                }
                fields={LOWER_BODY_FIELDS}
                values={formValues}
                onChange={handleFieldChange}
                errors={fieldErrors}
              />
            </div>

            {formError && (
              <div
                className="flex items-center gap-2 px-4 py-3 mt-4"
                style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-sm" style={{ color: '#DC2626' }}>{formError}</p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex items-center gap-2"
                style={{ opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/>
                      <polyline points="7 3 7 8 15 8"/>
                    </svg>
                    {formMode === 'create' ? 'Save Measurements' : 'Update Measurements'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ── Records list ──────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--c-primary)', borderTopColor: 'transparent' }} />
            <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>Loading measurements…</p>
          </div>
        ) : error ? (
          <div
            className="flex flex-col items-center justify-center py-16 gap-4"
            style={{ border: '1px dashed var(--c-border)' }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--c-text-muted)', opacity: 0.5 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-sm text-center" style={{ color: 'var(--c-text-muted)' }}>{error}</p>
            <button onClick={fetchRecords} className="btn-secondary text-sm">Retry</button>
          </div>
        ) : records.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-5 text-center"
            style={{ border: '1px dashed var(--c-border)' }}
          >
            <div
              className="w-16 h-16 flex items-center justify-center"
              style={{ background: 'var(--c-bg-warm)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--c-primary)' }}>
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div>
              <p className="font-display text-xl font-semibold mb-1" style={{ color: 'var(--c-primary)' }}>
                No measurements yet
              </p>
              <p className="text-sm max-w-xs" style={{ color: 'var(--c-text-muted)' }}>
                Add your body measurements once and they&apos;ll be ready whenever you place a custom order.
              </p>
            </div>
            {formMode === null && (
              <button onClick={openCreate} className="btn-primary flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add My First Measurements
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
                {totalCount} record{totalCount !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--c-text-muted)' }}>Sort</label>
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value)
                    setPage(1)
                  }}
                  className="py-2 px-3 text-sm"
                  style={{ border: '1px solid var(--c-border)', background: 'white', color: 'var(--c-text)', outline: 'none' }}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-3">
              {records.map((rec) => (
                <MeasurementCard
                  key={rec.id}
                  record={rec}
                  onOpen={(record) => {
                    setDetailId(record.id)
                  }}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
            {(prevUrl || nextUrl) && (
              <div className="flex items-center justify-between mt-5">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={!prevUrl}
                  className="px-4 py-2 text-sm font-medium"
                  style={{ border: '1px solid var(--c-border)', background: 'white', color: 'var(--c-text)', opacity: prevUrl ? 1 : 0.45, cursor: prevUrl ? 'pointer' : 'not-allowed' }}
                >
                  Previous
                </button>
                <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>Page {page}</p>
                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={!nextUrl}
                  className="px-4 py-2 text-sm font-medium"
                  style={{ border: '1px solid var(--c-border)', background: 'white', color: 'var(--c-text)', opacity: nextUrl ? 1 : 0.45, cursor: nextUrl ? 'pointer' : 'not-allowed' }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Guide panel ───────────────────────────────────── */}
        <div
          className="mt-10 p-6"
          style={{ background: 'var(--c-bg-warm)', border: '1px solid rgba(6,78,59,0.1)' }}
        >
          <h3 className="font-display text-base font-semibold mb-4" style={{ color: 'var(--c-primary)' }}>
            How to take accurate measurements
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ['Use a flexible tape measure', 'Rigid rulers give inaccurate results for body measurements.'],
              ['Measure over light clothing', 'Avoid bulky layers; breathe normally and stand straight.'],
              ['Keep the tape snug, not tight', 'It should lie flat against your skin without indenting.'],
              ['Ask a friend to help', 'Self-measuring can be inaccurate for back/shoulder spans.'],
            ].map(([title, body]) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(6,78,59,0.1)' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--c-primary)" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--c-text)' }}>{title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Delete modal ──────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteModal
          record={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </main>
  )
}
