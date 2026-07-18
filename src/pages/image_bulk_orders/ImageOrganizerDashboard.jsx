import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

// ── Icons ──────────────────────────────────────────────────────────────────────
const SpinnerIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
    <circle cx="12" cy="12" r="10" strokeOpacity=".2"/>
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
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
const CheckIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const ExternalLinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)
const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const ChevronUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
)
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const AlertIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const WhatsAppIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
)
const DownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)
const TagIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
)
const ImageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)
const LockClosedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

// ── Helpers ────────────────────────────────────────────────────────────────────
function shareableUrl(slug) {
  return `${window.location.origin}/image-bulk-order/${slug}`
}

function toLocalDatetimeInput(value) {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

// ── Copy to clipboard hook ─────────────────────────────────────────────────────
function useCopy() {
  const [copied, setCopied] = useState(false)
  const timeout = useRef(null)

  function copy(text) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      clearTimeout(timeout.current)
      timeout.current = setTimeout(() => setCopied(false), 2000)
    })
  }
  return [copied, copy]
}

// ── Modal backdrop ─────────────────────────────────────────────────────────────
function Modal({ children, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {children}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  CREATE ORDER MODAL
// ══════════════════════════════════════════════════════════════════════════════
function CreateOrderModal({ onClose, onCreated }) {
  const [form, setForm]     = useState({
    organization_name: '', price_per_item: '', payment_deadline: '', custom_branding_enabled: false,
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.organization_name.trim()) errs.organization_name = 'Organisation name is required'
    if (!form.price_per_item || isNaN(Number(form.price_per_item)) || Number(form.price_per_item) <= 0)
      errs.price_per_item = 'Enter a valid price'
    if (!form.payment_deadline) errs.payment_deadline = 'Deadline is required'
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSaving(true)
    setError('')
    try {
      const data = await api.post('/image_bulk_orders/links/', {
        organization_name:         form.organization_name.trim(),
        price_per_item:            Number(form.price_per_item),
        payment_deadline:          form.payment_deadline,
        custom_branding_enabled:   form.custom_branding_enabled,
      })
      onCreated(data)
    } catch (err) {
      if (err.data && typeof err.data === 'object') {
        const mapped = {}
        Object.entries(err.data).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v })
        setErrors(mapped)
        setError(mapped.detail || mapped.non_field_errors || '')
      } else {
        setError(err.message || 'Failed to create order link.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-warm)' }}>
          <div>
            <h2 className="font-display text-xl" style={{ color: 'var(--c-primary)' }}>
              New Image Order Link
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>
              Create a shareable link with image upload support
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 transition-colors" style={{ color: 'var(--c-text-muted)' }}>
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertIcon /><span>{error}</span>
            </div>
          )}

          {/* Org name */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--c-text)' }}>
              Organisation Name <span style={{ color: 'var(--c-accent)' }}>*</span>
            </label>
            <input
              type="text" value={form.organization_name}
              onChange={e => setField('organization_name', e.target.value)}
              placeholder="e.g. LAGOS TECH ALUMNI 2024"
              style={inputStyle(errors.organization_name)}
            />
            {errors.organization_name && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.organization_name}</p>}
            <p className="text-xs mt-1" style={{ color: 'var(--c-text-muted)' }}>Will be displayed in uppercase on the order page</p>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--c-text)' }}>
              Price per Item (₦) <span style={{ color: 'var(--c-accent)' }}>*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: 'var(--c-text-muted)' }}>₦</span>
              <input
                type="number" min="1" step="0.01" value={form.price_per_item}
                onChange={e => setField('price_per_item', e.target.value)}
                placeholder="0.00"
                style={{ ...inputStyle(errors.price_per_item), paddingLeft: '2rem' }}
              />
            </div>
            {errors.price_per_item && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.price_per_item}</p>}
            <p className="text-xs mt-1" style={{ color: 'var(--c-text-muted)' }}>7.5% VAT will be added at checkout</p>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--c-text)' }}>
              Payment Deadline <span style={{ color: 'var(--c-accent)' }}>*</span>
            </label>
            <input
              type="datetime-local" value={form.payment_deadline}
              min={new Date().toISOString().slice(0, 16)}
              onChange={e => setField('payment_deadline', e.target.value)}
              style={inputStyle(errors.payment_deadline)}
            />
            {errors.payment_deadline && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.payment_deadline}</p>}
          </div>

          {/* Custom branding toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl cursor-pointer"
            style={{ border: '1.5px solid var(--c-border)', background: 'var(--c-bg)' }}
            onClick={() => setField('custom_branding_enabled', !form.custom_branding_enabled)}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Enable Custom Name Field</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>
                Participants can enter a name/text to be printed on their item
              </p>
            </div>
            <div
              className="relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-200"
              style={{ background: form.custom_branding_enabled ? 'var(--c-primary)' : 'var(--c-border)' }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200"
                style={{ left: form.custom_branding_enabled ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
              />
            </div>
          </div>

          {/* Image note */}
          <div className="flex items-start gap-2 p-3 rounded-xl text-xs"
            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)', color: '#78350f' }}>
            <ImageIcon />
            <span>
              Image upload is automatically enabled for all Image Order Links.
              Participants may optionally upload a personalisation photo or graphic.
            </span>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <><SpinnerIcon /><span>Creating...</span></> : 'Create Link'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  LINK CREATED MODAL
