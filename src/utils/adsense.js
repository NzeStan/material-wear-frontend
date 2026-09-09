import { APP } from '../config/constants'

const SCRIPT_ID = 'google-adsense'

/**
 * A real AdSense publisher ID is "ca-pub-" followed by digits. The scaffolded
 * placeholder is ca-pub-XXXXXXXXXXXXXXXX, so requiring digits is what
 * distinguishes "configured" from "not filled in yet".
 */
export function isValidAdsenseId(id) {
  return typeof id === 'string' && /^ca-pub-\d{10,20}$/.test(id.trim())
}

/**
 * Load the AdSense script, but only when a real publisher ID is configured.
 *
 * Injected at runtime rather than hardcoded in index.html so that an unset or
 * still-placeholder VITE_ADSENSE_ID simply loads nothing, instead of pulling
 * in Google's script with a bogus client and logging errors on every page.
 *
 * Returns true if the script was loaded (or already present).
 */
export function loadAdsense() {
  if (typeof document === 'undefined') return false
  if (!isValidAdsenseId(APP.adsenseId)) return false
  if (document.getElementById(SCRIPT_ID)) return true

  const script = document.createElement('script')
  script.id = SCRIPT_ID
  script.async = true
  script.crossOrigin = 'anonymous'
  script.src =
    'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' +
    encodeURIComponent(APP.adsenseId.trim())
  document.head.appendChild(script)
  return true
}
