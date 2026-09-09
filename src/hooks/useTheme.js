import { useCallback, useEffect, useState } from 'react'

import { APP } from '../config/constants'
import { useLocalStorage } from './useLocalStorage'

const STORAGE_KEY = 'mw_theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

/**
 * Light/dark theme, applied by setting data-theme="dark" on <html>, which
 * swaps the colour tokens defined in index.css.
 *
 * Gated on VITE_ENABLE_DARK_MODE: with the flag off this always reports
 * light and the toggle isn't rendered, so the flag genuinely controls the
 * feature rather than just sitting unused in config.
 *
 * With no stored preference it follows the OS setting, and keeps following
 * it (including live changes) until the user picks a theme explicitly.
 *
 * Currently consumed only by the Navbar toggle. If more components need it,
 * lift it into a context — each caller otherwise keeps its own copy of the
 * stored value, which could drift.
 */
export function useTheme() {
  const [stored, setStored] = useLocalStorage(STORAGE_KEY, null)

  // Held in state (not read during render) so an OS change re-renders.
  const [systemDark, setSystemDark] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.(DARK_QUERY).matches
  )

  useEffect(() => {
    const mq = window.matchMedia?.(DARK_QUERY)
    if (!mq) return
    const onChange = (e) => setSystemDark(e.matches)
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  const theme = !APP.enableDarkMode
    ? 'light'
    : (stored ?? (systemDark ? 'dark' : 'light'))

  // Applied to <html> so the tokens cascade to everything, including
  // anything rendered outside the React root.
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark')
    } else {
      root.removeAttribute('data-theme')
    }
    // Lets the browser draw native UI (scrollbars, form controls) to match.
    root.style.colorScheme = theme
  }, [theme])

  const toggleTheme = useCallback(() => {
    setStored(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setStored])

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    enabled: APP.enableDarkMode,
  }
}
