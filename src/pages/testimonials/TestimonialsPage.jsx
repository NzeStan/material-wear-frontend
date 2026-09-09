import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

// ── Shared UI primitives ──────────────────────────────────────────────────────

function Stars({ rating, size = 14 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} style={{ fontSize: size, color: n <= rating ? 'var(--c-accent)' : '#E5E7EB', lineHeight: 1 }}>★</span>
      ))}
    </span>
  )
}

// ★ Key fix: defined at MODULE level so React never re-mounts it on state changes
const FormField = memo(function FormField({ id, label, type = 'text', required, placeholder, rows, value, onChange, error, autoComplete }) {
  return (
    <div>
      <label className="form-label" htmlFor={id}>
        {label}{required && <span style={{ color: '#DC2626' }}> *</span>}
      </label>
      {rows ? (
        <textarea id={id} rows={rows} className="form-input" placeholder={placeholder}
          value={value} onChange={onChange} style={{ resize: 'vertical', minHeight: 96 }} />
      ) : (
        <input id={id} type={type} className="form-input" placeholder={placeholder}
          value={value} onChange={onChange} autoComplete={autoComplete} />
      )}
      {error && <p style={{ color: '#DC2626', fontSize: 11, marginTop: 4 }}>{error}</p>}
    </div>
  )
})

function Spinner() {
  return <div style={{ width: 22, height: 22, border: '2px solid var(--c-border)', borderTopColor: 'var(--c-primary)', borderRadius: '50%', animation: 'tspin .7s linear infinite' }} />
}

function getMediaUrl(media) {
  return media?.thumbnails?.medium || media?.thumbnails?.large || media?.file_url || media?.file || ''
}

function inferUploadMediaType(file) {
  if (!file?.type) return 'document'
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('audio/')) return 'audio'
  return 'document'
}

function SkeletonCard() {
  return (
    <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 8, padding: 24 }}>
      <div className="tskel" style={{ height: 14, width: 100, borderRadius: 4, marginBottom: 16 }} />
      <div className="tskel" style={{ height: 11, width: '100%', borderRadius: 4, marginBottom: 8 }} />
      <div className="tskel" style={{ height: 11, width: '80%', borderRadius: 4, marginBottom: 8 }} />
      <div className="tskel" style={{ height: 11, width: '60%', borderRadius: 4, marginBottom: 20 }} />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div className="tskel" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
        <div className="tskel" style={{ height: 11, width: 90, borderRadius: 4 }} />
      </div>
    </div>
  )
}

// ── Testimonial card (public) ─────────────────────────────────────────────────

