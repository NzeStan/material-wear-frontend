// pages/academic_directory/AcademicDirectorySubmit.jsx
// Public form — AllowAny, no auth required.
// POST /api/v1/academic-directory/submit/
import { useState, useEffect } from 'react'
import { api } from '../../services/api'

const API = '/v1/academic-directory'

const ROLES = [
  { value: 'CLASS_REP',        label: 'Class Representative' },
  { value: 'DEPT_PRESIDENT',   label: 'Department President' },
  { value: 'FACULTY_PRESIDENT',label: 'Faculty President' },
]

const SOURCES = [
  { value: 'WEBSITE',   label: 'Website' },
  { value: 'WHATSAPP',  label: 'WhatsApp' },
  { value: 'EMAIL',     label: 'Email' },
  { value: 'PHONE',     label: 'Phone Call' },
  { value: 'SMS',       label: 'SMS' },
  { value: 'MANUAL',    label: 'Manual Entry' },
  { value: 'OTHER',     label: 'Other' },
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 15 }, (_, i) => currentYear - i)

const emptyForm = () => ({
  full_name: '',
  nickname: '',
  phone_number: '',
  whatsapp_number: '',
  email: '',
  university_id: '',
  faculty_id: '',
  department_id: '',
  role: '',
  entry_year: '',
  tenure_start_year: '',
  submission_source: 'WEBSITE',
  submission_source_other: '',
  notes: '',
})

