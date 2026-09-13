import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { APP } from '../../config/constants'

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const CheckCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/>
  </svg>
)
const MailIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
)

export default function VerifyEmail() {
  const { key } = useParams()
  const { verifyEmail } = useAuth()
  const navigate = useNavigate()
  const ranRef = useRef(false)

  const [status, setStatus] = useState('verifying') // verifying | success | error
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    document.title = `Verify Email — ${APP.name}`
  }, [])

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    if (!key) {
      setStatus('error')
      setErrorMsg('This verification link is missing its key.')
      return
    }

    verifyEmail(key)
      .then(() => {
        setStatus('success')
        setTimeout(() => navigate('/login', { replace: true }), 4000)
      })
      .catch(err => {
        setStatus('error')
        setErrorMsg(err.message || 'This verification link is invalid or has expired.')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  if (status === 'verifying') {
    return (
      <main
        className="page-transition flex-1 flex items-center justify-center px-4 py-20 text-center"
        style={{ background: 'var(--c-bg)', minHeight: 'calc(100vh - 72px)' }}
      >
        <div className="w-full max-w-[420px]">
          <div
            className="w-14 h-14 mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'rgba(6,78,59,0.08)', color: 'var(--c-primary)' }}
          >
            <MailIcon />
          </div>
          <p className="section-eyebrow mb-3">One Moment</p>
          <h1 className="font-display text-3xl font-medium" style={{ color: 'var(--c-primary)' }}>
            Verifying your email…
          </h1>
        </div>
      </main>
    )
  }

  if (status === 'success') {
    return (
      <main
        className="page-transition flex-1 flex items-center justify-center px-4 py-20 text-center"
        style={{ background: 'var(--c-bg)', minHeight: 'calc(100vh - 72px)' }}
      >
        <div className="w-full max-w-[420px]">
          <div
            className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(6,78,59,0.08)', color: 'var(--c-primary)' }}
          >
            <CheckCircleIcon />
          </div>
          <p className="section-eyebrow mb-3">All Done</p>
          <h1 className="font-display text-4xl font-medium mb-4" style={{ color: 'var(--c-primary)' }}>
            Email verified!
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--c-text-muted)', maxWidth: 340, margin: '0 auto 2rem' }}>
            Your account is ready. You&apos;ll be redirected to the sign in page in a moment.
          </p>
          <Link to="/login" className="btn-primary inline-flex">
            <span>Sign In Now</span>
          </Link>
        </div>
      </main>
    )
  }

  // ── error ──────────────────────────────────────────────────────────────────
  return (
    <main
      className="page-transition flex-1 flex items-center justify-center px-4 py-20 text-center"
      style={{ background: 'var(--c-bg)', minHeight: 'calc(100vh - 72px)' }}
    >
      <div className="w-full max-w-[420px]">
        <div
          className="w-16 h-16 mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#DC2626' }}
        >
          <AlertIcon />
        </div>
        <p className="section-eyebrow mb-3">Link Expired</p>
        <h1 className="font-display text-4xl font-medium mb-4" style={{ color: 'var(--c-primary)' }}>
          Verification failed
        </h1>
        <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--c-text-muted)', maxWidth: 340, margin: '0 auto 2rem' }}>
          {errorMsg}
        </p>
        <div className="space-y-3">
          <Link to="/login" className="btn-primary inline-flex">
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
