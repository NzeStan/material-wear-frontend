import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

// ── Helpers ───────────────────────────────────────────────────────────────────

function Stars({ rating }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} style={{ fontSize: 13, color: n <= rating ? 'var(--c-accent)' : '#E5E7EB' }}>★</span>
      ))}
    </span>
  )
}

function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Spinner({ size = 22 }) {
  return <div style={{ width: size, height: size, border: '2px solid var(--c-border)', borderTopColor: 'var(--c-primary)', borderRadius: '50%', animation: 'taspin .7s linear infinite', flexShrink: 0 }} />
}

function getMediaUrl(media) {
  return media?.thumbnails?.medium || media?.thumbnails?.large || media?.file_url || media?.file || ''
}

function inferMediaType(file) {
  if (!file?.type) return 'document'
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('audio/')) return 'audio'
  return 'document'
}

const STATUS_BADGE = {
  pending:  { bg: '#fef3c7', color: '#92400e' },
  approved: { bg: '#d1fae5', color: '#065f46' },
  featured: { bg: 'rgba(6,78,59,0.1)', color: 'var(--c-primary)' },
  rejected: { bg: '#fee2e2', color: '#991b1b' },
  archived: { bg: '#f3f4f6', color: '#6b7280' },
}

// ── Modals ────────────────────────────────────────────────────────────────────

