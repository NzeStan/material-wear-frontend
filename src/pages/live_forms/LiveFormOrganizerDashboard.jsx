import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

/* ─── helpers ───────────────────────────────────────────────── */
function fmtCountdown(s) {
  if (s <= 0) return 'Expired'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`
  return [h, m, sec].map(n => String(n).padStart(2, '0')).join(':')
}
function fmtDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function toLocalDatetimeStr(date = new Date()) {
  const pad = n => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/* ─── icons ─────────────────────────────────────────────────── */
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const IconCopy = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)
const IconChevron = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)
const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 15, height: 15 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
)
const IconRefresh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
  </svg>
)
const IconToggle = ({ on }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    {on
      ? <><rect x="1" y="5" width="22" height="14" rx="7" ry="7"/><circle cx="16" cy="12" r="3" fill="currentColor"/></>
      : <><rect x="1" y="5" width="22" height="14" rx="7" ry="7"/><circle cx="8" cy="12" r="3" fill="currentColor"/></>
    }
  </svg>
)
const IconExternalLink = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

/* ─── stat pill ─────────────────────────────────────────────── */
function StatPill({ label, value, color }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: 12, padding: '1rem 1.5rem', textAlign: 'center', minWidth: 120 }}>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: color || '#fff' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{label}</div>
    </div>
  )
}

/* ─── create form modal ─────────────────────────────────────── */
function CreateFormModal({ onClose, onCreate }) {
  const defaultExpiry = toLocalDatetimeStr(new Date(Date.now() + 7 * 24 * 3600 * 1000))
  const [orgName,     setOrgName]     = useState('')
  const [expiresAt,   setExpiresAt]   = useState(defaultExpiry)
  const [maxSubs,     setMaxSubs]     = useState('')
  const [customBrand, setCustomBrand] = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [err,         setErr]         = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!orgName.trim()) { setErr('Organisation name is required.'); return }
    if (!expiresAt)      { setErr('Expiry date is required.'); return }
    setErr('')
    setSubmitting(true)
    try {
      const body = {
        organization_name: orgName.trim(),
        expires_at: new Date(expiresAt).toISOString(),
        custom_branding_enabled: customBrand,
        ...(maxSubs ? { max_submissions: parseInt(maxSubs, 10) } : {}),
      }
      const data = await api.post('/live_forms/api/forms/', body)
      onCreate(data)
    } catch (e) {
      setErr(e.message || 'Failed to create form.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div style={{ background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontWeight: 800, color: 'var(--c-text)', fontSize: '1.2rem', margin: 0 }}>Create Live Form</h2>
            <p style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>Set up a new real-time group wear registration</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-text-muted)', fontSize: '1.5rem', lineHeight: 1, padding: '0.25rem' }}>×</button>
        </div>

        <form onSubmit={submit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* org name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
              ORGANISATION NAME <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              value={orgName}
              onChange={e => setOrgName(e.target.value)}
              placeholder="e.g. GH Tech Summit 2026"
              maxLength={255}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 10, border: '1.5px solid var(--c-border)', background: 'var(--c-bg)', color: 'var(--c-text)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = 'var(--c-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--c-border)'}
            />
            <p style={{ fontSize: '0.72rem', color: 'var(--c-text-muted)', marginTop: '0.35rem' }}>Stored and displayed in UPPERCASE.</p>
          </div>

          {/* expires at */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
              FORM CLOSES AT <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              min={toLocalDatetimeStr()}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 10, border: '1.5px solid var(--c-border)', background: 'var(--c-bg)', color: 'var(--c-text)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = 'var(--c-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--c-border)'}
            />
          </div>

          {/* max submissions */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
              MAX ENTRIES <span style={{ color: 'var(--c-text-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="number"
              value={maxSubs}
              onChange={e => setMaxSubs(e.target.value)}
              placeholder="Leave blank for unlimited"
              min={1}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 10, border: '1.5px solid var(--c-border)', background: 'var(--c-bg)', color: 'var(--c-text)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = 'var(--c-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--c-border)'}
            />
          </div>

          {/* custom branding toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: customBrand ? 'rgba(245,158,11,0.06)' : 'var(--c-bg)', border: `1.5px solid ${customBrand ? 'rgba(245,158,11,0.3)' : 'var(--c-border)'}`, borderRadius: 10, padding: '1rem' }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--c-text)', fontSize: '0.9rem' }}>Custom Branding Names</div>
              <div style={{ color: 'var(--c-text-muted)', fontSize: '0.78rem', marginTop: '0.2rem' }}>Participants provide a name to print/embroider</div>
            </div>
            <button type="button" onClick={() => setCustomBrand(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: customBrand ? '#d97706' : 'var(--c-text-muted)', padding: '0.25rem' }}>
              <IconToggle on={customBrand} />
            </button>
          </div>

          {err && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem' }}>
              {err}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.75rem', background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', borderRadius: 10, fontWeight: 600, cursor: 'pointer', color: 'var(--c-text)', fontSize: '0.9rem' }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} style={{ flex: 1, padding: '0.75rem', background: submitting ? 'var(--c-text-muted)' : 'var(--c-primary)', border: 'none', borderRadius: 10, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', color: '#fff', fontSize: '0.9rem' }}>
              {submitting ? 'Creating…' : 'Create Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── link created modal ────────────────────────────────────── */
function LinkCreatedModal({ form, onClose }) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/live-form/${form.slug}`

  const copy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const waText = encodeURIComponent(
    `📋 *${form.organization_name} — Group Wear Registration*\n\nRegister your size here 👇\n${url}\n\n⏰ Closes: ${fmtDate(form.expires_at)}`
  )

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div style={{ background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)', borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.3)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ background: 'linear-gradient(135deg, var(--c-primary), #065f46)', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.25rem' }}>Form Created!</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem' }}>{form.organization_name}</p>
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--c-text-muted)', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>SHAREABLE LINK</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1, background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', borderRadius: 8, padding: '0.65rem 0.85rem', fontSize: '0.8rem', color: 'var(--c-text)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {url}
              </div>
              <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.65rem 1rem', background: copied ? '#15803d' : 'var(--c-primary)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                <IconCopy /> {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <a
            href={`https://wa.me/?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: '#25D366', borderRadius: 10, color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}
          >
            <IconWhatsApp /> Share via WhatsApp
          </a>

          <Link
            to={`/live-form/${form.slug}`}
            target="_blank"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--c-bg)', border: '1.5px solid var(--c-border)', borderRadius: 10, color: 'var(--c-text)', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}
          >
            <IconExternalLink /> Preview Form
          </Link>

          <button onClick={onClose} style={{ padding: '0.6rem', background: 'none', border: 'none', color: 'var(--c-text-muted)', cursor: 'pointer', fontSize: '0.875rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── form card ─────────────────────────────────────────────── */
function FormCard({ form, isAdmin, onToggle, onDownload, onRefreshStats }) {
  const [open,    setOpen]    = useState(false)
  const [copied,  setCopied]  = useState(false)
  const [toggling, setToggling] = useState(false)
  const [stats,   setStats]   = useState(null)
  const [loadingStats, setLoadingStats] = useState(false)

  const url = `${window.location.origin}/live-form/${form.slug}`
  const copy = () => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const loadStats = async () => {
    if (stats || loadingStats) return
    setLoadingStats(true)
    try {
      const data = await api.get(`/live_forms/api/forms/${form.slug}/`)
      setStats(data)
    } catch { /* silent */ } finally {
      setLoadingStats(false)
    }
  }

  const handleExpand = () => {
    const next = !open
    setOpen(next)
    if (next) loadStats()
  }

  const handleToggle = async () => {
    setToggling(true)
    await onToggle(form, !form.is_active)
    setToggling(false)
  }

  const isExpired = form.is_expired || (form.seconds_remaining != null && form.seconds_remaining <= 0)
  const isActive  = form.is_active && !isExpired
  const total     = stats?.total_submissions ?? form.total_submissions ?? 0

  const statusColor = isActive ? '#15803d' : isExpired ? '#9ca3af' : '#dc2626'
  const statusLabel = isActive ? 'LIVE' : isExpired ? 'EXPIRED' : 'INACTIVE'
  const statusBg    = isActive ? 'rgba(22,163,74,0.1)' : isExpired ? 'rgba(107,114,128,0.1)' : 'rgba(239,68,68,0.1)'

  return (
    <div style={{ background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)', borderRadius: 14, overflow: 'hidden' }}>
      {/* card header */}
      <button
        onClick={handleExpand}
        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', textAlign: 'left' }}
      >
        {/* indicator */}
        <div style={{ flexShrink: 0, width: 10, height: 10, borderRadius: '50%', background: statusColor, marginTop: 6, boxShadow: isActive ? `0 0 0 3px rgba(22,163,74,0.2)` : 'none' }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--c-text)' }}>{form.organization_name}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: statusBg, color: statusColor, borderRadius: 9999, padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em' }}>
              {isActive && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse-live 1.5s infinite' }} />}
              {statusLabel}
            </span>
            {form.custom_branding_enabled && (
              <span style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 9999, padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: 700 }}>Custom Names</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--c-text-muted)' }}>
              <IconUsers /> {total} entries
            </span>
            <span style={{ fontSize: '0.78rem', color: isExpired ? '#9ca3af' : 'var(--c-text-muted)' }}>
              {isExpired ? `Expired ${fmtDate(form.expires_at)}` : `Closes ${fmtDate(form.expires_at)}`}
            </span>
            {!isExpired && form.seconds_remaining != null && (
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: form.seconds_remaining < 3600 ? '#dc2626' : '#15803d', fontFamily: 'monospace' }}>
                ⏱ {fmtCountdown(form.seconds_remaining)}
              </span>
            )}
          </div>
        </div>

        <div style={{ flexShrink: 0, color: 'var(--c-text-muted)', marginTop: 2 }}><IconChevron open={open} /></div>
      </button>

      {/* expanded */}
      {open && (
        <div style={{ borderTop: '1px solid var(--c-border)', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* shareable link */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--c-text-muted)', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>SHAREABLE LINK</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200, background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: 8, padding: '0.6rem 0.85rem', fontSize: '0.78rem', color: 'var(--c-text-muted)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {url}
              </div>
              <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.6rem 1rem', background: copied ? '#15803d' : 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: 8, color: copied ? '#fff' : 'var(--c-text)', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                <IconCopy /> {copied ? 'Copied!' : 'Copy'}
              </button>
              <Link to={`/live-form/${form.slug}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.6rem 1rem', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: 8, color: 'var(--c-text)', fontWeight: 600, textDecoration: 'none', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                <IconExternalLink /> Open
              </Link>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`📋 *${form.organization_name} — Group Wear*\n\nRegister your size 👇\n${url}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.6rem 1rem', background: '#25D366', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, textDecoration: 'none', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
              >
                <IconWhatsApp /> WhatsApp
              </a>
            </div>
          </div>

          {/* live stats */}
          {loadingStats ? (
            <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 24, height: 24, border: '2px solid var(--c-border)', borderTopColor: 'var(--c-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : stats && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--c-text-muted)', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>LIVE STATS</div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {[
                  { label: 'Total Entries',    value: stats.total_submissions },
                  { label: 'Views',            value: stats.view_count },
                  { label: 'Last Hour',        value: stats.social_proof?.submissions_last_hour ?? 0 },
                  { label: 'Slug',             value: `/${stats.slug}`, mono: true },
                ].map(({ label, value, mono }) => (
                  <div key={label} style={{ background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '0.75rem 1rem', minWidth: 100 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--c-text-muted)', fontWeight: 600, marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: mono ? '0.75rem' : '1.5rem', fontWeight: 800, color: 'var(--c-primary)', fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* admin tools */}
          {isAdmin && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--c-text-muted)', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>ADMIN TOOLS</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { label: 'PDF',   ext: 'pdf',  color: '#dc2626', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
                  { label: 'Word',  ext: 'word', color: '#2563eb', bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.25)' },
                  { label: 'Excel', ext: 'excel',color: '#15803d', bg: 'rgba(22,163,74,0.08)', border: 'rgba(22,163,74,0.25)' },
                ].map(({ label, ext, color, bg, border }) => (
                  <button
                    key={ext}
                    onClick={() => onDownload(form, ext)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: bg, border: `1px solid ${border}`, borderRadius: 8, color, fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    <IconDownload /> {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* toggle active */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '0.85rem 1rem' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--c-text)', fontSize: '0.875rem' }}>Form Active</div>
              <div style={{ color: 'var(--c-text-muted)', fontSize: '0.75rem' }}>Toggle to open/close this form manually</div>
            </div>
            <button
              onClick={handleToggle}
              disabled={toggling}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', background: form.is_active ? 'rgba(22,163,74,0.1)' : 'rgba(107,114,128,0.1)', border: `1px solid ${form.is_active ? 'rgba(22,163,74,0.3)' : 'var(--c-border)'}`, borderRadius: 8, color: form.is_active ? '#15803d' : 'var(--c-text-muted)', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
            >
              <IconToggle on={form.is_active} />
              {toggling ? '…' : form.is_active ? 'Active' : 'Inactive'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── main page ─────────────────────────────────────────────── */
export default function LiveFormOrganizerDashboard() {
  const { isAuthenticated, loading: authLoading, user } = useAuth()
  const navigate = useNavigate()

  const [forms,      setForms]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [created,    setCreated]    = useState(null) // link modal after creation
  const [filter,     setFilter]     = useState('all')

  const isAdmin = user?.is_staff

  /* auth guard */
  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/login?next=/live-form-organiser', { replace: true })
  }, [isAuthenticated, authLoading, navigate])

  const fetchForms = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await api.get('/live_forms/api/forms/')
      setForms(Array.isArray(res) ? res : (res.results || []))
    } catch (e) { setError(e.message || 'Failed to load forms') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { if (isAuthenticated) fetchForms() }, [isAuthenticated, fetchForms])

  /* create */
  const handleCreate = (newForm) => {
    setForms(prev => [newForm, ...prev])
    setShowCreate(false)
    setCreated(newForm)
  }

  /* toggle */
  const handleToggle = async (form, nextActive) => {
    try {
      const updated = await api.patch(`/live_forms/api/forms/${form.slug}/`, { is_active: nextActive })
      setForms(prev => prev.map(f => f.slug === form.slug ? { ...f, ...updated } : f))
    } catch { /* silent */ }
  }

  /* download */
  const handleDownload = async (form, type) => {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
    const token    = localStorage.getItem('mw_auth_token')
    const extMap   = { pdf: 'pdf', word: 'docx', excel: 'xlsx' }
    try {
      const res = await fetch(`${BASE_URL}/live_forms/api/forms/${form.slug}/download_${type}/`, {
        headers: token ? { Authorization: `Token ${token}` } : {},
      })
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `${form.slug}_entries.${extMap[type]}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) { alert(e.message) }
  }

  /* stats */
  const total   = forms.length
  const live    = forms.filter(f => f.is_active && !f.is_expired).length
  const expired = forms.filter(f => f.is_expired).length
  const totalEntries = forms.reduce((acc, f) => acc + (f.total_submissions || 0), 0)

  /* filter */
  const filtered = filter === 'all'     ? forms
    : filter === 'live'    ? forms.filter(f => f.is_active && !f.is_expired)
    : filter === 'expired' ? forms.filter(f => f.is_expired)
    : filter === 'inactive'? forms.filter(f => !f.is_active && !f.is_expired)
    : forms

  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 48, height: 48, border: '3px solid var(--c-border)', borderTopColor: 'var(--c-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <div className="page-transition" style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-live { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

      {/* modals */}
      {showCreate && <CreateFormModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
      {created    && <LinkCreatedModal form={created} onClose={() => setCreated(null)} />}

      {/* hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--c-primary) 0%, #065f46 60%, #047857 100%)', padding: '3rem 1.5rem 4rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: 9999, padding: '0.35rem 1rem', marginBottom: '1.25rem' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-live 1.5s infinite' }} />
            <span style={{ color: '#bbf7d0', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' }}>LIVE FORMS — ORGANISER</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.75rem)', fontWeight: 900, color: '#fff', marginBottom: '0.5rem', fontFamily: 'var(--font-display, inherit)' }}>
            Live Form Dashboard
          </h1>
          <p style={{ color: '#bbf7d0', fontSize: '1rem', marginBottom: '2rem' }}>Create real-time group wear registration forms — no payment required.</p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <StatPill label="Total Forms"    value={total}        />
            <StatPill label="Live Now"       value={live}         color="#4ade80" />
            <StatPill label="Expired"        value={expired}      color="rgba(255,255,255,0.5)" />
            <StatPill label="Total Entries"  value={totalEntries} color="#fde68a" />
            <button
              onClick={() => setShowCreate(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.5rem', background: '#fff', color: 'var(--c-primary)', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem', marginLeft: 'auto' }}
            >
              <IconPlus /> New Form
            </button>
          </div>
        </div>
      </div>

      {/* content */}
      <div style={{ maxWidth: 900, margin: '-2rem auto 0', padding: '0 1rem 4rem', position: 'relative', zIndex: 1 }}>

        {/* toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { key: 'all',      label: `All (${total})` },
              { key: 'live',     label: `Live (${live})` },
              { key: 'expired',  label: `Expired (${expired})` },
              { key: 'inactive', label: `Inactive (${forms.filter(f => !f.is_active && !f.is_expired).length})` },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '0.4rem 0.9rem', borderRadius: 9999, border: '1px solid',
                  fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                  background: filter === f.key ? 'var(--c-primary)' : 'var(--c-bg-warm)',
                  color: filter === f.key ? '#fff' : 'var(--c-text-muted)',
                  borderColor: filter === f.key ? 'var(--c-primary)' : 'var(--c-border)',
                  transition: 'all 0.15s',
                }}
              >{f.label}</button>
            ))}
          </div>
          <button onClick={fetchForms} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)', color: 'var(--c-text-muted)', padding: '0.5rem 0.9rem', borderRadius: 9, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
            <IconRefresh /> Refresh
          </button>
        </div>

        {/* non-admin notice */}
        {!isAdmin && (
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '0.85rem 1.1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#d97706' }}>
            ℹ️ PDF / Word / Excel downloads are available to staff accounts only.
          </div>
        )}

        {/* states */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3].map(i => <div key={i} style={{ height: 90, background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)', borderRadius: 14, animation: 'pulse 1.5s ease-in-out infinite' }} />)}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>
            <button onClick={fetchForms} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'var(--c-primary)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
              <IconRefresh /> Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--c-text-muted)' }}>
            {total === 0 ? (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                <p style={{ fontWeight: 700, color: 'var(--c-text)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Forms Yet</p>
                <p style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>Create your first live registration form to get started.</p>
                <button onClick={() => setShowCreate(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'var(--c-primary)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                  <IconPlus /> Create Form
                </button>
              </>
            ) : (
              <>
                <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>No forms match this filter.</p>
                <button onClick={() => setFilter('all')} style={{ color: 'var(--c-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Show all</button>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map(form => (
              <FormCard
                key={form.slug}
                form={form}
                isAdmin={!!isAdmin}
                onToggle={handleToggle}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}

        {/* guide */}
        {!loading && !error && total > 0 && (
          <div style={{ marginTop: '2rem', background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)', borderRadius: 14, padding: '1.5rem' }}>
            <div style={{ fontWeight: 700, color: 'var(--c-text)', marginBottom: '1rem' }}>📖 How Live Forms Work</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {[
                { n: '1', title: 'Create Form',      desc: 'Set name, closing time, optional entry cap and custom branding.' },
                { n: '2', title: 'Share the Link',   desc: 'Send via WhatsApp or copy to share in any channel.' },
                { n: '3', title: 'Watch Live',       desc: 'The feed updates in real-time as participants submit their sizes.' },
                { n: '4', title: 'Export Reports',   desc: 'Download PDF, Word, or Excel with all entries when ready.' },
              ].map(({ n, title, desc }) => (
                <div key={n} style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--c-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>{n}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--c-text)', fontSize: '0.875rem' }}>{title}</div>
                    <div style={{ color: 'var(--c-text-muted)', fontSize: '0.78rem', lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
