import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useScrollRevealGroup, useScrollReveal } from '../../hooks/useScrollAnimation'
import { api } from '../../services/api'
import { APP, CONTACT } from '../../config/constants'

// ── Icons ─────────────────────────────────────────────────────────────────────
const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
)
const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
)
const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)
const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
)
const ImageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const XIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
)

// ── Clipboard copy helper ─────────────────────────────────────────────────────
function useCopy(timeout = 2000) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), timeout)
    } catch {
      // Fallback
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), timeout)
    }
  }, [timeout])
  return { copied, copy }
}

// ── Alert component ───────────────────────────────────────────────────────────
function Alert({ type, message, onClose }) {
  if (!message) return null
  const isError = type === 'error'
  return (
    <div className="flex items-start gap-3 p-4 text-sm"
      style={{
        background: isError ? 'rgba(239,68,68,0.06)' : 'rgba(6,78,59,0.06)',
        border: `1px solid ${isError ? 'rgba(239,68,68,0.2)' : 'rgba(6,78,59,0.2)'}`,
        color: isError ? '#DC2626' : 'var(--c-primary)',
      }}>
      <AlertIcon />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-60 hover:opacity-100 flex-shrink-0">
          <XIcon />
        </button>
      )}
    </div>
  )
}

// ── Step card (how it works) ──────────────────────────────────────────────────
function StepCard({ number, title, desc, delay }) {
  return (
    <div className={`reveal delay-${delay} relative`}>
      <div className="flex flex-col h-full p-8"
        style={{ background: 'white', border: '1px solid rgba(6,78,59,0.08)' }}>
        <div
          className="w-10 h-10 flex items-center justify-center font-display text-lg font-medium text-white mb-5 flex-shrink-0"
          style={{ background: 'var(--c-primary)' }}
        >
          {number}
        </div>
        <h3 className="font-display text-xl font-medium mb-3" style={{ color: 'var(--c-primary)' }}>{title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>{desc}</p>
      </div>
      {/* Connector line (hide on last) */}
      <div className="hidden lg:block absolute top-12 left-full w-8 h-0.5 -translate-x-1"
        style={{ background: 'var(--c-accent)', opacity: 0.4, zIndex: 1 }} />
    </div>
  )
}

// ── Benefit card ──────────────────────────────────────────────────────────────
function BenefitCard({ icon, title, desc, delay }) {
  return (
    <div className={`reveal delay-${delay} value-card`}>
      <div className="mb-4" style={{ color: 'var(--c-accent)' }}>{icon}</div>
      <h3 className="font-display text-xl font-medium mb-2" style={{ color: 'var(--c-primary)' }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>{desc}</p>
    </div>
  )
}

// ── Promotional Media Card ────────────────────────────────────────────────────
function MediaCard({ item }) {
  const { copy: copyText, copied: textCopied } = useCopy()
  const isVideo = item.media_type === 'video'

  return (
    <div className="reveal group"
      style={{ background: 'white', border: '1px solid #F3F4F6', overflow: 'hidden' }}>

      {/* Media preview */}
      <div className="relative aspect-video overflow-hidden"
        style={{ background: 'var(--c-bg-warm)' }}>
        {item.media_url ? (
          isVideo ? (
            <video src={item.media_url} className="w-full h-full object-cover"
              poster="" preload="metadata" />
          ) : (
            <img src={item.media_url} alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy" />
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ color: 'var(--c-text-light)' }}>
            {isVideo ? <PlayIcon /> : <ImageIcon />}
            <span className="text-xs">No preview</span>
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold tracking-widest uppercase"
          style={{
            background: isVideo ? 'rgba(109,40,217,0.85)' : 'rgba(245,158,11,0.9)',
            color: 'white',
          }}>
          {isVideo ? '▶ Video' : '✦ Flyer'}
        </div>

        {/* Play overlay for video */}
        {isVideo && item.media_url && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(6,78,59,0.5)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white">
              <PlayIcon />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h4 className="font-display text-lg font-medium mb-2" style={{ color: 'var(--c-primary)' }}>
          {item.title}
        </h4>
        {item.marketing_text && (
          <p className="text-xs leading-relaxed mb-4 line-clamp-3" style={{ color: 'var(--c-text-muted)' }}>
            {item.marketing_text}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {item.media_url && (
            <a
              href={item.media_url}
              download={item.title}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium tracking-wide transition-all duration-200 flex-1 justify-center"
              style={{ background: 'var(--c-bg)', border: '1px solid #E5E7EB', color: 'var(--c-text)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--c-primary)'; e.currentTarget.style.color = 'var(--c-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = 'var(--c-text)' }}
            >
              <DownloadIcon /> {isVideo ? 'Save' : 'Download'}
            </a>
          )}
          {item.marketing_text && (
            <button
              onClick={() => copyText(item.marketing_text)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium tracking-wide transition-all duration-200 flex-1 justify-center"
              style={{
                background: textCopied ? 'rgba(6,78,59,0.06)' : 'var(--c-bg)',
                border: `1px solid ${textCopied ? 'var(--c-primary)' : '#E5E7EB'}`,
                color: textCopied ? 'var(--c-primary)' : 'var(--c-text)',
              }}
            >
              {textCopied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy Text</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function Referrals() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()

  const [pageState, setPageState]     = useState('loading')   // loading | guest | no_profile | dashboard
  const [profile, setProfile]         = useState(null)
  const [sharePayload, setSharePayload] = useState(null)
  const [media, setMedia]             = useState([])
  const [fetchError, setFetchError]   = useState('')

  useEffect(() => { document.title = `Referral Program — ${APP.name}` }, [])

  // ── Load profile + share data ──────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      setPageState('guest')
      return
    }

    let cancelled = false
    const load = async () => {
      try {
        const prof = await api.get('/referrals/profiles/me/')
        if (cancelled) return
        setProfile(prof)

        // Load share payload and media in parallel
        const [payload, mediaList] = await Promise.all([
          api.get('/referrals/share/generate/').catch(() => null),
          api.get('/referrals/media/').catch(() => ({ results: [] })),
        ])
        if (cancelled) return
        setSharePayload(payload)
        setMedia(mediaList?.results || mediaList || [])
        setPageState('dashboard')
      } catch (err) {
        if (cancelled) return
        if (err.status === 404) {
          setPageState('no_profile')
        } else {
          setFetchError('Something went wrong. Please refresh the page.')
          setPageState('no_profile')
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [isAuthenticated, authLoading])

  const onProfileCreated = async (newProfile) => {
    setProfile(newProfile)
    try {
      const [payload, mediaList] = await Promise.all([
        api.get('/referrals/share/generate/').catch(() => null),
        api.get('/referrals/media/').catch(() => ({ results: [] })),
      ])
      setSharePayload(payload)
      setMedia(mediaList?.results || mediaList || [])
    } catch { /* not critical */ }
    setPageState('dashboard')
  }

  const onProfileUpdated = (updated) => setProfile(updated)

  // ── Render ─────────────────────────────────────────────────────────────────
  if (pageState === 'loading') return <LoadingState />
  if (pageState === 'guest')   return <GuestView />
  if (pageState === 'dashboard') return (
    <Dashboard
      profile={profile}
      sharePayload={sharePayload}
      media={media}
      isAdmin={!!user?.is_staff}
      onProfileUpdated={onProfileUpdated}
      onMediaUpdated={setMedia}
    />
  )
  // no_profile
  return (
    <MarketingView
      isAuthenticated={isAuthenticated}
      user={user}
      error={fetchError}
      onCreated={onProfileCreated}
    />
  )
}

// ── Loading state ─────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ minHeight: '60vh', background: 'var(--c-bg)' }}>
      <div className="text-center">
        <div className="w-10 h-10 border-2 rounded-full animate-spin mx-auto mb-4"
          style={{ borderColor: 'var(--c-primary)', borderTopColor: 'transparent' }} />
        <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>Loading referral program…</p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// GUEST VIEW — not authenticated
// ═══════════════════════════════════════════════════════════════════════════════
function GuestView() {
  const sectionRef = useScrollRevealGroup()
  const heroRef    = useScrollReveal()

  return (
    <main className="page-transition flex-1" style={{ background: 'var(--c-bg)' }}>
      <MarketingHero authenticated={false} />
      <HowItWorks groupRef={sectionRef} />
      <BenefitsSection />
      {/* CTA for guests */}
      <section className="py-20 text-center" style={{ background: 'var(--c-bg-warm)' }}>
        <div className="container mx-auto max-w-2xl px-4" ref={heroRef}>
          <p className="section-eyebrow">Ready to start?</p>
          <h2 className="section-title mb-4">Join the Programme</h2>
          <p className="section-subtitle mx-auto mb-8">
            Sign in to your Material Wear account to register as a referrer and start earning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" state={{ from: { pathname: '/referrals' } }} className="btn-primary">
              <span>Sign In to Join</span><ArrowIcon />
            </Link>
            <Link to="/register" className="btn-outline" style={{ color: 'var(--c-primary)', border: '2px solid var(--c-primary)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-primary)'; e.currentTarget.style.color = 'white' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-primary)' }}>
              <span>Create Account</span>
            </Link>
          </div>
        </div>
      </section>
      <ProgramDetails />
    </main>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MARKETING VIEW — authenticated but no profile yet
// ═══════════════════════════════════════════════════════════════════════════════
function MarketingView({ user, error, onCreated }) {
  const sectionRef = useScrollRevealGroup()

  return (
    <main className="page-transition flex-1" style={{ background: 'var(--c-bg)' }}>
      <MarketingHero authenticated />
      <HowItWorks groupRef={sectionRef} />
      <BenefitsSection />
      <JoinFormSection user={user} error={error} onCreated={onCreated} />
      <ProgramDetails />
    </main>
  )
}

function AdminProfileModal({ profileId, onClose, onSaved, onDeleted }) {
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({ full_name: '', phone_number: '', bank_name: '', account_number: '', is_active: true })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [alert, setAlert] = useState({ type: '', message: '' })

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const data = await api.get(`/referrals/profiles/${profileId}/`)
        setProfile(data)
        setFormData({
          full_name: data.full_name || '',
          phone_number: data.phone_number || '',
          bank_name: data.bank_name || '',
          account_number: data.account_number || '',
          is_active: !!data.is_active,
        })
      } catch (err) {
        setAlert({ type: 'error', message: err.message || 'Could not load referrer profile.' })
      } finally {
        setLoading(false)
      }
    })()
  }, [profileId])

  const handleSave = async (ev) => {
    ev.preventDefault()
    setSaving(true)
    setAlert({ type: '', message: '' })
    try {
      const updated = await api.patch(`/referrals/profiles/${profileId}/`, formData)
      onSaved(updated)
      onClose()
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Could not update referrer profile.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this referrer profile permanently?')) return
    setDeleting(true)
    try {
      await api.delete(`/referrals/profiles/${profileId}/`)
      onDeleted(profileId)
      onClose()
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Could not delete referrer profile.' })
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="w-full max-w-2xl p-6" style={{ background: 'white' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="font-display text-2xl" style={{ color: 'var(--c-primary)' }}>Manage Referrer</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--c-text-muted)' }}>Profile retrieve, update, and delete</p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--c-text-muted)' }}><XIcon /></button>
        </div>

        {alert.message && <div className="mb-4"><Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} /></div>}

        {loading ? (
          <div className="py-10 text-center" style={{ color: 'var(--c-text-muted)' }}>Loading profile…</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">User Email</label>
                <div className="form-input" style={{ background: 'var(--c-bg-warm)' }}>{profile?.user_email || '—'}</div>
              </div>
              <div>
                <label className="form-label">Referral Code</label>
                <div className="form-input font-mono tracking-widest" style={{ background: 'var(--c-bg-warm)' }}>{profile?.referral_code || '—'}</div>
              </div>
              {[
                ['full_name', 'Full Name'],
                ['phone_number', 'Phone Number'],
                ['bank_name', 'Bank Name'],
                ['account_number', 'Account Number'],
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="form-label">{label}</label>
                  <input className="form-input" value={formData[key]} onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.value }))} />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
              className="w-full flex items-center justify-between px-4 py-3 text-sm"
              style={{ border: '1px solid #E5E7EB', background: 'var(--c-bg)' }}
            >
              <span style={{ color: 'var(--c-text)' }}>Profile Active</span>
              <span style={{ color: formData.is_active ? 'var(--c-primary)' : 'var(--c-text-muted)' }}>{formData.is_active ? 'Active' : 'Inactive'}</span>
            </button>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={handleDelete} disabled={deleting || saving} className="flex-1 px-5 py-3 text-xs font-semibold tracking-widest uppercase text-white" style={{ background: '#DC2626', opacity: deleting ? 0.7 : 1 }}>
                {deleting ? 'Deleting…' : 'Delete Profile'}
              </button>
              <button type="submit" disabled={saving || deleting} className="btn-primary flex-1 justify-center">
                <span>{saving ? 'Saving…' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function AdminMediaModal({ mediaId, onClose, onSaved, onDeleted }) {
  const isCreate = !mediaId
  const [formData, setFormData] = useState({
    title: '',
    media_type: 'flyer',
    marketing_text: '',
    is_active: true,
    order: 0,
    media_file: null,
  })
  const [loading, setLoading] = useState(!isCreate)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [alert, setAlert] = useState({ type: '', message: '' })

  useEffect(() => {
    if (isCreate) return
    ;(async () => {
      setLoading(true)
      try {
        const data = await api.get(`/referrals/media/${mediaId}/`)
        setFormData({
          title: data.title || '',
          media_type: data.media_type || 'flyer',
          marketing_text: data.marketing_text || '',
          is_active: !!data.is_active,
          order: data.order ?? 0,
          media_file: null,
        })
      } catch (err) {
        setAlert({ type: 'error', message: err.message || 'Could not load promotional media.' })
      } finally {
        setLoading(false)
      }
    })()
  }, [isCreate, mediaId])

  const buildPayload = () => {
    const fd = new FormData()
    fd.append('title', formData.title)
    fd.append('media_type', formData.media_type)
    fd.append('marketing_text', formData.marketing_text)
    fd.append('is_active', String(formData.is_active))
    fd.append('order', String(formData.order ?? 0))
    if (formData.media_file) fd.append('media_file', formData.media_file)
    return fd
  }

  const handleSave = async (ev) => {
    ev.preventDefault()
    setSaving(true)
    setAlert({ type: '', message: '' })
    try {
      const payload = buildPayload()
      const saved = isCreate
        ? await api.post('/referrals/media/', payload)
        : await api.patch(`/referrals/media/${mediaId}/`, payload)
      onSaved(saved, isCreate)
      onClose()
    } catch (err) {
      setAlert({ type: 'error', message: err.message || `Could not ${isCreate ? 'create' : 'update'} promotional media.` })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this promotional media item permanently?')) return
    setDeleting(true)
    try {
      await api.delete(`/referrals/media/${mediaId}/`)
      onDeleted(mediaId)
      onClose()
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Could not delete promotional media.' })
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="w-full max-w-2xl p-6" style={{ background: 'white' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="font-display text-2xl" style={{ color: 'var(--c-primary)' }}>{isCreate ? 'New Media' : 'Manage Media'}</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--c-text-muted)' }}>Media retrieve, create, update, and delete</p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--c-text-muted)' }}><XIcon /></button>
        </div>
        {alert.message && <div className="mb-4"><Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} /></div>}
        {loading ? (
          <div className="py-10 text-center" style={{ color: 'var(--c-text-muted)' }}>Loading media…</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Title</label>
                <input className="form-input" value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Media Type</label>
                <select className="form-input" value={formData.media_type} onChange={e => setFormData(prev => ({ ...prev, media_type: e.target.value }))}>
                  <option value="flyer">Flyer</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <label className="form-label">Display Order</label>
                <input type="number" className="form-input" value={formData.order} onChange={e => setFormData(prev => ({ ...prev, order: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Media File</label>
                <input type="file" className="form-input" onChange={e => setFormData(prev => ({ ...prev, media_file: e.target.files?.[0] || null }))} />
              </div>
            </div>
            <div>
              <label className="form-label">Marketing Text</label>
              <textarea className="form-input min-h-[140px]" value={formData.marketing_text} onChange={e => setFormData(prev => ({ ...prev, marketing_text: e.target.value }))} />
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
              className="w-full flex items-center justify-between px-4 py-3 text-sm"
              style={{ border: '1px solid #E5E7EB', background: 'var(--c-bg)' }}
            >
              <span style={{ color: 'var(--c-text)' }}>Media Active</span>
              <span style={{ color: formData.is_active ? 'var(--c-primary)' : 'var(--c-text-muted)' }}>{formData.is_active ? 'Active' : 'Inactive'}</span>
            </button>
            <div className="flex gap-3 pt-2">
              {!isCreate && (
                <button type="button" onClick={handleDelete} disabled={deleting || saving} className="flex-1 px-5 py-3 text-xs font-semibold tracking-widest uppercase text-white" style={{ background: '#DC2626', opacity: deleting ? 0.7 : 1 }}>
                  {deleting ? 'Deleting…' : 'Delete Media'}
                </button>
              )}
              <button type="submit" disabled={saving || deleting} className="btn-primary flex-1 justify-center">
                <span>{saving ? 'Saving…' : isCreate ? 'Create Media' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function AdminReferralPanel({ media, onMediaUpdated }) {
  const [profiles, setProfiles] = useState([])
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [profileModalId, setProfileModalId] = useState(null)
  const [mediaModalId, setMediaModalId] = useState(null)
  const [createMediaOpen, setCreateMediaOpen] = useState(false)

  const loadProfiles = useCallback(async () => {
    setLoadingProfiles(true)
    try {
      const data = await api.get('/referrals/profiles/')
      setProfiles(Array.isArray(data) ? data : (data?.results || []))
    } finally {
      setLoadingProfiles(false)
    }
  }, [])

  useEffect(() => { loadProfiles() }, [loadProfiles])

  const handleProfileSaved = (updated) => {
    setProfiles(prev => prev.map(item => item.id === updated.id ? { ...item, ...updated } : item))
  }
  const handleProfileDeleted = (profileId) => {
    setProfiles(prev => prev.filter(item => item.id !== profileId))
  }
  const handleMediaSaved = (saved, isCreate) => {
    onMediaUpdated(prev => (
      isCreate ? [saved, ...prev] : prev.map(item => item.id === saved.id ? { ...item, ...saved } : item)
    ))
  }
  const handleMediaDeleted = (mediaId) => {
    onMediaUpdated(prev => prev.filter(item => item.id !== mediaId))
  }

  return (
    <section className="py-16 lg:py-20" style={{ background: 'var(--c-bg)' }}>
      {profileModalId && (
        <AdminProfileModal
          profileId={profileModalId}
          onClose={() => setProfileModalId(null)}
          onSaved={handleProfileSaved}
          onDeleted={handleProfileDeleted}
        />
      )}
      {mediaModalId !== null && (
        <AdminMediaModal
          mediaId={mediaModalId}
          onClose={() => setMediaModalId(null)}
          onSaved={handleMediaSaved}
          onDeleted={handleMediaDeleted}
        />
      )}
      {createMediaOpen && (
        <AdminMediaModal
          mediaId={null}
          onClose={() => setCreateMediaOpen(false)}
          onSaved={handleMediaSaved}
          onDeleted={handleMediaDeleted}
        />
      )}

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <p className="section-eyebrow">Admin tools</p>
            <h2 className="section-title">Referral Operations</h2>
          </div>
          <button onClick={() => setCreateMediaOpen(true)} className="btn-primary">
            <span>New Media</span><ArrowIcon />
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div style={{ background: 'white', border: '1px solid #E5E7EB' }} className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-2xl" style={{ color: 'var(--c-primary)' }}>Referrer Profiles</h3>
              <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--c-text-muted)' }}>{profiles.length} total</span>
            </div>
            {loadingProfiles ? (
              <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>Loading profiles…</p>
            ) : (
              <div className="space-y-3 max-h-[440px] overflow-auto">
                {profiles.map(item => (
                  <button key={item.id} onClick={() => setProfileModalId(item.id)} className="w-full text-left p-4 transition-colors"
                    style={{ background: 'var(--c-bg)', border: '1px solid #E5E7EB' }}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--c-primary)' }}>{item.full_name}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--c-text-muted)' }}>{item.user_email} · {item.referral_code}</p>
                      </div>
                      <span className="text-xs font-semibold" style={{ color: item.is_active ? 'var(--c-primary)' : '#DC2626' }}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: 'white', border: '1px solid #E5E7EB' }} className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-2xl" style={{ color: 'var(--c-primary)' }}>Promotional Media</h3>
              <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--c-text-muted)' }}>{media.length} total</span>
            </div>
            <div className="space-y-3 max-h-[440px] overflow-auto">
              {media.map(item => (
                <button key={item.id} onClick={() => setMediaModalId(item.id)} className="w-full text-left p-4 transition-colors"
                  style={{ background: 'var(--c-bg)', border: '1px solid #E5E7EB' }}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--c-primary)' }}>{item.title}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--c-text-muted)' }}>{item.media_type} · order {item.order} · {item.created_by_name || 'system'}</p>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: item.is_active ? 'var(--c-primary)' : '#DC2626' }}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Marketing hero ────────────────────────────────────────────────────────────
function MarketingHero({ authenticated }) {
  return (
    <section className="relative overflow-hidden py-24 lg:py-36"
      style={{ background: 'var(--c-primary)' }}>
      {/* Decorative rings */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full"
          style={{ border: '1px solid rgba(245,158,11,0.08)' }} />
        <div className="absolute -top-16 -right-16 w-[400px] h-[400px] rounded-full"
          style={{ border: '1px solid rgba(245,158,11,0.06)' }} />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full"
          style={{ border: '1px solid rgba(245,158,11,0.07)' }} />
        <div className="absolute top-0 right-0 w-1/2 h-full"
          style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(245,158,11,0.05) 0%, transparent 60%)' }} />
      </div>

      <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="section-eyebrow" style={{ color: 'var(--c-accent)' }}>Referral Programme</p>
          <div className="divider-gold mb-8" />
          <h1 className="font-display font-light text-white leading-tight mb-6"
            style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', lineHeight: 1.05 }}>
            Share the luxury.<br />
            <em style={{ color: 'var(--c-accent-light)' }}>Earn the reward.</em>
          </h1>
          <p className="text-base sm:text-lg leading-relaxed mb-10 max-w-xl"
            style={{ color: 'rgba(255,255,255,0.65)' }}>
            Join Material Wear&apos;s referral programme. Share premium fashion with your network,
            get your unique code, and earn commissions — paid directly to your bank account.
          </p>

          <div className="flex flex-wrap gap-4">
            {authenticated ? (
              <a href="#join-form" className="btn-gold">
                <span>Join the Programme</span><ArrowIcon />
              </a>
            ) : (
              <Link to="/login" state={{ from: { pathname: '/referrals' } }} className="btn-gold">
                <span>Get Started</span><ArrowIcon />
              </Link>
            )}
            <a href="#how-it-works" className="btn-outline">
              <span>How It Works</span>
            </a>
          </div>

          {/* Quick stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg border-t pt-10"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            {[['5,000+', 'Active members'], ['₦0', 'Joining fee'], ['100%', 'Free to use']].map(([n, l]) => (
              <div key={l}>
                <p className="font-display text-3xl font-light" style={{ color: 'var(--c-accent-light)' }}>{n}</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── How it works ──────────────────────────────────────────────────────────────
function HowItWorks({ groupRef }) {
  return (
    <section id="how-it-works" className="py-20 lg:py-28" style={{ background: 'var(--c-bg)' }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" ref={groupRef}>
        <div className="text-center mb-14 reveal">
          <p className="section-eyebrow">Simple process</p>
          <h2 className="section-title">How it works</h2>
          <div className="divider-gold mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {[
            {
              n: '01', title: 'Register',
              desc: 'Sign up as a referrer by providing your details and bank information for payouts.',
              delay: 100,
            },
            {
              n: '02', title: 'Get Your Code',
              desc: 'Receive your unique 8-character referral code instantly — yours to keep forever.',
              delay: 200,
            },
            {
              n: '03', title: 'Share & Promote',
              desc: 'Use our ready-made flyers, videos and marketing text to spread the word on any platform.',
              delay: 300,
            },
            {
              n: '04', title: 'Earn Rewards',
              desc: 'Every successful referral earns you a commission paid directly to your bank account.',
              delay: 400,
            },
          ].map((s) => (
            <StepCard key={s.n} number={s.n} title={s.title} desc={s.desc} delay={s.delay} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Benefits ──────────────────────────────────────────────────────────────────
function BenefitsSection() {
  const ref = useScrollRevealGroup()
  return (
    <section className="py-20 lg:py-28" style={{ background: 'var(--c-bg-warm)' }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" ref={ref}>
        <div className="text-center mb-14 reveal">
          <p className="section-eyebrow">Why join us</p>
          <h2 className="section-title">Programme Benefits</h2>
          <div className="divider-gold mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <BenefitCard delay={100}
            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
            title="Commission Earnings"
            desc="Earn a commission for every customer who places an order through your referral code. The more you refer, the more you earn."
          />
          <BenefitCard delay={200}
            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
            title="Premium Marketing Assets"
            desc="Access professionally designed flyers, videos, and pre-written marketing copy ready to share on any platform."
          />
          <BenefitCard delay={300}
            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>}
            title="Direct Bank Payouts"
            desc="Commissions are paid directly to your registered bank account. No minimum threshold, no delays, no hassle."
          />
          <BenefitCard delay={400}
            icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
            title="Exclusive Community"
            desc="Join a growing community of brand ambassadors representing one of Nigeria's premier fashion houses."
          />
        </div>
      </div>
    </section>
  )
}

// ── Program details ───────────────────────────────────────────────────────────
function ProgramDetails() {
  const ref = useScrollRevealGroup()
  return (
    <section className="py-20 lg:py-28" style={{ background: 'var(--c-bg)' }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" ref={ref}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          <div>
            <p className="section-eyebrow reveal">Programme details</p>
            <h2 className="section-title mb-6 reveal delay-100">Everything you need to know</h2>
            <div className="divider-gold mb-8 reveal delay-200" />

            <div className="space-y-6">
              {[
                {
                  q: 'Who can join?',
                  a: 'Any registered Material Wear account holder can apply. You must provide valid bank details to receive payouts.',
                },
                {
                  q: 'How are commissions calculated?',
                  a: 'Commissions are calculated based on successful orders placed using your unique referral code. Rates are communicated on approval.',
                },
                {
                  q: 'When do I get paid?',
                  a: "Payouts are processed regularly and sent directly to your registered bank account. You'll be notified via email.",
                },
                {
                  q: 'Can I change my referral code?',
                  a: 'Your referral code is permanent and cannot be changed. This ensures consistent tracking and no lost referrals.',
                },
                {
                  q: 'What if my account is suspended?',
                  a: 'Referral accounts that violate our terms — including spamming or misrepresentation — may be deactivated. Please refer responsibly.',
                },
              ].map(({ q, a }, i) => (
                <details key={q}
                  className={`reveal delay-${(i + 1) * 100} group`}
                  style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '1.25rem' }}>
                  <summary className="flex items-center justify-between cursor-pointer list-none py-1 text-sm font-semibold tracking-wide"
                    style={{ color: 'var(--c-primary)' }}>
                    {q}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className="flex-shrink-0 transition-transform duration-300 group-open:rotate-180">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>{a}</p>
                </details>
              ))}
            </div>
          </div>

          {/* Contact support */}
          <div className="reveal delay-200">
            <div className="p-10" style={{ background: 'var(--c-primary)' }}>
              <p className="section-eyebrow mb-2" style={{ color: 'var(--c-accent)' }}>Need help?</p>
              <h3 className="font-display text-3xl font-light text-white mb-4">
                Talk to our team
              </h3>
              <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Have questions about the referral programme? Our team is here to help you get started
                and maximise your earnings.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { icon: '✉', label: CONTACT.email },
                  { icon: '📞', label: CONTACT.phone },
                  { icon: '⏰', label: CONTACT.hours },
                ].map(({ icon, label }) => (
                  <p key={label} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    <span>{icon}</span>{label}
                  </p>
                ))}
              </div>
              <Link to="/contact" className="btn-gold inline-flex">
                <span>Contact Us</span><ArrowIcon />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Join Form ─────────────────────────────────────────────────────────────────
function JoinFormSection({ user, error, onCreated }) {
  const [formData, setFormData] = useState({
    full_name:      user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    phone_number:   '',
    bank_name:      '',
    account_number: '',
  })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [alert, setAlert]     = useState({ type: error ? 'error' : '', message: error || '' })
  const formRef = useScrollReveal()

  const validate = () => {
    const e = {}
    if (!formData.full_name.trim())      e.full_name      = 'Full name is required'
    if (!formData.phone_number.trim())   e.phone_number   = 'Phone number is required'
    else if (!/^\+?\d{9,15}$/.test(formData.phone_number.replace(/\s/g, '')))
      e.phone_number = "Enter a valid phone number (e.g. +234 801 234 5678)"
    if (!formData.bank_name.trim())      e.bank_name      = 'Bank name is required'
    if (!formData.account_number.trim()) e.account_number = 'Account number is required'
    else if (!/^\d{10}$/.test(formData.account_number.replace(/\s/g, '')))
      e.account_number = 'Account number must be 10 digits'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setAlert({ type: '', message: '' })
    try {
      const created = await api.post('/referrals/profiles/', {
        ...formData,
        phone_number: formData.phone_number.replace(/\s/g, ''),
        account_number: formData.account_number.replace(/\s/g, ''),
      })
      onCreated(created)
    } catch (err) {
      const data = err.data || {}
      const mapped = {}
      if (data.full_name)      mapped.full_name      = Array.isArray(data.full_name)      ? data.full_name[0]      : data.full_name
      if (data.phone_number)   mapped.phone_number   = Array.isArray(data.phone_number)   ? data.phone_number[0]   : data.phone_number
      if (data.bank_name)      mapped.bank_name      = Array.isArray(data.bank_name)      ? data.bank_name[0]      : data.bank_name
      if (data.account_number) mapped.account_number = Array.isArray(data.account_number) ? data.account_number[0] : data.account_number
      if (Object.keys(mapped).length) {
        setErrors(mapped)
      } else {
        setAlert({ type: 'error', message: err.message || 'Failed to join programme. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  const FieldError = ({ name }) =>
    errors[name] ? <p className="mt-1.5 text-xs" style={{ color: '#DC2626' }}>{errors[name]}</p> : null

  return (
    <section id="join-form" className="py-20 lg:py-28" style={{ background: 'var(--c-primary)' }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left copy */}
          <div>
            <p className="section-eyebrow" style={{ color: 'var(--c-accent)' }}>One-time setup</p>
            <h2 className="font-display font-light text-white leading-tight mb-6"
              style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }}>
              Register as a<br /><em style={{ color: 'var(--c-accent-light)' }}>referrer</em>
            </h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Complete this one-time form and your unique referral code will be generated
              instantly. Your bank details are stored securely for commission payouts only.
            </p>
            <ul className="space-y-3">
              {[
                'Takes less than 2 minutes',
                'Unique code generated automatically',
                'Bank details secured with encryption',
                'Commission paid directly to your account',
              ].map(b => (
                <li key={b} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--c-accent)' }}>
                    <CheckIcon />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Right form */}
          <div
            className="p-8 lg:p-10"
            style={{ background: 'var(--c-bg)' }}
            ref={formRef}
          >
            <h3 className="font-display text-2xl font-medium mb-2" style={{ color: 'var(--c-primary)' }}>
              Join the Programme
            </h3>
            <p className="text-xs mb-6" style={{ color: 'var(--c-text-muted)' }}>
              Your referral code will be generated instantly after you submit.
            </p>

            {alert.message && (
              <div className="mb-5">
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-5">
                <div>
                  <label className="form-label" htmlFor="join-full_name">Full Name</label>
                  <input id="join-full_name" name="full_name" type="text" className="form-input"
                    placeholder="Jane Doe" value={formData.full_name} onChange={handleChange} autoComplete="name" />
                  <FieldError name="full_name" />
                </div>

                <div>
                  <label className="form-label" htmlFor="join-phone_number">Phone Number</label>
                  <input id="join-phone_number" name="phone_number" type="tel" className="form-input"
                    placeholder="+234 801 234 5678" value={formData.phone_number} onChange={handleChange} autoComplete="tel" />
                  <FieldError name="phone_number" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label" htmlFor="join-bank_name">Bank Name</label>
                    <input id="join-bank_name" name="bank_name" type="text" className="form-input"
                      placeholder="GTBank" value={formData.bank_name} onChange={handleChange} />
                    <FieldError name="bank_name" />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="join-account_number">Account Number</label>
                    <input id="join-account_number" name="account_number" type="text" className="form-input"
                      placeholder="0123456789" value={formData.account_number} onChange={handleChange}
                      maxLength={10} inputMode="numeric" />
                    <FieldError name="account_number" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full justify-center mt-8"
                disabled={loading}
                style={loading ? { opacity: 0.7, cursor: 'not-allowed', pointerEvents: 'none' } : {}}
              >
                <span>{loading ? 'Registering…' : 'Get My Referral Code'}</span>
                {!loading && <ArrowIcon />}
              </button>
            </form>

            <p className="mt-4 text-xs leading-relaxed text-center" style={{ color: 'var(--c-text-light)' }}>
              By joining you agree to our{' '}
              <Link to="/terms" className="underline underline-offset-2" style={{ color: 'var(--c-text-muted)' }}>Terms</Link>{' '}
              and{' '}
              <Link to="/privacy-policy" className="underline underline-offset-2" style={{ color: 'var(--c-text-muted)' }}>Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD — authenticated referrer
// ═══════════════════════════════════════════════════════════════════════════════
function Dashboard({ profile, sharePayload, media, isAdmin, onProfileUpdated, onMediaUpdated }) {
  const { copy: copyCode, copied: codeCopied }     = useCopy()
  const { copy: copyMsg,  copied: msgCopied }       = useCopy()
  const [editOpen, setEditOpen]                     = useState(false)
  const groupRef = useScrollRevealGroup()

  const referralCode  = sharePayload?.referral_code || profile?.referral_code || '—'
  const whatsappLink  = sharePayload?.whatsapp_link  || null
  const shareMessage  = sharePayload?.share_message  || null

  const flyers = media.filter(m => m.media_type === 'flyer')
  const videos = media.filter(m => m.media_type === 'video')

  return (
    <main className="page-transition flex-1" style={{ background: 'var(--c-bg)' }}>

      {/* ── DASHBOARD HERO ────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: 'var(--c-primary)' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full"
            style={{ border: '1px solid rgba(245,158,11,0.08)' }} />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full"
            style={{ border: '1px solid rgba(245,158,11,0.07)' }} />
        </div>

        <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

            <div>
              <p className="section-eyebrow" style={{ color: 'var(--c-accent)' }}>Referral Programme</p>
              <h1 className="font-display font-light text-white mt-1 mb-2"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1 }}>
                Welcome back,<br />
                <em style={{ color: 'var(--c-accent-light)' }}>{profile.full_name.split(' ')[0]}.</em>
              </h1>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Member since {new Date(profile.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                {' '}· Status:{' '}
                <span style={{ color: profile.is_active ? 'var(--c-accent-light)' : '#FCA5A5' }}>
                  {profile.is_active ? '✦ Active' : '✕ Inactive'}
                </span>
              </p>
            </div>

            {/* Big code display in hero */}
            <div className="flex-shrink-0">
              <p className="text-xs tracking-widest uppercase mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Your referral code
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="px-6 py-4 font-display text-3xl sm:text-4xl font-medium tracking-[0.3em] text-white"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', letterSpacing: '0.35em' }}
                >
                  {referralCode}
                </div>
                <button
                  onClick={() => copyCode(referralCode)}
                  className="flex items-center gap-2 px-4 py-4 text-xs font-semibold tracking-widest uppercase transition-all duration-200 flex-shrink-0"
                  style={{
                    background: codeCopied ? 'var(--c-accent)' : 'rgba(255,255,255,0.1)',
                    border: `1px solid ${codeCopied ? 'var(--c-accent)' : 'rgba(255,255,255,0.2)'}`,
                    color: 'white',
                  }}
                  title="Copy referral code"
                >
                  {codeCopied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy</>}
                </button>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t pt-8"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            {[
              { label: 'Referral Code',  value: referralCode,                        small: true },
              { label: 'Bank',           value: profile.bank_name,                   small: false },
              { label: 'Account',        value: `···· ${profile.account_number.slice(-4)}`, small: false },
              { label: 'Phone',          value: profile.phone_number,                small: false },
            ].map(({ label, value, small }) => (
              <div key={label}>
                <p className="text-xs tracking-widest uppercase mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
                <p className={`text-white ${small ? 'font-display text-lg font-medium tracking-widest' : 'text-sm'}`}
                  style={{ opacity: 0.85 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SHARE TOOLS ──────────────────────────────────────────── */}
      <section className="py-16 lg:py-20" style={{ background: 'var(--c-bg-warm)' }}>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" ref={groupRef}>
          <div className="text-center mb-12 reveal">
            <p className="section-eyebrow">Share & Earn</p>
            <h2 className="section-title">Your Share Tools</h2>
            <div className="divider-gold mx-auto mt-4" />
            <p className="section-subtitle mx-auto mt-4">
              Use these tools to share your referral code and start earning commissions today.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">

            {/* WhatsApp */}
            <div className="reveal delay-100 flex flex-col items-center text-center p-8"
              style={{ background: 'white', border: '1px solid rgba(6,78,59,0.08)' }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                style={{ background: '#25D366', color: 'white' }}>
                <WhatsAppIcon />
              </div>
              <h3 className="font-display text-lg font-medium mb-2" style={{ color: 'var(--c-primary)' }}>
                WhatsApp
              </h3>
              <p className="text-xs mb-6 leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>
                Share your code with a pre-written message instantly on WhatsApp.
              </p>
              {whatsappLink ? (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 text-xs font-semibold tracking-widest uppercase text-white transition-all duration-200 w-full justify-center"
                  style={{ background: '#25D366' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1ebe5d'}
                  onMouseLeave={e => e.currentTarget.style.background = '#25D366'}>
                  <WhatsAppIcon /> Share Now
                </a>
              ) : (
                <span className="text-xs" style={{ color: 'var(--c-text-light)' }}>Not available</span>
              )}
            </div>

            {/* Copy code */}
            <div className="reveal delay-200 flex flex-col items-center text-center p-8"
              style={{ background: 'white', border: '1px solid rgba(6,78,59,0.08)' }}>
              <div className="w-14 h-14 flex items-center justify-center mb-5 font-display text-xl font-bold text-white"
                style={{ background: 'var(--c-primary)' }}>
                {referralCode.slice(0, 2)}
              </div>
              <h3 className="font-display text-lg font-medium mb-2" style={{ color: 'var(--c-primary)' }}>
                Referral Code
              </h3>
              <p className="text-xs mb-6 leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>
                Copy your unique code to share anywhere — Instagram captions, emails, DMs.
              </p>
              <button
                onClick={() => copyCode(referralCode)}
                className="flex items-center gap-2 px-5 py-3 text-xs font-semibold tracking-widest uppercase transition-all duration-200 w-full justify-center"
                style={{
                  background: codeCopied ? 'rgba(6,78,59,0.08)' : 'transparent',
                  border: `2px solid ${codeCopied ? 'var(--c-primary)' : 'var(--c-primary)'}`,
                  color: 'var(--c-primary)',
                }}
                onMouseEnter={e => { if (!codeCopied) { e.currentTarget.style.background = 'var(--c-primary)'; e.currentTarget.style.color = 'white' } }}
                onMouseLeave={e => { if (!codeCopied) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-primary)' } }}
              >
                {codeCopied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy Code</>}
              </button>
            </div>

            {/* Copy full message */}
            <div className="reveal delay-300 flex flex-col items-center text-center p-8"
              style={{ background: 'white', border: '1px solid rgba(6,78,59,0.08)' }}>
              <div className="w-14 h-14 flex items-center justify-center mb-5"
                style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--c-accent-dark)' }}>
                <ShareIcon />
              </div>
              <h3 className="font-display text-lg font-medium mb-2" style={{ color: 'var(--c-primary)' }}>
                Share Message
              </h3>
              <p className="text-xs mb-6 leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>
                Copy a ready-to-paste marketing message with your code included.
              </p>
              {shareMessage ? (
                <button
                  onClick={() => copyMsg(shareMessage)}
                  className="btn-gold w-full justify-center text-xs py-3"
                  style={msgCopied ? { background: 'var(--c-primary)' } : {}}>
                  {msgCopied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy Message</>}
                </button>
              ) : (
                <span className="text-xs" style={{ color: 'var(--c-text-light)' }}>Not available</span>
              )}
            </div>
          </div>

          {/* Share message preview */}
          {shareMessage && (
            <div className="reveal mt-10 max-w-2xl mx-auto">
              <p className="text-xs tracking-widest uppercase mb-3 font-semibold" style={{ color: 'var(--c-text-muted)' }}>
                Your share message preview
              </p>
              <div className="relative p-6 text-sm leading-relaxed whitespace-pre-line"
                style={{ background: 'white', border: '1px solid #E5E7EB', color: 'var(--c-text)' }}>
                {shareMessage}
                <button
                  onClick={() => copyMsg(shareMessage)}
                  className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all duration-200"
                  style={{
                    background: msgCopied ? 'rgba(6,78,59,0.08)' : 'var(--c-bg)',
                    border: '1px solid #E5E7EB',
                    color: msgCopied ? 'var(--c-primary)' : 'var(--c-text-muted)',
                  }}>
                  {msgCopied ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── PROMOTIONAL MEDIA ────────────────────────────────────── */}
      {media.length > 0 && (
        <section className="py-16 lg:py-20" style={{ background: 'var(--c-bg)' }}>
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 reveal">
              <p className="section-eyebrow">Ready to share</p>
              <h2 className="section-title">Promotional Materials</h2>
              <div className="divider-gold mt-4" />
              <p className="section-subtitle mt-4">
                Download and share these professionally designed marketing assets with your audience.
              </p>
            </div>

            {/* Flyers */}
            {flyers.length > 0 && (
              <div className="mb-12">
                <p className="text-xs font-semibold tracking-widest uppercase mb-5"
                  style={{ color: 'var(--c-text-muted)' }}>
                  ✦ Flyers ({flyers.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {flyers.map(item => <MediaCard key={item.id} item={item} />)}
                </div>
              </div>
            )}

            {/* Videos */}
            {videos.length > 0 && (
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-5"
                  style={{ color: 'var(--c-text-muted)' }}>
                  ▶ Videos ({videos.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map(item => <MediaCard key={item.id} item={item} />)}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* No media placeholder */}
      {media.length === 0 && (
        <section className="py-16" style={{ background: 'var(--c-bg)' }}>
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="reveal text-center py-16"
              style={{ background: 'white', border: '1px solid #F3F4F6' }}>
              <div className="w-14 h-14 mx-auto mb-5 flex items-center justify-center"
                style={{ background: 'rgba(6,78,59,0.06)', color: 'var(--c-text-light)' }}>
                <ImageIcon />
              </div>
              <p className="font-display text-xl font-medium mb-2" style={{ color: 'var(--c-text-muted)' }}>
                Promotional materials coming soon
              </p>
              <p className="text-sm" style={{ color: 'var(--c-text-light)' }}>
                Our team is preparing flyers and videos for you to share. Check back soon.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── PROFILE MANAGEMENT ───────────────────────────────────── */}
      <section className="py-16 lg:py-20" style={{ background: 'var(--c-bg-warm)' }}>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="flex items-start justify-between mb-8 reveal">
              <div>
                <p className="section-eyebrow">Your details</p>
                <h2 className="section-title">Profile Settings</h2>
              </div>
              <button
                onClick={() => setEditOpen(p => !p)}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-widest uppercase transition-all duration-200 flex-shrink-0"
                style={{
                  border: '1.5px solid var(--c-primary)',
                  color: editOpen ? 'white' : 'var(--c-primary)',
                  background: editOpen ? 'var(--c-primary)' : 'transparent',
                }}
                onMouseEnter={e => { if (!editOpen) { e.currentTarget.style.background = 'var(--c-primary)'; e.currentTarget.style.color = 'white' } }}
                onMouseLeave={e => { if (!editOpen) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-primary)' } }}
              >
                {editOpen ? <><XIcon /> Close</> : <><EditIcon /> Edit Profile</>}
              </button>
            </div>

            {editOpen ? (
              <EditProfileForm
                profile={profile}
                onUpdated={(updated) => { onProfileUpdated(updated); setEditOpen(false) }}
                onCancel={() => setEditOpen(false)}
              />
            ) : (
              <ProfileReadView profile={profile} />
            )}
          </div>
        </div>
      </section>

      {isAdmin && <AdminReferralPanel media={media} onMediaUpdated={onMediaUpdated} />}
    </main>
  )
}

// ── Read-only profile view ────────────────────────────────────────────────────
function ProfileReadView({ profile }) {
  const ref = useScrollRevealGroup()
  const fields = [
    { label: 'Full Name',       value: profile.full_name },
    { label: 'Phone Number',    value: profile.phone_number },
    { label: 'Bank Name',       value: profile.bank_name },
    { label: 'Account Number',  value: profile.account_number },
    { label: 'Referral Code',   value: profile.referral_code, monospace: true },
    { label: 'Status',          value: profile.is_active ? 'Active' : 'Inactive' },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5" ref={ref}>
      {fields.map(({ label, value, monospace }) => (
        <div key={label} className="reveal">
          <p className="form-label">{label}</p>
          <div className="px-4 py-3.5 text-sm"
            style={{
              background: 'white',
              border: '1.5px solid #E5E7EB',
              color: 'var(--c-text)',
              fontFamily: monospace ? 'monospace' : undefined,
              letterSpacing: monospace ? '0.2em' : undefined,
            }}>
            {value}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Edit profile form ─────────────────────────────────────────────────────────
function EditProfileForm({ profile, onUpdated, onCancel }) {
  const [formData, setFormData] = useState({
    full_name:      profile.full_name,
    phone_number:   profile.phone_number,
    bank_name:      profile.bank_name,
    account_number: profile.account_number,
  })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [alert, setAlert]     = useState({ type: '', message: '' })

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setLoading(true)
    setAlert({ type: '', message: '' })
    setErrors({})
    try {
      const updated = await api.patch('/referrals/profiles/me/update/', formData)
      setAlert({ type: 'success', message: 'Profile updated successfully.' })
      setTimeout(() => onUpdated(updated), 800)
    } catch (err) {
      const data = err.data || {}
      const mapped = {}
      Object.keys(formData).forEach(k => {
        if (data[k]) mapped[k] = Array.isArray(data[k]) ? data[k][0] : data[k]
      })
      if (Object.keys(mapped).length) setErrors(mapped)
      else setAlert({ type: 'error', message: err.message || 'Failed to update profile.' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {alert.message && (
        <div className="mb-5">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />
        </div>
      )}

      <div className="space-y-5">
        {[
          { id: 'ep-full_name',      name: 'full_name',      label: 'Full Name',      placeholder: 'Jane Doe',      type: 'text',  complete: 'name' },
          { id: 'ep-phone_number',   name: 'phone_number',   label: 'Phone Number',   placeholder: '+234 801 234 5678', type: 'tel', complete: 'tel' },
          { id: 'ep-bank_name',      name: 'bank_name',      label: 'Bank Name',      placeholder: 'GTBank',         type: 'text',  complete: 'organization' },
          { id: 'ep-account_number', name: 'account_number', label: 'Account Number', placeholder: '0123456789',     type: 'text',  complete: 'off' },
        ].map(({ id, name, label, placeholder, type, complete }) => (
          <div key={name}>
            <label className="form-label" htmlFor={id}>{label}</label>
            <input id={id} name={name} type={type} className="form-input"
              placeholder={placeholder} value={formData[name]}
              onChange={handleChange} autoComplete={complete} />
            {errors[name] && <p className="mt-1.5 text-xs" style={{ color: '#DC2626' }}>{errors[name]}</p>}
          </div>
        ))}

        {/* Referral code — read only */}
        <div>
          <label className="form-label">Referral Code</label>
          <div className="px-4 py-3.5 text-sm font-mono tracking-widest"
            style={{ background: 'rgba(6,78,59,0.04)', border: '1.5px solid rgba(6,78,59,0.1)', color: 'var(--c-primary)', letterSpacing: '0.25em' }}>
            {profile.referral_code}
          </div>
          <p className="mt-1.5 text-xs" style={{ color: 'var(--c-text-light)' }}>
            Your referral code is permanent and cannot be changed.
          </p>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          style={loading ? { opacity: 0.7, cursor: 'not-allowed', pointerEvents: 'none' } : {}}
        >
          <span>{loading ? 'Saving…' : 'Save Changes'}</span>
          {!loading && <CheckIcon />}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-6 py-3.5 text-xs font-semibold tracking-widest uppercase transition-all duration-200"
          style={{ border: '1.5px solid #D1D5DB', color: 'var(--c-text-muted)', background: 'transparent' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--c-primary)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#D1D5DB'}
        >
          <XIcon /> Cancel
        </button>
      </div>
    </form>
  )
}