// ══════════════════════════════════════════════════════════════════════════════
function LinkCreatedModal({ link, onClose }) {
  const [copied, copy] = useCopy()
  const url = shareableUrl(link.slug)
  const waText = encodeURIComponent(
    `Hi! Here is the image order link for *${link.organization_name}*.\n\nYou can upload your personalisation image and register here:\n${url}\n\nDeadline: ${new Date(link.payment_deadline).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}\nPrice: ₦${Number(link.price_per_item).toLocaleString()} (+ VAT)`
  )

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>

        {/* Success header */}
        <div className="px-6 pt-8 pb-6 text-center" style={{ background: 'var(--c-primary)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(255,255,255,0.15)' }}>
            <CheckIcon size={28} />
          </div>
          <h2 className="font-display text-2xl text-white mb-1">Image Order Link Created!</h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Share this link so participants can register and upload their images
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* URL box */}
          <div>
            <label className="block text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: 'var(--c-text-muted)' }}>
              Shareable Link
            </label>
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)' }}>
              <span className="text-sm truncate flex-1 font-mono" style={{ color: 'var(--c-text)' }}>{url}</span>
              <button onClick={() => copy(url)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: copied ? 'rgba(16,185,129,0.1)' : 'var(--c-primary)',
                  color: copied ? '#10b981' : '#fff',
                }}>
                {copied ? <><CheckIcon size={12} /> Copied!</> : <><CopyIcon /> Copy</>}
              </button>
            </div>
          </div>

          {/* Order details */}
          <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)' }}>
            {[
              ['Organisation', link.organization_name],
              ['Price per item', `₦${Number(link.price_per_item).toLocaleString()} + VAT`],
              ['Deadline', new Date(link.payment_deadline).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })],
              ['Image Upload', 'Enabled'],
              ['Custom Names', link.custom_branding_enabled ? 'Enabled' : 'Disabled'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-sm">
                <span style={{ color: 'var(--c-text-muted)' }}>{l}</span>
                <span className="font-medium" style={{ color: 'var(--c-text)' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* WhatsApp share */}
          <a
            href={`https://wa.me/?text=${waText}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: '#25d366', color: '#fff' }}
          >
            <WhatsAppIcon /> Share on WhatsApp
          </a>

          <button onClick={onClose} className="btn-secondary w-full">Done</button>
        </div>
      </div>
    </Modal>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  COUPON MODAL (admin only)
// ══════════════════════════════════════════════════════════════════════════════
function CouponModal({ link, onClose, onGenerated }) {
  const [count, setCount]     = useState(50)
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError]     = useState('')

  async function handleGenerate() {
    if (count < 1 || count > 1000) { setError('Enter a number between 1 and 1000'); return }
    setSaving(true)
    setError('')
    try {
      const data = await api.post(`/image_bulk_orders/links/${link.slug}/generate_coupons/`, { count })
      setSuccess(data.count)
      await onGenerated?.()
    } catch (err) {
      setError(err.message || 'Failed to generate coupons.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-warm)' }}>
          <h2 className="font-display text-xl" style={{ color: 'var(--c-primary)' }}>Generate Coupons</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5" style={{ color: 'var(--c-text-muted)' }}>
            <XIcon />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                <CheckIcon size={24} />
              </div>
              <p className="font-display text-2xl mb-1" style={{ color: 'var(--c-primary)' }}>
                {success} Coupons Generated
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--c-text-muted)' }}>
                New coupon codes are now available for this image order.
              </p>
              <button onClick={onClose} className="btn-primary w-full">Done</button>
            </div>
          ) : (
            <>
              <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
                Generate coupon codes for <strong style={{ color: 'var(--c-text)' }}>{link.organization_name}</strong>.
                Each coupon can be used once by a participant to mark their order as paid.
              </p>
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl text-sm"
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <AlertIcon /><span>{error}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--c-text)' }}>
                  Number of Coupons (1-1000)
                </label>
                <input
                  type="number" min="1" max="1000" value={count}
                  onChange={e => setCount(Number(e.target.value))}
                  style={inputStyle(false)}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleGenerate} disabled={saving}
                  className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><SpinnerIcon /><span>Generating...</span></> : 'Generate'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}

function ManageLinkModal({ slug, onClose, onSaved, onDeleted }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    organization_name: '',
    price_per_item: '',
    payment_deadline: '',
    custom_branding_enabled: false,
  })

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await api.get(`/image_bulk_orders/links/${slug}/`)
        setForm({
          organization_name: data.organization_name || '',
          price_per_item: data.price_per_item ?? '',
          payment_deadline: toLocalDatetimeInput(data.payment_deadline),
          custom_branding_enabled: !!data.custom_branding_enabled,
        })
      } catch (err) {
        setError(err.message || 'Could not load image order details.')
      } finally {
        setLoading(false)
      }
    })()
  }, [slug])

  function setField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        organization_name: form.organization_name.trim(),
        price_per_item: Number(form.price_per_item),
        payment_deadline: new Date(form.payment_deadline).toISOString(),
        custom_branding_enabled: form.custom_branding_enabled,
      }
      const data = await api.patch(`/image_bulk_orders/links/${slug}/`, payload)
      onSaved(data)
      onClose()
    } catch (err) {
      setError(err.message || 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this image bulk order link permanently?')) return
    setDeleting(true)
    setError('')
    try {
      await api.delete(`/image_bulk_orders/links/${slug}/`)
      onDeleted(slug)
      onClose()
    } catch (err) {
      setError(err.message || 'Could not delete image bulk order.')
      setDeleting(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-warm)' }}>
          <div>
            <h2 className="font-display text-xl" style={{ color: 'var(--c-primary)' }}>Manage Image Order</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>
              Update pricing, deadline, and branding settings
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5" style={{ color: 'var(--c-text-muted)' }}>
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertIcon />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-10 flex items-center justify-center">
              <SpinnerIcon size={24} />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--c-text)' }}>Organisation Name</label>
                <input
                  type="text"
                  value={form.organization_name}
                  onChange={e => setField('organization_name', e.target.value)}
                  style={inputStyle(false)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--c-text)' }}>Price per Item (Naira)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.price_per_item}
                  onChange={e => setField('price_per_item', e.target.value)}
                  style={inputStyle(false)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--c-text)' }}>Payment Deadline</label>
                <input
                  type="datetime-local"
                  value={form.payment_deadline}
                  onChange={e => setField('payment_deadline', e.target.value)}
                  style={inputStyle(false)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl"
                style={{ border: '1.5px solid var(--c-border)', background: 'var(--c-bg)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>Custom Name Field</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>
                    Let participants submit custom text to be printed with their order
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setField('custom_branding_enabled', !form.custom_branding_enabled)}
                  className="relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-200"
                  style={{ background: form.custom_branding_enabled ? 'var(--c-primary)' : 'var(--c-border)' }}
                >
                  <div
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200"
                    style={{ left: form.custom_branding_enabled ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                  />
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleDelete} disabled={deleting || saving} className="btn-secondary flex-1">
                  {deleting ? 'Deleting...' : 'Delete Link'}
                </button>
                <button type="submit" disabled={saving || deleting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><SpinnerIcon /><span>Saving...</span></> : 'Save Changes'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </Modal>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  ORDER LINK CARD
// ══════════════════════════════════════════════════════════════════════════════
function OrderLinkCard({ link, isAdmin, onSaved, onDeleted }) {
  const [expanded, setExpanded]       = useState(false)
  const [stats, setStats]             = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [showCoupons, setShowCoupons] = useState(false)
  const [showManage, setShowManage]   = useState(false)
  const [urlCopied, copyUrl]          = useCopy()
  const [downloading, setDownloading] = useState(null)
  const [coupons, setCoupons]         = useState([])
  const [couponsLoading, setCouponsLoading] = useState(false)
  const [couponsError, setCouponsError] = useState('')

  const url       = shareableUrl(link.slug)
  const isExpired = link.is_expired

  const deadlineStr = new Date(link.payment_deadline).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  async function loadStats() {
    if (stats) return stats
    setStatsLoading(true)
    try {
      const data = await api.get(`/image_bulk_orders/links/${link.slug}/stats/`)
      setStats(data)
      return data
    } finally {
      setStatsLoading(false)
    }
  }

  async function loadCoupons({ force = false } = {}) {
    if (coupons.length && !force) return
    setCouponsLoading(true)
    setCouponsError('')
    try {
      const data = await api.get(`/image_bulk_orders/coupons/?bulk_order_slug=${link.slug}`)
      setCoupons(Array.isArray(data) ? data : (data?.results ?? []))
    } catch (err) {
      setCouponsError(err.message || 'Could not load coupons.')
    } finally {
      setCouponsLoading(false)
    }
  }

  function handleToggle() {
    setExpanded(x => !x)
    if (!expanded) {
      loadStats()
      if (isAdmin) loadCoupons()
    }
  }

  async function handleCouponsGenerated() {
    setStats(null)
    setCoupons([])
    const freshStats = await api.get(`/image_bulk_orders/links/${link.slug}/stats/`)
    setStats(freshStats)
    await loadCoupons({ force: true })
  }

  async function handleDownload(type) {
    setDownloading(type)
    try {
      const endpoints = {
        pdf: `/image_bulk_orders/links/${link.slug}/download_pdf/`,
        word: `/image_bulk_orders/links/${link.slug}/download_word/`,
        excel: `/image_bulk_orders/links/${link.slug}/generate_size_summary/`,
      }
      const res = await fetch(`${API_BASE}${endpoints[type]}`, {
        headers: api.getAuthHeader(),
      })
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const extMap = { pdf: '.pdf', word: '.docx', excel: '.xlsx' }
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `image_orders_${link.slug}${extMap[type] || ''}`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (err) {
      console.error('Download error:', err)
    } finally {
      setDownloading(null)
    }
  }

  const paidPct = stats
    ? Math.round((stats.paid_orders / Math.max(stats.total_orders, 1)) * 100)
    : 0
  const hasCoupons = (stats?.total_coupons ?? link.coupon_count ?? coupons.length) > 0

  const waText = encodeURIComponent(
    `Hi! Here is the image order link for *${link.organization_name}*.\n\nUpload your image & register here:\n${url}\n\nDeadline: ${deadlineStr}\nPrice: ₦${Number(link.price_per_item).toLocaleString()} (+ VAT)`
  )

  return (
    <>
      {showCoupons && (
        <CouponModal
          link={link}
          onClose={() => setShowCoupons(false)}
          onGenerated={handleCouponsGenerated}
        />
      )}
      {showManage && (
        <ManageLinkModal
          slug={link.slug}
          onClose={() => setShowManage(false)}
          onSaved={onSaved}
          onDeleted={onDeleted}
        />
      )}

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: `1.5px solid ${isExpired ? 'rgba(239,68,68,0.2)' : 'var(--c-border)'}`,
          background: '#fff',
          boxShadow: expanded ? '0 8px 40px rgba(0,0,0,0.09)' : '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'box-shadow 0.2s',
        }}
      >
        {/* Card header */}
        <div className="px-5 py-4" style={{ background: isExpired ? 'rgba(239,68,68,0.03)' : 'var(--c-bg-warm)', borderBottom: '1px solid var(--c-border)' }}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display text-lg truncate" style={{ color: 'var(--c-primary)' }}>
                  {link.organization_name}
                </h3>
                <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#92400e', border: '1px solid rgba(245,158,11,0.25)' }}>
                  <ImageIcon /> Image Orders
                </span>
                {isExpired && (
                  <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#b91c1c' }}>
                    Closed
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                <span className="text-sm font-bold" style={{ color: 'var(--c-accent)' }}>
                  ₦{Number(link.price_per_item).toLocaleString()}
                </span>
                <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>+VAT per item</span>
                <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>·</span>
                <span className="flex items-center gap-1 text-xs" style={{ color: isExpired ? '#b91c1c' : 'var(--c-text-muted)' }}>
                  <ClockIcon /> {deadlineStr}
                </span>
              </div>
            </div>
            <button
              onClick={handleToggle}
              className="flex-shrink-0 p-2 rounded-xl transition-colors hover:bg-black/5"
              style={{ color: 'var(--c-text-muted)' }}
            >
              {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>
          </div>
        </div>

        {/* Always visible: URL + actions */}
        <div className="px-5 py-4">
          {/* URL row */}
          <div className="flex items-center gap-2 p-3 rounded-xl mb-3" style={{ background: 'var(--c-bg)', border: '1px solid var(--c-border)' }}>
            <span className="text-xs font-mono truncate flex-1" style={{ color: 'var(--c-text-muted)' }}>
              {url}
            </span>
            <button
              onClick={() => copyUrl(url)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: urlCopied ? 'rgba(16,185,129,0.1)' : 'var(--c-primary)', color: urlCopied ? '#10b981' : '#fff' }}
            >
              {urlCopied ? <><CheckIcon size={12} /> Copied</> : <><CopyIcon /> Copy</>}
            </button>
            <a
              href={url} target="_blank" rel="noopener noreferrer"
              className="flex-shrink-0 p-2 rounded-lg transition-colors hover:bg-black/5"
              style={{ color: 'var(--c-text-muted)' }}
              title="Preview"
            >
              <ExternalLinkIcon />
            </a>
          </div>

          {/* WhatsApp quick share */}
          <a
            href={`https://wa.me/?text=${waText}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all mb-3"
            style={{ background: '#25d366', color: '#fff' }}
          >
            <WhatsAppIcon /> Share on WhatsApp
          </a>

          {/* Expand toggle */}
          <button onClick={handleToggle}
            className="flex items-center justify-center gap-1.5 w-full text-xs py-1.5"
            style={{ color: 'var(--c-text-muted)' }}>
            {expanded ? <><ChevronUpIcon /> Hide Stats</> : <><ChevronDownIcon /> Show Stats & Tools</>}
          </button>
        </div>

        {/* Expanded section */}
        {expanded && (
          <div className="px-5 pb-5 border-t space-y-5" style={{ borderColor: 'var(--c-border)' }}>

            {/* Stats */}
            <div className="pt-5">
              {statsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <SpinnerIcon size={20} />
                </div>
              ) : stats ? (
                <div>
                  <div className="grid grid-cols-3 gap-3 text-center mb-4">
                    {[
                      { label: 'Total',   val: stats.total_orders, color: 'var(--c-primary)' },
                      { label: 'Paid',    val: stats.paid_orders,  color: '#10b981' },
                      { label: 'Pending', val: (stats.total_orders - stats.paid_orders), color: '#f59e0b' },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="rounded-xl py-3" style={{ background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)' }}>
                        <p className="font-display text-2xl font-bold" style={{ color }}>{val}</p>
                        <p className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: 'var(--c-text-muted)' }}>{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 rounded-full overflow-hidden mb-1.5" style={{ background: 'var(--c-border)' }}>
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${paidPct}%`, background: 'linear-gradient(90deg,var(--c-primary),var(--c-accent))' }} />
                  </div>
                  <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                    {paidPct}% paid · {stats.paid_orders} of {stats.total_orders}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-center py-4" style={{ color: 'var(--c-text-muted)' }}>
                  Could not load stats
                </p>
              )}
            </div>

            {/* Organiser tools */}
            <div>
                <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--c-text-muted)' }}>
                  Organiser Tools
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Download PDF',   key: 'pdf',   icon: <DownloadIcon /> },
                    { label: 'Download Word',  key: 'word',  icon: <DownloadIcon /> },
                    { label: 'Excel Summary',  key: 'excel', icon: <DownloadIcon /> },
                  ].map(({ label, key, icon }) => (
                    <button
                      key={key}
                      onClick={() => handleDownload(key)}
                      disabled={!!downloading}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all"
                      style={{
                        border: '1.5px solid var(--c-border)',
                        background: downloading === key ? 'var(--c-primary)' : 'transparent',
                        color: downloading === key ? '#fff' : 'var(--c-text)',
                      }}
                    >
                      {downloading === key ? <SpinnerIcon /> : icon}
                      {downloading === key ? 'Downloading...' : label}
                    </button>
                  ))}

                  <button
                    onClick={() => setShowManage(true)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all"
                    style={{ border: '1.5px solid var(--c-border)', background: 'transparent', color: 'var(--c-text)' }}
                  >
                    <ExternalLinkIcon /> Manage Link
                  </button>

                  {isAdmin && !hasCoupons && (
                    <button
                      onClick={() => setShowCoupons(true)}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all"
                      style={{ border: '1.5px solid var(--c-border)', background: 'transparent', color: 'var(--c-text)' }}
                    >
                      <TagIcon /> Generate Coupons
                    </button>
                  )}
                </div>

                <a
                  href={`${API_BASE}/image_bulk_orders/links/${link.slug}/paid_orders/`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full mt-2 py-2 text-xs"
                  style={{ color: 'var(--c-text-muted)' }}
                >
                  <ExternalLinkIcon /> View Public Paid Orders Page
                </a>

                {isAdmin && (
                  <>
                    <a
                      href={`${API_BASE}/image_bulk_orders/links/${link.slug}/stats/`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full mt-2 py-2 text-xs"
                      style={{ color: 'var(--c-text-muted)' }}
                    >
                      <ExternalLinkIcon /> View Raw Analytics JSON
                    </a>

                    {hasCoupons && (
                      <p className="text-xs text-center mt-2" style={{ color: 'var(--c-text-muted)' }}>
                        This image order already has generated coupons.
                      </p>
                    )}

                    <div className="mt-4 rounded-xl p-4" style={{ background: 'var(--c-bg)', border: '1px solid var(--c-border)' }}>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--c-text-muted)' }}>
                          Coupons
                        </p>
                        {!!coupons.length && (
                          <span className="text-xs font-semibold" style={{ color: 'var(--c-primary)' }}>
                            {coupons.filter(coupon => !coupon.is_used).length} unused / {coupons.length} total
                          </span>
                        )}
                      </div>

                      {couponsLoading ? (
                        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--c-text-muted)' }}>
                          <SpinnerIcon size={16} />
                          <span>Loading coupons...</span>
                        </div>
                      ) : couponsError ? (
                        <p className="text-sm" style={{ color: '#dc2626' }}>{couponsError}</p>
                      ) : coupons.length > 0 ? (
                        <div className="space-y-2">
                          {coupons.slice(0, 8).map(coupon => (
                            <div key={coupon.id} className="flex items-center justify-between rounded-lg px-3 py-2 text-xs"
                              style={{ background: '#fff', border: '1px solid var(--c-border)' }}>
                              <span className="font-mono" style={{ color: 'var(--c-text)' }}>{coupon.code}</span>
                              <span style={{ color: coupon.is_used ? '#10b981' : 'var(--c-text-muted)' }}>
                                {coupon.is_used ? 'Used' : 'Unused'}
                              </span>
                            </div>
                          ))}
                          {coupons.length > 8 && (
                            <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                              Showing first 8 coupons. Open your admin API list for the full set.
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
                          No coupons generated yet for this image order.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
          </div>
        )}
      </div>
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function ImageOrganizerDashboard() {
  const { isAuthenticated, loading: authLoading, user } = useAuth()
  const navigate = useNavigate()

  const [links, setLinks]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [createdLink, setCreatedLink] = useState(null)

  useEffect(() => {
    document.title = 'Image Organiser Dashboard — Material Wear'
    return () => { document.title = 'Material Wear Limited' }
  }, [])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?next=/image-organiser', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  useEffect(() => {
    if (!isAuthenticated) return
    ;(async () => {
      try {
        const data = await api.get('/image_bulk_orders/links/')
        setLinks(Array.isArray(data) ? data : (data?.results ?? []))
      } catch (err) {
        setError(err.message || 'Failed to load image order links.')
      } finally {
        setLoading(false)
      }
    })()
  }, [isAuthenticated])

  function handleCreated(newLink) {
    setShowCreate(false)
    setCreatedLink(newLink)
    setLinks(prev => [newLink, ...prev])
  }

  function handleSavedLink(updatedLink) {
    setLinks(prev => prev.map(link => (link.slug === updatedLink.slug ? { ...link, ...updatedLink } : link)))
  }

  function handleDeletedLink(slug) {
    setLinks(prev => prev.filter(link => link.slug !== slug))
  }

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <main className="page-transition flex-1 flex items-center justify-center py-40" style={{ background: 'var(--c-bg)' }}>
        <SpinnerIcon size={32} />
      </main>
    )
  }

  const isAdmin   = user?.is_staff
  const activeLinks  = links.filter(l => !l.is_expired)
  const expiredLinks = links.filter(l =>  l.is_expired)

  return (
    <>
      {showCreate  && <CreateOrderModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
      {createdLink && <LinkCreatedModal link={createdLink} onClose={() => setCreatedLink(null)} />}

      <main className="page-transition flex-1" style={{ background: 'var(--c-bg)' }}>

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-28 pb-16 px-4" style={{ background: 'var(--c-primary)' }}>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg,rgba(255,255,255,0.03) 0,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,rgba(255,255,255,0.03) 0,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 40px)',
            }}
          />
          <div className="max-w-5xl mx-auto relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-4"
                  style={{ background: 'rgba(245,158,11,0.2)', color: '#fde68a', border: '1px solid rgba(245,158,11,0.3)' }}>
                  <ImageIcon /> Image Orders Portal
                </div>
                <h1 className="font-display text-4xl sm:text-5xl text-white mb-3 tracking-tight">
                  Image Organiser Dashboard
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.65)' }}>
                  Create and manage group order links with image upload support
                </p>
              </div>
              <button
                onClick={() => setShowCreate(true)}
                className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'var(--c-accent)', color: '#fff', boxShadow: '0 4px 16px rgba(245,158,11,0.35)' }}
              >
                <PlusIcon /> New Image Order Link
              </button>
            </div>

            {/* Summary pills */}
            {!loading && links.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-7">
                {[
                  { label: 'Total Links',  val: links.length,        color: 'rgba(255,255,255,0.12)', text: 'rgba(255,255,255,0.9)' },
                  { label: 'Active',       val: activeLinks.length,  color: 'rgba(16,185,129,0.25)',  text: '#6ee7b7' },
                  { label: 'Closed',       val: expiredLinks.length, color: 'rgba(239,68,68,0.2)',    text: '#fca5a5' },
                ].map(({ label, val, color, text }) => (
                  <div key={label} className="px-4 py-2 rounded-full text-sm"
                    style={{ background: color, color: text, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span className="font-bold">{val}</span>
                    <span className="ml-1.5 text-xs opacity-80">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── ACCESS NOTE (non-admin) ──────────────────────────────────────── */}
        {!isAdmin && (
          <div className="max-w-5xl mx-auto px-4 pt-6">
            <div className="flex items-start gap-3 p-4 rounded-xl text-sm"
              style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)', color: '#92400e' }}>
              <LockClosedIcon />
              <div>
                <p className="font-semibold mb-1">Admin features are restricted</p>
                <p>
                  Coupon generation and coupon code lists are available to admin accounts only.
                  You can still manage your own image links and download order summaries.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── BODY ──────────────────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 py-12">

          {error && (
            <div className="flex items-center gap-2 p-4 rounded-xl mb-6 text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertIcon /> {error}
            </div>
          )}

          {loading && (
            <div className="text-center py-24">
              <SpinnerIcon size={32} />
              <p className="text-sm mt-4" style={{ color: 'var(--c-text-muted)' }}>Loading your image order links...</p>
            </div>
          )}

          {!loading && links.length === 0 && (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'var(--c-bg-warm)', color: 'var(--c-text-muted)' }}>
                <ImageIcon />
              </div>
              <p className="section-eyebrow mb-2">No Links Yet</p>
              <h2 className="font-display text-2xl mb-4" style={{ color: 'var(--c-primary)' }}>
                Create Your First Image Order Link
              </h2>
              <p className="max-w-sm mx-auto mb-8" style={{ color: 'var(--c-text-muted)' }}>
                Image order links work exactly like standard bulk orders but also allow participants
                to upload personalisation images (photos, logos, etc.).
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <PlusIcon /> Create Image Order Link
              </button>
            </div>
          )}

          {!loading && links.length > 0 && (
            <div className="space-y-10">

              {/* Active links */}
              {activeLinks.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="font-display text-2xl" style={{ color: 'var(--c-primary)' }}>
                      Active Image Orders
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(16,185,129,0.1)', color: '#065f46' }}>
                      {activeLinks.length}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {activeLinks.map(link => (
                      <OrderLinkCard
                        key={link.id}
                        link={link}
                        isAdmin={isAdmin}
                        onSaved={handleSavedLink}
                        onDeleted={handleDeletedLink}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Expired links */}
              {expiredLinks.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="font-display text-2xl" style={{ color: 'var(--c-text-muted)' }}>
                      Closed Orders
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: 'rgba(239,68,68,0.08)', color: '#b91c1c' }}>
                      {expiredLinks.length}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {expiredLinks.map(link => (
                      <OrderLinkCard
                        key={link.id}
                        link={link}
                        isAdmin={isAdmin}
                        onSaved={handleSavedLink}
                        onDeleted={handleDeletedLink}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Navigation */}
          {!loading && (
            <div className="flex flex-wrap gap-4 justify-center mt-12 pt-8" style={{ borderTop: '1px solid var(--c-border)' }}>
              <Link to="/organiser" className="text-sm underline" style={{ color: 'var(--c-text-muted)' }}>
                Standard Organiser Dashboard
              </Link>
              <span style={{ color: 'var(--c-border)' }}>|</span>
              <Link to="/image-my-orders" className="text-sm underline" style={{ color: 'var(--c-text-muted)' }}>
                My Image Orders
              </Link>
              <span style={{ color: 'var(--c-border)' }}>|</span>
              <Link to="/profile" className="text-sm underline" style={{ color: 'var(--c-text-muted)' }}>
                My Profile
              </Link>
            </div>
          )}
        </section>
      </main>
    </>
  )
}

// ── Input style ────────────────────────────────────────────────────────────────
function inputStyle(hasError) {
  return {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem',
    border: `1.5px solid ${hasError ? '#ef4444' : 'var(--c-border)'}`,
    background: 'var(--c-bg)', color: 'var(--c-text)', fontSize: '0.875rem',
    outline: 'none', transition: 'border-color 0.15s', display: 'block',
  }
}
