import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { APP } from '../../config/constants'

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
)
const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const MailIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)
const CheckCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/>
  </svg>
)

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail]       = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)

  useEffect(() => { document.title = `Reset Password — ${APP.name}` }, [])

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!email) { setError('Email is required'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address'); return }
    setLoading(true)
    setError('')
    try {
      await requestPasswordReset({ email })
      setSuccess(true)
    } catch (err) {
      // Still show success even on error — don't reveal if email exists
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="page-transition flex-1 flex items-center justify-center px-4 py-20"
      style={{ background: 'var(--c-bg)', minHeight: 'calc(100vh - 72px)' }}
    >
      <div className="w-full max-w-[480px]">

        {success ? (
          /* ── SUCCESS STATE ─────────────────────────────────────────── */
          <div className="text-center">
            <div
              className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full"
              style={{ background: 'rgba(6,78,59,0.08)', color: 'var(--c-primary)' }}
            >
              <CheckCircleIcon />
            </div>

            <p className="section-eyebrow mb-3">Email Sent</p>
            <h1 className="font-display text-4xl font-medium mb-4" style={{ color: 'var(--c-primary)' }}>
              Check your inbox
            </h1>
            <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--c-text-muted)', maxWidth: 360, margin: '0 auto 2rem' }}>
              If an account exists for <strong style={{ color: 'var(--c-text)' }}>{email}</strong>, we've sent a password reset link.
              It may take a minute or two to arrive — check your spam folder too.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => { setSuccess(false); setEmail('') }}
                className="btn-primary mx-auto"
              >
                <span>Try a different email</span>
              </button>
              <div>
                <Link to="/login" className="text-sm underline underline-offset-2 transition-colors"
                  style={{ color: 'var(--c-text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--c-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-muted)'}
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>

        ) : (
          /* ── FORM STATE ────────────────────────────────────────────── */
          <>
            {/* Icon */}
            <div
              className="w-14 h-14 flex items-center justify-center mb-8"
              style={{ background: 'rgba(6,78,59,0.08)', color: 'var(--c-primary)' }}
            >
              <MailIcon />
            </div>

            <p className="section-eyebrow">Account Recovery</p>
            <h1 className="font-display text-4xl font-medium mb-3" style={{ color: 'var(--c-primary)', lineHeight: 1.15 }}>
              Forgot your<br />password?
            </h1>
            <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--c-text-muted)' }}>
              No worries. Enter your email address and we'll send you a secure link to reset your password.
            </p>

            {/* Error */}
            {error && (
              <div className="mb-5 p-4 text-sm flex items-center gap-3"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#DC2626' }}>
                <AlertIcon /><span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-6">
                <label className="form-label" htmlFor="reset-email">Email Address</label>
                <input
                  id="reset-email" type="email" name="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full justify-center"
                disabled={loading}
                style={loading ? { opacity: 0.7, cursor: 'not-allowed', pointerEvents: 'none' } : {}}
              >
                <span>{loading ? 'Sending link…' : 'Send Reset Link'}</span>
                {!loading && <ArrowIcon />}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px" style={{ background: '#E5E7EB' }} />
              <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--c-text-light)' }}>or</span>
              <div className="flex-1 h-px" style={{ background: '#E5E7EB' }} />
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
                Remember your password?{' '}
                <Link to="/login" className="font-semibold underline underline-offset-2" style={{ color: 'var(--c-primary)' }}>
                  Sign in
                </Link>
              </p>
              <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold underline underline-offset-2" style={{ color: 'var(--c-primary)' }}>
                  Create one
                </Link>
              </p>
            </div>

            {/* Help */}
            <div
              className="mt-10 p-5 border-l-2"
              style={{ borderColor: 'var(--c-accent)', background: 'rgba(245,158,11,0.04)' }}
            >
              <p className="text-xs font-semibold tracking-wide uppercase mb-1.5" style={{ color: 'var(--c-accent-dark)' }}>
                Still having trouble?
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>
                Contact our support team at{' '}
                <a href="mailto:hello@materialwearlimited.com"
                  className="font-medium underline underline-offset-2"
                  style={{ color: 'var(--c-primary)' }}>
                  hello@materialwearlimited.com
                </a>{' '}
                and we'll help you recover your account.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
