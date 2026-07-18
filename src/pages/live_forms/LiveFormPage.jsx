import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../services/api'

/* ─── constants ─────────────────────────────────────────────── */
const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL']
const POLL_INTERVAL = 4000 // 4 s

/* ─── helpers ───────────────────────────────────────────────── */
function initials(name = '') {
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}
function fmtCountdown(s) {
  if (s <= 0) return '00:00:00'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h, m, sec].map(n => String(n).padStart(2, '0')).join(':')
}
function fmtRelative(str) {
  if (!str) return ''
  const diff = (Date.now() - new Date(str).getTime()) / 1000
  if (diff < 60)   return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(str).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}
const AVATAR_COLORS = [
  '#064E3B','#1e3a5f','#7c3aed','#dc2626','#d97706','#0369a1','#065f46'
]
function avatarColor(name = '') {
  const code = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}

/* ─── icons ─────────────────────────────────────────────────── */
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
)
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 48, height: 48 }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
/* ─── size button ───────────────────────────────────────────── */
function SizeBtn({ size, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(size)}
      style={{
        padding: '0.5rem 0.85rem',
        borderRadius: 8,
        border: selected ? '2px solid var(--c-primary)' : '1.5px solid var(--c-border)',
        background: selected ? 'var(--c-primary)' : 'var(--c-bg)',
        color: selected ? '#fff' : 'var(--c-text)',
        fontWeight: 700,
        fontSize: '0.85rem',
        cursor: 'pointer',
        transition: 'all 0.15s',
        letterSpacing: '0.03em',
      }}
    >
      {size}
    </button>
  )
}

/* ─── live entry card ───────────────────────────────────────── */
function EntryCard({ entry, isNew, showCustomName }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        background: isNew ? 'rgba(6,78,59,0.06)' : 'transparent',
        borderRadius: 10,
        borderLeft: isNew ? '3px solid var(--c-primary)' : '3px solid transparent',
        animation: isNew ? 'slideInEntry 0.4s ease-out' : 'none',
        transition: 'background 0.5s',
      }}
    >
      {/* avatar */}
      <div style={{
        flexShrink: 0, width: 36, height: 36, borderRadius: '50%',
        background: avatarColor(entry.full_name),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 700, fontSize: '0.75rem',
      }}>
        {initials(entry.full_name)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, color: 'var(--c-text)', fontSize: '0.875rem' }}>
            {entry.full_name}
          </span>
          {showCustomName && entry.custom_name && (
            <span style={{ fontSize: '0.7rem', color: 'var(--c-text-muted)', fontStyle: 'italic' }}>
              &quot;{entry.custom_name}&quot;
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)' }}>
          {fmtRelative(entry.created_at)}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem', flexShrink: 0 }}>
        <span style={{
          background: 'var(--c-bg)', border: '1px solid var(--c-border)',
          borderRadius: 6, padding: '0.2rem 0.5rem',
          fontWeight: 700, fontSize: '0.75rem', color: 'var(--c-primary)',
        }}>
          {entry.size}
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--c-text-muted)', fontFamily: 'monospace' }}>
          #{String(entry.serial_number).padStart(3, '0')}
        </span>
      </div>
    </div>
  )
}

