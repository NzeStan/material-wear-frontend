import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { CONTACT } from '../../config/constants'

// ── Icons ──────────────────────────────────────────────────────────────────────
const SpinnerIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
    <circle cx="12" cy="12" r="10" strokeOpacity=".2"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
)
const AlertIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const PackageIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)
const ClockIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const DownloadIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)
const BarChartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
)
const TagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
)
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)
const ExternalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)

// ── Helpers ────────────────────────────────────────────────────────────────────
function useCopy() {
  const [copiedId, setCopiedId] = useState(null)
  const copy = useCallback(async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2200)
  }, [])
  return { copiedId, copy }
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatDeadline(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatCurrency(amount) {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(amount)
}

function toLocalDatetimeInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ── Form field ─────────────────────────────────────────────────────────────────
function FormField({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--c-text)' }}>
        {label}
        {required && <span className="ml-1" style={{ color: 'var(--c-accent)' }}>*</span>}
      </label>
      {children}
      {error && <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>{error}</p>}
      {hint && !error && <p className="text-xs mt-1.5" style={{ color: 'var(--c-text-muted)' }}>{hint}</p>}
    </div>
  )
}

function inputStyle(hasError) {
  return {
    width: '100%', padding: '0.7rem 1rem', borderRadius: '0.75rem',
    border: `1.5px solid ${hasError ? '#ef4444' : 'var(--c-border)'}`,
    background: 'var(--c-bg)', color: 'var(--c-text)', fontSize: '0.875rem', outline: 'none',
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  CREATE FORM (modal overlay)
// ══════════════════════════════════════════════════════════════════════════════
function CreateOrderModal({ onClose, onCreated }) {
  const [form, setForm]         = useState({ organization_name: '', price_per_item: '', payment_deadline: '', custom_branding_enabled: false })
  const [errors, setErrors]     = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.organization_name.trim())  e.organization_name  = 'Organisation name is required'
    if (!form.price_per_item)            e.price_per_item     = 'Price per item is required'
    else if (isNaN(form.price_per_item) || Number(form.price_per_item) <= 0) e.price_per_item = 'Enter a valid price'
    if (!form.payment_deadline)          e.payment_deadline   = 'Payment deadline is required'
    else if (new Date(form.payment_deadline) <= new Date()) e.payment_deadline = 'Deadline must be in the future'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    setApiError('')
    try {
      const data = await api.post('/bulk_orders/links/', {
        organization_name:       form.organization_name,
        price_per_item:          parseFloat(form.price_per_item),
        payment_deadline:        new Date(form.payment_deadline).toISOString(),
        custom_branding_enabled: form.custom_branding_enabled,
      })
      onCreated(data)
    } catch (err) {
      if (err.data && typeof err.data === 'object') {
        const errs = {}
        Object.entries(err.data).forEach(([k, v]) => { errs[k] = Array.isArray(v) ? v[0] : v })
        setErrors(errs)
        setApiError(errs.detail || errs.non_field_errors || '')
      } else {
        setApiError(err.message || 'Failed to create bulk order. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Min datetime = now + 1 hour
  const minDatetime = toLocalDatetimeInput(new Date(Date.now() + 3600000).toISOString())

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-5 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-warm)' }}>
          <div>
            <h2 className="font-display text-2xl" style={{ color: 'var(--c-primary)' }}>
              Create Bulk Order
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--c-text-muted)' }}>
              A shareable link will be generated for your group
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: 'var(--c-text-muted)', border: '1px solid var(--c-border)' }}
          >
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
          {apiError && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertIcon /><span>{apiError}</span>
            </div>
          )}

          {/* Organisation name */}
          <FormField label="Organisation / Group Name" required error={errors.organization_name}>
            <input
              type="text"
              value={form.organization_name}
              onChange={e => setField('organization_name', e.target.value)}
              placeholder="e.g. GRACE CHAPEL 2025"
              style={inputStyle(errors.organization_name)}
            />
          </FormField>

          {/* Price */}
          <FormField
            label="Price Per Item (₦)"
            required
            error={errors.price_per_item}
            hint="The amount each member will pay for their item (VAT will be added at checkout)"
          >
            <div className="relative">
              <span
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold select-none"
                style={{ color: 'var(--c-text-muted)' }}
              >
                ₦
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price_per_item}
                onChange={e => setField('price_per_item', e.target.value)}
                placeholder="5000.00"
                style={{ ...inputStyle(errors.price_per_item), paddingLeft: '2rem' }}
              />
            </div>
          </FormField>

          {/* Payment deadline */}
          <FormField
            label="Payment Deadline"
            required
            error={errors.payment_deadline}
            hint="Members cannot place new orders after this date and time"
          >
            <input
              type="datetime-local"
              value={form.payment_deadline}
              min={minDatetime}
              onChange={e => setField('payment_deadline', e.target.value)}
              style={inputStyle(errors.payment_deadline)}
            />
          </FormField>

          {/* Custom branding toggle */}
          <div className="flex items-start gap-4 p-4 rounded-xl" style={{ background: 'var(--c-bg)', border: '1.5px solid var(--c-border)' }}>
            <button
              type="button"
              onClick={() => setField('custom_branding_enabled', !form.custom_branding_enabled)}
              className="flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 relative mt-0.5"
              style={{ background: form.custom_branding_enabled ? 'var(--c-primary)' : 'var(--c-border)' }}
              role="switch"
              aria-checked={form.custom_branding_enabled}
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
                style={{ transform: form.custom_branding_enabled ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </button>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>
                Enable Custom Branding
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>
                Members will be asked to enter a custom name or text to be printed/embroidered on their item
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-3">
              {submitting
                ? <><SpinnerIcon size={15} /><span>Creating...</span></>
                : <><PlusIcon /><span>Create Order Link</span></>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  SUCCESS MODAL (show shareable link after creation)
// ══════════════════════════════════════════════════════════════════════════════
function LinkCreatedModal({ order, onClose }) {
  const { copiedId, copy } = useCopy()
  const shareableUrl = `${window.location.origin}/bulk-order/${order.slug}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>

        {/* Success header */}
        <div className="px-7 pt-8 pb-6 text-center"
          style={{ background: 'linear-gradient(135deg,var(--c-primary),#065f46)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(255,255,255,0.15)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h2 className="font-display text-2xl text-white mb-1">Bulk Order Created!</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem' }}>
            Share the link below with your group members
          </p>
        </div>

        <div className="px-7 py-6 space-y-5">
          {/* Org name */}
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--c-text-muted)' }}>Group Name</p>
            <p className="font-display text-xl" style={{ color: 'var(--c-primary)' }}>{order.organization_name}</p>
          </div>

          {/* Shareable link box */}
          <div>
            <p className="text-xs uppercase tracking-widest mb-2 font-semibold" style={{ color: 'var(--c-text-muted)' }}>
              Shareable Link
            </p>
            <div className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: 'var(--c-bg-warm)', border: '1.5px solid var(--c-border)' }}>
              <LinkIcon />
              <span className="flex-1 text-sm font-mono truncate" style={{ color: 'var(--c-text)' }}>
                {shareableUrl}
              </span>
              <button
                onClick={() => copy(shareableUrl, 'main')}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: copiedId === 'main' ? 'rgba(16,185,129,0.12)' : 'var(--c-primary)',
                  color:      copiedId === 'main' ? '#065f46' : '#fff',
                }}
              >
                {copiedId === 'main' ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy</>}
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--c-bg)', border: '1px solid var(--c-border)' }}>
            {[
              ['Slug',         order.slug],
              ['Price',        formatCurrency(order.price_per_item)],
              ['Deadline',     formatDeadline(order.payment_deadline)],
              ['Custom Brand', order.custom_branding_enabled ? 'Enabled' : 'Disabled'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span style={{ color: 'var(--c-text-muted)' }}>{label}</span>
                <span className="font-medium" style={{ color: 'var(--c-text)' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* WhatsApp / share helpers */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Join our group order! Place your order and make payment here: ${shareableUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-colors"
              style={{ background: '#25D366', color: '#fff' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              Share on WhatsApp
            </a>
            <button
              onClick={() => copy(shareableUrl, 'copy2')}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-colors"
              style={{ background: copiedId === 'copy2' ? 'rgba(16,185,129,0.1)' : 'var(--c-bg-warm)', color: copiedId === 'copy2' ? '#065f46' : 'var(--c-text)', border: '1.5px solid var(--c-border)' }}
            >
              {copiedId === 'copy2' ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy Link</>}
            </button>
          </div>

          <button onClick={onClose} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
            Done — View My Orders
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  COUPON MODAL (admin only)
// ══════════════════════════════════════════════════════════════════════════════
function CouponModal({ order, onClose }) {
  const [count,     setCount]     = useState(50)
  const [loading,   setLoading]   = useState(false)
  const [result,    setResult]    = useState(null)
  const [error,     setError]     = useState('')

  async function handleGenerate() {
    setLoading(true)
    setError('')
    try {
      const data = await api.post(`/bulk_orders/links/${order.slug}/generate_coupons/`, { count })
      setResult(data)
    } catch (err) {
      setError(err.message || 'Failed to generate coupons.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
        <div className="px-6 pt-6 pb-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-warm)' }}>
          <h2 className="font-display text-xl" style={{ color: 'var(--c-primary)' }}>Generate Coupons</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ color: 'var(--c-text-muted)', border: '1px solid var(--c-border)' }}>
            <XIcon />
          </button>
        </div>
        <div className="px-6 py-6 space-y-4">
          <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
            Generate unique coupon codes for <strong style={{ color: 'var(--c-text)' }}>{order.organization_name}</strong>.
            Members with a coupon will not need to pay — their order is marked as paid automatically.
          </p>

          {result ? (
            <div className="p-4 rounded-xl text-center"
              style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <p className="font-display text-3xl mb-1" style={{ color: 'var(--c-primary)' }}>{result.count}</p>
              <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>coupons generated</p>
              {result.sample_codes?.length > 0 && (
                <div className="mt-3 text-xs font-mono" style={{ color: 'var(--c-text-muted)' }}>
                  Sample: {result.sample_codes.slice(0, 3).join(', ')}...
                </div>
              )}
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl text-sm"
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <AlertIcon /><span>{error}</span>
                </div>
              )}
              <FormField label="Number of Coupons" hint="Each coupon can only be used once">
                <input
                  type="number" min="1" max="1000" value={count}
                  onChange={e => setCount(Number(e.target.value))}
                  style={inputStyle(false)}
                />
              </FormField>
              <button onClick={handleGenerate} disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                {loading ? <><SpinnerIcon size={15} /><span>Generating...</span></> : <><TagIcon /><span>Generate {count} Coupons</span></>}
              </button>
            </>
          )}

          {result && (
            <button onClick={onClose} className="btn-secondary w-full flex items-center justify-center py-3">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  ORDER CARD
// ══════════════════════════════════════════════════════════════════════════════
function OrderLinkCard({ order, isAdmin, onRefresh }) {
  const { copiedId, copy } = useCopy()
  const [expanded,     setExpanded]     = useState(false)
  const [stats,        setStats]        = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [couponModal,  setCouponModal]  = useState(false)
  const [downloading,  setDownloading]  = useState({})

  const shareableUrl = `${window.location.origin}/bulk-order/${order.slug}`
  const isExpired    = order.is_expired

  async function loadStats() {
    if (stats) { setExpanded(v => !v); return }
    setStatsLoading(true)
    setExpanded(true)
    try {
      const data = await api.get(`/bulk_orders/links/${order.slug}/stats/`)
      setStats(data)
    } catch {
      // Stats failed silently — still show expanded with partial info
    } finally {
      setStatsLoading(false)
    }
  }

  function toggleExpanded() {
    if (!expanded) loadStats()
    else setExpanded(false)
  }

  async function download(type) {
    setDownloading(d => ({ ...d, [type]: true }))
    try {
      const endpoints = {
        pdf:   `/bulk_orders/links/${order.slug}/download_pdf/`,
        word:  `/bulk_orders/links/${order.slug}/download_word/`,
        excel: `/bulk_orders/links/${order.slug}/generate_size_summary/`,
      }
      // Direct browser download via anchor
      const token = localStorage.getItem('mw_auth_token')
      const resp  = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}${endpoints[type]}`, {
        headers: token ? { Authorization: `Token ${token}` } : {},
      })
      if (!resp.ok) throw new Error('Download failed')
      const blob = await resp.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      const ext  = { pdf: 'pdf', word: 'docx', excel: 'xlsx' }[type]
      a.download = `${order.slug}-${type}.${ext}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
    } finally {
      setDownloading(d => ({ ...d, [type]: false }))
    }
  }

  const paidPct = stats
    ? Math.round((stats.paid_orders / Math.max(stats.total_orders, 1)) * 100)
    : null

  return (
    <>
      {couponModal && (
        <CouponModal order={order} onClose={() => setCouponModal(false)} />
      )}

      <div
        className="rounded-2xl overflow-hidden transition-shadow hover:shadow-md"
        style={{
          border: `1.5px solid ${isExpired ? 'rgba(239,68,68,0.2)' : 'var(--c-border)'}`,
          background: '#fff',
        }}
      >
        {/* ── Header ── */}
        <div className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{ background: isExpired ? 'rgba(239,68,68,0.03)' : 'var(--c-bg-warm)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: isExpired ? 'rgba(239,68,68,0.1)' : 'rgba(6,78,59,0.1)', color: isExpired ? '#ef4444' : 'var(--c-primary)' }}>
              <PackageIcon size={18} />
            </div>
            <div className="min-w-0">
              <p className="font-display text-base truncate" style={{ color: 'var(--c-primary)' }}>
                {order.organization_name}
              </p>
              <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--c-text-muted)' }}>
                /{order.slug}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: isExpired ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.12)',
                color:       isExpired ? '#b91c1c'             : '#065f46',
              }}>
              {isExpired ? 'Expired' : 'Active'}
            </span>
            <button
              onClick={toggleExpanded}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ border: '1px solid var(--c-border)', color: 'var(--c-text-muted)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Quick info strip ── */}
        <div className="px-5 sm:px-6 py-3 flex flex-wrap gap-x-5 gap-y-1 text-sm border-b"
          style={{ borderColor: 'var(--c-border)' }}>
          <span style={{ color: 'var(--c-text-muted)' }}>
            Price: <strong style={{ color: 'var(--c-text)' }}>{formatCurrency(order.price_per_item)}</strong>
          </span>
          <span style={{ color: 'var(--c-text-muted)' }}>
            Deadline: <strong style={{ color: 'var(--c-text)' }}>{formatDate(order.payment_deadline)}</strong>
          </span>
          <span style={{ color: 'var(--c-text-muted)' }}>
            Orders: <strong style={{ color: 'var(--c-text)' }}>{order.order_count ?? '—'}</strong>
          </span>
          <span style={{ color: 'var(--c-text-muted)' }}>
            Paid: <strong style={{ color: '#10b981' }}>{order.paid_count ?? '—'}</strong>
          </span>
        </div>

        {/* ── Shareable link row ── */}
        <div className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center border-b"
          style={{ borderColor: 'var(--c-border)' }}>
          <div className="flex-1 flex items-center gap-2 min-w-0 px-3 py-2 rounded-xl"
            style={{ background: 'var(--c-bg)', border: '1px solid var(--c-border)' }}>
            <LinkIcon />
            <span className="flex-1 text-xs font-mono truncate" style={{ color: 'var(--c-text-muted)' }}>
              {shareableUrl}
            </span>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => copy(shareableUrl, order.slug)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: copiedId === order.slug ? 'rgba(16,185,129,0.12)' : 'var(--c-primary)',
                color:      copiedId === order.slug ? '#065f46' : '#fff',
              }}
            >
              {copiedId === order.slug ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy Link</>}
            </button>
            <a
              href={shareableUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ border: '1.5px solid var(--c-border)', color: 'var(--c-text-muted)' }}
            >
              <ExternalIcon /> Preview
            </a>
          </div>
        </div>

        {/* WhatsApp quick share */}
        <div className="px-5 sm:px-6 py-3 border-b" style={{ borderColor: 'var(--c-border)' }}>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Join our group order! Place your order and make payment here: ${shareableUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(37,211,102,0.1)', color: '#128C7E' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            Share via WhatsApp
          </a>
        </div>

        {/* ── EXPANDED DETAILS ── */}
        {expanded && (
          <div className="px-5 sm:px-6 py-5 space-y-5" style={{ borderBottom: '1px solid var(--c-border)' }}>

            {/* Stats */}
            {statsLoading && (
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--c-text-muted)' }}>
                <SpinnerIcon size={14} /><span>Loading stats...</span>
              </div>
            )}

            {stats && (
              <>
                <div>
                  <p className="text-xs uppercase tracking-widest mb-3 font-semibold" style={{ color: 'var(--c-text-muted)' }}>
                    Payment Progress
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-center mb-3">
                    {[
                      ['Total', stats.total_orders, 'var(--c-primary)'],
                      ['Paid',  stats.paid_orders,  '#10b981'],
                      ['Unpaid', stats.unpaid_orders, 'var(--c-accent)'],
                    ].map(([label, val, color]) => (
                      <div key={label} className="p-3 rounded-xl" style={{ background: 'var(--c-bg)', border: '1px solid var(--c-border)' }}>
                        <p className="font-display text-2xl font-bold" style={{ color }}>{val}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--c-border)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${paidPct}%`, background: 'linear-gradient(90deg,var(--c-primary),var(--c-accent))' }} />
                  </div>
                  <p className="text-xs text-right mt-1" style={{ color: 'var(--c-text-muted)' }}>
                    {paidPct}% paid
                  </p>
                </div>

                {stats.total_coupons > 0 && (
                  <div className="p-3 rounded-xl text-sm flex items-center justify-between"
                    style={{ background: 'var(--c-bg)', border: '1px solid var(--c-border)' }}>
                    <span style={{ color: 'var(--c-text-muted)' }}>Coupons</span>
                    <span className="font-semibold" style={{ color: 'var(--c-text)' }}>
                      {stats.used_coupons} / {stats.total_coupons} used
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Deadline */}
            <div className="flex items-start gap-2 text-sm" style={{ color: 'var(--c-text-muted)' }}>
              <ClockIcon />
              <span>
                Deadline: <strong style={{ color: 'var(--c-text)' }}>{formatDeadline(order.payment_deadline)}</strong>
                {isExpired && <span className="ml-2 text-xs" style={{ color: '#ef4444' }}>(Expired)</span>}
              </span>
            </div>

            {/* Admin-only tools */}
            {isAdmin && (
              <div>
                <p className="text-xs uppercase tracking-widest mb-3 font-semibold" style={{ color: 'var(--c-text-muted)' }}>
                  Admin Tools
                </p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => download('pdf')} disabled={downloading.pdf}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                    style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {downloading.pdf ? <SpinnerIcon size={12} /> : <DownloadIcon />} PDF Report
                  </button>
                  <button onClick={() => download('word')} disabled={downloading.word}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                    style={{ background: 'rgba(37,99,235,0.08)', color: '#1d4ed8', border: '1px solid rgba(37,99,235,0.2)' }}>
                    {downloading.word ? <SpinnerIcon size={12} /> : <DownloadIcon />} Word Doc
                  </button>
                  <button onClick={() => download('excel')} disabled={downloading.excel}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                    style={{ background: 'rgba(22,163,74,0.08)', color: '#15803d', border: '1px solid rgba(22,163,74,0.2)' }}>
                    {downloading.excel ? <SpinnerIcon size={12} /> : <DownloadIcon />} Size Summary
                  </button>
                  <button
                    onClick={() => setCouponModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                    style={{ background: 'rgba(245,158,11,0.1)', color: '#92400e', border: '1px solid rgba(245,158,11,0.3)' }}>
                    <TagIcon /> Generate Coupons
                  </button>
                  <a
                    href={`/api/bulk_orders/links/${order.slug}/analytics/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                    style={{ background: 'rgba(139,92,246,0.08)', color: '#6d28d9', border: '1px solid rgba(139,92,246,0.2)' }}>
                    <BarChartIcon /> Analytics JSON
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
export default function OrganizerDashboard() {
  const { isAuthenticated, loading: authLoading, user } = useAuth()
  const navigate = useNavigate()

  const [orders,      setOrders]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [showCreate,  setShowCreate]  = useState(false)
  const [newOrder,    setNewOrder]    = useState(null)   // triggers link-created modal

  const isAdmin = user?.is_staff

  useEffect(() => {
    document.title = 'Organiser Dashboard — Material Wear'
    return () => { document.title = 'Material Wear Limited' }
  }, [])

  // Auth guard
  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      navigate('/login?next=/organiser', { replace: true })
    }
  }, [authLoading, isAuthenticated, navigate])

  // Load orders
  useEffect(() => {
    if (authLoading || !isAuthenticated) return
    fetchOrders()
  }, [authLoading, isAuthenticated]) // eslint-disable-line

  async function fetchOrders() {
    setLoading(true)
    setError('')
    try {
      const data = await api.get('/bulk_orders/links/')
      setOrders(Array.isArray(data) ? data : (data?.results ?? []))
    } catch (err) {
      setError(err.message || 'Failed to load your bulk orders.')
    } finally {
      setLoading(false)
    }
  }

  function handleCreated(data) {
    setShowCreate(false)
    setNewOrder(data)
    setOrders(prev => [data, ...prev])
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (authLoading || (loading && !orders.length)) {
    return (
      <main className="page-transition flex-1 flex items-center justify-center py-40" style={{ background: 'var(--c-bg)' }}>
        <div className="text-center">
          <SpinnerIcon size={36} />
          <p className="text-sm mt-4" style={{ color: 'var(--c-text-muted)' }}>Loading your dashboard...</p>
        </div>
      </main>
    )
  }

  const activeOrders  = orders.filter(o => !o.is_expired)
  const expiredOrders = orders.filter(o => o.is_expired)

  return (
    <>
      {/* Modals */}
      {showCreate && (
        <CreateOrderModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
      {newOrder && (
        <LinkCreatedModal order={newOrder} onClose={() => setNewOrder(null)} />
      )}

      <main className="page-transition flex-1" style={{ background: 'var(--c-bg)' }}>

        {/* ── PAGE HEADER ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-28 pb-16 px-4"
          style={{ background: 'var(--c-primary)' }}>
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'repeating-linear-gradient(0deg,rgba(255,255,255,0.03) 0,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,rgba(255,255,255,0.03) 0,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 40px)',
          }} />

          <div className="max-w-5xl mx-auto relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Organiser Portal
                </p>
                <h1 className="font-display text-4xl sm:text-5xl text-white">
                  Bulk Order Dashboard
                </h1>
                {user && (
                  <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {user.first_name ? `Welcome back, ${user.first_name}` : `Welcome, ${user.email}`}
                    {isAdmin && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(245,158,11,0.25)', color: 'var(--c-accent)' }}>
                        Admin
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Stats pills */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                  style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
                  <PackageIcon size={16} />
                  <span>{orders.length} total link{orders.length !== 1 ? 's' : ''}</span>
                </div>
                {activeOrders.length > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                    style={{ background: 'rgba(16,185,129,0.2)', color: '#6ee7b7' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{activeOrders.length} active</span>
                  </div>
                )}
              </div>
            </div>

            {/* Create button */}
            <div className="mt-8">
              <button
                onClick={() => setShowCreate(true)}
                className="btn-primary inline-flex items-center gap-2"
                style={{ background: 'var(--c-accent)', borderColor: 'var(--c-accent)', color: '#fff' }}
              >
                <PlusIcon />
                <span>Create New Bulk Order Link</span>
              </button>
            </div>
          </div>
        </section>

        {/* ── CONTENT ─────────────────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 py-12">

          {/* Error */}
          {error && (
            <div className="flex items-center justify-between p-4 rounded-xl mb-6"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="flex items-center gap-2 text-sm"><AlertIcon /><span>{error}</span></div>
              <button onClick={fetchOrders} className="flex items-center gap-1.5 text-sm underline">
                <RefreshIcon /> Retry
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && orders.length === 0 && !error && (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'var(--c-bg-warm)', color: 'var(--c-text-muted)' }}>
                <PackageIcon size={32} />
              </div>
              <p className="section-eyebrow mb-2">Nothing here yet</p>
              <h2 className="font-display text-3xl mb-4" style={{ color: 'var(--c-primary)' }}>
                No Bulk Orders Yet
              </h2>
              <p className="max-w-sm mx-auto mb-8" style={{ color: 'var(--c-text-muted)' }}>
                Create your first bulk order link and share it with your group so members can place and pay for their orders.
              </p>
              <button onClick={() => setShowCreate(true)}
                className="btn-primary inline-flex items-center gap-2">
                <PlusIcon /><span>Create Your First Bulk Order</span>
              </button>
            </div>
          )}

          {/* Active orders */}
          {activeOrders.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="font-display text-xl" style={{ color: 'var(--c-primary)' }}>Active Orders</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(16,185,129,0.12)', color: '#065f46' }}>
                  {activeOrders.length}
                </span>
              </div>
              <div className="space-y-4">
                {activeOrders.map(o => (
                  <OrderLinkCard key={o.id} order={o} isAdmin={isAdmin} onRefresh={fetchOrders} />
                ))}
              </div>
            </div>
          )}

          {/* Expired orders */}
          {expiredOrders.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <h2 className="font-display text-xl" style={{ color: 'var(--c-primary)' }}>Expired / Closed</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(107,114,128,0.1)', color: '#6b7280' }}>
                  {expiredOrders.length}
                </span>
              </div>
              <div className="space-y-4">
                {expiredOrders.map(o => (
                  <OrderLinkCard key={o.id} order={o} isAdmin={isAdmin} onRefresh={fetchOrders} />
                ))}
              </div>
            </div>
          )}

          {/* Refresh */}
          {orders.length > 0 && (
            <div className="text-center mt-10">
              <button onClick={fetchOrders} disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
                style={{ border: '1.5px solid var(--c-border)', color: 'var(--c-text-muted)', background: '#fff' }}>
                {loading ? <SpinnerIcon size={14} /> : <RefreshIcon />}
                <span>Refresh</span>
              </button>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
