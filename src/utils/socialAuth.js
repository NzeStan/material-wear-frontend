/**
 * Shared helpers for the accounts OAuth flows (Google token exchange +
 * GitHub redirect). Both Login and Register need the exact same backend
 * paths — keep them here so a backend/ngrok URL change only needs editing
 * in one place instead of being copy-pasted per page.
 */
import { APP } from '../config/constants'

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

// Real resolved paths (see accounts/urls.py mounted under material/urls.py at
// "api/auth/social/"): .../api/auth/social/google/login/ and .../github/login/
const SOCIAL_ENTRY = `${APP.backendOrigin}/api/auth/social`

export function goToGoogleRedirect() {
  window.location.href = `${SOCIAL_ENTRY}/google/login/`
}

export function goToGithubRedirect() {
  window.location.href = `${SOCIAL_ENTRY}/github/login/`
}

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve(window.google)
      return
    }

    const existing = document.querySelector('script[data-google-identity="true"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google), { once: true })
      existing.addEventListener('error', () => reject(new Error('Could not load Google sign-in.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.googleIdentity = 'true'
    script.onload = () => resolve(window.google)
    script.onerror = () => reject(new Error('Could not load Google sign-in.'))
    document.head.appendChild(script)
  })
}

export async function requestGoogleAccessToken() {
  await loadGoogleScript()

  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google sign-in is not available in this browser session.'))
      return
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'openid email profile',
      callback: response => {
        if (response?.error) {
          reject(new Error(response.error_description || response.error || 'Google sign-in was cancelled.'))
          return
        }
        resolve(response.access_token)
      },
    })

    tokenClient.requestAccessToken({ prompt: 'select_account' })
  })
}
