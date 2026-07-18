import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../services/api'
import { CONTACT } from '../../config/constants'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// ── Icons ──────────────────────────────────────────────────────────────────────
const SpinnerIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
    <circle cx="12" cy="12" r="10" strokeOpacity=".2"/>
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
  </svg>
)
const DownloadIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)
const UploadIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
)
const CheckCircleIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const AlertIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const CheckIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
)
const ExcelIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
)
const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
)
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// ── Status helpers ─────────────────────────────────────────────────────────────
const STATUS_STEP = {
  pending:    1,
  uploaded:   2,
  valid:      3,
  invalid:    2,
  processing: 4,
  completed:  5,
}

const STATUS_LABEL = {
  pending:    'Awaiting Upload',
  uploaded:   'File Uploaded',
  valid:      'Validated',
  invalid:    'Validation Failed',
  processing: 'Payment Processing',
  completed:  'Complete',
}

const STATUS_COLOR = {
  pending:    { bg: 'rgba(245,158,11,0.1)',  text: '#92400e',  border: 'rgba(245,158,11,0.25)' },
  uploaded:   { bg: 'rgba(59,130,246,0.08)', text: '#1e40af',  border: 'rgba(59,130,246,0.2)' },
  valid:      { bg: 'rgba(16,185,129,0.08)', text: '#065f46',  border: 'rgba(16,185,129,0.2)' },
  invalid:    { bg: 'rgba(239,68,68,0.08)',  text: '#b91c1c',  border: 'rgba(239,68,68,0.2)' },
  processing: { bg: 'rgba(245,158,11,0.1)',  text: '#92400e',  border: 'rgba(245,158,11,0.25)' },
  completed:  { bg: 'rgba(16,185,129,0.08)', text: '#065f46',  border: 'rgba(16,185,129,0.2)' },
}

