import { useState, useEffect, useRef } from 'react'
import { api } from '../../services/api'

// ── helpers ───────────────────────────────────────────────────────────────────

function getDate(item) {
  return new Date(item._type === 'image' ? item.upload_date : item.published_at)
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60)     return 'Just now'
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function youtubeEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
}

// ── share helper ──────────────────────────────────────────────────────────────

async function shareItem(item) {
  const url  = item._type === 'image' ? (item.optimized_url || item.url) : item.url
  const title = item._type === 'video' ? (item.title || 'Material Wear Video') : 'Material Wear'
  const text  = item._type === 'video' ? item.description || '' : 'Check out this photo from Material Wear Limited'

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url })
      return
    } catch {
      // user cancelled or API unsupported — fall through to clipboard
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    return null
  }
}

// ── action bar ────────────────────────────────────────────────────────────────

function ActionBar({ item, openUrl }) {
  const [liked,       setLiked]       = useState(false)
  const [likes,       setLikes]       = useState(Math.floor(Math.random() * 48) + 2)
  const [shareLabel,  setShareLabel]  = useState(null)

  function handleLike() {
    setLiked(p => !p)
    setLikes(p => p + (liked ? -1 : 1))
  }

  async function handleShare() {
    const result = await shareItem(item)
    if (result === 'copied') {
      setShareLabel('Link copied!')
      setTimeout(() => setShareLabel(null), 2000)
    }
  }

  return (
    <>
      {/* Like count */}
      {likes > 0 && (
        <div
          className="flex items-center gap-1.5 px-4 py-1.5"
          style={{ borderTop: '1px solid var(--c-border)' }}
        >
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: '#1877F2' }}
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="white">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <span className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{likes}</span>
        </div>
      )}

      {/* Action buttons */}
      <div
        className="flex items-stretch border-t"
        style={{ borderColor: 'var(--c-border)' }}
      >
        {/* Like */}
        <ActionBtn
          onClick={handleLike}
          active={liked}
          activeColor="#1877F2"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24"
              fill={liked ? '#1877F2' : 'none'}
              stroke={liked ? '#1877F2' : 'currentColor'} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          }
          label={liked ? 'Liked' : 'Like'}
        />

        {/* Open/View */}
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors"
          style={{ color: 'var(--c-text-muted)', borderLeft: '1px solid var(--c-border)' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = 'var(--c-text)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text-muted)' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          {item._type === 'video' ? 'Watch' : 'View'}
        </a>

        {/* Share */}
        <ActionBtn
          onClick={handleShare}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          }
          label={shareLabel || 'Share'}
          borderLeft
        />
      </div>
    </>
  )
}

function ActionBtn({ onClick, active, activeColor, icon, label, borderLeft }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors"
      style={{
        color: active ? activeColor : 'var(--c-text-muted)',
        background: 'transparent',
        borderLeft: borderLeft ? '1px solid var(--c-border)' : 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; if (!active) e.currentTarget.style.color = 'var(--c-text)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; if (!active) e.currentTarget.style.color = 'var(--c-text-muted)' }}
    >
      {icon}
      {label}
    </button>
  )
}

// ── post components ───────────────────────────────────────────────────────────

function PostHeader({ avatarBg, avatarContent, name, date }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
        style={{ background: avatarBg }}
      >
        {avatarContent}
      </div>
      <div>
        <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>{name}</p>
        <div className="flex items-center gap-1">
          <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>{date}</p>
          <span style={{ color: 'var(--c-text-muted)', fontSize: 10 }}>·</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ color: 'var(--c-text-muted)' }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

function ImagePost({ item }) {
  const [expanded, setExpanded] = useState(false)
  const imgSrc = item.optimized_url || item.url

  return (
    <article style={cardStyle}>
      <PostHeader
        avatarBg="var(--c-primary)"
        avatarContent="MW"
        name="Material Wear Limited"
        date={formatDate(item.upload_date)}
      />

      {/* Image */}
      <div
        style={{ width: '100%', cursor: 'zoom-in', background: '#F3F4F6', overflow: 'hidden' }}
        onClick={() => setExpanded(true)}
      >
        <img
          src={imgSrc}
          alt="Material Wear"
          loading="lazy"
          style={{ width: '100%', display: 'block', maxHeight: 560, objectFit: 'cover' }}
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
      </div>

      <ActionBar item={item} openUrl={imgSrc} />

      {/* Lightbox */}
      {expanded && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setExpanded(false)}
        >
          <img
            src={imgSrc}
            alt="Material Wear"
            style={{ maxWidth: '92vw', maxHeight: '92vh', objectFit: 'contain', borderRadius: 4 }}
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setExpanded(false)}
            className="absolute top-4 right-4 text-white opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Close lightbox"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}
    </article>
  )
}

