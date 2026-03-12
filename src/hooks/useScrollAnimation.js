import { useEffect, useRef, useState } from 'react'

/**
 * useScrollReveal — attaches an IntersectionObserver to the returned ref.
 * Adds "visible" class when element enters the viewport.
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null)
  const { threshold = 0.15, rootMargin = '0px 0px -60px 0px' } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); observer.unobserve(el) } },
      { threshold, rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return ref
}

/**
 * useScrollRevealGroup — observes all children with a .reveal class
 * and stagger-reveals them when the parent enters view.
 */
export function useScrollRevealGroup(staggerMs = 120) {
  const ref = useRef(null)

  useEffect(() => {
    const parent = ref.current
    if (!parent) return
    const children = parent.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach((child, i) => {
            setTimeout(() => child.classList.add('visible'), i * staggerMs)
          })
          observer.unobserve(parent)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(parent)
    return () => observer.disconnect()
  }, [staggerMs])

  return ref
}

/**
 * useParallax — returns a ref. On scroll, applies a translateY offset
 * to create a parallax effect. `speed` controls intensity (0–1).
 */
export function useParallax(speed = 0.3) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const viewH = window.innerHeight
      const center = rect.top + rect.height / 2 - viewH / 2
      el.style.transform = `translateY(${center * speed}px)`
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [speed])

  return ref
}

/**
 * useScrollProgress — returns a 0–1 value representing scroll progress.
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return progress
}

/**
 * useScrollDirection — returns 'up' | 'down'
 */
export function useScrollDirection() {
  const [direction, setDirection] = useState('up')
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setDirection(y > lastY.current ? 'down' : 'up')
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return direction
}

/**
 * useIsScrolled — returns true if page has been scrolled past threshold
 */
export function useIsScrolled(threshold = 80) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrolled
}

/**
 * useCounter — animates a number from 0 to target when triggered
 */
export function useCounter(target, duration = 2000, trigger = true) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!trigger) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else { setCount(Math.floor(start)) }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, trigger])

  return count
}