function fmt(v) {
  return `₦${Number(v || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

// ── Progress stepper ───────────────────────────────────────────────────────────
const STEPS = ['Download', 'Upload', 'Validate', 'Pay', 'Done']

function Stepper({ currentStep }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((label, i) => {
        const stepNum = i + 1
        const done    = stepNum < currentStep
        const active  = stepNum === currentStep
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 flex-shrink-0"
                style={{
                  background: done ? 'var(--c-primary)' : active ? 'var(--c-accent)' : 'var(--c-border)',
                  color: (done || active) ? '#fff' : 'var(--c-text-muted)',
                }}
              >
                {done ? <CheckIcon size={12} /> : stepNum}
              </div>
              <span
                className="text-xs mt-1.5 hidden sm:block"
                style={{ color: active ? 'var(--c-text)' : done ? 'var(--c-primary)' : 'var(--c-text-muted)', fontWeight: active ? 600 : 400 }}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="h-0.5 w-8 sm:w-14 -mt-5 sm:-mt-4 mx-1 transition-all duration-300"
                style={{ background: done ? 'var(--c-primary)' : 'var(--c-border)' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Info row ───────────────────────────────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b last:border-0 text-sm"
      style={{ borderColor: 'var(--c-border)' }}>
      <span style={{ color: 'var(--c-text-muted)' }}>{label}</span>
      <span className="font-medium text-right" style={{ color: 'var(--c-text)' }}>{value ?? '—'}</span>
    </div>
  )
}

// ── Error banner ───────────────────────────────────────────────────────────────
function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl text-sm"
      style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
      <AlertIcon /><span>{message}</span>
    </div>
  )
}

// ── File drop zone ─────────────────────────────────────────────────────────────
function FileDropZone({ file, onChange, error }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  function handleFile(f) {
    if (!f) return
    if (!f.name.endsWith('.xlsx')) { onChange(null, 'Only .xlsx files are accepted'); return }
    if (f.size > 5 * 1024 * 1024) { onChange(null, 'File exceeds 5MB limit'); return }
    onChange(f, null)
  }

  if (file) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl"
        style={{ border: '1.5px solid var(--c-primary)', background: 'rgba(6,78,59,0.04)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--c-bg-warm)', color: 'var(--c-primary)' }}>
          <ExcelIcon />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--c-text)' }}>{file.name}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>
            {(file.size / 1024).toFixed(0)} KB
          </p>
        </div>
        <button type="button" onClick={() => onChange(null, null)}
          className="p-1.5 rounded-lg hover:bg-black/5 transition-colors flex-shrink-0"
          style={{ color: 'var(--c-text-muted)' }}>
          <XIcon />
        </button>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl flex flex-col items-center justify-center gap-3 py-10 px-4 cursor-pointer transition-all duration-150"
      style={{
        border: `1.5px dashed ${error ? '#ef4444' : dragOver ? 'var(--c-primary)' : 'var(--c-border)'}`,
        background: dragOver ? 'rgba(6,78,59,0.04)' : 'var(--c-bg)',
      }}
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]) }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: 'var(--c-bg-warm)', color: 'var(--c-primary)' }}>
        <UploadIcon size={22} />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>
          Click to browse or drag & drop
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--c-text-muted)' }}>
          Excel file (.xlsx) — max 5MB
        </p>
      </div>
      <input ref={inputRef} type="file" accept=".xlsx" className="hidden"
        onChange={e => handleFile(e.target.files?.[0])} />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function ExcelBulkOrderFlow() {
  const { id } = useParams()

  const [order, setOrder]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [participants, setParticipants] = useState([])
  const [participantsLoading, setParticipantsLoading] = useState(false)
  const [participantsError, setParticipantsError] = useState('')
  const [settingsForm, setSettingsForm] = useState(null)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsError, setSettingsError] = useState('')

  // Upload state
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadFileErr, setUploadFileErr] = useState('')
  const [uploading, setUploading]   = useState(false)
  const [uploadError, setUploadError] = useState('')

  // Validate state
  const [validating, setValidating] = useState(false)
  const [validateError, setValidateError] = useState('')
  const [validationResult, setValidationResult] = useState(null)

  // Payment state
  const [paying, setPaying]   = useState(false)
  const [payError, setPayError] = useState('')

  // Template download state
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    document.title = 'Excel Bulk Order — Material Wear'
    return () => { document.title = 'Material Wear Limited' }
  }, [])

  const loadParticipants = useCallback(async () => {
    setParticipantsLoading(true)
    setParticipantsError('')
    try {
      const data = await api.get(`/excel-participants/?bulk_order=${id}`)
      setParticipants(Array.isArray(data) ? data : (data.results || []))
    } catch (err) {
      setParticipantsError(err.message || 'Could not load participants.')
    } finally {
      setParticipantsLoading(false)
    }
  }, [id])

  const loadOrder = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get(`/excel-bulk-orders/${id}/`)
      setOrder(data)
      setSettingsForm({
        title: data.title || '',
        coordinator_name: data.coordinator_name || '',
        coordinator_email: data.coordinator_email || '',
        coordinator_phone: data.coordinator_phone || '',
        price_per_participant: data.price_per_participant ?? '',
        requires_custom_name: !!data.requires_custom_name,
      })
      document.title = `${data.title} — Excel Bulk Order — Material Wear`
      if (data.payment_status || data.validation_status === 'completed') {
        await loadParticipants()
      }
    } catch {
      setError('Order not found or you do not have access to it.')
    } finally {
      setLoading(false)
    }
  }, [id, loadParticipants])

  useEffect(() => { loadOrder() }, [loadOrder])

  async function handleDownloadTemplate() {
    if (!order?.template_file) return
    setDownloading(true)
    try {
      const res = await fetch(`${BASE_URL}/excel-bulk-orders/${id}/download-template/`, {
        headers: api.getAuthHeader(),
      })
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${order.reference}_template.xlsx`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      // fallback to direct link
      window.open(order.template_file, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  async function handleUpload() {
    if (!uploadFile) { setUploadFileErr('Please select a file'); return }
    setUploading(true)
    setUploadError('')
    try {
      const fd = new FormData()
      fd.append('excel_file', uploadFile)
      const data = await api.post(`/excel-bulk-orders/${id}/upload/`, fd)
      setOrder(data)
      setUploadFile(null)
      setValidationResult(null)
    } catch (err) {
      setUploadError(err.message || 'Failed to upload file. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  async function handleValidate() {
    setValidating(true)
    setValidateError('')
    setValidationResult(null)
    try {
      const data = await api.post(`/excel-bulk-orders/${id}/validate/`, {})
      setOrder(data.bulk_order)
      setValidationResult(data.validation_result)
    } catch (err) {
      setValidateError(err.message || 'Validation failed. Please try again.')
    } finally {
      setValidating(false)
    }
  }

  async function handlePay() {
    setPaying(true)
    setPayError('')
    try {
      const data = await api.post(`/excel-bulk-orders/${id}/initialize-payment/`, {
        callback_url: `${window.location.origin}/excel-payment/verify?order_id=${id}`,
      })
      window.location.href = data.authorization_url
    } catch (err) {
      setPayError(err.message || 'Payment initialization failed. Please try again.')
      setPaying(false)
    }
  }

  function setSettingsField(field, value) {
    setSettingsForm(prev => ({ ...prev, [field]: value }))
    setSettingsError('')
  }

  async function handleSaveSettings() {
    if (!settingsForm) return
    setSettingsSaving(true)
    setSettingsError('')
    try {
      const data = await api.patch(`/excel-bulk-orders/${id}/`, {
        title: settingsForm.title,
        coordinator_name: settingsForm.coordinator_name,
        coordinator_email: settingsForm.coordinator_email,
        coordinator_phone: settingsForm.coordinator_phone,
        price_per_participant: Number(settingsForm.price_per_participant),
        requires_custom_name: settingsForm.requires_custom_name,
      })
      setOrder(data)
      setSettingsForm({
        title: data.title || '',
        coordinator_name: data.coordinator_name || '',
        coordinator_email: data.coordinator_email || '',
        coordinator_phone: data.coordinator_phone || '',
        price_per_participant: data.price_per_participant ?? '',
        requires_custom_name: !!data.requires_custom_name,
      })
    } catch (err) {
      setSettingsError(err.message || 'Could not save campaign settings.')
    } finally {
      setSettingsSaving(false)
    }
  }

  // ── Loading / Error ───────────────────────────────────────────────────────────
  if (loading) return (
    <main className="page-transition flex-1 flex items-center justify-center py-40" style={{ background: 'var(--c-bg)' }}>
      <div className="text-center">
        <SpinnerIcon size={32} />
        <p className="text-sm mt-4" style={{ color: 'var(--c-text-muted)' }}>Loading your order...</p>
      </div>
    </main>
  )

  if (error) return (
    <main className="page-transition flex-1 flex items-center justify-center py-40 px-4" style={{ background: 'var(--c-bg)' }}>
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
          <AlertIcon size={28} />
        </div>
        <h1 className="font-display text-2xl mb-3" style={{ color: 'var(--c-primary)' }}>Order Not Found</h1>
        <p className="mb-8" style={{ color: 'var(--c-text-muted)' }}>{error}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/excel-bulk-order/new" className="btn-primary inline-flex items-center justify-center gap-2">
            Create New Order
          </Link>
          <Link to="/excel-my-orders" className="btn-secondary inline-flex items-center justify-center gap-2">
            My Orders
          </Link>
        </div>
      </div>
    </main>
  )

  const vs     = order.validation_status
  const step   = STATUS_STEP[vs] ?? 1
  const sc     = STATUS_COLOR[vs] ?? STATUS_COLOR.pending
  const bd     = order.payment_breakdown ?? {}
  const vatRate = 0.075

  return (
    <main className="page-transition flex-1" style={{ background: 'var(--c-bg)' }}>

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-16 px-4" style={{ background: 'var(--c-primary)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg,rgba(255,255,255,0.03) 0,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,rgba(255,255,255,0.03) 0,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 40px)',
          }}
        />
        <div className="max-w-5xl mx-auto relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs px-3 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)' }}>
                  {order.reference}
                </span>
                <span className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                  {STATUS_LABEL[vs]}
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl text-white mb-1 tracking-tight">
                {order.title}
              </h1>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Coordinator: {order.coordinator_name} · {order.coordinator_email}
              </p>
            </div>
            <button onClick={loadOrder}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
              <RefreshIcon /> Refresh
            </button>
          </div>

          {/* Stepper */}
          {vs !== 'completed' && (
            <div className="overflow-x-auto pb-1">
              <Stepper currentStep={step} />
            </div>
          )}
        </div>
      </section>

      {/* ── BODY ──────────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-5 gap-8 items-start">

          {/* MAIN CONTENT */}
          <div className="lg:col-span-3 space-y-6">

            {/* ══ COMPLETED ══════════════════════════════════════════════════════ */}
            {vs === 'completed' && (
              <div className="rounded-2xl p-8 text-center"
                style={{ border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.05)' }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                  <CheckCircleIcon size={40} />
                </div>
                <p className="section-eyebrow mb-2">Payment Complete</p>
                <h2 className="font-display text-3xl mb-4" style={{ color: 'var(--c-primary)' }}>
                  Order Processed!
                </h2>
                <p className="mb-6" style={{ color: 'var(--c-text-muted)' }}>
                  All participants have been registered and a confirmation email has been sent to{' '}
                  <strong style={{ color: 'var(--c-text)' }}>{order.coordinator_email}</strong>.
                </p>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[
                    { label: 'Participants', val: bd.total_participants ?? order.participants?.length ?? '—', color: 'var(--c-primary)' },
                    { label: 'Paid',         val: bd.chargeable_participants ?? '—',  color: '#10b981' },
                    { label: 'Free (Coupon)',val: bd.couponed_participants ?? '—',   color: 'var(--c-accent)' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="rounded-xl py-3" style={{ background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)' }}>
                      <p className="font-display text-2xl font-bold" style={{ color }}>{val}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>{label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/excel-my-orders" className="btn-primary inline-flex items-center gap-2 justify-center">
                    View All My Orders
                  </Link>
                  <a
                    href={`/api/excel-bulk-orders/${id}/paid-participants/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary inline-flex items-center gap-2 justify-center"
                  >
                    View Paid Participants
                  </a>
                  <Link to="/excel-bulk-order/new" className="btn-secondary inline-flex items-center gap-2 justify-center">
                    Create Another Order
                  </Link>
                </div>
              </div>
            )}

            {vs === 'completed' && (
              <div className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid var(--c-border)', background: '#fff' }}>
                <div className="px-6 py-5 flex items-center justify-between gap-3"
                  style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-warm)' }}>
                  <div>
                    <h3 className="font-display text-lg" style={{ color: 'var(--c-primary)' }}>Participant Roster</h3>
                    <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                      Loaded from the participant endpoint for this bulk order
                    </p>
                  </div>
                  <button
                    onClick={loadParticipants}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm"
                    style={{ background: 'white', color: 'var(--c-text)', border: '1px solid var(--c-border)' }}
                  >
                    <RefreshIcon /> Refresh
                  </button>
                </div>
                <div className="px-6 py-5">
                  {participantsLoading && (
                    <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>Loading participants...</p>
                  )}
                  {participantsError && <ErrorBanner message={participantsError} />}
                  {!participantsLoading && !participantsError && participants.length > 0 && (
                    <div className="overflow-x-auto">
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--c-border)' }}>
                            {['Row', 'Name', 'Size', 'Custom Name', 'Coupon'].map(label => (
                              <th key={label} style={{ padding: '0.75rem 0.5rem', fontSize: 12, color: 'var(--c-text-muted)', fontWeight: 700 }}>
                                {label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {participants.map(participant => (
                            <tr key={participant.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                              <td style={{ padding: '0.75rem 0.5rem', fontSize: 13, color: 'var(--c-text)' }}>{participant.row_number}</td>
                              <td style={{ padding: '0.75rem 0.5rem', fontSize: 13, color: 'var(--c-text)' }}>{participant.full_name}</td>
                              <td style={{ padding: '0.75rem 0.5rem', fontSize: 13, color: 'var(--c-text)' }}>{participant.size}</td>
                              <td style={{ padding: '0.75rem 0.5rem', fontSize: 13, color: 'var(--c-text-muted)' }}>{participant.custom_name || '—'}</td>
                              <td style={{ padding: '0.75rem 0.5rem', fontSize: 13, color: participant.is_coupon_applied ? '#15803d' : 'var(--c-text-muted)' }}>
                                {participant.coupon_status}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {!participantsLoading && !participantsError && participants.length === 0 && (
                    <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
                      No participants found yet. Try refreshing if payment completed recently.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ══ PROCESSING ═════════════════════════════════════════════════════ */}
            {vs === 'processing' && (
              <div className="rounded-2xl p-8 text-center"
                style={{ border: '1px solid rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.04)' }}>
                <div className="flex justify-center mb-4" style={{ color: 'var(--c-accent)' }}>
                  <SpinnerIcon size={40} />
                </div>
                <h2 className="font-display text-2xl mb-2" style={{ color: 'var(--c-primary)' }}>
                  Payment Processing
                </h2>
                <p className="mb-6" style={{ color: 'var(--c-text-muted)' }}>
                  Your payment is being processed by Paystack. Please wait — do not close this page.
                  Once confirmed, this page will automatically update.
                </p>
                <button onClick={loadOrder}
                  className="btn-primary inline-flex items-center gap-2 justify-center">
                  <RefreshIcon /> Check Payment Status
                </button>
              </div>
            )}

            {/* ══ STEP 1: DOWNLOAD TEMPLATE ═══════════════════════════════════════ */}
            {(vs === 'pending' || vs === 'uploaded' || vs === 'invalid') && (
              <div className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid var(--c-border)', background: '#fff' }}>
                <div className="px-6 py-5 flex items-center gap-3"
                  style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-warm)' }}>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'var(--c-primary)' }}>
                    1
                  </div>
                  <div>
                    <h3 className="font-display text-lg" style={{ color: 'var(--c-primary)' }}>Download Excel Template</h3>
                    <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                      Open the file and fill in participant details
                    </p>
                  </div>
                  {(vs === 'uploaded' || vs === 'invalid') && (
                    <div className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
                      style={{ background: 'rgba(16,185,129,0.1)', color: '#065f46' }}>
                      <CheckIcon size={11} /> Downloaded
                    </div>
                  )}
                </div>
                <div className="px-6 py-5">
                  <p className="text-sm mb-5" style={{ color: 'var(--c-text-muted)' }}>
                    The template has the correct columns pre-set. Fill in:
                    <span className="font-medium" style={{ color: 'var(--c-text)' }}> Full Name, Size</span>
                    {order.requires_custom_name && <span className="font-medium" style={{ color: 'var(--c-text)' }}>, Custom Name</span>}
                    {' '}and optionally a <span className="font-medium" style={{ color: 'var(--c-text)' }}>Coupon Code</span> per participant.
                    Do not change column headers.
                  </p>
                  <button
                    onClick={handleDownloadTemplate}
                    disabled={downloading || !order.template_file}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    {downloading ? <><SpinnerIcon /><span>Downloading...</span></> : <><DownloadIcon size={15} /><span>Download Excel Template</span></>}
                  </button>
                  {!order.template_file && (
                    <p className="text-xs mt-2" style={{ color: '#ef4444' }}>Template not yet generated. Please contact support.</p>
                  )}
                </div>
              </div>
            )}

            {/* ══ STEP 2: UPLOAD ═══════════════════════════════════════════════════ */}
            {(vs === 'pending' || vs === 'uploaded' || vs === 'invalid') && (
              <div className="rounded-2xl overflow-hidden"
                style={{ border: `1.5px solid ${vs === 'invalid' ? 'rgba(239,68,68,0.3)' : 'var(--c-border)'}`, background: '#fff' }}>
                <div className="px-6 py-5 flex items-center gap-3"
                  style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-warm)' }}>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: vs === 'invalid' ? '#ef4444' : (vs === 'uploaded' ? 'var(--c-primary)' : 'var(--c-border)'),
                      color: vs === 'pending' ? 'var(--c-text-muted)' : '#fff',
                    }}>
                    {vs === 'invalid' ? '!' : 2}
                  </div>
                  <div>
                    <h3 className="font-display text-lg" style={{ color: vs === 'invalid' ? '#b91c1c' : 'var(--c-primary)' }}>
                      {vs === 'invalid' ? 'Re-Upload Corrected Excel' : 'Upload Filled Excel'}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                      {vs === 'invalid' ? 'Fix the errors below and upload again' : 'Upload your completed Excel file (.xlsx)'}
                    </p>
                  </div>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <ErrorBanner message={uploadError} />
                  {uploadFileErr && <ErrorBanner message={uploadFileErr} />}
                  <FileDropZone
                    file={uploadFile}
                    onChange={(f, err) => { setUploadFile(f); setUploadFileErr(err || '') }}
                    error={!!uploadFileErr}
                  />
                  <button
                    onClick={handleUpload}
                    disabled={uploading || !uploadFile}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                  >
                    {uploading
                      ? <><SpinnerIcon /><span>Uploading...</span></>
                      : <><UploadIcon size={15} /><span>Upload Excel</span></>
                    }
                  </button>
                </div>
              </div>
            )}

            {/* ══ STEP 3: VALIDATE ═════════════════════════════════════════════════ */}
            {vs === 'uploaded' && (
              <div className="rounded-2xl overflow-hidden"
                style={{ border: '1.5px solid var(--c-primary)', background: '#fff', boxShadow: '0 4px 24px rgba(6,78,59,0.08)' }}>
                <div className="px-6 py-5 flex items-center gap-3"
                  style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-warm)' }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'var(--c-accent)' }}>3</div>
                  <div>
                    <h3 className="font-display text-lg" style={{ color: 'var(--c-primary)' }}>Validate Excel Data</h3>
                    <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                      Our system will check all rows for errors before payment
                    </p>
                  </div>
                </div>
                <div className="px-6 py-5">
                  <ErrorBanner message={validateError} />
                  {validateError && <div className="mb-4" />}
                  <p className="text-sm mb-5" style={{ color: 'var(--c-text-muted)' }}>
                    Your file has been uploaded. Click below to validate all participant data.
                    We will check name formats, sizes, duplicate coupons, and more.
                  </p>
                  <button
                    onClick={handleValidate}
                    disabled={validating}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                  >
                    {validating
                      ? <><SpinnerIcon /><span>Validating All Rows...</span></>
                      : <><CheckIcon size={15} /><span>Validate Excel</span></>
                    }
                  </button>
                </div>
              </div>
            )}

            {/* ══ VALIDATION ERRORS ════════════════════════════════════════════════ */}
            {vs === 'invalid' && (order.validation_summary || validationResult) && (
              <div className="rounded-2xl overflow-hidden"
                style={{ border: '1.5px solid rgba(239,68,68,0.3)', background: '#fff' }}>
                <div className="px-6 py-5 flex items-center justify-between gap-4"
                  style={{ borderBottom: '1px solid var(--c-border)', background: 'rgba(239,68,68,0.04)' }}>
                  <div>
                    <h3 className="font-display text-lg" style={{ color: '#b91c1c' }}>Validation Errors</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>
                      Fix these issues in your Excel and re-upload
                    </p>
                  </div>
                  <div className="flex gap-3 text-sm text-center">
                    {(() => {
                      const s = order.validation_summary || validationResult?.summary || {}
                      const errorRows = s.error_rows ?? (
                        typeof s.total_rows === 'number' && typeof s.valid_rows === 'number'
                          ? s.total_rows - s.valid_rows
                          : '—'
                      )
                      return (
                        <>
                          <div>
                            <p className="font-bold" style={{ color: 'var(--c-text)' }}>{s.total_rows ?? '—'}</p>
                            <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Total</p>
                          </div>
                          <div>
                            <p className="font-bold" style={{ color: '#10b981' }}>{s.valid_rows ?? '—'}</p>
                            <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Valid</p>
                          </div>
                          <div>
                            <p className="font-bold" style={{ color: '#ef4444' }}>{errorRows}</p>
                            <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Errors</p>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>
                <div className="px-6 py-5 max-h-72 overflow-y-auto space-y-2">
                  {(order.validation_summary?.errors || validationResult?.errors || []).map((err, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl text-sm"
                      style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                      <AlertIcon size={14} />
                      <div>
                        <p className="font-semibold" style={{ color: '#b91c1c' }}>
                          Row {err.row} — {err.field}
                        </p>
                        <p style={{ color: '#dc2626' }}>{err.error}</p>
                        {err.current_value && (
                          <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>
                            Current value: <span className="font-mono">{err.current_value}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ STEP 4: VALID → PAY ══════════════════════════════════════════════ */}
            {vs === 'valid' && (
              <div className="rounded-2xl overflow-hidden"
                style={{ border: '1.5px solid var(--c-primary)', background: '#fff', boxShadow: '0 4px 24px rgba(6,78,59,0.08)' }}>
                <div className="px-6 py-5 flex items-center gap-3"
                  style={{ borderBottom: '1px solid var(--c-border)', background: 'rgba(16,185,129,0.04)' }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: '#10b981' }}>
                    <CheckIcon size={12} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg" style={{ color: '#065f46' }}>Excel Validated!</h3>
                    <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                      All participant data is correct — ready for payment
                    </p>
                  </div>
                </div>

                <div className="px-6 py-5">
                  {/* Participant breakdown */}
                  {bd && (
                    <div className="rounded-xl p-5 mb-5"
                      style={{ background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)' }}>
                      <p className="text-xs uppercase tracking-widest font-semibold mb-4" style={{ color: 'var(--c-text-muted)' }}>
                        Payment Breakdown
                      </p>
                      <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--c-text-muted)' }}>Total participants</span>
                          <span className="font-semibold" style={{ color: 'var(--c-text)' }}>{bd.total_participants}</span>
                        </div>
                        {bd.couponed_participants > 0 && (
                          <div className="flex justify-between">
                            <span style={{ color: 'var(--c-text-muted)' }}>Free (coupon applied)</span>
                            <span className="font-semibold" style={{ color: 'var(--c-accent)' }}>−{bd.couponed_participants}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--c-text-muted)' }}>Chargeable participants</span>
                          <span className="font-semibold" style={{ color: 'var(--c-text)' }}>{bd.chargeable_participants}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--c-text-muted)' }}>Price per participant</span>
                          <span className="font-semibold" style={{ color: 'var(--c-text)' }}>₦{Number(bd.price_per_participant).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--c-text-muted)' }}>Subtotal</span>
                          <span className="font-semibold" style={{ color: 'var(--c-text)' }}>{fmt(bd.total_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--c-text-muted)' }}>VAT (7.5%)</span>
                          <span className="font-semibold" style={{ color: 'var(--c-text)' }}>{fmt(Number(bd.total_amount) * vatRate)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t" style={{ borderColor: 'var(--c-border)' }}>
                          <span className="font-bold" style={{ color: 'var(--c-text)' }}>Total Due</span>
                          <span className="font-bold text-lg" style={{ color: 'var(--c-primary)' }}>
                            {fmt(Number(bd.total_amount) * (1 + vatRate))}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <ErrorBanner message={payError} />
                  {payError && <div className="mb-4" />}

                  <button
                    onClick={handlePay}
                    disabled={paying}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
                  >
                    {paying
                      ? <><SpinnerIcon /><span>Redirecting to Paystack...</span></>
                      : <><LockIcon /><span>Proceed to Secure Payment</span></>
                    }
                  </button>
                  <p className="text-xs text-center mt-3" style={{ color: 'var(--c-text-muted)' }}>
                    You will be redirected to Paystack. A confirmation email will be sent to{' '}
                    <strong style={{ color: 'var(--c-text)' }}>{order.coordinator_email}</strong> after payment.
                  </p>
                </div>
              </div>
            )}

            {/* ══ VALIDATION SUCCESS BANNER (valid + validated) ═════════════════════ */}
            {vs === 'valid' && validationResult?.valid && (
              <div className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ color: '#10b981' }}><CheckIcon size={16} /></div>
                <div className="text-sm">
                  <p className="font-semibold" style={{ color: '#065f46' }}>
                    All {validationResult.summary?.total_rows} rows validated successfully
                  </p>
                  <p style={{ color: 'var(--c-text-muted)' }}>
                    {validationResult.summary?.valid_rows} participants are ready to be processed
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-2 space-y-4">

            {settingsForm && vs !== 'completed' && (
              <div className="rounded-2xl p-5" style={{ border: '1px solid var(--c-border)', background: '#fff' }}>
                <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--c-primary)' }}>
                  <ExcelIcon />
                  <h3 className="font-display text-base">Campaign Settings</h3>
                </div>
                <div className="space-y-3">
                  <input
                    value={settingsForm.title}
                    onChange={e => setSettingsField('title', e.target.value)}
                    placeholder="Campaign title"
                    style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: 10, border: '1px solid var(--c-border)', background: 'var(--c-bg)' }}
                  />
                  <input
                    value={settingsForm.coordinator_name}
                    onChange={e => setSettingsField('coordinator_name', e.target.value)}
                    placeholder="Coordinator name"
                    style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: 10, border: '1px solid var(--c-border)', background: 'var(--c-bg)' }}
                  />
                  <input
                    value={settingsForm.coordinator_email}
                    onChange={e => setSettingsField('coordinator_email', e.target.value)}
                    placeholder="Coordinator email"
                    style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: 10, border: '1px solid var(--c-border)', background: 'var(--c-bg)' }}
                  />
                  <input
                    value={settingsForm.coordinator_phone}
                    onChange={e => setSettingsField('coordinator_phone', e.target.value)}
                    placeholder="Coordinator phone"
                    style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: 10, border: '1px solid var(--c-border)', background: 'var(--c-bg)' }}
                  />
                  <input
                    type="number"
                    value={settingsForm.price_per_participant}
                    onChange={e => setSettingsField('price_per_participant', e.target.value)}
                    placeholder="Price per participant"
                    style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: 10, border: '1px solid var(--c-border)', background: 'var(--c-bg)' }}
                  />
                  <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--c-text)' }}>
                    <input
                      type="checkbox"
                      checked={settingsForm.requires_custom_name}
                      onChange={e => setSettingsField('requires_custom_name', e.target.checked)}
                    />
                    Require custom names
                  </label>
                  {settingsError && <ErrorBanner message={settingsError} />}
                  <button
                    onClick={handleSaveSettings}
                    disabled={settingsSaving}
                    className="btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    {settingsSaving ? <><SpinnerIcon /><span>Saving...</span></> : <><CheckIcon size={15} /><span>Save Settings</span></>}
                  </button>
                </div>
              </div>
            )}

            {/* Order summary */}
            <div className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid var(--c-border)', background: '#fff' }}>
              <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-warm)' }}>
                <h3 className="font-display text-base" style={{ color: 'var(--c-primary)' }}>Order Summary</h3>
              </div>
              <div className="px-5 py-4">
                <InfoRow label="Reference"     value={<span className="font-mono text-xs font-bold" style={{ color: 'var(--c-primary)' }}>{order.reference}</span>} />
                <InfoRow label="Campaign"      value={order.title} />
                <InfoRow label="Coordinator"   value={order.coordinator_name} />
                <InfoRow label="Price / person" value={`₦${Number(order.price_per_participant).toLocaleString()}`} />
                <InfoRow label="Custom Names"  value={order.requires_custom_name ? 'Enabled' : 'Disabled'} />
                <InfoRow label="Status"        value={
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: sc.bg, color: sc.text }}>
                    {STATUS_LABEL[vs]}
                  </span>
                } />
                {order.total_amount > 0 && (
                  <InfoRow label="Total Amount" value={<span className="font-bold" style={{ color: 'var(--c-primary)' }}>{fmt(order.total_amount)}</span>} />
                )}
              </div>
            </div>

            {order.payment_status && (
              <div className="rounded-2xl p-5" style={{ border: '1px solid var(--c-border)', background: '#fff' }}>
                <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--c-primary)' }}>Paid Participants Page</h4>
                <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                  A public social-proof page is available for this completed Excel order.
                </p>
                <a
                  href={`/api/excel-bulk-orders/${id}/paid-participants/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 text-sm font-semibold"
                  style={{ color: 'var(--c-primary)' }}
                >
                  <ArrowRightIcon />
                  Open paid participants page
                </a>
              </div>
            )}

            {/* Template download (always available) */}
            {order.template_file && (
              <button
                onClick={handleDownloadTemplate}
                disabled={downloading}
                className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all hover:shadow-md"
                style={{ border: '1px solid var(--c-border)', background: '#fff' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--c-bg-warm)', color: 'var(--c-primary)' }}>
                  {downloading ? <SpinnerIcon size={18} /> : <DownloadIcon size={18} />}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>Download Template</p>
                  <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{order.reference}_template.xlsx</p>
                </div>
                <ArrowRightIcon />
              </button>
            )}

            {/* Column guide */}
            <div className="rounded-2xl p-5" style={{ border: '1px solid var(--c-border)', background: 'var(--c-bg-warm)' }}>
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--c-primary)' }}>Excel Column Guide</h4>
              <div className="space-y-2 text-xs">
                {[
                  { col: 'Full Name',    req: true,  note: 'Participant\'s full name' },
                  { col: 'Size',        req: true,  note: 'S / M / L / XL / XXL / XXXL / XXXXL' },
                  ...(order.requires_custom_name
                    ? [{ col: 'Custom Name', req: false, note: 'Text to be printed/embroidered' }]
                    : []),
                  { col: 'Coupon Code', req: false, note: 'Leave blank if no coupon' },
                ].map(({ col, req, note }) => (
                  <div key={col} className="flex items-start gap-2">
                    <span className="font-mono font-semibold" style={{ color: 'var(--c-primary)', minWidth: '80px' }}>{col}</span>
                    <span className="px-1.5 rounded text-xs" style={{ background: req ? 'rgba(239,68,68,0.1)' : 'rgba(107,114,128,0.1)', color: req ? '#b91c1c' : '#6b7280' }}>
                      {req ? 'Required' : 'Optional'}
                    </span>
                    <span style={{ color: 'var(--c-text-muted)' }}>{note}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Help */}
            <div className="rounded-2xl p-5" style={{ border: '1px solid var(--c-border)', background: '#fff' }}>
              <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                Having trouble? Contact us at{' '}
                <a href={`mailto:${CONTACT.email}`} className="underline" style={{ color: 'var(--c-primary)' }}>
                  {CONTACT.email}
                </a>{' '}quoting reference <strong style={{ color: 'var(--c-text)' }}>{order.reference}</strong>.
              </p>
            </div>

            {/* Nav links */}
            <div className="flex flex-wrap gap-3 text-xs">
              <Link to="/excel-my-orders" className="underline" style={{ color: 'var(--c-text-muted)' }}>
                All My Orders
              </Link>
              <Link to="/excel-bulk-order/new" className="underline" style={{ color: 'var(--c-text-muted)' }}>
                Create New Order
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