function FieldRow({ label, required, hint, children, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--c-text-muted)' }}>
        {label}{required && <span className="ml-1" style={{ color: '#DC2626' }}>*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs" style={{ color: 'var(--c-text-muted)', opacity: 0.75 }}>{hint}</p>}
      {error && <p className="text-xs font-medium" style={{ color: '#DC2626' }}>{error}</p>}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text', error }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full py-2.5 px-3 text-sm transition-colors"
      style={{
        background: 'var(--c-bg)',
        border: `1px solid ${error ? '#DC2626' : 'var(--c-border)'}`,
        color: 'var(--c-text)',
        outline: 'none',
      }}
      onFocus={e => {
        e.currentTarget.style.borderColor = error ? '#DC2626' : 'var(--c-primary)'
        e.currentTarget.style.boxShadow = `0 0 0 3px ${error ? 'rgba(220,38,38,0.1)' : 'rgba(6,78,59,0.08)'}`
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = error ? '#DC2626' : 'var(--c-border)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    />
  )
}

function SelectInput({ value, onChange, children, error, disabled }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className="w-full py-2.5 px-3 text-sm transition-colors appearance-none"
      style={{
        background: disabled ? 'var(--c-bg-warm)' : 'var(--c-bg)',
        border: `1px solid ${error ? '#DC2626' : 'var(--c-border)'}`,
        color: value ? 'var(--c-text)' : 'var(--c-text-muted)',
        outline: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
      onFocus={e => {
        if (!disabled) {
          e.currentTarget.style.borderColor = error ? '#DC2626' : 'var(--c-primary)'
          e.currentTarget.style.boxShadow = `0 0 0 3px ${error ? 'rgba(220,38,38,0.1)' : 'rgba(6,78,59,0.08)'}`
        }
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = error ? '#DC2626' : 'var(--c-border)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {children}
    </select>
  )
}

export default function AcademicDirectorySubmit() {
  useEffect(() => { document.title = 'Submit Representative — Academic Directory' }, [])

  const [form, setForm]           = useState(emptyForm())
  const [errors, setErrors]       = useState({})
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]     = useState(null)

  // Cascading dropdown data
  const [universities, setUniversities] = useState([])
  const [faculties, setFaculties]       = useState([])
  const [departments, setDepartments]   = useState([])
  const [loadingUni, setLoadingUni]     = useState(true)
  const [loadingFac, setLoadingFac]     = useState(false)
  const [loadingDep, setLoadingDep]     = useState(false)

  // Load universities on mount (public endpoint)
  useEffect(() => {
    api.get(`${API}/universities/choices/`)
      .then(data => setUniversities(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingUni(false))
  }, [])

  // Load faculties when university changes
  useEffect(() => {
    if (!form.university_id) { setFaculties([]); setDepartments([]); return }
    setLoadingFac(true)
    setFaculties([])
    setDepartments([])
    setForm(p => ({ ...p, faculty_id: '', department_id: '' }))
    api.get(`${API}/faculties/choices/?university=${form.university_id}`)
      .then(data => setFaculties(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingFac(false))
  }, [form.university_id])

  // Load departments when faculty changes
  useEffect(() => {
    if (!form.faculty_id) { setDepartments([]); return }
    setLoadingDep(true)
    setDepartments([])
    setForm(p => ({ ...p, department_id: '' }))
    api.get(`${API}/departments/choices/?faculty=${form.faculty_id}`)
      .then(data => setDepartments(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingDep(false))
  }, [form.faculty_id])

  function set(key, value) {
    setForm(p => ({ ...p, [key]: value }))
    if (errors[key]) setErrors(p => ({ ...p, [key]: null }))
  }

  // When role changes, clear the field that belongs to the OTHER role
  // so stale values don't get sent to the backend and cause hidden validation errors.
  function handleRoleChange(val) {
    setForm(p => ({
      ...p,
      role: val,
      entry_year:        val === 'CLASS_REP' ? p.entry_year    : '',
      tenure_start_year: val === 'CLASS_REP' ? ''               : p.tenure_start_year,
    }))
    if (errors.role)             setErrors(p => ({ ...p, role: null }))
    if (errors.entry_year)       setErrors(p => ({ ...p, entry_year: null }))
    if (errors.tenure_start_year) setErrors(p => ({ ...p, tenure_start_year: null }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setFormError(null)

    // Client-side required check
    const req = {}
    if (!form.full_name.trim())    req.full_name    = 'Full name is required.'
    if (!form.phone_number.trim()) req.phone_number = 'Phone number is required.'
    if (!form.department_id)       req.department_id = 'Please select a department.'
    if (!form.role)                req.role          = 'Please select a role.'
    if (form.role === 'CLASS_REP' && !form.entry_year)
      req.entry_year = 'Entry year is required for class representatives.'
    if ((form.role === 'DEPT_PRESIDENT' || form.role === 'FACULTY_PRESIDENT') && !form.tenure_start_year)
      req.tenure_start_year = 'Tenure start year is required for presidents.'
    if (Object.keys(req).length) { setErrors(req); return }

    const payload = {
      full_name:      form.full_name.trim(),
      phone_number:   form.phone_number.trim(),
      department_id:  form.department_id,
      role:           form.role,
      submission_source: form.submission_source,
    }
    if (form.nickname.trim())             payload.nickname              = form.nickname.trim()
    if (form.whatsapp_number.trim())      payload.whatsapp_number       = form.whatsapp_number.trim()
    if (form.email.trim())                payload.email                 = form.email.trim()
    // Only send the year field that matches the role — never both
    if (form.role === 'CLASS_REP' && form.entry_year)
      payload.entry_year = parseInt(form.entry_year)
    if ((form.role === 'DEPT_PRESIDENT' || form.role === 'FACULTY_PRESIDENT') && form.tenure_start_year)
      payload.tenure_start_year = parseInt(form.tenure_start_year)
    if (form.submission_source === 'OTHER' && form.submission_source_other.trim())
      payload.submission_source_other = form.submission_source_other.trim()
    if (form.notes.trim())                payload.notes                 = form.notes.trim()

    setSubmitting(true)
    try {
      const data = await api.post(`${API}/submit/`, payload)
      setSuccess(data)
      setForm(emptyForm())
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      const errData = err.data
      if (errData?.details && typeof errData.details === 'object') {
        // DRF nested errors under "details" > "submissions" > [0] > field
        const sub0 = errData.details?.submissions?.[0]
        if (sub0 && typeof sub0 === 'object') {
          const fieldErrs = {}
          for (const [k, v] of Object.entries(sub0)) {
            fieldErrs[k] = Array.isArray(v) ? v[0] : String(v)
          }
          setErrors(fieldErrs)
        } else {
          setFormError(errData.error || 'Submission failed. Please check your details.')
        }
      } else {
        setFormError(err.message || 'Submission failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    const created = success.created ?? 0
    const updated = success.updated ?? 0
    return (
      <main className="page-transition flex-1 py-16 px-4" style={{ background: 'var(--c-bg)', minHeight: '70vh' }}>
        <div className="max-w-lg mx-auto text-center">
          <div
            className="w-20 h-20 flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(6,78,59,0.08)' }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--c-primary)" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <p className="section-eyebrow mb-2">Thank You</p>
          <h1 className="font-display text-3xl font-bold mb-4" style={{ color: 'var(--c-primary)' }}>
            Submission Received!
          </h1>
          {created > 0 && (
            <p className="text-base mb-2" style={{ color: 'var(--c-text)' }}>
              <strong>{created}</strong> new representative{created !== 1 ? 's' : ''} added to the directory.
            </p>
          )}
          {updated > 0 && (
            <p className="text-base mb-2" style={{ color: 'var(--c-text)' }}>
              <strong>{updated}</strong> existing record{updated !== 1 ? 's' : ''} updated.
            </p>
          )}
          <p className="text-sm mt-4 mb-8" style={{ color: 'var(--c-text-muted)' }}>
            Our team will review and verify the submission. Thank you for contributing to the directory.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setSuccess(null)}
              className="btn-primary"
            >
              Submit Another
            </button>
            <a href="/" className="btn-secondary">Back to Home</a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="page-transition flex-1 py-12 px-4 sm:px-6" style={{ background: 'var(--c-bg)' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="section-eyebrow mb-1">Academic Directory</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: 'var(--c-primary)' }}>
            Submit a Representative
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--c-text-muted)' }}>
            Help us build a comprehensive directory of class representatives and student leaders.
            All submissions are reviewed before being published.
          </p>
        </div>

        {/* Info banner */}
        <div
          className="flex items-start gap-3 px-4 py-3 mb-8"
          style={{ background: 'rgba(6,78,59,0.06)', border: '1px solid rgba(6,78,59,0.15)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-primary)" strokeWidth="2" className="mt-0.5 flex-shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
            Fields marked <strong style={{ color: '#DC2626' }}>*</strong> are required.
            Phone number is used as the unique identifier — submitting the same number again will update the existing record.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* ── Personal Information ─────────────────────────── */}
          <section className="p-6 mb-4" style={{ border: '1px solid var(--c-border)', background: 'white' }}>
            <h2 className="font-display text-base font-semibold mb-5" style={{ color: 'var(--c-primary)' }}>
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldRow label="Full Name" required error={errors.full_name}>
                <TextInput value={form.full_name} onChange={v => set('full_name', v)} placeholder="e.g. Adaeze Okonkwo" error={errors.full_name} />
              </FieldRow>
              <FieldRow label="Nickname / Preferred Name" hint="Optional — how they're commonly known">
                <TextInput value={form.nickname} onChange={v => set('nickname', v)} placeholder="e.g. Ada" />
              </FieldRow>
              <FieldRow label="Phone Number" required hint="Nigerian format: 0801234567 or +2348012345678" error={errors.phone_number}>
                <TextInput value={form.phone_number} onChange={v => set('phone_number', v)} placeholder="08012345678" error={errors.phone_number} />
              </FieldRow>
              <FieldRow label="WhatsApp Number" hint="Leave blank if same as phone number" error={errors.whatsapp_number}>
                <TextInput value={form.whatsapp_number} onChange={v => set('whatsapp_number', v)} placeholder="08012345678" error={errors.whatsapp_number} />
              </FieldRow>
              <div className="sm:col-span-2">
                <FieldRow label="Email Address" hint="Optional" error={errors.email}>
                  <TextInput value={form.email} onChange={v => set('email', v)} placeholder="name@university.edu.ng" type="email" error={errors.email} />
                </FieldRow>
              </div>
            </div>
          </section>

          {/* ── Institutional Information ─────────────────────── */}
          <section className="p-6 mb-4" style={{ border: '1px solid var(--c-border)', background: 'white' }}>
            <h2 className="font-display text-base font-semibold mb-5" style={{ color: 'var(--c-primary)' }}>
              Institutional Information
            </h2>
            <div className="grid grid-cols-1 gap-5">
              {/* University */}
              <FieldRow label="University" required error={errors.university_id}>
                <SelectInput value={form.university_id} onChange={v => set('university_id', v)} error={errors.university_id} disabled={loadingUni}>
                  <option value="">{loadingUni ? 'Loading universities…' : '— Select University —'}</option>
                  {universities.map(u => (
                    <option key={u.id} value={u.id}>{u.name}{u.abbreviation ? ` (${u.abbreviation})` : ''}</option>
                  ))}
                </SelectInput>
              </FieldRow>

              {/* Faculty */}
              <FieldRow label="Faculty" required error={errors.faculty_id} hint={!form.university_id ? 'Select a university first' : undefined}>
                <SelectInput value={form.faculty_id} onChange={v => set('faculty_id', v)} error={errors.faculty_id} disabled={!form.university_id || loadingFac}>
                  <option value="">{loadingFac ? 'Loading faculties…' : '— Select Faculty —'}</option>
                  {faculties.map(f => (
                    <option key={f.id} value={f.id}>{f.name}{f.abbreviation ? ` (${f.abbreviation})` : ''}</option>
                  ))}
                </SelectInput>
              </FieldRow>

              {/* Department */}
              <FieldRow label="Department" required error={errors.department_id} hint={!form.faculty_id ? 'Select a faculty first' : undefined}>
                <SelectInput value={form.department_id} onChange={v => set('department_id', v)} error={errors.department_id} disabled={!form.faculty_id || loadingDep}>
                  <option value="">{loadingDep ? 'Loading departments…' : '— Select Department —'}</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}{d.abbreviation ? ` (${d.abbreviation})` : ''}</option>
                  ))}
                </SelectInput>
              </FieldRow>
            </div>
          </section>

          {/* ── Role & Academic Details ───────────────────────── */}
          <section className="p-6 mb-4" style={{ border: '1px solid var(--c-border)', background: 'white' }}>
            <h2 className="font-display text-base font-semibold mb-5" style={{ color: 'var(--c-primary)' }}>
              Role & Academic Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldRow label="Role" required error={errors.role}>
                <SelectInput value={form.role} onChange={handleRoleChange} error={errors.role}>
                  <option value="">— Select Role —</option>
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </SelectInput>
              </FieldRow>

              {/* Entry year — class reps only */}
              {form.role === 'CLASS_REP' && (
                <FieldRow label="Entry Year" required hint="Year they started the programme" error={errors.entry_year}>
                  <SelectInput value={form.entry_year} onChange={v => set('entry_year', v)} error={errors.entry_year}>
                    <option value="">— Select Year —</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </SelectInput>
                </FieldRow>
              )}

              {/* Tenure year — presidents only */}
              {(form.role === 'DEPT_PRESIDENT' || form.role === 'FACULTY_PRESIDENT') && (
                <FieldRow label="Tenure Start Year" required hint="Year they assumed office" error={errors.tenure_start_year}>
                  <SelectInput value={form.tenure_start_year} onChange={v => set('tenure_start_year', v)} error={errors.tenure_start_year}>
                    <option value="">— Select Year —</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </SelectInput>
                </FieldRow>
              )}
            </div>

            {/* Role description card */}
            {form.role && (
              <div
                className="mt-5 px-4 py-3 text-xs"
                style={{ background: 'rgba(6,78,59,0.06)', border: '1px solid rgba(6,78,59,0.12)' }}
              >
                {form.role === 'CLASS_REP' && (
                  <p style={{ color: 'var(--c-text-muted)' }}>
                    <strong style={{ color: 'var(--c-primary)' }}>Class Representative</strong> — elected by classmates to represent a specific academic level within their department.
                    Entry year helps calculate their current level.
                  </p>
                )}
                {form.role === 'DEPT_PRESIDENT' && (
                  <p style={{ color: 'var(--c-text-muted)' }}>
                    <strong style={{ color: 'var(--c-primary)' }}>Department President</strong> — heads the department's student body.
                    Tenure year tracks when they took office.
                  </p>
                )}
                {form.role === 'FACULTY_PRESIDENT' && (
                  <p style={{ color: 'var(--c-text-muted)' }}>
                    <strong style={{ color: 'var(--c-primary)' }}>Faculty President</strong> — heads the faculty's student union.
                    Tenure year tracks when they took office.
                  </p>
                )}
              </div>
            )}
          </section>

          {/* ── Submission Details ────────────────────────────── */}
          <section className="p-6 mb-6" style={{ border: '1px solid var(--c-border)', background: 'white' }}>
            <h2 className="font-display text-base font-semibold mb-5" style={{ color: 'var(--c-primary)' }}>
              Submission Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldRow label="How did you hear about this?" hint="How you're submitting this information">
                <SelectInput value={form.submission_source} onChange={v => set('submission_source', v)}>
                  {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </SelectInput>
              </FieldRow>
              {form.submission_source === 'OTHER' && (
                <FieldRow label="Please specify" error={errors.submission_source_other}>
                  <TextInput value={form.submission_source_other} onChange={v => set('submission_source_other', v)} placeholder="e.g. Referred by student union" error={errors.submission_source_other} />
                </FieldRow>
              )}
              <div className="sm:col-span-2">
                <FieldRow label="Additional Notes" hint="Optional — any extra information about this representative">
                  <textarea
                    value={form.notes}
                    onChange={e => set('notes', e.target.value)}
                    rows={3}
                    placeholder="e.g. Also serves as departmental welfare officer"
                    className="w-full py-2.5 px-3 text-sm resize-none transition-colors"
                    style={{
                      background: 'var(--c-bg)',
                      border: '1px solid var(--c-border)',
                      color: 'var(--c-text)',
                      outline: 'none',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--c-primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6,78,59,0.08)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--c-border)'; e.currentTarget.style.boxShadow = 'none' }}
                  />
                </FieldRow>
              </div>
            </div>
          </section>

          {/* Global error */}
          {formError && (
            <div
              className="flex items-center gap-3 px-4 py-3 mb-4"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-sm" style={{ color: '#DC2626' }}>{formError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
            style={{ opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Submit Representative
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  )
}