/* ─── size distribution ─────────────────────────────────────── */
function SizeDistribution({ entries }) {
  if (!entries.length) return null
  const counts = SIZES.reduce((acc, s) => {
    acc[s] = entries.filter(e => e.size === s).length
    return acc
  }, {})
  const max = Math.max(...Object.values(counts), 1)
  return (
    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'flex-end', height: 40 }}>
      {SIZES.map(s => (
        <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', flex: 1 }}>
          <div style={{
            width: '100%', borderRadius: '3px 3px 0 0',
            background: counts[s] ? 'var(--c-primary)' : 'var(--c-border)',
            height: counts[s] ? `${Math.max(4, (counts[s] / max) * 30)}px` : 4,
            transition: 'height 0.3s ease',
            opacity: counts[s] ? 1 : 0.3,
          }} />
          <span style={{ fontSize: '0.6rem', color: 'var(--c-text-muted)', fontWeight: 600 }}>{s}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── main page ─────────────────────────────────────────────── */
export default function LiveFormPage() {
  const { slug } = useParams()

  /* form state */
  const [form,       setForm]       = useState(null)
  const [loadErr,    setLoadErr]    = useState('')
  const [loadingForm, setLoadingForm] = useState(true)

  /* countdown */
  const [secsLeft,   setSecsLeft]   = useState(0)
  const tickRef = useRef(null)

  /* live feed */
  const [entries,    setEntries]    = useState([])
  const [newIds,     setNewIds]     = useState(new Set())
  const lastTimestamp = useRef(null)
  const pollRef = useRef(null)

  /* submission form */
  const [fullName,   setFullName]   = useState('')
  const [size,       setSize]       = useState('')
  const [customName, setCustomName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitErr,  setSubmitErr]  = useState('')
  const [submitted,  setSubmitted]  = useState(null) // entry obj on success

  /* ── load form ── */
  useEffect(() => {
    document.title = 'Live Form'
    api.get(`/live_forms/api/forms/${slug}/`).then(data => {
      setForm(data)
      setSecsLeft(data.seconds_remaining || 0)
      document.title = `${data.organization_name} — Live Form`
      setLoadingForm(false)
    }).catch(e => {
      setLoadErr(e.message || 'Form not found')
      setLoadingForm(false)
    })
    return () => { clearInterval(tickRef.current); clearInterval(pollRef.current) }
  }, [slug])

  /* ── countdown tick ── */
  useEffect(() => {
    if (!form) return
    clearInterval(tickRef.current)
    tickRef.current = setInterval(() => {
      setSecsLeft(s => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(tickRef.current)
  }, [form])

  /* ── live feed ── */
  const fetchFeed = useCallback(async () => {
    const since = lastTimestamp.current
    const qs    = since ? `?since=${encodeURIComponent(since)}` : ''
    try {
      const data = await api.get(`/live_forms/api/forms/${slug}/live_feed/${qs}`)
      if (data.form) {
        setForm(f => ({ ...f, ...data.form }))
        setSecsLeft(data.form.seconds_remaining || 0)
      }
      if (data.entries?.length) {
        if (!since) {
          setEntries(data.entries)
          if (data.entries.length) {
            lastTimestamp.current = data.entries[data.entries.length - 1].created_at
          }
        } else {
          const ids = new Set(data.entries.map(e => e.id))
          setNewIds(ids)
          setEntries(prev => [...data.entries, ...prev])
          lastTimestamp.current = data.entries[0].created_at
          setTimeout(() => setNewIds(new Set()), 3000)
        }
      }
    } catch { /* silent */ }
  }, [slug])

  useEffect(() => {
    if (!form) return
    fetchFeed()
    pollRef.current = setInterval(fetchFeed, POLL_INTERVAL)
    return () => clearInterval(pollRef.current)
  }, [form, fetchFeed])

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitErr('')
    if (!fullName.trim()) { setSubmitErr('Please enter your full name.'); return }
    if (!size)             { setSubmitErr('Please select your size.'); return }
    if (form?.custom_branding_enabled && !customName.trim()) {
      setSubmitErr('Please enter your custom name for branding.'); return
    }
    setSubmitting(true)
    try {
      const body = { full_name: fullName.trim(), size }
      if (form?.custom_branding_enabled) body.custom_name = customName.trim()
      const entry = await api.post(`/live_forms/api/forms/${slug}/submit/`, body)
      setSubmitted(entry)
    } catch (e) {
      setSubmitErr(e.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setSubmitted(null)
    setFullName('')
    setSize('')
    setCustomName('')
    setSubmitErr('')
  }

  /* ── loading ── */
  if (loadingForm) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid var(--c-border)', borderTopColor: 'var(--c-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--c-text-muted)', fontWeight: 500 }}>Loading form…</p>
      </div>
    </div>
  )

  /* ── error ── */
  if (loadErr) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-bg)', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 48, marginBottom: '1rem' }}>😕</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: '0.5rem' }}>Form Not Found</h1>
        <p style={{ color: 'var(--c-text-muted)' }}>{loadErr}</p>
      </div>
    </div>
  )

  const isOpen    = form?.is_open
  const isExpired = form?.is_expired || secsLeft <= 0
  const isClosed  = !isOpen

  const totalEntries = form?.total_submissions ?? entries.length
  const recentSubmitters = form?.social_proof?.recent_submitters || []

  /* ── countdown display ── */
  const countdownStr  = fmtCountdown(secsLeft)
  const [hh, mm, ss]  = countdownStr.split(':')
  return (
    <div className="page-transition" style={{ minHeight: '100vh', background: 'var(--c-bg)' }}>
      <style>{`
        @keyframes slideInEntry {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-live {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── HERO ── */}
      <div style={{
        background: isClosed
          ? 'linear-gradient(135deg, #1f2937 0%, #374151 100%)'
          : `linear-gradient(135deg, var(--c-primary) 0%, #065f46 100%)`,
        padding: 'clamp(2rem, 5vw, 4rem) 1.5rem',
        textAlign: 'center',
      }}>
        {/* status + live badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {isOpen ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 9999, padding: '0.35rem 0.9rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-live 1.5s ease-in-out infinite' }} />
              <span style={{ color: '#bbf7d0', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em' }}>LIVE — ACCEPTING ENTRIES</span>
            </div>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(239,68,68,0.2)', borderRadius: 9999, padding: '0.35rem 0.9rem' }}>
              <span style={{ color: '#fca5a5', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                {isExpired ? '⏰ FORM CLOSED — TIME EXPIRED' : '🔒 FORM CLOSED'}
              </span>
            </div>
          )}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.1)', borderRadius: 9999, padding: '0.35rem 0.9rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', gap: '0.3rem', display: 'flex', alignItems: 'center' }}>
              <IconUsers /> <strong style={{ color: '#fff' }}>{totalEntries}</strong> registered
            </span>
          </div>
        </div>

        <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', fontWeight: 900, color: '#fff', marginBottom: '0.35rem', fontFamily: 'var(--font-display, inherit)', letterSpacing: '-0.02em' }}>
          {form?.organization_name}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginBottom: '2rem' }}>
          Group wear registration — select your size and submit below
        </p>

        {/* countdown */}
        {!isClosed && (
          <div style={{ display: 'inline-block' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
              <IconClock /> TIME REMAINING
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
              {[['HRS', hh], ['MIN', mm], ['SEC', ss]].map(([label, val]) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{
                    background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '0.5rem 0.85rem',
                    fontFamily: 'monospace', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: 800,
                    color: secsLeft < 300 ? '#fca5a5' : '#fff', minWidth: 64,
                    border: `1px solid ${secsLeft < 300 ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  }}>
                    {val}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', marginTop: 3, fontWeight: 700, letterSpacing: '0.1em' }}>{label}</div>
                </div>
              ))}
            </div>
            {secsLeft < 300 && secsLeft > 0 && (
              <p style={{ color: '#fca5a5', fontSize: '0.8rem', marginTop: '0.75rem', fontWeight: 600 }}>
                ⚡ Closing soon — submit now!
              </p>
            )}
          </div>
        )}

        {/* recent submitters */}
        {recentSubmitters.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex' }}>
              {recentSubmitters.slice(0, 5).map((s, i) => (
                <div key={i} style={{
                  width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)',
                  background: avatarColor(s.name || ''), marginLeft: i > 0 ? -10 : 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '0.65rem', zIndex: 5 - i,
                  position: 'relative',
                }}>
                  {initials(s.name || '?')}
                </div>
              ))}
            </div>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem' }}>
              <strong style={{ color: '#fff' }}>{recentSubmitters[0]?.name?.split(' ')[0]}</strong>
              {recentSubmitters.length > 1 ? ` and ${totalEntries - 1} others` : ''} already registered
            </span>
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(1rem, 3vw, 2rem)' }}>
        {isClosed ? (
          /* ── CLOSED STATE ── */
          <div style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: 480, margin: '0 auto' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(107,114,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#9ca3af' }}>
              <IconLock />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--c-text)', marginBottom: '0.75rem' }}>
              {isExpired ? 'Registration Closed' : 'Form Not Available'}
            </h2>
            <p style={{ color: 'var(--c-text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
              {isExpired
                ? `The registration window for ${form?.organization_name} has ended. Thank you to everyone who submitted their details.`
                : 'This form is currently unavailable. Please contact the organiser for assistance.'}
            </p>
            <div style={{ background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)', borderRadius: 12, padding: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--c-text-muted)', marginBottom: '0.5rem' }}>FINAL COUNT</div>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--c-primary)' }}>{totalEntries}</div>
              <div style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem' }}>total registrations</div>
            </div>
          </div>
        ) : submitted ? (
          /* ── SUCCESS STATE ── */
          <div style={{ maxWidth: 520, margin: '2rem auto' }}>
            <div style={{ background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <div style={{ background: 'linear-gradient(135deg, var(--c-primary), #065f46)', padding: '2rem', textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#4ade80' }}>
                  <IconCheck />
                </div>
                <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.25rem' }}>You&apos;re registered!</h2>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>{form?.organization_name}</p>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'var(--c-bg)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--c-text-muted)', letterSpacing: '0.06em', marginBottom: 4 }}>ENTRY NUMBER</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--c-primary)', fontFamily: 'monospace' }}>#{String(submitted.serial_number).padStart(3, '0')}</div>
                  </div>
                  <div style={{ background: 'var(--c-bg)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--c-text-muted)', letterSpacing: '0.06em', marginBottom: 4 }}>SIZE SELECTED</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--c-primary)' }}>{submitted.size}</div>
                  </div>
                </div>
                <div style={{ background: 'rgba(6,78,59,0.06)', border: '1px solid rgba(6,78,59,0.15)', borderRadius: 10, padding: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--c-text)' }}>{submitted.full_name}</div>
                  {submitted.custom_name && <div style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem' }}>Custom name: {submitted.custom_name}</div>}
                </div>
                <button onClick={handleReset} style={{ width: '100%', padding: '0.75rem', background: 'var(--c-primary)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                  Submit Another Entry
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── OPEN STATE: 2-col layout ── */
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1.5rem', alignItems: 'start' }}>

            {/* LEFT: form */}
            <div style={{ background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--c-border)' }}>
                <h2 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--c-text)', margin: 0 }}>Register Now</h2>
                <p style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Fill in your details below to join the group order</p>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* full name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                    FULL NAME <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Kwame Mensah"
                    maxLength={255}
                    style={{
                      width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
                      border: '1.5px solid var(--c-border)', background: 'var(--c-bg)',
                      color: 'var(--c-text)', fontSize: '0.95rem', outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--c-primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--c-border)'}
                  />
                </div>

                {/* custom name */}
                {form?.custom_branding_enabled && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                      CUSTOM NAME (BRANDING) <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      placeholder="Name to print/embroider on your item"
                      maxLength={255}
                      style={{
                        width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
                        border: '1.5px solid rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.04)',
                        color: 'var(--c-text)', fontSize: '0.95rem', outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={e => e.target.style.borderColor = '#d97706'}
                      onBlur={e => e.target.style.borderColor = 'rgba(245,158,11,0.4)'}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#d97706', marginTop: '0.35rem' }}>
                      This will be printed or embroidered on your item.
                    </p>
                  </div>
                )}

                {/* size selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                    SIZE <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {SIZES.map(s => (
                      <SizeBtn key={s} size={s} selected={size === s} onClick={setSize} />
                    ))}
                  </div>
                  {size && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)', marginTop: '0.4rem' }}>
                      Selected: <strong>{size}</strong> — confirm this matches your measurements.
                    </p>
                  )}
                </div>

                {/* error */}
                {submitErr && (
                  <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem' }}>
                    {submitErr}
                  </div>
                )}

                {/* submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%', padding: '0.9rem', background: submitting ? 'var(--c-text-muted)' : 'var(--c-primary)',
                    color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800,
                    fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer',
                    letterSpacing: '0.02em', transition: 'background 0.2s',
                  }}
                >
                  {submitting ? 'Submitting…' : 'Register My Size'}
                </button>

                <p style={{ fontSize: '0.72rem', color: 'var(--c-text-muted)', textAlign: 'center' }}>
                  Entries stored securely. Your name will appear in the live feed below.
                </p>
              </form>
            </div>

            {/* RIGHT: live feed */}
            <div style={{ background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)', borderRadius: 16, overflow: 'hidden', position: 'sticky', top: '6rem' }}>
              {/* header */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse-live 1.5s infinite' }} />
                  <span style={{ fontWeight: 800, color: 'var(--c-text)', fontSize: '0.95rem' }}>Live Feed</span>
                </div>
                <span style={{ background: 'var(--c-bg)', border: '1px solid var(--c-border)', borderRadius: 9999, padding: '0.2rem 0.7rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--c-primary)' }}>
                  {totalEntries} entries
                </span>
              </div>

              {/* size distribution */}
              {entries.length > 0 && (
                <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--c-text-muted)', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>SIZE DISTRIBUTION</div>
                  <SizeDistribution entries={entries} />
                </div>
              )}

              {/* entries list */}
              <div style={{ maxHeight: 420, overflowY: 'auto', padding: '0.5rem 0.75rem' }}>
                {entries.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--c-text-muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👀</div>
                    <p style={{ fontSize: '0.875rem' }}>No entries yet. Be the first!</p>
                  </div>
                ) : entries.slice(0, 50).map(entry => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    isNew={newIds.has(entry.id)}
                    showCustomName={form?.custom_branding_enabled}
                  />
                ))}
              </div>

              {/* footer */}
              <div style={{ padding: '0.75rem 1.25rem', background: 'var(--c-bg)', borderTop: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse-live 1.5s infinite' }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--c-text-muted)' }}>Refreshing every {POLL_INTERVAL / 1000}s</span>
              </div>
            </div>
          </div>
        )}

        {/* closed but still show feed */}
        {isClosed && entries.length > 0 && (
          <div style={{ maxWidth: 520, margin: '2rem auto', background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--c-border)', fontWeight: 700, color: 'var(--c-text)' }}>All Entries</div>
            <div style={{ maxHeight: 360, overflowY: 'auto', padding: '0.5rem 0.75rem' }}>
              {entries.slice(0, 50).map(entry => (
                <EntryCard key={entry.id} entry={entry} isNew={false} showCustomName={form?.custom_branding_enabled} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
