import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../../services/api'

const INITIAL_BATCH = 5
const LOAD_MORE_BATCH = 4

function getPostDate(item) {
  return new Date(item._type === 'image' ? item.upload_date : item.published_at)
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function youtubeEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
}

function normalizeMediaCollections(images, videos) {
  const imageItems = (Array.isArray(images) ? images : (images?.results || [])).map((img, index) => ({
    ...img,
    _type: 'image',
    _sortDate: getPostDate({ ...img, _type: 'image' }).getTime(),
    _seed: `${img.id}-${index}`,
  }))

  const videoItems = (Array.isArray(videos) ? videos : (videos?.results || [])).map((vid, index) => ({
    ...vid,
    _type: 'video',
    _sortDate: getPostDate({ ...vid, _type: 'video' }).getTime(),
    _seed: `${vid.id}-${index}`,
  }))

  return [...imageItems, ...videoItems]
}

function shuffleList(items) {
  const pool = [...items]
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool
}

function weightedMixedFeed(items) {
  const images = shuffleList(items.filter(item => item._type === 'image'))
  const videos = shuffleList(items.filter(item => item._type === 'video'))
  const mixed = []

  let imageRunTarget = 2 + Math.floor(Math.random() * 2)
  let imageRunCount = 0

  while (images.length > 0 || videos.length > 0) {
    const canPlaceVideo = videos.length > 0 && imageRunCount >= imageRunTarget
    const shouldForceImage = images.length > 0 && imageRunCount < imageRunTarget

    if (shouldForceImage || videos.length === 0) {
      mixed.push(images.shift())
      imageRunCount += 1
      continue
    }

    if (canPlaceVideo) {
      mixed.push(videos.shift())
      imageRunCount = 0
      imageRunTarget = 2 + Math.floor(Math.random() * 2)
      continue
    }

    if (images.length > 0) {
      mixed.push(images.shift())
      imageRunCount += 1
    } else {
      mixed.push(videos.shift())
      imageRunCount = 0
      imageRunTarget = 2 + Math.floor(Math.random() * 2)
    }
  }

  return mixed.filter(Boolean)
}

async function shareItem(item) {
  const url = item._type === 'image' ? (item.optimized_url || item.url) : item.url
  const title = item._type === 'video' ? (item.title || 'Material Wear Video') : 'Material Wear'
  const text = item._type === 'video'
    ? (item.description || 'Watch this from Material Wear Limited.')
    : 'Check out this image from Material Wear Limited.'

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url })
      return
    } catch {
      // fall back to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    return null
  }
}

function useInViewPlayback() {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!ref.current) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting && entry.intersectionRatio > 0.55),
      { threshold: [0.15, 0.55, 0.8] }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return { ref, inView }
}

function FeedShell({ children }) {
  return (
    <main className="flex-1 px-4 py-6 sm:px-6" style={{ background: 'linear-gradient(180deg, #F5F1E8 0%, #EEE7DA 100%)', minHeight: '100vh' }}>
      <div className="mx-auto max-w-[760px]">
        {children}
      </div>
    </main>
  )
}