function VideoPost({ item }) {
  const [playing, setPlaying] = useState(false)

  return (
    <article style={cardStyle}>
      <PostHeader
        avatarBg="#FF0000"
        avatarContent={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23 7s-.3-1.9-1.2-2.7c-1.1-1.2-2.4-1.2-3-1.3C16.2 3 12 3 12 3s-4.2 0-6.8.2c-.6.1-1.9.1-3 1.3C1.3 5.3 1 7 1 7S.7 9 .7 11v1.9C.7 15 1 17 1 17s.3 1.9 1.2 2.7c1.1 1.2 2.6 1.2 3.3 1.2C7.2 21 12 21 12 21s4.2 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.7 1.2-2.7s.3-2 .3-4v-1.9C23.3 9 23 7 23 7zM9.7 15V9l6.5 3-6.5 3z"/>
          </svg>
        }
        name="Material Wear — YouTube"
        date={formatDate(item.published_at)}
      />

      {item.title && (
        <div className="px-4 pb-2">
          <p className="text-sm font-medium leading-snug" style={{ color: 'var(--c-text)' }}>{item.title}</p>
        </div>
      )}

      {/* 16:9 embed */}
      <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000', width: '100%' }}>
        {playing ? (
          <iframe
            src={youtubeEmbedUrl(item.id) + '&autoplay=1'}
            title={item.title || 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <div
            style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}
            onClick={() => setPlaying(true)}
          >
            {item.thumbnail
              ? <img src={item.thumbnail} alt={item.title || 'Thumbnail'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.currentTarget.style.display = 'none' }} />
              : <div style={{ width: '100%', height: '100%', background: '#111' }} />
            }
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
              justifyContent: 'center', background: 'rgba(0,0,0,0.25)'
            }}>
              <div style={{
                width: 68, height: 48, background: '#FF0000', borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                transition: 'transform 0.15s'
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {item.description && <TruncatedText text={item.description} />}

      <ActionBar item={item} openUrl={item.url} />
    </article>
  )
}

function TruncatedText({ text }) {
  const [expanded, setExpanded] = useState(false)
  const LIMIT = 120
  const isLong = text.length > LIMIT
  return (
    <div className="px-4 pt-2 pb-3">
      <p className="text-xs" style={{ color: 'var(--c-text-muted)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
        {expanded || !isLong ? text : text.slice(0, LIMIT) + '…'}
      </p>
      {isLong && (
        <button className="text-xs font-semibold mt-0.5" style={{ color: 'var(--c-primary)' }}
          onClick={() => setExpanded(p => !p)}>
          {expanded ? 'See less' : 'See more'}
        </button>
      )}
    </div>
  )
}

function PostSkeleton() {
  return (
    <div style={cardStyle}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-10 h-10 rounded-full skeleton" />
        <div className="flex-1">
          <div className="skeleton h-3.5 w-36 mb-2" style={{ borderRadius: 4 }} />
          <div className="skeleton h-3 w-24" style={{ borderRadius: 4 }} />
        </div>
      </div>
      <div className="skeleton w-full" style={{ height: 320 }} />
      <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--c-border)' }}>
        <div className="flex gap-4">
          <div className="skeleton h-3 w-12" style={{ borderRadius: 4 }} />
          <div className="skeleton h-3 w-12" style={{ borderRadius: 4 }} />
          <div className="skeleton h-3 w-12" style={{ borderRadius: 4 }} />
        </div>
      </div>
    </div>
  )
}

const cardStyle = {
  background: 'white',
  border: '1px solid var(--c-border)',
  borderRadius: 8,
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
}

// ── sentinel for infinite scroll ──────────────────────────────────────────────

function InfiniteScrollSentinel({ onIntersect }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) onIntersect() },
      { rootMargin: '200px' }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [onIntersect])
  return <div ref={ref} />
}