function TestimonialCard({ t, onClick }) {
  const initials = (t.author_display || t.author_name || '?')[0].toUpperCase()
  return (
    <div
      onClick={() => onClick(t)}
      style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'box-shadow .15s, transform .15s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stars rating={t.rating} />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {t.category && (
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: 'var(--c-bg-warm)', color: 'var(--c-text-muted)', border: '1px solid var(--c-border)' }}>
              {t.category.name}
            </span>
          )}
          {t.is_verified && (
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: 'rgba(6,78,59,0.08)', color: 'var(--c-primary)' }}>
              Verified ✓
            </span>
          )}
        </div>
      </div>

      {t.title && <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)', margin: 0 }}>{t.title}</p>}

      <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--c-text-muted)', margin: 0, flex: 1,
        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
        &ldquo;{t.content}&rdquo;
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 10, borderTop: '1px solid var(--c-border)' }}>
        {t.avatar
          ? <img src={t.avatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--c-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
        }
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {t.author_display || t.author_name}
          </p>
          <p style={{ fontSize: 11, color: 'var(--c-text-muted)', margin: '1px 0 0' }}>
            {[t.location, t.company].filter(Boolean).join(' · ') || 'Customer'}
          </p>
          {/* Phone + social — shown if provided */}
          {(t.author_phone || t.social_media?.instagram || t.social_media?.twitter) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 5 }} onClick={e => e.stopPropagation()}>
              {t.author_phone && (
                <a href={`tel:${t.author_phone}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600, color: 'var(--c-primary)', textDecoration: 'none' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4a2 2 0 0 1 1.77-2.18H6.3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.77-1.46a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  {t.author_phone}
                </a>
              )}
              {t.social_media?.instagram && (
                <a href={t.social_media.instagram.startsWith('http') ? t.social_media.instagram : `https://${t.social_media.instagram}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600, color: '#E1306C', textDecoration: 'none' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  Instagram
                </a>
              )}
              {t.social_media?.twitter && (
                <a href={t.social_media.twitter.startsWith('http') ? t.social_media.twitter : `https://${t.social_media.twitter}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: '#000', textDecoration: 'none' }}>
                  <span style={{ fontSize: 10 }}>𝕏</span>
                  Twitter/X
                </a>
              )}
            </div>
          )}
        </div>
        {t.approved_at && (
          <p style={{ fontSize: 10, color: 'var(--c-text-muted)', marginLeft: 'auto', flexShrink: 0, alignSelf: 'flex-start' }}>
            {new Date(t.approved_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Detail modal (uses GET /api/testimonials/{id}/) ───────────────────────────

function DetailModal({ id, onClose }) {
  const [t, setT] = useState(null)
  const [mediaItems, setMediaItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    Promise.allSettled([
      api.get(`/testimonials/testimonials/${id}/`),
      api.get(`/testimonials/media/?testimonial=${id}&ordering=order`),
    ])
      .then(([testimonialRes, mediaRes]) => {
        if (cancelled) return
        if (testimonialRes.status === 'fulfilled') {
          setT(testimonialRes.value)
        }
        if (mediaRes.status === 'fulfilled') {
          const data = mediaRes.value
          setMediaItems(Array.isArray(data) ? data : (data.results || []))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [id])

  const initials = t ? (t.author_display || t.author_name || '?')[0].toUpperCase() : ''

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.55)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: 'var(--c-surface)', borderRadius: 10, width: '100%', maxWidth: 540, maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--c-border)', position: 'sticky', top: 0, background: 'var(--c-surface)', zIndex: 1 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Customer Review</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--c-text-muted)', display: 'flex', alignItems: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style={{ padding: '24px 28px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
          ) : !t ? (
            <p style={{ textAlign: 'center', color: 'var(--c-text-muted)', fontSize: 13 }}>Could not load review.</p>
          ) : (
            <>
              {/* Author */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
                {t.avatar
                  ? <img src={t.avatar} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--c-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                }
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-text)', margin: 0 }}>{t.author_display || t.author_name}</p>
                  <p style={{ fontSize: 12, color: 'var(--c-text-muted)', margin: '3px 0 0' }}>
                    {[t.location, t.company].filter(Boolean).join(' · ') || 'Customer'}
                  </p>
                  {/* Social links — lets new customers connect with the reviewer */}
                  {t.social_media && (t.social_media.instagram || t.social_media.twitter) && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                      {t.social_media.instagram && (
                        <a href={t.social_media.instagram.startsWith('http') ? t.social_media.instagram : `https://${t.social_media.instagram}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#E1306C', textDecoration: 'none' }}
                          onClick={e => e.stopPropagation()}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                          Instagram
                        </a>
                      )}
                      {t.social_media.twitter && (
                        <a href={t.social_media.twitter.startsWith('http') ? t.social_media.twitter : `https://${t.social_media.twitter}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#000', textDecoration: 'none' }}
                          onClick={e => e.stopPropagation()}>
                          <span style={{ fontSize: 12, fontWeight: 900 }}>𝕏</span>
                          Twitter/X
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <Stars rating={t.rating} size={16} />
                  {t.is_verified && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-primary)', background: 'rgba(6,78,59,0.08)', padding: '2px 8px', borderRadius: 99 }}>Verified ✓</span>
                  )}
                </div>
              </div>

              {/* Category + source */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {t.category && (
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--c-bg-warm)', color: 'var(--c-text)', border: '1px solid var(--c-border)' }}>{t.category.name}</span>
                )}
                {t.source_display && (
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' }}>via {t.source_display}</span>
                )}
              </div>

              {/* Title + content */}
              {t.title && <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-text)', marginBottom: 10 }}>{t.title}</p>}
              <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--c-text-muted)', whiteSpace: 'pre-wrap' }}>&ldquo;{t.content}&rdquo;</p>

              {/* Media */}
              {(mediaItems.length > 0 || t.media?.length > 0) && (
                <div style={{ marginTop: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--c-text-muted)', marginBottom: 10 }}>Attachments</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(mediaItems.length > 0 ? mediaItems : t.media).map(m => (
                      String(m.media_type).toLowerCase() === 'image' ? (
                        <img key={m.id} src={getMediaUrl(m)} alt={m.title || ''} style={{ width: 80, height: 80, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--c-border)' }} />
                      ) : (
                        <a key={m.id} href={getMediaUrl(m)} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--c-primary)', padding: '6px 12px', border: '1px solid var(--c-border)', borderRadius: 6 }}>
                          📎 {m.title || 'Attachment'}
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Company response */}
              {t.response && (
                <div style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(6,78,59,0.04)', borderRadius: 8, borderLeft: '3px solid var(--c-primary)' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-primary)', marginBottom: 6 }}>Response from Material Wear</p>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--c-text)', margin: 0 }}>{t.response}</p>
                  {t.response_at && <p style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 6 }}>{new Date(t.response_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                </div>
              )}

              {/* Date */}
              {t.approved_at && (
                <p style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 20, textAlign: 'right' }}>
                  Published {new Date(t.approved_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Submit form ───────────────────────────────────────────────────────────────
// IMPORTANT: FormField is module-level — no focus loss on re-render

function SubmitForm({ categories, onSuccess }) {
  const { isAuthenticated } = useAuth()
  const [form, setForm] = useState({
    author_name: '', author_email: '', author_phone: '', location: '', company: '',
    title: '', content: '', rating: 0, category: '', is_anonymous: false,
    instagram: '', twitter: '',
  })
  const [avatar, setAvatar]       = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarError, setAvatarError] = useState('')
  const [attachments, setAttachments] = useState([])
  const [attachmentError, setAttachmentError] = useState('')
  const [errors, setErrors]       = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [hover, setHover]         = useState(0)
  const fileInputRef              = useRef(null)
  const attachmentInputRef        = useRef(null)

  const set = useCallback((field, value) => {
    setForm(p => ({ ...p, [field]: value }))
    setErrors(p => ({ ...p, [field]: '' }))
  }, [])

  function handleAvatar(e) {
    const file = e.target.files[0]
    if (!file) return
    setAvatarError('')
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      setAvatarError('Only JPEG, PNG, WebP or GIF images are allowed.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be smaller than 5 MB.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    setAvatar(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  function removeAvatar() {
    setAvatar(null)
    setAvatarPreview(null)
    setAvatarError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleAttachments(e) {
    const picked = Array.from(e.target.files || [])
    if (!picked.length) return

    const allowed = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm', 'video/quicktime',
    ]

    const next = []
    const issues = []
    const remainingSlots = Math.max(0, 4 - attachments.length)

    picked.slice(0, remainingSlots).forEach(file => {
      if (!allowed.includes(file.type)) {
        issues.push(`${file.name}: only images or short videos are allowed.`)
        return
      }

      const isVideo = file.type.startsWith('video/')
      const maxSize = isVideo ? 25 * 1024 * 1024 : 8 * 1024 * 1024
      if (file.size > maxSize) {
        issues.push(`${file.name}: ${isVideo ? 'video' : 'image'} is too large.`)
        return
      }

      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
        mediaType: inferUploadMediaType(file),
      })
    })

    if (picked.length > remainingSlots) {
      issues.push('You can attach up to 4 files per review.')
    }

    setAttachments(prev => [...prev, ...next])
    setAttachmentError(issues[0] || '')
    if (attachmentInputRef.current) attachmentInputRef.current.value = ''
  }

  function removeAttachment(id) {
    setAttachments(prev => {
      const item = prev.find(entry => entry.id === id)
      if (item?.preview) URL.revokeObjectURL(item.preview)
      return prev.filter(entry => entry.id !== id)
    })
  }

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
      attachments.forEach(item => {
        if (item.preview) URL.revokeObjectURL(item.preview)
      })
    }
  }, [avatarPreview, attachments])

  const validate = () => {
    const e = {}
    if (!form.author_name.trim())                   e.author_name  = 'Name is required'
    if (!form.author_email.trim())                  e.author_email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.author_email)) e.author_email = 'Enter a valid email'
    if (!form.content.trim())                       e.content      = 'Review text is required'
    else if (form.content.trim().length < 10)       e.content      = 'Must be at least 10 characters'
    if (!form.rating)                               e.rating       = 'Please pick a star rating'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true); setErrors({})

    try {
      const fd = new FormData()
      fd.append('author_name',  form.author_name.trim())
      fd.append('author_email', form.author_email.trim())
      fd.append('content',      form.content.trim())
      fd.append('rating',       form.rating)
      fd.append('source',       'website')
      fd.append('is_anonymous', form.is_anonymous)
      if (form.location.trim())    fd.append('location',     form.location.trim())
      if (form.company.trim())     fd.append('company',      form.company.trim())
      if (form.title.trim())       fd.append('title',        form.title.trim())
      if (form.author_phone.trim()) fd.append('author_phone', form.author_phone.trim())
      if (form.category)           fd.append('category',     form.category)
      if (avatar)                  fd.append('avatar',       avatar)
      // social_media is a JSONField — send as JSON string
      const social = {}
      if (form.instagram.trim()) social.instagram = form.instagram.trim()
      if (form.twitter.trim())   social.twitter   = form.twitter.trim()
      if (Object.keys(social).length) fd.append('social_media', JSON.stringify(social))

      const created = await api.post('/testimonials/testimonials/', fd)

      let mediaNotice = ''
      if (attachments.length > 0) {
        if (isAuthenticated && created?.id) {
          const uploads = await Promise.allSettled(
            attachments.map(item => {
              const mediaFd = new FormData()
              mediaFd.append('testimonial', created.id)
              mediaFd.append('file', item.file)
              mediaFd.append('media_type', item.mediaType)
              mediaFd.append('title', item.file.name)
              return api.post('/testimonials/media/', mediaFd)
            })
          )

          const failed = uploads.filter(result => result.status === 'rejected').length
          if (failed > 0) {
            mediaNotice = `${failed} attachment${failed > 1 ? 's were' : ' was'} not saved.`
          }
        } else {
          mediaNotice = 'Your review was submitted, but attachments require sign-in with the current API setup.'
        }
      }

      onSuccess({ mediaNotice })
    } catch (err) {
      const msg = err.data
        ? Object.entries(err.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`).join('; ')
        : err.message || 'Submission failed. Please try again.'
      setErrors({ form: msg })
    } finally { setSubmitting(false) }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errors.form && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 6, padding: '12px 16px', fontSize: 13, display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 20 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {errors.form}
        </div>
      )}

      {/* Avatar picker */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text)', marginBottom: 8 }}>Profile Photo <span style={{ color: 'var(--c-text-muted)', fontWeight: 400 }}>(optional)</span></p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {avatarPreview
            ? <img src={avatarPreview} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--c-primary)' }} />
            : <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--c-bg-warm)', border: '2px dashed var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-text-muted)', fontSize: 20 }}>+</div>
          }
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => fileInputRef.current?.click()}
              style={{ fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 6, border: '1px solid var(--c-border)', background: 'var(--c-surface)', cursor: 'pointer', color: 'var(--c-text)' }}>
              {avatarPreview ? 'Change' : 'Upload Photo'}
            </button>
            {avatarPreview && (
              <button type="button" onClick={removeAvatar}
                style={{ fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 6, border: '1px solid #fecaca', background: '#fff5f5', cursor: 'pointer', color: '#dc2626' }}>
                Remove
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.gif" onChange={handleAvatar} style={{ display: 'none' }} />
        </div>
        {avatarError && <p style={{ fontSize: 12, color: '#dc2626', marginTop: 6 }}>{avatarError}</p>}
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text)', marginBottom: 4 }}>
              Experience Photos / Videos <span style={{ color: 'var(--c-text-muted)', fontWeight: 400 }}>(optional)</span>
            </p>
            <p style={{ fontSize: 11, color: 'var(--c-text-muted)', margin: 0, lineHeight: 1.6 }}>
              This is a strong addition for trust. Images and short videos make reviews feel much more real.
              {!isAuthenticated && ' With the current API, attachments can only be saved for signed-in users.'}
            </p>
          </div>
          <button type="button" onClick={() => attachmentInputRef.current?.click()}
            style={{ fontSize: 12, fontWeight: 700, padding: '8px 14px', borderRadius: 6, border: '1px solid var(--c-border)', background: 'var(--c-surface)', cursor: 'pointer', color: 'var(--c-text)' }}>
            Add Media
          </button>
          <input
            ref={attachmentInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mov"
            multiple
            onChange={handleAttachments}
            style={{ display: 'none' }}
          />
        </div>

        {attachments.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            {attachments.map(item => (
              <div key={item.id} style={{ border: '1px solid var(--c-border)', borderRadius: 8, overflow: 'hidden', background: 'var(--c-surface)' }}>
                <div style={{ height: 108, background: 'var(--c-bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.mediaType === 'image' ? (
                    <img src={item.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'var(--c-text-muted)', fontSize: 12 }}>
                      <span style={{ fontSize: 24 }}>▶</span>
                      <span>Video</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: '10px 10px 12px' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-text)', margin: '0 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.file.name}
                  </p>
                  <button type="button" onClick={() => removeAttachment(item.id)}
                    style={{ fontSize: 11, fontWeight: 600, padding: 0, border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer' }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {attachmentError && <p style={{ fontSize: 12, color: '#dc2626', marginTop: 6 }}>{attachmentError}</p>}
      </div>

      {/* Name + email + phone */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 14 }}>
        <FormField id="tf-name"  label="Your Name"     required placeholder="Adaeze Okonkwo"    value={form.author_name}   onChange={e => set('author_name',   e.target.value)} error={errors.author_name}  autoComplete="name" />
        <FormField id="tf-email" label="Email Address" required type="email" placeholder="you@example.com" value={form.author_email} onChange={e => set('author_email', e.target.value)} error={errors.author_email} autoComplete="email" />
        <FormField id="tf-phone" label="Phone Number"  type="tel" placeholder="+234 800 000 0000" value={form.author_phone} onChange={e => set('author_phone', e.target.value)} error={errors.author_phone} autoComplete="tel" />
        <FormField id="tf-loc"   label="Location"      placeholder="Lagos, Nigeria"              value={form.location}     onChange={e => set('location',     e.target.value)} error={errors.location} />
        <FormField id="tf-co"    label="Company / School" placeholder="Optional"                 value={form.company}      onChange={e => set('company',      e.target.value)} error={errors.company} />
      </div>

      {/* Star rating */}
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text)', marginBottom: 8 }}>
          Rating<span style={{ color: '#DC2626' }}> *</span>
        </p>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button"
              onClick={() => { set('rating', n) }}
              onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
              style={{ fontSize: 30, color: n <= (hover || form.rating) ? 'var(--c-accent)' : '#E5E7EB', background: 'none', border: 'none', padding: 0, cursor: 'pointer', transition: 'color .1s, transform .1s', transform: n <= (hover || form.rating) ? 'scale(1.15)' : 'scale(1)', lineHeight: 1 }}
              aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
            >★</button>
          ))}
          {form.rating > 0 && (
            <span style={{ alignSelf: 'center', marginLeft: 8, fontSize: 12, color: 'var(--c-text-muted)' }}>
              {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][form.rating]}
            </span>
          )}
        </div>
        {errors.rating && <p style={{ color: '#DC2626', fontSize: 11, marginTop: 4 }}>{errors.rating}</p>}
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <label className="form-label" htmlFor="tf-cat">Category <span style={{ color: 'var(--c-text-muted)', fontWeight: 400 }}>(optional)</span></label>
          <select id="tf-cat" className="form-input" value={form.category} onChange={e => set('category', e.target.value)} style={{ paddingRight: 32 }}>
            <option value="">-- select a category --</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {/* Title + content */}
      <div style={{ marginBottom: 14 }}>
        <FormField id="tf-title" label="Review Title" placeholder="Summarise your experience…" value={form.title} onChange={e => set('title', e.target.value)} error={errors.title} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <FormField id="tf-content" label="Your Review" required rows={5} placeholder="Tell us about your experience with Material Wear — the product quality, service, delivery…" value={form.content} onChange={e => set('content', e.target.value)} error={errors.content} />
      </div>

      {/* Social media */}
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text)', marginBottom: 4 }}>
          Social Accounts <span style={{ fontWeight: 400, color: 'var(--c-text-muted)' }}>(optional — lets others connect with you)</span>
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#E1306C', pointerEvents: 'none' }}>IG</span>
            <input id="tf-ig" className="form-input" placeholder="instagram.com/yourhandle"
              value={form.instagram} onChange={e => set('instagram', e.target.value)}
              style={{ paddingLeft: 32 }} />
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 700, color: '#000', pointerEvents: 'none' }}>𝕏</span>
            <input id="tf-tw" className="form-input" placeholder="x.com/yourhandle"
              value={form.twitter} onChange={e => set('twitter', e.target.value)}
              style={{ paddingLeft: 32 }} />
          </div>
        </div>
      </div>

      {/* Anonymous toggle */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 20, fontSize: 13, color: 'var(--c-text)' }}>
        <input type="checkbox" checked={form.is_anonymous} onChange={e => set('is_anonymous', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--c-primary)', cursor: 'pointer' }} />
        Post anonymously (your name will be hidden)
      </label>

      <p style={{ fontSize: 11, color: 'var(--c-text-muted)', marginBottom: 16 }}>
        Reviews are published after moderation. Your email and phone are never shown publicly.
      </p>

      <button type="submit" className="btn-primary" disabled={submitting}
        style={{ width: '100%', justifyContent: 'center', opacity: submitting ? 0.7 : 1 }}>
        {submitting ? 'Submitting…' : 'Submit Review'}
        {!submitting && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        )}
      </button>
    </form>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TestimonialsPage() {
  const location  = useLocation()
  const submitRef = useRef(null)
  const sentinelRef = useRef(null)

  const [items,        setItems]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [loadingMore,  setLoadingMore]  = useState(false)
  const [hasMore,      setHasMore]      = useState(false)
  const [page,         setPage]         = useState(1)
  const [totalCount,   setTotalCount]   = useState(null)
  const [ratingFilter, setRatingFilter] = useState(null)
  const [catFilter,    setCatFilter]    = useState(null)
  const [categories,   setCategories]   = useState([])
  const [submitted,    setSubmitted]    = useState(false)
  const [submissionNotice, setSubmissionNotice] = useState('')
  const [detailId,     setDetailId]     = useState(null)

  // page title
  useEffect(() => { document.title = 'Customer Reviews — Material Wear Limited' }, [])

  // scroll to #submit
  useEffect(() => {
    if (location.hash === '#submit' && submitRef.current) {
      setTimeout(() => submitRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300)
    }
  }, [location.hash])

  // fetch categories from API
  useEffect(() => {
    api.get('/testimonials/categories/')
      .then(data => {
        const list = Array.isArray(data) ? data : (data.results || [])
        setCategories(list.filter(c => c.is_active))
      })
      .catch(() => {})
  }, [])

  // fetch testimonials (page 1) whenever filters change
  const fetchPage1 = useCallback(async (rating, cat) => {
    setLoading(true); setItems([]); setPage(1); setHasMore(false); setTotalCount(null)
    try {
      // No status filter — ViewSet already returns only published (approved + featured) to public users
      const params = new URLSearchParams({ ordering: '-approved_at', page_size: 9 })
      if (rating) params.set('rating', rating)
      if (cat)    params.set('category', cat)
      const data = await api.get(`/testimonials/testimonials/?${params}`)
      const results = Array.isArray(data) ? data : (data.results || [])
      setItems(results)
      setHasMore(!!(Array.isArray(data) ? false : data.next))
      if (!Array.isArray(data) && data.count != null) setTotalCount(data.count)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchPage1(ratingFilter, catFilter) }, [ratingFilter, catFilter, fetchPage1])

  // infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loadingMore) doLoadMore()
    }, { rootMargin: '200px' })
    obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore, page])

  async function doLoadMore() {
    if (!hasMore || loadingMore) return
    const nextPage = page + 1
    setLoadingMore(true)
    try {
      const params = new URLSearchParams({ ordering: '-approved_at', page_size: 9, page: nextPage })
      if (ratingFilter) params.set('rating', ratingFilter)
      if (catFilter)    params.set('category', catFilter)
      const data = await api.get(`/testimonials/testimonials/?${params}`)
      const results = Array.isArray(data) ? data : (data.results || [])
      setItems(prev => [...prev, ...results])
      setPage(nextPage)
      setHasMore(!!(Array.isArray(data) ? false : data.next))
    } catch { /* silent */ }
    finally { setLoadingMore(false) }
  }

  function resetFilters() { setRatingFilter(null); setCatFilter(null) }

  const activeFilters = (ratingFilter != null) || (catFilter != null)

  return (
    <main className="flex-1" style={{ background: 'var(--c-bg-warm)', minHeight: '80vh' }}>

      {detailId && <DetailModal id={detailId} onClose={() => setDetailId(null)} />}

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div style={{ background: 'var(--c-primary)', padding: '56px 16px 48px', textAlign: 'center' }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--c-accent-light)', marginBottom: 10 }}>Social Proof</p>
        <h1 className="font-display" style={{ fontSize: 36, fontWeight: 300, color: 'white', marginBottom: 10 }}>Customer Stories</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', maxWidth: 360, margin: '0 auto' }}>
          Honest experiences from people who wear Material Wear every day.
        </p>
        {totalCount != null && (
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-accent-light)', marginTop: 14 }}>
            {totalCount.toLocaleString()} approved {totalCount === 1 ? 'review' : 'reviews'}
          </p>
        )}
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>

        {/* ── Filters ──────────────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          {/* Category pills */}
          {categories.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--c-text-muted)', alignSelf: 'center', marginRight: 4 }}>Category:</p>
              {[{ id: null, name: 'All' }, ...categories].map(c => (
                <button key={c.id ?? 'all'} onClick={() => setCatFilter(c.id)}
                  style={{ fontSize: 11, fontWeight: 600, padding: '5px 14px', borderRadius: 99, border: `1px solid ${catFilter === c.id ? 'var(--c-primary)' : 'var(--c-border)'}`, background: catFilter === c.id ? 'var(--c-primary)' : 'white', color: catFilter === c.id ? 'white' : 'var(--c-text)', cursor: 'pointer', transition: 'all .15s' }}>
                  {c.name}
                  {c.testimonials_count != null ? ` (${c.testimonials_count})` : ''}
                </button>
              ))}
            </div>
          )}

          {/* Rating filter */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--c-text-muted)', marginRight: 4 }}>Rating:</p>
            {[null, 5, 4, 3].map(v => (
              <button key={v ?? 'all'} onClick={() => setRatingFilter(v)}
                style={{ fontSize: 11, fontWeight: 600, padding: '5px 14px', borderRadius: 99, border: `1px solid ${ratingFilter === v ? 'var(--c-primary)' : 'var(--c-border)'}`, background: ratingFilter === v ? 'var(--c-primary)' : 'white', color: ratingFilter === v ? 'white' : 'var(--c-text)', cursor: 'pointer', transition: 'all .15s' }}>
                {v == null ? 'All' : v === 3 ? '3+ ★' : `${v} ★`}
              </button>
            ))}
            {activeFilters && (
              <button onClick={resetFilters} style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 99, border: '1px solid #fecaca', background: '#fff5f5', color: '#dc2626', cursor: 'pointer', marginLeft: 4 }}>
                ✕ Clear filters
              </button>
            )}
          </div>
        </div>

        {/* ── Grid ─────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 8, padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)', marginBottom: 6 }}>No reviews found</p>
            <p style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>
              {activeFilters ? 'Try different filters, or ' : 'Be the first — '}
              <button onClick={() => { resetFilters(); setTimeout(() => submitRef.current?.scrollIntoView({ behavior: 'smooth' }), 100) }}
                style={{ color: 'var(--c-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 12 }}>
                leave a review
              </button>
              {activeFilters ? '.' : '!'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>
            {items.map(t => <TestimonialCard key={t.id} t={t} onClick={t2 => setDetailId(t2.id)} />)}
          </div>
        )}

        {/* sentinel */}
        <div ref={sentinelRef} />
        {loadingMore && <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}><Spinner /></div>}
        {!loading && !loadingMore && !hasMore && items.length > 0 && (
          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--c-text-muted)', padding: '16px 0' }}>
            All {items.length} reviews shown ✓
          </p>
        )}

        {/* ── Submit form ───────────────────────────────────────── */}
        <div id="submit" ref={submitRef}
          style={{ marginTop: 60, background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '40px 36px', scrollMarginTop: 80 }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(6,78,59,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--c-primary)" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3 className="font-display" style={{ fontSize: 24, color: 'var(--c-primary)', marginBottom: 8 }}>Thank you!</h3>
                <p style={{ fontSize: 13, color: 'var(--c-text-muted)', lineHeight: 1.7 }}>
                  Your review has been submitted and is awaiting moderation.<br />We&apos;ll publish it shortly. Thank you for sharing your experience.
                </p>
                {submissionNotice && (
                  <p style={{ fontSize: 12, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', marginTop: 14, lineHeight: 1.6 }}>
                    {submissionNotice}
                  </p>
                )}
              </div>
            ) : (
              <>
                <p className="section-eyebrow" style={{ marginBottom: 4 }}>Your Voice Matters</p>
                <h2 className="font-display" style={{ fontSize: 26, color: 'var(--c-primary)', marginBottom: 6 }}>Share Your Experience</h2>
                <p style={{ fontSize: 13, color: 'var(--c-text-muted)', marginBottom: 28, lineHeight: 1.6 }}>
                  Help others discover Material Wear by leaving an honest review.
                </p>
                <SubmitForm categories={categories} onSuccess={({ mediaNotice } = {}) => {
                  setSubmissionNotice(mediaNotice || '')
                  setSubmitted(true)
                  submitRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }} />
              </>
            )}
          </div>
        </div>

      </div>

      <style>{`
        .tskel { background: linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size:200% 100%; animation:tskel 1.4s infinite; }
        @keyframes tskel { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes tspin { to{transform:rotate(360deg)} }
      `}</style>
    </main>
  )
}