function FeedHeader({ onRefresh, refreshing, totalLoaded, totalAvailable }) {
  return (
    <div className="mb-6 overflow-hidden rounded-xl" style={{ background: 'white', border: '1px solid rgba(6,78,59,0.12)', boxShadow: '0 10px 30px rgba(47,41,31,0.08)' }}>
      <div className="px-5 py-5 sm:px-6" style={{ background: 'radial-gradient(circle at top left, rgba(6,78,59,0.1), transparent 48%), linear-gradient(135deg, #F8F4EC 0%, #FFFFFF 100%)' }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-eyebrow">For You</p>
            <h1 className="font-display text-2xl font-semibold sm:text-3xl" style={{ color: 'var(--c-primary)' }}>
              Material Wear Feed
            </h1>
            <p className="mt-2 max-w-xl text-sm" style={{ color: 'var(--c-text-muted)' }}>
              A scrollable stream of campaign visuals and videos, shuffled together so each pass feels fresh.
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors"
            style={{ background: 'white', color: 'var(--c-primary)', border: '1px solid rgba(6,78,59,0.14)', borderRadius: 999 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            {refreshing ? 'Refreshing…' : 'Shuffle Feed'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-5 py-3 text-xs sm:px-6" style={{ borderTop: '1px solid var(--c-border)', color: 'var(--c-text-muted)' }}>
        <span>{totalLoaded} visible</span>
        <span>•</span>
        <span>{totalAvailable} available</span>
        <span>•</span>
        <span>mixed photos + videos</span>
      </div>
    </div>
  )
}

function PostHeader({ accent, badge, title, subtitle, date }) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ background: accent }}
      >
        {badge}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold" style={{ color: 'var(--c-text)' }}>{title}</p>
        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--c-text-muted)' }}>
          <span>{subtitle}</span>
          <span>•</span>
          <span>{date}</span>
        </div>
      </div>
    </div>
  )
}