// ── main page ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8

export default function FeedPage() {
  const [items,       setItems]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [page,        setPage]        = useState(1)
  const [hasMore,     setHasMore]     = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const allItems = useRef([])

  useEffect(() => {
    document.title = 'Feed — Material Wear Limited'
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    setError(null)
    try {
      const [images, videos] = await Promise.all([
        api.get('/feed/images/').catch(() => []),
        api.get('/feed/youtube/').catch(() => []),
      ])

      const tagged = [
        ...(Array.isArray(images) ? images : []).map(img => ({ ...img, _type: 'image' })),
        ...(Array.isArray(videos) ? videos : []).map(vid => ({ ...vid, _type: 'video' })),
      ]
      tagged.sort((a, b) => getDate(b) - getDate(a))

      allItems.current = tagged
      setItems(tagged.slice(0, PAGE_SIZE))
      setHasMore(tagged.length > PAGE_SIZE)
      setPage(1)
    } catch (e) {
      setError(e?.data?.detail || e?.message || 'Failed to load feed')
    } finally {
      setLoading(false)
    }
  }

  function loadMore() {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const nextPage = page + 1
    const nextItems = allItems.current.slice(0, nextPage * PAGE_SIZE)
    setItems(nextItems)
    setPage(nextPage)
    setHasMore(nextItems.length < allItems.current.length)
    setLoadingMore(false)
  }

  return (
    <main
      className="flex-1 py-6 px-4"
      style={{ background: 'var(--c-bg-warm)', minHeight: '100vh' }}
    >
      {/* Header */}
      <div className="max-w-[620px] mx-auto mb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="section-eyebrow">Latest from</p>
            <h1 className="font-display text-2xl font-semibold" style={{ color: 'var(--c-primary)' }}>
              Material Wear Feed
            </h1>
          </div>
          {!loading && (
            <button
              onClick={fetchAll}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 transition-colors"
              style={{ border: '1px solid var(--c-border)', borderRadius: 6, color: 'var(--c-text-muted)', background: 'white' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--c-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-muted)'}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-[620px] mx-auto mb-4">
          <div className="flex items-center gap-3 p-4"
            style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-sm flex-1" style={{ color: '#DC2626' }}>{error}</p>
            <button onClick={fetchAll} className="text-xs font-semibold" style={{ color: '#DC2626' }}>
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Skeletons */}
      {loading && (
        <div className="max-w-[620px] mx-auto space-y-4">
          {[1, 2, 3].map(i => <PostSkeleton key={i} />)}
        </div>
      )}

      {/* Feed */}
      {!loading && !error && (
        <div className="max-w-[620px] mx-auto space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center"
              style={{ background: 'white', border: '1px solid var(--c-border)', borderRadius: 8 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
                style={{ color: 'var(--c-text-muted)', marginBottom: 12 }}>
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--c-text)' }}>No posts yet</p>
              <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Check back soon for photos and videos.</p>
            </div>
          ) : (
            <>
              {items.map(item =>
                item._type === 'image'
                  ? <ImagePost key={`img-${item.id}`} item={item} />
                  : <VideoPost key={`vid-${item.id}`} item={item} />
              )}

              {/* Infinite scroll sentinel */}
              {hasMore && (
                <>
                  <InfiniteScrollSentinel onIntersect={loadMore} />
                  {loadingMore && (
                    <div className="flex justify-center py-4">
                      <div style={{
                        width: 28, height: 28, border: '3px solid var(--c-border)',
                        borderTopColor: 'var(--c-primary)', borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite'
                      }} />
                    </div>
                  )}
                </>
              )}

              {!hasMore && items.length > 0 && (
                <p className="text-center text-xs py-8" style={{ color: 'var(--c-text-muted)' }}>
                  You're all caught up ✓
                </p>
              )}
            </>
          )}
        </div>
      )}

      <style>{`
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  )
}