function RejectModal({ onConfirm, onClose, busy }) {
  const [reason, setReason] = useState('')
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: 'white', borderRadius: 10, padding: '28px 32px', maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--c-primary)', marginBottom: 6 }}>Reject Review</h3>
        <p style={{ fontSize: 12, color: 'var(--c-text-muted)', marginBottom: 16 }}>Reason is optional — for internal records only.</p>
        <textarea rows={3} className="form-input" placeholder="e.g. Contains promotional content…"
          value={reason} onChange={e => setReason(e.target.value)} style={{ resize: 'vertical', marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => onConfirm(reason)} disabled={busy}
            style={{ flex: 1, padding: '9px 0', fontSize: 13, fontWeight: 700, background: '#DC2626', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', opacity: busy ? 0.7 : 1 }}>
            {busy ? 'Rejecting…' : 'Confirm Reject'}
          </button>
          <button onClick={onClose}
            style={{ padding: '9px 18px', fontSize: 13, fontWeight: 600, background: 'white', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 6, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function BulkRejectModal({ count, onConfirm, onClose, busy }) {
  const [reason, setReason] = useState('')
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: 'white', borderRadius: 10, padding: '28px 32px', maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, color: '#DC2626', marginBottom: 6 }}>Bulk Reject ({count} reviews)</h3>
        <p style={{ fontSize: 12, color: 'var(--c-text-muted)', marginBottom: 16 }}>This will reject all selected reviews. Provide a reason if applicable.</p>
        <textarea rows={3} className="form-input" placeholder="Reason (optional)…"
          value={reason} onChange={e => setReason(e.target.value)} style={{ resize: 'vertical', marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => onConfirm(reason)} disabled={busy}
            style={{ flex: 1, padding: '9px 0', fontSize: 13, fontWeight: 700, background: '#DC2626', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', opacity: busy ? 0.7 : 1 }}>
            {busy ? 'Rejecting…' : `Reject ${count} Reviews`}
          </button>
          <button onClick={onClose}
            style={{ padding: '9px 18px', fontSize: 13, fontWeight: 600, background: 'white', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 6, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function ReviewDetailModal({ id, categories, onClose, onSaved, onDeleted }) {
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [detail, setDetail] = useState(null)
  const [mediaItems, setMediaItems] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    response: '',
    is_verified: false,
    display_order: 0,
    category_id: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [detailData, mediaData] = await Promise.all([
        api.get(`/testimonials/testimonials/${id}/`),
        api.get(`/testimonials/media/?testimonial=${id}&ordering=order`),
      ])
      const mediaList = Array.isArray(mediaData) ? mediaData : (mediaData.results || [])
      setDetail(detailData)
      setMediaItems(mediaList)
      setForm({
        response: detailData.response || '',
        is_verified: !!detailData.is_verified,
        display_order: detailData.display_order ?? 0,
        category_id: detailData.category?.id ? String(detailData.category.id) : '',
      })
    } catch (e) {
      setError(e.message || 'Could not load review details.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function save() {
    setSaving(true)
    setError('')
    try {
      await api.patch(`/testimonials/testimonials/${id}/`, {
        response: form.response.trim(),
        is_verified: form.is_verified,
        display_order: Number(form.display_order) || 0,
        category_id: form.category_id || null,
      })
      await load()
      onSaved()
    } catch (e) {
      setError(e.message || 'Could not save review changes.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteReview() {
    if (!confirm('Delete this review permanently? This cannot be undone.')) return
    setSaving(true)
    setError('')
    try {
      await api.delete(`/testimonials/testimonials/${id}/`)
      onDeleted(id)
      onClose()
    } catch (e) {
      setError(e.message || 'Could not delete this review.')
      setSaving(false)
    }
  }

  async function uploadMedia(ev) {
    const file = ev.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('testimonial', id)
      fd.append('file', file)
      fd.append('media_type', inferMediaType(file))
      fd.append('title', file.name)
      await api.post('/testimonials/media/', fd)
      await load()
    } catch (e) {
      setError(e.message || 'Could not upload media.')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
      setUploading(false)
    }
  }

  async function updateMedia(media) {
    setError('')
    try {
      await api.patch(`/testimonials/media/${media.id}/`, {
        order: Number(media.order) || 0,
        is_primary: !!media.is_primary,
        title: media.title || '',
        description: media.description || '',
      })
      await load()
      onSaved()
    } catch (e) {
      setError(e.message || 'Could not update media.')
    }
  }

  async function deleteMedia(mediaId) {
    if (!confirm('Remove this attachment?')) return
    setError('')
    try {
      await api.delete(`/testimonials/media/${mediaId}/`)
      await load()
      onSaved()
    } catch (e) {
      setError(e.message || 'Could not remove media.')
    }
  }

  function updateMediaDraft(mediaId, field, value) {
    setMediaItems(prev => prev.map(item => item.id === mediaId ? { ...item, [field]: value } : item))
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.55)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 820, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.28)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--c-border)', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--c-text-muted)', marginBottom: 4 }}>Review Manager</p>
            <h3 style={{ fontSize: 18, color: 'var(--c-primary)', margin: 0 }}>Review Details</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-text-muted)', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: '22px 24px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}><Spinner /></div>
          ) : error && !detail ? (
            <p style={{ color: '#b91c1c', fontSize: 13 }}>{error}</p>
          ) : detail ? (
            <>
              {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8, padding: '10px 12px', fontSize: 12, marginBottom: 16 }}>{error}</div>}

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18, marginBottom: 22 }}>
                <div style={{ background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)', borderRadius: 10, padding: '18px 18px' }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-text)', marginBottom: 8 }}>{detail.title || 'Untitled review'}</p>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--c-text-muted)', marginBottom: 14 }}>&ldquo;{detail.content}&rdquo;</p>
                  <p style={{ fontSize: 12, color: 'var(--c-text)', marginBottom: 6 }}>
                    <strong>{detail.author_display || detail.author_name}</strong> · {detail.author_email || 'No email'}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--c-text-muted)', margin: 0 }}>
                    {[detail.author_phone, detail.location, detail.company].filter(Boolean).join(' · ') || 'No extra profile info'}
                  </p>
                  {detail.approved_at && (
                    <p style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 12 }}>Published {fmt(detail.approved_at)}</p>
                  )}
                </div>

                <div style={{ background: 'white', border: '1px solid var(--c-border)', borderRadius: 10, padding: '18px 18px' }}>
                  <div style={{ marginBottom: 12 }}>
                    <label className="form-label" htmlFor="review-category">Category</label>
                    <select id="review-category" className="form-input" value={form.category_id} onChange={e => set('category_id', e.target.value)}>
                      <option value="">Uncategorised</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label className="form-label" htmlFor="review-order">Display Order</label>
                    <input id="review-order" className="form-input" type="number" value={form.display_order} onChange={e => set('display_order', e.target.value)} />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontWeight: 600, color: 'var(--c-text)', marginBottom: 14 }}>
                    <input type="checkbox" checked={form.is_verified} onChange={e => set('is_verified', e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--c-primary)' }} />
                    Mark reviewer as verified
                  </label>
                  <div>
                    <label className="form-label" htmlFor="review-response">Company Response</label>
                    <textarea id="review-response" rows={5} className="form-input" value={form.response} onChange={e => set('response', e.target.value)}
                      placeholder="Add a response from Material Wear..." style={{ resize: 'vertical' }} />
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', border: '1px solid var(--c-border)', borderRadius: 10, padding: '18px 18px', marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text)', marginBottom: 3 }}>Attachments</p>
                    <p style={{ fontSize: 11, color: 'var(--c-text-muted)', margin: 0 }}>This is wired to the testimonials media endpoints for upload, edit, and removal.</p>
                  </div>
                  <div>
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      style={{ fontSize: 12, fontWeight: 700, padding: '8px 14px', borderRadius: 6, background: 'var(--c-primary)', color: 'white', border: 'none', cursor: 'pointer', opacity: uploading ? 0.7 : 1 }}>
                      {uploading ? 'Uploading…' : '+ Add Attachment'}
                    </button>
                    <input ref={fileInputRef} type="file" onChange={uploadMedia} style={{ display: 'none' }} />
                  </div>
                </div>

                {mediaItems.length === 0 ? (
                  <p style={{ fontSize: 12, color: 'var(--c-text-muted)', margin: 0 }}>No attachments on this review yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {mediaItems.map(media => (
                      <div key={media.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 12, alignItems: 'center', border: '1px solid var(--c-border)', borderRadius: 8, padding: '10px 12px' }}>
                        {String(media.media_type).toLowerCase() === 'image'
                          ? <img src={getMediaUrl(media)} alt={media.title || ''} style={{ width: 80, height: 64, objectFit: 'cover', borderRadius: 6 }} />
                          : <a href={getMediaUrl(media)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--c-primary)', textDecoration: 'none' }}>Open file ↗</a>
                        }
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr auto', gap: 10, alignItems: 'center' }}>
                          <input className="form-input" value={media.title || ''} onChange={e => updateMediaDraft(media.id, 'title', e.target.value)} placeholder="Attachment title" />
                          <input className="form-input" type="number" value={media.order ?? 0} onChange={e => updateMediaDraft(media.id, 'order', e.target.value)} placeholder="Order" />
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--c-text-muted)' }}>
                            <input type="checkbox" checked={!!media.is_primary} onChange={e => updateMediaDraft(media.id, 'is_primary', e.target.checked)}
                              style={{ width: 15, height: 15, accentColor: 'var(--c-primary)' }} />
                            Primary
                          </label>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => updateMedia(media)}
                            style={{ fontSize: 11, fontWeight: 700, padding: '6px 10px', borderRadius: 6, background: '#d1fae5', color: '#065f46', border: 'none', cursor: 'pointer' }}>
                            Save
                          </button>
                          <button onClick={() => deleteMedia(media.id)}
                            style={{ fontSize: 11, fontWeight: 700, padding: '6px 10px', borderRadius: 6, background: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer' }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <button onClick={deleteReview} disabled={saving}
                  style={{ fontSize: 12, fontWeight: 700, padding: '9px 14px', borderRadius: 6, background: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                  Delete Review
                </button>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={onClose}
                    style={{ fontSize: 12, fontWeight: 600, padding: '9px 14px', borderRadius: 6, background: 'white', color: 'var(--c-text)', border: '1px solid var(--c-border)', cursor: 'pointer' }}>
                    Close
                  </button>
                  <button onClick={save} disabled={saving}
                    style={{ fontSize: 12, fontWeight: 700, padding: '9px 16px', borderRadius: 6, background: 'var(--c-primary)', color: 'white', border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// ── Individual review row ─────────────────────────────────────────────────────

function ReviewRow({ t, selected, onSelect, onAction, onManage }) {
  const [busy, setBusy]         = useState(null)
  const [showReject, setReject] = useState(false)
  const [expanded, setExpanded] = useState(false)

  async function act(action, payload = {}) {
    setBusy(action)
    try {
      if (action === 'approve')   await api.post(`/testimonials/testimonials/${t.id}/approve/`, {})
      if (action === 'feature')   await api.post(`/testimonials/testimonials/${t.id}/feature/`, {})
      if (action === 'reject')    await api.post(`/testimonials/testimonials/${t.id}/reject/`, { reason: payload.reason || '' })
      if (action === 'archive')   await api.post('/testimonials/testimonials/bulk_action/', { action: 'archive', testimonial_ids: [t.id] })
      if (action === 'rm_avatar') await api.delete(`/testimonials/testimonials/${t.id}/remove_avatar/`)
      onAction(t.id, action)
    } catch (e) { alert(e.message || 'Action failed') }
    finally { setBusy(null) }
  }

  const st      = STATUS_BADGE[t.status] || STATUS_BADGE.archived
  const initials = (t.author_display || t.author_name || '?')[0].toUpperCase()

  return (
    <>
      {showReject && (
        <RejectModal
          onConfirm={async reason => { await act('reject', { reason }); setReject(false) }}
          onClose={() => setReject(false)}
          busy={busy === 'reject'}
        />
      )}

      <div style={{ background: 'white', border: `1px solid ${selected ? 'var(--c-primary)' : 'var(--c-border)'}`, borderRadius: 8, padding: '18px 20px', transition: 'border-color .15s', boxShadow: selected ? '0 0 0 2px rgba(6,78,59,0.12)' : 'none' }}>

        {/* Top row */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
          {/* Checkbox */}
          <input type="checkbox" checked={selected} onChange={() => onSelect(t.id)}
            style={{ width: 16, height: 16, accentColor: 'var(--c-primary)', cursor: 'pointer', marginTop: 2, flexShrink: 0 }} />

          {/* Avatar */}
          {t.avatar
            ? <img src={t.avatar} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            : <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--c-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
          }

          {/* Author info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text)' }}>{t.author_display || t.author_name}</span>
              {t.is_verified && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: 'rgba(6,78,59,0.08)', color: 'var(--c-primary)' }}>Verified ✓</span>}
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: st.bg, color: st.color }}>
                {t.status_display || t.status}
              </span>
              {t.category && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' }}>{t.category.name}</span>}
            </div>
            <p style={{ fontSize: 11, color: 'var(--c-text-muted)', margin: '3px 0 0' }}>
              {t.author_email}
              {t.author_phone ? ` · ${t.author_phone}` : ''}
              {t.location ? ` · ${t.location}` : ''}
              {t.company  ? ` · ${t.company}`  : ''}
            </p>
            {t.social_media && (t.social_media.instagram || t.social_media.twitter) && (
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                {t.social_media.instagram && (
                  <a href={t.social_media.instagram.startsWith('http') ? t.social_media.instagram : `https://${t.social_media.instagram}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 10, fontWeight: 700, color: '#E1306C', textDecoration: 'none' }}>
                    IG ↗
                  </a>
                )}
                {t.social_media.twitter && (
                  <a href={t.social_media.twitter.startsWith('http') ? t.social_media.twitter : `https://${t.social_media.twitter}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 10, fontWeight: 700, color: '#000', textDecoration: 'none' }}>
                    𝕏 ↗
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Rating + date */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <Stars rating={t.rating} />
            <p style={{ fontSize: 10, color: 'var(--c-text-muted)', marginTop: 4 }}>{fmt(t.created_at)}</p>
          </div>
        </div>

        {/* Content preview */}
        {t.title && <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text)', marginBottom: 4 }}>{t.title}</p>}
        <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--c-text-muted)', marginBottom: 8,
          overflow: expanded ? 'visible' : 'hidden', display: expanded ? 'block' : '-webkit-box',
          WebkitLineClamp: expanded ? 'none' : 3, WebkitBoxOrient: 'vertical' }}>
          &ldquo;{t.content}&rdquo;
        </p>
        {t.content.length > 180 && (
          <button onClick={() => setExpanded(v => !v)} style={{ fontSize: 11, color: 'var(--c-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 8, fontWeight: 600 }}>
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}

        {/* Rejection reason */}
        {t.rejection_reason && (
          <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 6, padding: '8px 12px', marginBottom: 8 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', marginBottom: 2 }}>Rejection reason:</p>
            <p style={{ fontSize: 11, color: '#991b1b', margin: 0 }}>{t.rejection_reason}</p>
          </div>
        )}

        {/* Avatar remove */}
        {t.avatar && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <img src={t.avatar} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
            <button onClick={() => act('rm_avatar')} disabled={!!busy}
              style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0, opacity: busy === 'rm_avatar' ? 0.5 : 1 }}>
              {busy === 'rm_avatar' ? 'Removing…' : '✕ Remove avatar'}
            </button>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 10, borderTop: '1px solid var(--c-border)' }}>
          {(t.status === 'pending' || t.status === 'rejected') && (
            <button onClick={() => act('approve')} disabled={!!busy}
              style={{ fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 6, background: '#d1fae5', color: '#065f46', border: 'none', cursor: 'pointer', opacity: busy === 'approve' ? 0.6 : 1 }}>
              {busy === 'approve' ? '…' : '✓ Approve'}
            </button>
          )}
          {(t.status === 'pending' || t.status === 'approved') && (
            <button onClick={() => act('feature')} disabled={!!busy}
              style={{ fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 6, background: 'rgba(6,78,59,0.1)', color: 'var(--c-primary)', border: 'none', cursor: 'pointer', opacity: busy === 'feature' ? 0.6 : 1 }}>
              {busy === 'feature' ? '…' : '★ Feature'}
            </button>
          )}
          {t.status !== 'rejected' && t.status !== 'archived' && (
            <button onClick={() => setReject(true)} disabled={!!busy}
              style={{ fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 6, background: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer' }}>
              ✕ Reject
            </button>
          )}
          {t.status !== 'archived' && (
            <button onClick={() => act('archive')} disabled={!!busy}
              style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 6, background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb', cursor: 'pointer', opacity: busy === 'archive' ? 0.6 : 1 }}>
              {busy === 'archive' ? '…' : 'Archive'}
            </button>
          )}
          <button onClick={() => onManage(t.id)}
            style={{ fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 6, background: 'white', color: 'var(--c-primary)', border: '1px solid rgba(6,78,59,0.18)', cursor: 'pointer' }}>
            Manage
          </button>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: 'var(--c-text-muted)', alignSelf: 'center' }}>
            {t.source_display ? `via ${t.source_display}` : ''}{t.approved_at ? `  ·  published ${fmt(t.approved_at)}` : ''}
          </span>
        </div>
      </div>
    </>
  )
}

// ── Stats strip ───────────────────────────────────────────────────────────────

function StatsStrip({ stats }) {
  if (!stats) return null
  const items = [
    { label: 'Pending',  value: stats.pending,  bg: '#fef3c7', color: '#92400e', border: '#f59e0b' },
    { label: 'Approved', value: stats.approved, bg: '#d1fae5', color: '#065f46', border: '#34d399' },
    { label: 'Featured', value: stats.featured, bg: 'rgba(6,78,59,0.1)', color: 'var(--c-primary)', border: 'var(--c-primary)' },
    { label: 'Rejected', value: stats.rejected, bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
    { label: 'Total',    value: stats.total,    bg: 'white',  color: 'var(--c-text)', border: 'var(--c-border)' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 10, marginBottom: 28 }}>
      {items.map(({ label, value, bg, color, border }) => (
        <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '14px 10px', textAlign: 'center' }}>
          <p className="font-display" style={{ fontSize: 24, fontWeight: 700, color, margin: 0 }}>{value ?? '—'}</p>
          <p style={{ fontSize: 10, fontWeight: 700, color, margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        </div>
      ))}
    </div>
  )
}

// ── Categories tab ────────────────────────────────────────────────────────────

function CategoriesTab({ catStats }) {
  const [cats,     setCats]     = useState([])
  const [loading,  setLoading]  = useState(true)
  const [editId,   setEditId]   = useState(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [newName,  setNewName]  = useState('')
  const [newDesc,  setNewDesc]  = useState('')
  const [creating, setCreating] = useState(false)
  const [busy,     setBusy]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get('/testimonials/categories/')
      setCats(Array.isArray(data) ? data : (data.results || []))
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function create() {
    if (!newName.trim()) return
    setBusy('create')
    try {
      await api.post('/testimonials/categories/', { name: newName.trim(), description: newDesc.trim() || undefined })
      setNewName(''); setNewDesc(''); setCreating(false)
      load()
    } catch (e) { alert(e.message || 'Create failed') }
    finally { setBusy(null) }
  }

  async function saveEdit(id) {
    setBusy(`edit-${id}`)
    try {
      await api.patch(`/testimonials/categories/${id}/`, { name: editName.trim(), description: editDesc.trim() || undefined })
      setEditId(null); load()
    } catch (e) { alert(e.message || 'Update failed') }
    finally { setBusy(null) }
  }

  async function toggleActive(cat) {
    setBusy(`toggle-${cat.id}`)
    try {
      await api.patch(`/testimonials/categories/${cat.id}/`, { is_active: !cat.is_active })
      load()
    } catch (e) { alert(e.message || 'Toggle failed') }
    finally { setBusy(null) }
  }

  async function del(id) {
    if (!confirm('Delete this category? Reviews in it will become uncategorised.')) return
    setBusy(`del-${id}`)
    try { await api.delete(`/testimonials/categories/${id}/`); load() }
    catch (e) { alert(e.message || 'Delete failed') }
    finally { setBusy(null) }
  }

  return (
    <div>
      {/* Category-level stats from /categories/stats/ */}
      {catStats && catStats.length > 0 && (
        <div style={{ marginBottom: 20, padding: '14px 18px', background: 'white', border: '1px solid var(--c-border)', borderRadius: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--c-text-muted)', marginBottom: 10 }}>Reviews per category</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {catStats.map(cs => (
              <div key={cs.id ?? cs.name} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 99, background: 'var(--c-bg-warm)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}>
                <span style={{ fontWeight: 700 }}>{cs.name}</span>
                <span style={{ color: 'var(--c-text-muted)', marginLeft: 6 }}>{cs.testimonials_count ?? cs.count ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add new */}
      {!creating ? (
        <button onClick={() => setCreating(true)}
          style={{ fontSize: 13, fontWeight: 700, padding: '9px 20px', borderRadius: 6, background: 'var(--c-primary)', color: 'white', border: 'none', cursor: 'pointer', marginBottom: 20 }}>
          + New Category
        </button>
      ) : (
        <div style={{ background: 'white', border: '1px solid var(--c-primary)', borderRadius: 8, padding: '18px 20px', marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-primary)', marginBottom: 14 }}>New Category</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label className="form-label" htmlFor="cat-name">Name *</label>
              <input id="cat-name" className="form-input" placeholder="e.g. Products" value={newName} onChange={e => setNewName(e.target.value)} />
            </div>
            <div>
              <label className="form-label" htmlFor="cat-desc">Description</label>
              <input id="cat-desc" className="form-input" placeholder="Optional description" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={create} disabled={!newName.trim() || busy === 'create'}
              style={{ fontSize: 12, fontWeight: 700, padding: '7px 18px', borderRadius: 6, background: 'var(--c-primary)', color: 'white', border: 'none', cursor: 'pointer', opacity: busy === 'create' ? 0.7 : 1 }}>
              {busy === 'create' ? 'Creating…' : 'Create'}
            </button>
            <button onClick={() => { setCreating(false); setNewName(''); setNewDesc('') }}
              style={{ fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 6, background: 'white', color: 'var(--c-text)', border: '1px solid var(--c-border)', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Spinner />
        </div>
      ) : cats.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', border: '1px solid var(--c-border)', borderRadius: 8 }}>
          <p style={{ fontSize: 13, color: 'var(--c-text-muted)' }}>No categories yet. Create one above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cats.map(cat => (
            <div key={cat.id} style={{ background: 'white', border: '1px solid var(--c-border)', borderRadius: 8, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              {editId === cat.id ? (
                <>
                  <input className="form-input" value={editName} onChange={e => setEditName(e.target.value)} style={{ flex: 1 }} placeholder="Category name" />
                  <input className="form-input" value={editDesc} onChange={e => setEditDesc(e.target.value)} style={{ flex: 2 }} placeholder="Description" />
                  <button onClick={() => saveEdit(cat.id)} disabled={busy === `edit-${cat.id}`}
                    style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 6, background: 'var(--c-primary)', color: 'white', border: 'none', cursor: 'pointer', opacity: busy === `edit-${cat.id}` ? 0.7 : 1 }}>
                    Save
                  </button>
                  <button onClick={() => setEditId(null)}
                    style={{ fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 6, background: 'white', color: 'var(--c-text)', border: '1px solid var(--c-border)', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text)' }}>{cat.name}</span>
                      {!cat.is_active && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#f3f4f6', color: '#6b7280' }}>Inactive</span>}
                      {cat.testimonials_count != null && <span style={{ fontSize: 10, color: 'var(--c-text-muted)' }}>{cat.testimonials_count} reviews</span>}
                    </div>
                    {cat.description && <p style={{ fontSize: 11, color: 'var(--c-text-muted)', margin: 0 }}>{cat.description}</p>}
                  </div>
                  <button onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditDesc(cat.description || '') }}
                    style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 6, background: '#f3f4f6', color: 'var(--c-text)', border: 'none', cursor: 'pointer' }}>
                    Edit
                  </button>
                  <button onClick={() => toggleActive(cat)} disabled={busy === `toggle-${cat.id}`}
                    style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 6, background: cat.is_active ? '#fef3c7' : '#d1fae5', color: cat.is_active ? '#92400e' : '#065f46', border: 'none', cursor: 'pointer', opacity: busy === `toggle-${cat.id}` ? 0.6 : 1 }}>
                    {cat.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => del(cat.id)} disabled={busy === `del-${cat.id}`}
                    style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 6, background: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer', opacity: busy === `del-${cat.id}` ? 0.6 : 1 }}>
                    Delete
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const REVIEW_TABS = [
  { label: 'Pending',  value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Featured', value: 'featured' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'All',      value: null },
]
const MAIN_TABS = ['Reviews', 'Categories']

export default function TestimonialsAdmin() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()

  // Auth guard early return
  const [mainTab, setMainTab]   = useState('Reviews')
  const [revTab,  setRevTab]    = useState('pending')
  const [items,   setItems]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [hasMore, setHasMore]   = useState(false)
  const [page,    setPage]      = useState(1)
  const [loadingMore, setLM]    = useState(false)
  const [stats,   setStats]     = useState(null)
  const [catStats, setCatStats] = useState([])
  const [categories, setCategories] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [bulkBusy, setBulkBusy] = useState(null)
  const [showBulkReject, setShowBulkReject] = useState(false)
  const [detailId, setDetailId] = useState(null)
  const sentinelRef = useRef(null)

  useEffect(() => { document.title = 'Reviews Admin — Material Wear' }, [])

  // fetch stats from two endpoints
  const loadStats = useCallback(async () => {
    try {
      const s = await api.get('/testimonials/testimonials/stats/')
      // API returns: { total, status_distribution: { pending: { count, label, percentage }, ... }, avg_rating, ... }
      const sd = s.status_distribution || {}
      setStats({
        total:    s.total    ?? s.total_count ?? null,
        pending:  sd.pending?.count  ?? s.pending_count  ?? null,
        approved: sd.approved?.count ?? s.approved_count ?? null,
        featured: sd.featured?.count ?? s.featured_count ?? null,
        rejected: sd.rejected?.count ?? s.rejected_count ?? null,
      })
    } catch { /* non-critical */ }
    try {
      const cs = await api.get('/testimonials/categories/stats/')
      setCatStats(Array.isArray(cs) ? cs : (cs.results || []))
    } catch { /* non-critical */ }
  }, [])

  const loadCategories = useCallback(async () => {
    try {
      const data = await api.get('/testimonials/categories/')
      setCategories(Array.isArray(data) ? data : (data.results || []))
    } catch { /* non-critical */ }
  }, [])

  const loadReviews = useCallback(async (tab, pg = 1) => {
    if (pg === 1) { setLoading(true); setItems([]); setHasMore(false) }
    try {
      const params = new URLSearchParams({ ordering: '-created_at', page_size: 15 })
      if (tab) params.set('status', tab)
      params.set('page', pg)
      const data = await api.get(`/testimonials/testimonials/?${params}`)
      const results = Array.isArray(data) ? data : (data.results || [])
      setItems(prev => pg === 1 ? results : [...prev, ...results])
      setHasMore(!!(Array.isArray(data) ? false : data.next))
      setPage(pg)
    } catch { /* silent */ }
    finally { setLoading(false); setLM(false) }
  }, [])

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.is_staff) {
      loadStats()
      loadCategories()
    }
  }, [authLoading, isAuthenticated, user, loadStats, loadCategories])

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.is_staff && mainTab === 'Reviews') {
      setSelected(new Set())
      loadReviews(revTab, 1)
    }
  }, [revTab, mainTab, authLoading, isAuthenticated, user, loadReviews])

  // infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !loadingMore) {
        setLM(true)
        loadReviews(revTab, page + 1)
      }
    }, { rootMargin: '200px' })
    obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  }, [hasMore, loadingMore, page, revTab, loadReviews])

  function handleAction(id, action) {
    // Remove from list if it no longer belongs in this tab
    if (revTab !== null && !['rm_avatar'].includes(action)) {
      setItems(prev => prev.filter(t => t.id !== id))
    } else {
      loadReviews(revTab, 1)
    }
    setSelected(prev => { const s = new Set(prev); s.delete(id); return s })
    loadStats()
  }

  function toggleSelect(id) {
    setSelected(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  function selectAll()   { setSelected(new Set(items.map(t => t.id))) }
  function selectNone()  { setSelected(new Set()) }

  function handleDeleted(id) {
    setItems(prev => prev.filter(t => t.id !== id))
    setSelected(prev => { const s = new Set(prev); s.delete(id); return s })
    loadStats()
  }

  async function bulkAction(action, payload = {}) {
    if (selected.size === 0) return
    setBulkBusy(action)
    try {
      await api.post('/testimonials/testimonials/bulk_action/', {
        action,
        testimonial_ids: [...selected],
        ...(payload.reason ? { reason: payload.reason } : {}),
      })
      setSelected(new Set())
      loadReviews(revTab, 1)
      loadStats()
    } catch (e) { alert(e.message || 'Bulk action failed') }
    finally { setBulkBusy(null) }
  }

  if (authLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!user?.is_staff)  return <Navigate to="/" replace />

  const allSelected   = items.length > 0 && selected.size === items.length
  const someSelected  = selected.size > 0

  return (
    <main style={{ flex: 1, background: 'var(--c-bg-warm)', minHeight: '80vh', padding: '36px 16px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {showBulkReject && (
          <BulkRejectModal
            count={selected.size}
            onConfirm={async reason => { await bulkAction('reject', { reason }); setShowBulkReject(false) }}
            onClose={() => setShowBulkReject(false)}
            busy={bulkBusy === 'reject'}
          />
        )}

        {detailId && (
          <ReviewDetailModal
            id={detailId}
            categories={categories}
            onClose={() => setDetailId(null)}
            onSaved={() => { loadStats(); loadReviews(revTab, 1) }}
            onDeleted={handleDeleted}
          />
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Link to="/admin" style={{ fontSize: 11, color: 'var(--c-text-muted)', textDecoration: 'none', display: 'inline-block', marginBottom: 6 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--c-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-muted)'}>
              ← Admin Dashboard
            </Link>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--c-text-muted)', marginBottom: 4 }}>Moderation</p>
            <h1 className="font-display" style={{ fontSize: 28, color: 'var(--c-primary)', margin: 0 }}>Customer Reviews</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => { loadStats(); loadReviews(revTab, 1) }}
              disabled={loading}
              style={{ fontSize: 12, fontWeight: 600, padding: '8px 14px', borderRadius: 6, border: '1px solid var(--c-border)', background: 'white', color: 'var(--c-text)', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
              ↻ Refresh
            </button>
            <Link to="/testimonials" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 6, border: '1px solid var(--c-border)', background: 'white', color: 'var(--c-text)', textDecoration: 'none' }}>
              View Public Page ↗
            </Link>
          </div>
        </div>

        <StatsStrip stats={stats} />

        {/* Main tab switcher: Reviews | Categories */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 24, background: 'var(--c-border)', borderRadius: 8, padding: 3, width: 'fit-content' }}>
          {MAIN_TABS.map(t => (
            <button key={t} onClick={() => setMainTab(t)}
              style={{ fontSize: 12, fontWeight: 700, padding: '7px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', transition: 'all .15s',
                background: mainTab === t ? 'white' : 'transparent',
                color: mainTab === t ? 'var(--c-primary)' : 'var(--c-text-muted)',
                boxShadow: mainTab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
              {t}
            </button>
          ))}
        </div>

        {mainTab === 'Categories' ? (
          <CategoriesTab catStats={catStats} />
        ) : (
          <>
            {/* Status tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 20, background: 'var(--c-border)', borderRadius: 8, padding: 3, width: 'fit-content' }}>
              {REVIEW_TABS.map(tab => (
                <button key={tab.label} onClick={() => setRevTab(tab.value)}
                  style={{ fontSize: 11, fontWeight: 700, padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', transition: 'all .15s',
                    background: revTab === tab.value ? 'white' : 'transparent',
                    color: revTab === tab.value ? 'var(--c-primary)' : 'var(--c-text-muted)',
                    boxShadow: revTab === tab.value ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Select all + bulk actions */}
            {items.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, padding: '10px 14px', background: someSelected ? 'rgba(6,78,59,0.04)' : 'transparent', borderRadius: 8, border: someSelected ? '1px solid rgba(6,78,59,0.15)' : '1px solid transparent', transition: 'all .2s', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--c-text)' }}>
                  <input type="checkbox" checked={allSelected} onChange={() => allSelected ? selectNone() : selectAll()}
                    style={{ width: 16, height: 16, accentColor: 'var(--c-primary)', cursor: 'pointer' }} />
                  {someSelected ? `${selected.size} selected` : 'Select all'}
                </label>

                {someSelected && (
                  <>
                    <span style={{ width: 1, height: 18, background: 'var(--c-border)' }} />
                    <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>Bulk:</span>
                    <button onClick={() => bulkAction('approve')} disabled={!!bulkBusy}
                      style={{ fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 6, background: '#d1fae5', color: '#065f46', border: 'none', cursor: 'pointer', opacity: bulkBusy === 'approve' ? 0.6 : 1 }}>
                      {bulkBusy === 'approve' ? '…' : '✓ Approve'}
                    </button>
                    <button onClick={() => bulkAction('feature')} disabled={!!bulkBusy}
                      style={{ fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 6, background: 'rgba(6,78,59,0.1)', color: 'var(--c-primary)', border: 'none', cursor: 'pointer', opacity: bulkBusy === 'feature' ? 0.6 : 1 }}>
                      {bulkBusy === 'feature' ? '…' : '★ Feature'}
                    </button>
                    <button onClick={() => setShowBulkReject(true)} disabled={!!bulkBusy}
                      style={{ fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 6, background: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer' }}>
                      ✕ Reject
                    </button>
                    <button onClick={() => bulkAction('archive')} disabled={!!bulkBusy}
                      style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 6, background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb', cursor: 'pointer', opacity: bulkBusy === 'archive' ? 0.6 : 1 }}>
                      {bulkBusy === 'archive' ? '…' : 'Archive'}
                    </button>
                    <button onClick={selectNone}
                      style={{ fontSize: 11, color: 'var(--c-text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}>
                      Clear selection
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Review list */}
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ background: 'white', border: '1px solid var(--c-border)', borderRadius: 8, padding: 20 }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                      <div className="taskel" style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div className="taskel" style={{ height: 14, width: 140, borderRadius: 4, marginBottom: 8 }} />
                        <div className="taskel" style={{ height: 11, width: 200, borderRadius: 4 }} />
                      </div>
                    </div>
                    <div className="taskel" style={{ height: 11, width: '100%', borderRadius: 4, marginBottom: 6 }} />
                    <div className="taskel" style={{ height: 11, width: '80%', borderRadius: 4 }} />
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', border: '1px solid var(--c-border)', borderRadius: 8 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)', marginBottom: 4 }}>No reviews here</p>
                <p style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>Switch tabs or check back later.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {items.map(t => (
                  <ReviewRow
                    key={t.id} t={t}
                    selected={selected.has(t.id)}
                    onSelect={toggleSelect}
                    onAction={handleAction}
                    onManage={setDetailId}
                  />
                ))}
              </div>
            )}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} />
            {loadingMore && <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}><Spinner /></div>}
            {!loading && !loadingMore && !hasMore && items.length > 0 && (
              <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--c-text-muted)', padding: '16px 0' }}>
                All {items.length} reviews shown ✓
              </p>
            )}
          </>
        )}
      </div>

      <style>{`
        .taskel { background: linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size:200% 100%; animation:taskel 1.4s infinite; }
        @keyframes taskel { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes taspin { to{transform:rotate(360deg)} }
      `}</style>
    </main>
  )
}
