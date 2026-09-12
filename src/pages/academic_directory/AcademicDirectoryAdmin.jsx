import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const API = '/v1/academic-directory'

const STATUS_COLORS = {
  UNVERIFIED: { bg: 'rgba(245,158,11,0.1)', color: '#B45309', label: 'Unverified' },
  VERIFIED:   { bg: 'rgba(6,78,59,0.1)', color: '#065F46', label: 'Verified' },
  DISPUTED:   { bg: 'rgba(220,38,38,0.1)', color: '#991B1B', label: 'Disputed' },
}

const ROLE_LABELS = {
  CLASS_REP: 'Class Rep',
  DEPT_PRESIDENT: 'Dept. President',
  FACULTY_PRESIDENT: 'Faculty President',
}

const SOURCE_LABELS = {
  WEBSITE: 'Website',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'Email',
  PHONE: 'Phone Call',
  SMS: 'SMS',
  MANUAL: 'Manual Entry',
  IMPORT: 'Bulk Import',
  OTHER: 'Other',
}

const UNIVERSITY_TYPES = [
  { value: 'FEDERAL', label: 'Federal University' },
  { value: 'STATE', label: 'State University' },
  { value: 'PRIVATE', label: 'Private University' },
]

const NIGERIAN_STATES = [
  { value: 'ABIA', label: 'Abia' },
  { value: 'ADAMAWA', label: 'Adamawa' },
  { value: 'AKWA_IBOM', label: 'Akwa Ibom' },
  { value: 'ANAMBRA', label: 'Anambra' },
  { value: 'BAUCHI', label: 'Bauchi' },
  { value: 'BAYELSA', label: 'Bayelsa' },
  { value: 'BENUE', label: 'Benue' },
  { value: 'BORNO', label: 'Borno' },
  { value: 'CROSS_RIVER', label: 'Cross River' },
  { value: 'DELTA', label: 'Delta' },
  { value: 'EBONYI', label: 'Ebonyi' },
  { value: 'EDO', label: 'Edo' },
  { value: 'EKITI', label: 'Ekiti' },
  { value: 'ENUGU', label: 'Enugu' },
  { value: 'FCT', label: 'Federal Capital Territory' },
  { value: 'GOMBE', label: 'Gombe' },
  { value: 'IMO', label: 'Imo' },
  { value: 'JIGAWA', label: 'Jigawa' },
  { value: 'KADUNA', label: 'Kaduna' },
  { value: 'KANO', label: 'Kano' },
  { value: 'KATSINA', label: 'Katsina' },
  { value: 'KEBBI', label: 'Kebbi' },
  { value: 'KOGI', label: 'Kogi' },
  { value: 'KWARA', label: 'Kwara' },
  { value: 'LAGOS', label: 'Lagos' },
  { value: 'NASARAWA', label: 'Nasarawa' },
  { value: 'NIGER', label: 'Niger' },
  { value: 'OGUN', label: 'Ogun' },
  { value: 'ONDO', label: 'Ondo' },
  { value: 'OSUN', label: 'Osun' },
  { value: 'OYO', label: 'Oyo' },
  { value: 'PLATEAU', label: 'Plateau' },
  { value: 'RIVERS', label: 'Rivers' },
  { value: 'SOKOTO', label: 'Sokoto' },
  { value: 'TARABA', label: 'Taraba' },
  { value: 'YOBE', label: 'Yobe' },
  { value: 'ZAMFARA', label: 'Zamfara' },
]

const REPRESENTATIVE_TABS = ['Directory', 'Institutions']
const INSTITUTION_TABS = ['Universities', 'Faculties', 'Departments']

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 15 }, (_, i) => currentYear - i)

function normalizeCollection(data) {
  return {
    items: Array.isArray(data) ? data : (data?.results || []),
    count: Array.isArray(data) ? data.length : (data?.count ?? 0),
    next: Array.isArray(data) ? null : (data?.next ?? null),
    previous: Array.isArray(data) ? null : (data?.previous ?? null),
  }
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
    <div className="p-5" style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface)' }}>
      <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--c-text-muted)' }}>{label}</p>
      <p className="font-display text-3xl font-bold" style={{ color: accent || 'var(--c-primary)' }}>{value ?? '—'}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--c-text-muted)' }}>{sub}</p>}
    </div>
  )
}

function FormField({ label, required, children, hint, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--c-text-muted)' }}>
        {label}{required && <span style={{ color: '#DC2626' }}> *</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs" style={{ color: 'var(--c-text-muted)', opacity: 0.75 }}>{hint}</p>}
      {error && <p className="text-xs font-medium" style={{ color: '#DC2626' }}>{error}</p>}
    </div>
  )
}

function Input(props) {
  const { error, ...rest } = props
  return (
    <input
      {...rest}
      className="w-full py-2.5 px-3 text-sm"
      style={{ border: `1px solid ${error ? '#DC2626' : 'var(--c-border)'}`, background: 'var(--c-surface)', color: 'var(--c-text)', outline: 'none' }}
    />
  )
}

function Select(props) {
  const { error, children, ...rest } = props
  return (
    <select
      {...rest}
      className="w-full py-2.5 px-3 text-sm appearance-none"
      style={{ border: `1px solid ${error ? '#DC2626' : 'var(--c-border)'}`, background: 'var(--c-surface)', color: 'var(--c-text)', outline: 'none' }}
    >
      {children}
    </select>
  )
}

function TextArea(props) {
  const { error, ...rest } = props
  return (
    <textarea
      {...rest}
      className="w-full py-2.5 px-3 text-sm resize-none"
      style={{ border: `1px solid ${error ? '#DC2626' : 'var(--c-border)'}`, background: 'var(--c-surface)', color: 'var(--c-text)', outline: 'none' }}
    />
  )
}

function formatDate(value, withTime = false) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-GB', withTime ? {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  } : { day: '2-digit', month: 'short', year: 'numeric' })
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

async function downloadAcademicExport(params) {
  const response = await api.getBlob(`${API}/export-pdf/?${params.toString()}`)

  const disposition = response.headers.get('Content-Disposition') || ''
  const matched = disposition.match(/filename="?([^"]+)"?/)
  const filename = matched?.[1] || (response.headers.get('Content-Type')?.includes('zip') ? 'academic-directory-export.zip' : 'academic-directory-export.pdf')
  const blob = await response.blob()
  downloadBlob(blob, filename)
}