function PostActions({ item, primaryUrl }) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(Math.floor(Math.random() * 140) + 12)
  const [shareLabel, setShareLabel] = useState('Share')

  function toggleLike() {
    setLiked(prev => !prev)
    setLikes(prev => prev + (liked ? -1 : 1))
  }

  async function handleShare() {
    const result = await shareItem(item)
    if (result === 'copied') {
      setShareLabel('Link copied')
      setTimeout(() => setShareLabel('Share'), 1800)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 text-xs sm:px-5" style={{ borderTop: '1px solid var(--c-border)', color: 'var(--c-text-muted)' }}>
        <span>{likes} likes</span>
        <span>{item._type === 'video' ? 'Video post' : 'Photo post'}</span>
      </div>
      <div className="grid grid-cols-3" style={{ borderTop: '1px solid var(--c-border)' }}>
        <button
          onClick={toggleLike}
          className="inline-flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-colors"
          style={{ color: liked ? '#1877F2' : 'var(--c-text-muted)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? '#1877F2' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {liked ? 'Liked' : 'Like'}
        </button>
        <a
          href={primaryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-colors"
          style={{ borderLeft: '1px solid var(--c-border)', borderRight: '1px solid var(--c-border)', color: 'var(--c-text-muted)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h6v6" />
            <path d="M10 14 21 3" />
            <path d="M21 14v7H3V3h7" />
          </svg>
          Open
        </a>
        <button
          onClick={handleShare}
          className="inline-flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition-colors"
          style={{ color: 'var(--c-text-muted)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          {shareLabel}
        </button>
      </div>
    </>
  )
}

function ImagePost({ item }) {
  const [expanded, setExpanded] = useState(false)
  const imageUrl = item.optimized_url || item.url
  const { ref, inView } = useInViewPlayback()

  return (
    <article ref={ref} className="overflow-hidden rounded-xl" style={{ background: 'white', border: '1px solid rgba(47,41,31,0.08)', boxShadow: inView ? '0 16px 40px rgba(47,41,31,0.14)' : '0 8px 24px rgba(47,41,31,0.08)', transition: 'box-shadow .2s ease' }}>
      <PostHeader
        accent="var(--c-primary)"
        badge="MW"
        title="Material Wear Limited"
        subtitle="Editorial photo"
        date={formatDate(item.upload_date)}
      />

      <div className="relative cursor-zoom-in" onClick={() => setExpanded(true)} style={{ background: '#F3F4F6' }}>
        <img
          src={imageUrl}
          alt="Material Wear"
          loading="lazy"
          style={{ width: '100%', display: 'block', maxHeight: 780, objectFit: 'cover' }}
        />
        <div className="absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide" style={{ background: 'rgba(255,255,255,0.92)', color: 'var(--c-primary)' }}>
          Photo
        </div>
      </div>

      <div className="px-4 py-3 text-sm sm:px-5" style={{ color: 'var(--c-text-muted)' }}>
        Fresh from the Material Wear visual stream. Tap to view larger.
      </div>

      <PostActions item={item} primaryUrl={imageUrl} />

      {expanded && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.92)' }} onClick={() => setExpanded(false)}>
          <img
            src={imageUrl}
            alt="Material Wear"
            style={{ maxWidth: '92vw', maxHeight: '92vh', objectFit: 'contain', borderRadius: 8 }}
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setExpanded(false)}
            className="absolute right-4 top-4 text-white"
            aria-label="Close lightbox"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </article>
  )
}

function VideoPost({ item }) {
  const [playing, setPlaying] = useState(false)
  const { ref, inView } = useInViewPlayback()

  return (
    <article ref={ref} className="overflow-hidden rounded-xl" style={{ background: 'white', border: '1px solid rgba(47,41,31,0.08)', boxShadow: inView ? '0 16px 40px rgba(47,41,31,0.14)' : '0 8px 24px rgba(47,41,31,0.08)', transition: 'box-shadow .2s ease' }}>
      <PostHeader
        accent="#FF0000"
        badge="YT"
        title="Material Wear Studio"
        subtitle="Video update"
        date={formatDate(item.published_at)}
      />

      {item.title && (
        <div className="px-4 pb-2 text-sm font-semibold sm:px-5" style={{ color: 'var(--c-text)' }}>
          {item.title}
        </div>
      )}

      <div style={{ position: 'relative', paddingBottom: '115%', background: '#090909', width: '100%' }}>
        {playing ? (
          <iframe
            src={youtubeEmbedUrl(item.id)}
            title={item.title || 'Material Wear video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="absolute inset-0 w-full text-left"
            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            {item.thumbnail ? (
              <img
                src={item.thumbnail}
                alt={item.title || 'Video thumbnail'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.92 }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: '#111' }} />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.45))' }} />
            <div className="absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide" style={{ background: 'rgba(255,255,255,0.92)', color: '#991B1B' }}>
              Video
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>
                <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: '#FF0000', boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                    <polygon points="8 5 19 12 8 19 8 5" />
                  </svg>
                </div>
              </div>
            </div>
          </button>
        )}
      </div>

      {item.description && <TruncatedText text={item.description} />}

      <PostActions item={item} primaryUrl={item.url} />
    </article>
  )
}

function TruncatedText({ text }) {
  const [expanded, setExpanded] = useState(false)
  const limit = 140
  const isLong = text.length > limit

  return (
    <div className="px-4 pb-3 pt-3 text-sm sm:px-5">
      <p style={{ color: 'var(--c-text-muted)', whiteSpace: 'pre-line', lineHeight: 1.65 }}>
        {expanded || !isLong ? text : `${text.slice(0, limit)}…`}
      </p>
      {isLong && (
        <button
          className="mt-1 text-xs font-semibold"
          style={{ color: 'var(--c-primary)' }}
          onClick={() => setExpanded(prev => !prev)}
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  )
}

function PostSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl" style={{ background: 'white', border: '1px solid rgba(47,41,31,0.08)', boxShadow: '0 8px 24px rgba(47,41,31,0.08)' }}>
      <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
        <div className="feed-skeleton h-11 w-11 rounded-full" />
        <div className="flex-1">
          <div className="feed-skeleton mb-2 h-3.5 w-40 rounded" />
          <div className="feed-skeleton h-3 w-24 rounded" />
        </div>
      </div>
      <div className="feed-skeleton w-full" style={{ height: 520 }} />
      <div className="px-4 py-4 sm:px-5">
        <div className="feed-skeleton mb-2 h-3 w-1/3 rounded" />
        <div className="feed-skeleton h-3 w-2/3 rounded" />
      </div>
    </div>
  )
}

function InfiniteScrollSentinel({ onIntersect }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onIntersect()
      },
      { rootMargin: '300px' }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [onIntersect])

  return <div ref={ref} style={{ height: 1 }} />
}

export default function FeedPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const allItems = useRef([])
  const cursor = useRef(0)

  const appendBatch = useCallback((batchSize) => {
    if (loadingMore) return

    const nextSlice = allItems.current.slice(cursor.current, cursor.current + batchSize)
    cursor.current += nextSlice.length

    setItems(prev => [...prev, ...nextSlice])
    setHasMore(cursor.current < allItems.current.length)
  }, [loadingMore])

  const loadFeed = useCallback(async ({ reshuffle = false } = {}) => {
    if (reshuffle) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const [images, videos] = await Promise.all([
        api.get('/feed/images/').catch(() => []),
        api.get('/feed/youtube/').catch(() => []),
      ])

      const merged = normalizeMediaCollections(images, videos)
      const randomized = weightedMixedFeed(merged)

      allItems.current = randomized
      cursor.current = 0
      setItems([])
      setHasMore(false)

      const firstBatch = randomized.slice(0, INITIAL_BATCH)
      cursor.current = firstBatch.length
      setItems(firstBatch)
      setHasMore(cursor.current < randomized.length)
    } catch (e) {
      setError(e?.data?.detail || e?.message || 'Failed to load feed')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    document.title = 'Feed — Material Wear Limited'
    loadFeed()
  }, [loadFeed])

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return
    setLoadingMore(true)
    appendBatch(LOAD_MORE_BATCH)
    setLoadingMore(false)
  }, [appendBatch, hasMore, loadingMore])

  return (
    <FeedShell>
      <FeedHeader
        onRefresh={() => loadFeed({ reshuffle: true })}
        refreshing={refreshing}
        totalLoaded={items.length}
        totalAvailable={allItems.current.length}
      />

      {error && (
        <div className="mb-4 rounded-xl px-4 py-4" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <div className="flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="flex-1 text-sm" style={{ color: '#DC2626' }}>{error}</p>
            <button onClick={() => loadFeed()} className="text-xs font-semibold" style={{ color: '#DC2626' }}>
              Retry
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-5">
          {[1, 2, 3].map(id => <PostSkeleton key={id} />)}
        </div>
      ) : !error && (
        <div className="space-y-5">
          {items.length === 0 ? (
            <div className="rounded-xl px-8 py-20 text-center" style={{ background: 'white', border: '1px solid rgba(47,41,31,0.08)', boxShadow: '0 8px 24px rgba(47,41,31,0.08)' }}>
              <p className="mb-2 text-base font-semibold" style={{ color: 'var(--c-text)' }}>No posts yet</p>
              <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>Check back soon for a mix of fresh photos and videos.</p>
            </div>
          ) : (
            <>
              {items.map(item => (
                item._type === 'image'
                  ? <ImagePost key={`image-${item.id}`} item={item} />
                  : <VideoPost key={`video-${item.id}`} item={item} />
              ))}

              {hasMore && <InfiniteScrollSentinel onIntersect={loadMore} />}

              {loadingMore && (
                <div className="flex justify-center py-4">
                  <div style={{ width: 30, height: 30, border: '3px solid var(--c-border)', borderTopColor: 'var(--c-primary)', borderRadius: '50%', animation: 'feed-spin 0.7s linear infinite' }} />
                </div>
              )}

              {!hasMore && items.length > 0 && (
                <div className="py-6 text-center text-sm" style={{ color: 'var(--c-text-muted)' }}>
                  You&apos;re all caught up. Refresh to reshuffle the mix.
                </div>
              )}
            </>
          )}
        </div>
      )}

      <style>{`
        .feed-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: feed-shimmer 1.4s infinite;
        }
        @keyframes feed-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes feed-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </FeedShell>
  )
}