function NotificationsPanel({ onClose }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get(`${API}/notifications/`)
      setNotifications(normalizeCollection(data).items)
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadNotifications() }, [loadNotifications])

  async function markAll() {
    setMarking(true)
    try {
      await api.post(`${API}/notifications/mark-all-read/`)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch {
      // Non-blocking: the drawer still renders cached local state.
    }
    setMarking(false)
  }

  async function markOne(id) {
    try {
      await api.post(`${API}/notifications/${id}/mark-read/`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch {
      // Non-blocking: keep the rest of the drawer interactive.
    }
  }

  const unread = notifications.filter(n => !n.is_read).length

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="h-full w-full max-w-sm flex flex-col shadow-2xl overflow-hidden" style={{ background: 'var(--c-surface)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--c-border)' }}>
          <div>
            <h3 className="font-display text-lg font-semibold" style={{ color: 'var(--c-primary)' }}>Notifications</h3>
            {unread > 0 && <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{unread} unread</p>}
          </div>
          <div className="flex items-center gap-3">
            {unread > 0 && (
              <button onClick={markAll} disabled={marking} className="text-xs font-semibold" style={{ color: 'var(--c-primary)' }}>
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

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--c-primary)', borderTopColor: 'transparent' }} />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
              <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>No notifications yet</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className="flex items-start gap-3 px-5 py-4 border-b cursor-pointer transition-colors"
                style={{ borderColor: 'var(--c-border)', background: n.is_read ? 'white' : 'rgba(6,78,59,0.04)' }}
                onClick={() => !n.is_read && markOne(n.id)}
              >
                {!n.is_read ? <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--c-primary)' }} /> : <div className="w-2 h-2 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--c-text)' }}>{n.representative_name || 'Unknown'}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>{[n.representative_role, n.university_name].filter(Boolean).join(' · ')}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)', opacity: 0.7 }}>{formatDate(n.created_at, true)}</p>
                </div>
                {!n.is_read && <span className="text-xs px-2 py-0.5 flex-shrink-0" style={{ background: 'rgba(6,78,59,0.1)', color: 'var(--c-primary)' }}>New</span>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function RepresentativeEditorModal({
  repId,
  universities,
  faculties,
  departments,
  onClose,
  onSaved,
  onDeleted,
}) {
  const isCreate = !repId
  const [loading, setLoading] = useState(!isCreate)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [form, setForm] = useState({
    full_name: '',
    nickname: '',
    phone_number: '',
    whatsapp_number: '',
    email: '',
    university_id: '',
    faculty_id: '',
    department: '',
    role: '',
    entry_year: '',
    tenure_start_year: '',
    submission_source: 'MANUAL',
    submission_source_other: '',
    notes: '',
    is_active: true,
  })

  const availableFaculties = faculties.filter(f => !form.university_id || String(f.university) === String(form.university_id))
  const availableDepartments = departments.filter(d => !form.faculty_id || String(d.faculty) === String(form.faculty_id))

  const set = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setFormErrors(prev => ({ ...prev, [field]: null }))
  }, [])

  useEffect(() => {
    if (isCreate) return
    let cancelled = false

    api.get(`${API}/representatives/${repId}/`)
      .then(data => {
        if (cancelled) return
        const facultyId = data.department_detail?.faculty ? String(data.department_detail.faculty) : ''
        const matchedFaculty = faculties.find(f => String(f.id) === facultyId)
        setForm({
          full_name: data.full_name || '',
          nickname: data.nickname || '',
          phone_number: data.phone_number || '',
          whatsapp_number: data.whatsapp_number || '',
          email: data.email || '',
          university_id: matchedFaculty?.university ? String(matchedFaculty.university) : '',
          faculty_id: facultyId,
          department: data.department ? String(data.department) : '',
          role: data.role || '',
          entry_year: data.entry_year || '',
          tenure_start_year: data.tenure_start_year || '',
          submission_source: data.submission_source || 'MANUAL',
          submission_source_other: data.submission_source_other || '',
          notes: data.notes || '',
          is_active: !!data.is_active,
        })
      })
      .catch(err => { if (!cancelled) setError(err.message || 'Could not load representative.') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [isCreate, repId, faculties])

  function validate() {
    const next = {}
    if (!form.full_name.trim()) next.full_name = 'Full name is required.'
    if (!form.phone_number.trim()) next.phone_number = 'Phone number is required.'
    if (!form.department) next.department = 'Department is required.'
    if (!form.role) next.role = 'Role is required.'
    if (form.role === 'CLASS_REP' && !form.entry_year) next.entry_year = 'Entry year is required.'
    if ((form.role === 'DEPT_PRESIDENT' || form.role === 'FACULTY_PRESIDENT') && !form.tenure_start_year) next.tenure_start_year = 'Tenure year is required.'
    if (form.submission_source === 'OTHER' && !form.submission_source_other.trim()) next.submission_source_other = 'Please specify the source.'
    return next
  }

  async function handleSave() {
    const nextErrors = validate()
    setFormErrors(nextErrors)
    setError('')
    if (Object.keys(nextErrors).length) return

    const payload = {
      full_name: form.full_name.trim(),
      phone_number: form.phone_number.trim(),
      department: form.department,
      role: form.role,
      submission_source: form.submission_source,
      notes: form.notes.trim() || null,
      nickname: form.nickname.trim() || null,
      whatsapp_number: form.whatsapp_number.trim() || null,
      email: form.email.trim() || null,
      submission_source_other: form.submission_source === 'OTHER' ? (form.submission_source_other.trim() || null) : null,
    }

    if (form.role === 'CLASS_REP') payload.entry_year = Number(form.entry_year)
    if (form.role === 'DEPT_PRESIDENT' || form.role === 'FACULTY_PRESIDENT') payload.tenure_start_year = Number(form.tenure_start_year)

    if (!isCreate) payload.is_active = !!form.is_active

    setSaving(true)
    try {
      if (isCreate) await api.post(`${API}/representatives/`, payload)
      else await api.patch(`${API}/representatives/${repId}/`, payload)
      onSaved()
      onClose()
    } catch (err) {
      const data = err.data || {}
      if (typeof data === 'object' && !Array.isArray(data)) {
        const next = {}
        for (const [key, value] of Object.entries(data)) {
          next[key] = Array.isArray(value) ? value[0] : String(value)
        }
        setFormErrors(next)
      }
      setError(err.message || 'Could not save representative.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (isCreate) return
    if (!confirm('Delete this representative? This cannot be undone.')) return
    setDeleting(true)
    setError('')
    try {
      await api.delete(`${API}/representatives/${repId}/`)
      onDeleted(repId)
      onClose()
    } catch (err) {
      setError(err.message || 'Could not delete representative.')
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto" style={{ background: 'var(--c-surface)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--c-border)' }}>
          <div>
            <p className="section-eyebrow mb-1">Representative</p>
            <h3 className="font-display text-xl" style={{ color: 'var(--c-primary)' }}>{isCreate ? 'Add Representative' : 'Edit Representative'}</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--c-text-muted)' }}>Close</button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-14">
              <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--c-primary)', borderTopColor: 'transparent' }} />
            </div>
          ) : (
            <>
              {error && <div className="mb-4 px-4 py-3 text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>{error}</div>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="Full Name" required error={formErrors.full_name}>
                  <Input value={form.full_name} onChange={e => set('full_name', e.target.value)} error={formErrors.full_name} />
                </FormField>
                <FormField label="Nickname" error={formErrors.nickname}>
                  <Input value={form.nickname} onChange={e => set('nickname', e.target.value)} error={formErrors.nickname} />
                </FormField>
                <FormField label="Phone Number" required error={formErrors.phone_number}>
                  <Input value={form.phone_number} onChange={e => set('phone_number', e.target.value)} error={formErrors.phone_number} />
                </FormField>
                <FormField label="WhatsApp Number" error={formErrors.whatsapp_number}>
                  <Input value={form.whatsapp_number} onChange={e => set('whatsapp_number', e.target.value)} error={formErrors.whatsapp_number} />
                </FormField>
                <FormField label="Email" error={formErrors.email}>
                  <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} error={formErrors.email} />
                </FormField>
                <FormField label="Role" required error={formErrors.role}>
                  <Select value={form.role} onChange={e => set('role', e.target.value)} error={formErrors.role}>
                    <option value="">Select role</option>
                    {Object.entries(ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </Select>
                </FormField>
                <FormField label="University">
                  <Select
                    value={form.university_id}
                    onChange={e => {
                      const value = e.target.value
                      set('university_id', value)
                      set('faculty_id', '')
                      set('department', '')
                    }}
                  >
                    <option value="">All universities</option>
                    {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </Select>
                </FormField>
                <FormField label="Faculty">
                  <Select
                    value={form.faculty_id}
                    onChange={e => {
                      const value = e.target.value
                      set('faculty_id', value)
                      set('department', '')
                    }}
                  >
                    <option value="">Select faculty</option>
                    {availableFaculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </Select>
                </FormField>
                <FormField label="Department" required error={formErrors.department}>
                  <Select value={form.department} onChange={e => set('department', e.target.value)} error={formErrors.department}>
                    <option value="">Select department</option>
                    {availableDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </Select>
                </FormField>
                <FormField label="Source">
                  <Select value={form.submission_source} onChange={e => set('submission_source', e.target.value)}>
                    {Object.entries(SOURCE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </Select>
                </FormField>
                {form.role === 'CLASS_REP' && (
                  <FormField label="Entry Year" required error={formErrors.entry_year}>
                    <Select value={form.entry_year} onChange={e => set('entry_year', e.target.value)} error={formErrors.entry_year}>
                      <option value="">Select year</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </Select>
                  </FormField>
                )}
                {(form.role === 'DEPT_PRESIDENT' || form.role === 'FACULTY_PRESIDENT') && (
                  <FormField label="Tenure Start Year" required error={formErrors.tenure_start_year}>
                    <Select value={form.tenure_start_year} onChange={e => set('tenure_start_year', e.target.value)} error={formErrors.tenure_start_year}>
                      <option value="">Select year</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </Select>
                  </FormField>
                )}
                {form.submission_source === 'OTHER' && (
                  <FormField label="Other Source" required error={formErrors.submission_source_other}>
                    <Input value={form.submission_source_other} onChange={e => set('submission_source_other', e.target.value)} error={formErrors.submission_source_other} />
                  </FormField>
                )}
                {!isCreate && (
                  <FormField label="Active">
                    <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--c-text)' }}>
                      <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} />
                      Keep this representative active
                    </label>
                  </FormField>
                )}
                <div className="sm:col-span-2">
                  <FormField label="Notes" error={formErrors.notes}>
                    <TextArea rows={4} value={form.notes} onChange={e => set('notes', e.target.value)} error={formErrors.notes} />
                  </FormField>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: 'var(--c-border)' }}>
          <div>
            {!isCreate && (
              <button onClick={handleDelete} disabled={deleting || saving} className="px-4 py-2 text-sm font-semibold" style={{ border: '1px solid #FCA5A5', color: '#991B1B' }}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold" style={{ border: '1px solid var(--c-border)', color: 'var(--c-text)' }}>Cancel</button>
            <button onClick={handleSave} disabled={loading || saving || deleting} className="btn-primary text-sm" style={{ opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : isCreate ? 'Create Representative' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function InstitutionManager({
  entity,
  title,
  items,
  universities,
  faculties,
  onReload,
}) {
  const [creating, setCreating] = useState(false)
  const [busy, setBusy] = useState('')
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({})
  const endpointMap = {
    universities: 'universities',
    faculties: 'faculties',
    departments: 'departments',
  }
  const endpoint = endpointMap[entity]

  function beginCreate() {
    setCreating(true)
    setEditId(null)
    if (entity === 'universities') setForm({ name: '', abbreviation: '', state: 'LAGOS', type: 'FEDERAL', is_active: true })
    if (entity === 'faculties') setForm({ name: '', abbreviation: '', university: universities[0]?.id || '', is_active: true })
    if (entity === 'departments') setForm({ name: '', abbreviation: '', faculty: faculties[0]?.id || '', is_active: true })
  }

  function beginEdit(item) {
    setCreating(false)
    setEditId(item.id)
    if (entity === 'universities') setForm({ name: item.name || '', abbreviation: item.abbreviation || '', state: item.state || 'LAGOS', type: item.type || 'FEDERAL', is_active: !!item.is_active })
    if (entity === 'faculties') setForm({ name: item.name || '', abbreviation: item.abbreviation || '', university: item.university || '', is_active: !!item.is_active })
    if (entity === 'departments') setForm({ name: item.name || '', abbreviation: item.abbreviation || '', faculty: item.faculty || '', is_active: !!item.is_active })
  }

  function cancel() {
    setCreating(false)
    setEditId(null)
    setForm({})
  }

  async function submitCreate() {
    setBusy('create')
    try {
      await api.post(`${API}/${endpoint}/`, form)
      cancel()
      onReload()
    } catch (err) {
      alert(err.message || `Could not create ${title.toLowerCase()}.`)
    } finally {
      setBusy('')
    }
  }

  async function submitEdit(id) {
    setBusy(`edit-${id}`)
    try {
      await api.patch(`${API}/${endpoint}/${id}/`, form)
      cancel()
      onReload()
    } catch (err) {
      alert(err.message || `Could not update ${title.toLowerCase()}.`)
    } finally {
      setBusy('')
    }
  }

  async function remove(id) {
    if (!confirm(`Delete this ${title.slice(0, -1).toLowerCase()}?`)) return
    setBusy(`delete-${id}`)
    try {
      await api.delete(`${API}/${endpoint}/${id}/`)
      onReload()
    } catch (err) {
      alert(err.message || `Could not delete ${title.slice(0, -1).toLowerCase()}.`)
    } finally {
      setBusy('')
    }
  }

  function renderEditor(submitLabel, submitAction, disabledKey) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 mb-4" style={{ border: '1px solid var(--c-primary)', background: 'rgba(6,78,59,0.03)' }}>
        <Input placeholder="Name" value={form.name || ''} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
        <Input placeholder="Abbreviation" value={form.abbreviation || ''} onChange={e => setForm(prev => ({ ...prev, abbreviation: e.target.value.toUpperCase() }))} />
        {entity === 'universities' && (
          <>
            <Select value={form.state || 'LAGOS'} onChange={e => setForm(prev => ({ ...prev, state: e.target.value }))}>
              {NIGERIAN_STATES.map(state => <option key={state.value} value={state.value}>{state.label}</option>)}
            </Select>
            <Select value={form.type || 'FEDERAL'} onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}>
              {UNIVERSITY_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
            </Select>
          </>
        )}
        {entity === 'faculties' && (
          <Select value={form.university || ''} onChange={e => setForm(prev => ({ ...prev, university: e.target.value }))}>
            <option value="">Select university</option>
            {universities.map(u => <option key={u.id} value={u.id}>{u.abbreviation} · {u.name}</option>)}
          </Select>
        )}
        {entity === 'departments' && (
          <Select value={form.faculty || ''} onChange={e => setForm(prev => ({ ...prev, faculty: e.target.value }))}>
            <option value="">Select faculty</option>
            {faculties.map(f => <option key={f.id} value={f.id}>{f.university_abbreviation || 'UNI'} · {f.name}</option>)}
          </Select>
        )}
        <label className="flex items-center gap-2 text-sm px-2" style={{ color: 'var(--c-text)' }}>
          <input type="checkbox" checked={!!form.is_active} onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))} />
          Active
        </label>
        <div className="flex gap-2 lg:col-span-5">
          <button onClick={submitAction} disabled={busy === disabledKey} className="btn-primary text-sm" style={{ opacity: busy === disabledKey ? 0.7 : 1 }}>{submitLabel}</button>
          <button onClick={cancel} className="px-4 py-2 text-sm font-semibold" style={{ border: '1px solid var(--c-border)', color: 'var(--c-text)' }}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-xl" style={{ color: 'var(--c-primary)' }}>{title}</h3>
          <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>This section wires the full CRUD endpoints for {title.toLowerCase()}.</p>
        </div>
        {!creating && editId == null && (
          <button onClick={beginCreate} className="btn-primary text-sm">+ Add {title.slice(0, -1)}</button>
        )}
      </div>

      {creating && renderEditor(`Create ${title.slice(0, -1)}`, submitCreate, 'create')}
      {items.length === 0 ? (
        <div className="p-8 text-center" style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface)', color: 'var(--c-text-muted)' }}>No {title.toLowerCase()} yet.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(item => (
            <div key={item.id} className="p-4" style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface)' }}>
              {editId === item.id ? (
                renderEditor(`Save ${title.slice(0, -1)}`, () => submitEdit(item.id), `edit-${item.id}`)
              ) : (
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>{item.name}</p>
                      {item.abbreviation && <span className="text-xs px-2 py-0.5" style={{ background: 'var(--c-bg-warm)', color: 'var(--c-text-muted)' }}>{item.abbreviation}</span>}
                      {!item.is_active && <span className="text-xs px-2 py-0.5" style={{ background: '#F3F4F6', color: '#6B7280' }}>Inactive</span>}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                      {entity === 'universities' && `${item.state || '—'} · ${item.type_display || item.type || '—'} · ${item.representatives_count ?? 0} reps`}
                      {entity === 'faculties' && `${item.university_abbreviation || '—'} · ${item.departments_count ?? 0} departments · ${item.representatives_count ?? 0} reps`}
                      {entity === 'departments' && `${item.university_name || '—'} · ${item.faculty_name || '—'} · ${item.program_duration || '—'} year programme`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => beginEdit(item)} className="px-3 py-1.5 text-xs font-semibold" style={{ border: '1px solid var(--c-border)', color: 'var(--c-text)' }}>Edit</button>
                    <button onClick={() => remove(item.id)} disabled={busy === `delete-${item.id}`} className="px-3 py-1.5 text-xs font-semibold" style={{ border: '1px solid #FCA5A5', color: '#991B1B', opacity: busy === `delete-${item.id}` ? 0.7 : 1 }}>
                      {busy === `delete-${item.id}` ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RepRow({ rep, selected, onToggle, onVerify, onDispute, onEdit, actionLoading }) {
  const [expanded, setExpanded] = useState(false)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const isLoading = actionLoading === rep.id

  async function toggleExpand() {
    setExpanded(prev => !prev)
    if (!expanded && !detail) {
      setDetailLoading(true)
      try {
        const data = await api.get(`${API}/representatives/${rep.id}/`)
        setDetail(data)
      } catch {
        // Detail panel is optional, so fail softly here.
      }
      setDetailLoading(false)
    }
  }

  return (
    <>
      <tr className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--c-border)' }}>
        <td className="px-4 py-3">
          <input type="checkbox" checked={selected} onChange={() => onToggle(rep.id)} />
        </td>
        <td className="px-4 py-3 cursor-pointer" onClick={toggleExpand}>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{rep.display_name || rep.full_name}</p>
            {rep.display_name && rep.full_name && rep.display_name !== rep.full_name && (
              <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{rep.full_name}</p>
            )}
          </div>
        </td>
        <td className="px-4 py-3 hidden sm:table-cell">
          <p className="text-xs font-mono" style={{ color: 'var(--c-text-muted)' }}>{rep.phone_number}</p>
        </td>
        <td className="px-4 py-3 hidden md:table-cell">
          <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{rep.department_name || '—'}</p>
          <p className="text-xs" style={{ color: 'var(--c-text-muted)', opacity: 0.6 }}>{rep.university_name || ''}</p>
        </td>
        <td className="px-4 py-3 hidden lg:table-cell">
          <div>
            <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{ROLE_LABELS[rep.role] || rep.role_display || rep.role}</span>
            {rep.current_level_display && <p className="text-xs mt-0.5" style={{ color: 'var(--c-primary)', opacity: 0.8 }}>{rep.current_level_display}</p>}
          </div>
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={rep.verification_status} />
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            {rep.verification_status !== 'VERIFIED' && (
              <button onClick={() => onVerify(rep.id, rep.verification_status)} disabled={isLoading} className="px-2.5 py-1 text-xs font-semibold" style={{ border: '1px solid #065F46', color: '#065F46', opacity: isLoading ? 0.5 : 1 }}>
                Verify
              </button>
            )}
            {rep.verification_status !== 'DISPUTED' && (
              <button onClick={() => onDispute(rep.id, rep.verification_status)} disabled={isLoading} className="px-2.5 py-1 text-xs font-semibold" style={{ border: '1px solid #991B1B', color: '#991B1B', opacity: isLoading ? 0.5 : 1 }}>
                Dispute
              </button>
            )}
            <button onClick={() => onEdit(rep.id)} className="px-2.5 py-1 text-xs font-semibold" style={{ border: '1px solid var(--c-border)', color: 'var(--c-text)' }}>
              Manage
            </button>
            <button onClick={toggleExpand} className="text-xs font-semibold" style={{ color: 'var(--c-primary)' }}>
              {expanded ? 'Hide' : 'Details'}
            </button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr style={{ background: 'rgba(6,78,59,0.02)' }}>
          <td colSpan={7} className="px-6 py-4 border-b" style={{ borderColor: 'var(--c-border)' }}>
            {detailLoading ? (
              <div className="flex items-center gap-2 py-2">
                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--c-primary)', borderTopColor: 'transparent' }} />
                <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Loading details…</span>
              </div>
            ) : detail ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                {[
                  ['Full Name', detail.full_name],
                  ['Nickname', detail.nickname || '—'],
                  ['Phone', detail.phone_number],
                  ['WhatsApp', detail.whatsapp_number || '—'],
                  ['Email', detail.email || '—'],
                  ['University', detail.university_name || '—'],
                  ['Faculty', detail.faculty_name || '—'],
                  ['Department', detail.department_detail?.name || '—'],
                  ['Role', detail.role_display || ROLE_LABELS[detail.role] || detail.role],
                  ['Entry Year', detail.entry_year || '—'],
                  ['Tenure Year', detail.tenure_start_year || '—'],
                  ['Level', detail.current_level_display || '—'],
                  ['Final Year?', detail.is_final_year ? 'Yes' : 'No'],
                  ['Graduated?', detail.has_graduated ? 'Yes' : 'No'],
                  ['Grad. Year', detail.expected_graduation_year || '—'],
                  ['Source', detail.submission_source_display || detail.submission_source || '—'],
                  ['Verified By', detail.verified_by_username || '—'],
                  ['Verified At', formatDate(detail.verified_at)],
                  ['Submitted', formatDate(detail.created_at)],
                  ['Last Updated', formatDate(detail.updated_at)],
                  ['Active', detail.is_active ? 'Yes' : 'No'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p style={{ color: 'var(--c-text-muted)', opacity: 0.7 }}>{k}</p>
                    <p className="font-medium mt-0.5 break-words" style={{ color: 'var(--c-text)' }}>{v}</p>
                  </div>
                ))}
                {detail.notes && (
                  <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                    <p style={{ color: 'var(--c-text-muted)', opacity: 0.7 }}>Notes</p>
                    <p className="font-medium mt-0.5" style={{ color: 'var(--c-text)' }}>{detail.notes}</p>
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

export default function AcademicDirectoryAdmin() {
  const { isAuthenticated, loading: authLoading, user } = useAuth()
  const navigate = useNavigate()

  const [mainTab, setMainTab] = useState('Directory')
  const [institutionTab, setInstitutionTab] = useState('Universities')
  const [stats, setStats] = useState(null)
  const [reps, setReps] = useState([])
  const [count, setCount] = useState(0)
  const [nextUrl, setNextUrl] = useState(null)
  const [prevUrl, setPrevUrl] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingReps, setLoadingReps] = useState(true)
  const [repsError, setRepsError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [bulkBusy, setBulkBusy] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [editingRepId, setEditingRepId] = useState(null)
  const [creatingRep, setCreatingRep] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [exporting, setExporting] = useState('')

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterUniversity, setFilterUniversity] = useState('')
  const [filterFaculty, setFilterFaculty] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [page, setPage] = useState(1)

  const [universities, setUniversities] = useState([])
  const [faculties, setFaculties] = useState([])
  const [departments, setDepartments] = useState([])
  const [loadingInstitutions, setLoadingInstitutions] = useState(false)

  const searchTimeout = useRef(null)

  useEffect(() => {
    document.title = 'Academic Directory Admin'
    return () => clearTimeout(searchTimeout.current)
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }
    if (!user?.is_staff) {
      navigate('/', { replace: true })
    }
  }, [authLoading, isAuthenticated, user, navigate])

  const loadStats = useCallback(async () => {
    setLoadingStats(true)
    try {
      const data = await api.get(`${API}/dashboard/`)
      setStats(data)
    } catch {
      setStats(null)
    }
    setLoadingStats(false)
  }, [])

  const loadInstitutions = useCallback(async () => {
    setLoadingInstitutions(true)
    try {
      const [uniData, facData, depData] = await Promise.all([
        api.get(`${API}/universities/`),
        api.get(`${API}/faculties/`),
        api.get(`${API}/departments/`),
      ])
      setUniversities(normalizeCollection(uniData).items)
      setFaculties(normalizeCollection(facData).items)
      setDepartments(normalizeCollection(depData).items)
    } catch {
      setUniversities([])
      setFaculties([])
      setDepartments([])
    } finally {
      setLoadingInstitutions(false)
    }
  }, [])

  const loadRepresentatives = useCallback(async (opts = {}) => {
    const {
      pg = 1,
      q = search,
      status = filterStatus,
      role = filterRole,
      university = filterUniversity,
      faculty = filterFaculty,
      department = filterDepartment,
    } = opts

    setLoadingReps(true)
    setRepsError(null)

    try {
      const params = new URLSearchParams({ page: pg })
      if (q) params.set('search', q)
      if (status) params.set('verification_status', status)
      if (role) params.set('role', role)
      if (university) params.set('university', university)
      if (faculty) params.set('faculty', faculty)
      if (department) params.set('department', department)
      const data = await api.get(`${API}/representatives/?${params}`)
      const normalized = normalizeCollection(data)
      setReps(normalized.items)
      setCount(normalized.count)
      setNextUrl(normalized.next)
      setPrevUrl(normalized.previous)
      setSelectedIds(new Set())
    } catch (err) {
      setRepsError(err.data?.detail || err.message || 'Failed to load representatives.')
      setReps([])
    }

    setLoadingReps(false)
  }, [search, filterStatus, filterRole, filterUniversity, filterFaculty, filterDepartment])

  useEffect(() => {
    if (isAuthenticated && user?.is_staff) {
      loadStats()
      loadInstitutions()
      loadRepresentatives({ pg: 1, q: '', status: '', role: '', university: '', faculty: '', department: '' })
    }
  }, [isAuthenticated, user, loadStats, loadInstitutions, loadRepresentatives])

  const filteredFaculties = faculties.filter(f => !filterUniversity || String(f.university) === String(filterUniversity))
  const filteredDepartments = departments.filter(d => !filterFaculty || String(d.faculty) === String(filterFaculty))

  function handleSearch(value) {
    setSearch(value)
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      setPage(1)
      loadRepresentatives({ pg: 1, q: value })
    }, 350)
  }

  function applyFilters(next = {}) {
    const merged = {
      status: next.status ?? filterStatus,
      role: next.role ?? filterRole,
      university: next.university ?? filterUniversity,
      faculty: next.faculty ?? filterFaculty,
      department: next.department ?? filterDepartment,
    }
    setPage(1)
    loadRepresentatives({ pg: 1, status: merged.status, role: merged.role, university: merged.university, faculty: merged.faculty, department: merged.department })
  }

  function updateStatsForTransition(oldStatus, newStatus) {
    setStats(prev => {
      if (!prev || oldStatus === newStatus) return prev
      const next = { ...prev }
      const fieldMap = {
        UNVERIFIED: 'unverified_count',
        VERIFIED: 'verified_count',
        DISPUTED: 'disputed_count',
      }
      if (fieldMap[oldStatus]) next[fieldMap[oldStatus]] = Math.max(0, (prev[fieldMap[oldStatus]] || 0) - 1)
      if (fieldMap[newStatus]) next[fieldMap[newStatus]] = (prev[fieldMap[newStatus]] || 0) + 1
      return next
    })
  }

  async function handleVerify(id, oldStatus) {
    setActionLoading(id)
    try {
      await api.post(`${API}/representatives/${id}/verify/`)
      setReps(prev => prev.map(r => r.id === id ? { ...r, verification_status: 'VERIFIED' } : r))
      updateStatsForTransition(oldStatus, 'VERIFIED')
    } catch {
      await loadStats()
    }
    setActionLoading(null)
  }

  async function handleDispute(id, oldStatus) {
    setActionLoading(id)
    try {
      await api.post(`${API}/representatives/${id}/dispute/`)
      setReps(prev => prev.map(r => r.id === id ? { ...r, verification_status: 'DISPUTED' } : r))
      updateStatsForTransition(oldStatus, 'DISPUTED')
    } catch {
      await loadStats()
    }
    setActionLoading(null)
  }

  async function handleBulkAction(action) {
    if (selectedIds.size === 0) return
    setBulkBusy(action)
    try {
      await api.post(`${API}/representatives/bulk-verify/`, {
        representative_ids: [...selectedIds],
        action,
      })
      const nextStatus = action === 'verify' ? 'VERIFIED' : 'DISPUTED'
      setReps(prev => prev.map(rep => selectedIds.has(rep.id) ? { ...rep, verification_status: nextStatus } : rep))
      await loadStats()
      setSelectedIds(new Set())
    } catch (err) {
      alert(err.message || 'Bulk action failed.')
    } finally {
      setBulkBusy('')
    }
  }

  async function handleExport(mode) {
    setExporting(mode)
    try {
      const params = new URLSearchParams()
      params.set('mode', mode)
      if (filterUniversity) params.set('university', filterUniversity)
      if (filterFaculty) params.set('faculty', filterFaculty)
      if (filterDepartment) params.set('department', filterDepartment)
      if (filterRole) params.set('role', filterRole)
      if (mode === 'master') params.set('group_by', 'department')
      await downloadAcademicExport(params)
    } catch (err) {
      alert(err.message || 'Export failed.')
    } finally {
      setExporting('')
    }
  }

  function toggleSelect(id) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === reps.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(reps.map(rep => rep.id)))
  }

  function clearFilters() {
    setSearch('')
    setFilterStatus('')
    setFilterRole('')
    setFilterUniversity('')
    setFilterFaculty('')
    setFilterDepartment('')
    setPage(1)
    loadRepresentatives({ pg: 1, q: '', status: '', role: '', university: '', faculty: '', department: '' })
  }

  function handleRepDeleted(id) {
    setReps(prev => prev.filter(rep => rep.id !== id))
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setCount(prev => Math.max(0, prev - 1))
    loadStats()
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
        {showNotifications && <NotificationsPanel onClose={() => { setShowNotifications(false); loadStats() }} />}
        {(creatingRep || editingRepId) && (
          <RepresentativeEditorModal
            repId={editingRepId}
            universities={universities}
            faculties={faculties}
            departments={departments}
            onClose={() => { setCreatingRep(false); setEditingRepId(null) }}
            onSaved={() => { loadRepresentatives({ pg: page }); loadStats(); loadInstitutions() }}
            onDeleted={handleRepDeleted}
          />
        )}

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="section-eyebrow mb-1">Admin Panel</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: 'var(--c-primary)' }}>Academic Directory</h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowNotifications(true)}
              className="relative flex items-center justify-center w-10 h-10"
              style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface)' }}
              title="Notifications"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--c-primary)' }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {stats?.unread_notifications > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-white font-bold rounded-full px-1" style={{ background: '#DC2626', fontSize: '10px' }}>
                  {stats.unread_notifications}
                </span>
              )}
            </button>
            <button onClick={() => { setCreatingRep(true); setEditingRepId(null) }} className="btn-primary text-sm">+ Add Representative</button>
            <Link to="/academic-directory/submit" className="btn-secondary text-sm">View Submit Form</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {loadingStats ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-5 animate-pulse" style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface)' }}>
                <div className="h-3 w-16 mb-3 rounded" style={{ background: '#E5E7EB' }} />
                <div className="h-8 w-10 rounded" style={{ background: '#E5E7EB' }} />
              </div>
            ))
          ) : (
            <>
              <StatCard label="Representatives" value={stats?.total_representatives} sub="Active" />
              <StatCard label="Universities" value={stats?.total_universities} />
              <StatCard label="Verified" value={stats?.verified_count} accent="#065F46" sub="Confirmed" />
              <StatCard label="Unverified" value={stats?.unverified_count} accent="#B45309" sub="Pending review" />
              <StatCard label="Disputed" value={stats?.disputed_count} accent="#991B1B" />
              <StatCard label="Last 24h" value={stats?.recent_submissions_24h} sub={`${stats?.recent_submissions_7d ?? 0} this week`} />
            </>
          )}
        </div>

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {[
              { label: 'Class Reps', value: stats.class_reps_count, color: 'var(--c-primary)' },
              { label: 'Dept. Presidents', value: stats.dept_presidents_count, color: '#065F46' },
              { label: 'Faculty Presidents', value: stats.faculty_presidents_count, color: '#7C3AED' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-4 px-5 py-4" style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface)' }}>
                <div className="w-1 h-10 flex-shrink-0 rounded" style={{ background: color }} />
                <div>
                  <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{label}</p>
                  <p className="font-display text-2xl font-bold mt-0.5" style={{ color }}>{value ?? 0}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 mb-6" style={{ background: 'var(--c-border)', padding: 3, width: 'fit-content' }}>
          {REPRESENTATIVE_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setMainTab(tab)}
              className="px-4 py-2 text-sm font-semibold"
              style={{ background: mainTab === tab ? 'white' : 'transparent', color: mainTab === tab ? 'var(--c-primary)' : 'var(--c-text-muted)' }}
            >
              {tab}
            </button>
          ))}
        </div>

        {mainTab === 'Institutions' ? (
          <>
            <div className="flex gap-2 mb-6" style={{ background: 'var(--c-border)', padding: 3, width: 'fit-content' }}>
              {INSTITUTION_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setInstitutionTab(tab)}
                  className="px-4 py-2 text-sm font-semibold"
                  style={{ background: institutionTab === tab ? 'white' : 'transparent', color: institutionTab === tab ? 'var(--c-primary)' : 'var(--c-text-muted)' }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {loadingInstitutions ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--c-primary)', borderTopColor: 'transparent' }} />
              </div>
            ) : (
              <>
                {institutionTab === 'Universities' && (
                  <InstitutionManager entity="universities" title="Universities" items={universities} universities={universities} faculties={faculties} onReload={loadInstitutions} />
                )}
                {institutionTab === 'Faculties' && (
                  <InstitutionManager entity="faculties" title="Faculties" items={faculties} universities={universities} faculties={faculties} onReload={loadInstitutions} />
                )}
                {institutionTab === 'Departments' && (
                  <InstitutionManager entity="departments" title="Departments" items={departments} universities={universities} faculties={faculties} onReload={loadInstitutions} />
                )}
              </>
            )}
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-3 mb-4">
              <div className="relative lg:col-span-2">
                <input
                  type="text"
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Search name, phone, email…"
                  className="w-full pl-4 pr-4 py-2.5 text-sm"
                  style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface)', color: 'var(--c-text)', outline: 'none' }}
                />
              </div>
              <Select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); applyFilters({ status: e.target.value }) }}>
                <option value="">All Statuses</option>
                <option value="UNVERIFIED">Unverified</option>
                <option value="VERIFIED">Verified</option>
                <option value="DISPUTED">Disputed</option>
              </Select>
              <Select value={filterRole} onChange={e => { setFilterRole(e.target.value); applyFilters({ role: e.target.value }) }}>
                <option value="">All Roles</option>
                {Object.entries(ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </Select>
              <Select value={filterUniversity} onChange={e => {
                const value = e.target.value
                setFilterUniversity(value)
                setFilterFaculty('')
                setFilterDepartment('')
                applyFilters({ university: value, faculty: '', department: '' })
              }}>
                <option value="">All Universities</option>
                {universities.map(u => <option key={u.id} value={u.id}>{u.abbreviation} · {u.name}</option>)}
              </Select>
              <Select value={filterFaculty} onChange={e => {
                const value = e.target.value
                setFilterFaculty(value)
                setFilterDepartment('')
                applyFilters({ faculty: value, department: '' })
              }}>
                <option value="">All Faculties</option>
                {filteredFaculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </Select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-6 gap-3 mb-4">
              <div className="lg:col-span-2">
                <Select value={filterDepartment} onChange={e => { setFilterDepartment(e.target.value); applyFilters({ department: e.target.value }) }}>
                  <option value="">All Departments</option>
                  {filteredDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </div>
              <div className="lg:col-span-4 flex flex-wrap items-center gap-3">
                <button onClick={() => handleExport('single')} disabled={exporting === 'single'} className="px-4 py-2 text-sm font-semibold" style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface)', color: 'var(--c-text)' }}>
                  {exporting === 'single' ? 'Exporting…' : 'Export PDF'}
                </button>
                <button onClick={() => handleExport('bulk_department')} disabled={exporting === 'bulk_department'} className="px-4 py-2 text-sm font-semibold" style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface)', color: 'var(--c-text)' }}>
                  {exporting === 'bulk_department' ? 'Exporting…' : 'Bulk by Department'}
                </button>
                <button onClick={() => handleExport('bulk_faculty')} disabled={exporting === 'bulk_faculty'} className="px-4 py-2 text-sm font-semibold" style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface)', color: 'var(--c-text)' }}>
                  {exporting === 'bulk_faculty' ? 'Exporting…' : 'Bulk by Faculty'}
                </button>
                <button onClick={() => handleExport('master')} disabled={exporting === 'master'} className="px-4 py-2 text-sm font-semibold" style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface)', color: 'var(--c-text)' }}>
                  {exporting === 'master' ? 'Exporting…' : 'Master PDF'}
                </button>
                {(filterStatus || filterRole || filterUniversity || filterFaculty || filterDepartment || search) && (
                  <button className="text-sm font-semibold" style={{ color: 'var(--c-primary)' }} onClick={clearFilters}>Clear filters</button>
                )}
              </div>
            </div>

            {reps.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap mb-3 px-4 py-3" style={{ border: '1px solid rgba(6,78,59,0.15)', background: selectedIds.size > 0 ? 'rgba(6,78,59,0.04)' : 'white' }}>
                <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--c-text)' }}>
                  <input type="checkbox" checked={reps.length > 0 && selectedIds.size === reps.length} onChange={toggleSelectAll} />
                  {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
                </label>
                {selectedIds.size > 0 && (
                  <>
                    <button onClick={() => handleBulkAction('verify')} disabled={bulkBusy === 'verify'} className="px-3 py-1.5 text-xs font-semibold" style={{ border: '1px solid #065F46', color: '#065F46' }}>
                      {bulkBusy === 'verify' ? 'Working…' : 'Bulk Verify'}
                    </button>
                    <button onClick={() => handleBulkAction('dispute')} disabled={bulkBusy === 'dispute'} className="px-3 py-1.5 text-xs font-semibold" style={{ border: '1px solid #991B1B', color: '#991B1B' }}>
                      {bulkBusy === 'dispute' ? 'Working…' : 'Bulk Dispute'}
                    </button>
                  </>
                )}
                <span className="ml-auto text-xs" style={{ color: 'var(--c-text-muted)' }}>{loadingReps ? 'Loading…' : `${count} representative${count !== 1 ? 's' : ''}`}</span>
              </div>
            )}

            <div className="overflow-x-auto" style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface)' }}>
              {loadingReps ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--c-primary)', borderTopColor: 'transparent' }} />
                </div>
              ) : repsError ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-4">
                  <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>{repsError}</p>
                  <button onClick={() => loadRepresentatives({ pg: page })} className="btn-secondary text-sm">Retry</button>
                </div>
              ) : reps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
                  <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
                    {search || filterStatus || filterRole || filterUniversity || filterFaculty || filterDepartment ? 'No representatives match your filters.' : 'No representatives yet.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr style={{ background: 'var(--c-bg-warm)', borderBottom: '1px solid var(--c-border)' }}>
                      {[
                        { label: '', cls: '' },
                        { label: 'Name', cls: '' },
                        { label: 'Phone', cls: 'hidden sm:table-cell' },
                        { label: 'Department', cls: 'hidden md:table-cell' },
                        { label: 'Role', cls: 'hidden lg:table-cell' },
                        { label: 'Status', cls: '' },
                        { label: 'Actions', cls: '' },
                      ].map(({ label, cls }, index) => (
                        <th key={`${label}-${index}`} className={`px-4 py-3 text-xs font-semibold tracking-wide uppercase ${cls}`} style={{ color: 'var(--c-text-muted)' }}>
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
                        selected={selectedIds.has(rep.id)}
                        onToggle={toggleSelect}
                        onVerify={handleVerify}
                        onDispute={handleDispute}
                        onEdit={setEditingRepId}
                        actionLoading={actionLoading}
                      />
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>

            {!loadingReps && !repsError && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => { const p = page - 1; setPage(p); loadRepresentatives({ pg: p }) }}
                  disabled={!prevUrl}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
                  style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface)', color: 'var(--c-text)', opacity: prevUrl ? 1 : 0.4, cursor: prevUrl ? 'pointer' : 'not-allowed' }}
                >
                  Previous
                </button>
                <span className="text-sm" style={{ color: 'var(--c-text-muted)' }}>Page {page} of {totalPages}</span>
                <button
                  onClick={() => { const p = page + 1; setPage(p); loadRepresentatives({ pg: p }) }}
                  disabled={!nextUrl}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
                  style={{ border: '1px solid var(--c-border)', background: 'var(--c-surface)', color: 'var(--c-text)', opacity: nextUrl ? 1 : 0.4, cursor: nextUrl ? 'pointer' : 'not-allowed' }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
