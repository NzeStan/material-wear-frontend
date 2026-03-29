import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { APP } from '../../config/constants'

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)
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
const LockIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

function getStrength(pw) {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8)           s++
  if (/[A-Z]/.test(pw))        s++
  if (/[0-9]/.test(pw))        s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}
const strengthColor = ['', '#EF4444', '#F59E0B', '#10B981', '#064E3B']
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']

export default function ResetPassword() {
  const { uid, token } = useParams()
  const { confirmPasswordReset } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData]     = useState({ new_password1: '', new_password2: '' })
  const [errors, setErrors]         = useState({})
  const [loading, setLoading]       = useState(false)
  const [showPw1, setShowPw1]       = useState(false)
  const [showPw2, setShowPw2]       = useState(false)
  const [success, setSuccess]       = useState(false)
  const [tokenValid, setTokenValid] = useState(true)

  const strength = getStrength(formData.new_password1)

  useEffect(() => {
    document.title = `Set New Password — ${APP.name}`
    if (!uid || !token) setTokenValid(false)
  }, [uid, token])

  const validate = () => {
    const e = {}
    if (!formData.new_password1)      e.new_password1 = 'Password is required'
    else if (formData.new_password1.length < 8) e.new_password1 = 'Password must be at least 8 characters'
    if (!formData.new_password2)      e.new_password2 = 'Please confirm your password'
    else if (formData.new_password1 !== formData.new_password2) e.new_password2 = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setErrors({})
    try {
      await confirmPasswordReset({
        uid,
        token,
        new_password1: formData.new_password1,
        new_password2: formData.new_password2,
      })
      setSuccess(true)
      setTimeout(() => navigate('/login', { replace: true }), 4000)
    } catch (err) {
      const data = err.data || {}
      if (data.token || data.uid || err.status === 400) {
        setTokenValid(false)
      } else {
        const mapped = {}
        if (data.new_password1) mapped.new_password1 = Array.isArray(data.new_password1) ? data.new_password1[0] : data.new_password1
        if (data.new_password2) mapped.new_password2 = Array.isArray(data.new_password2) ? data.new_password2[0] : data.new_password2
        if (!Object.keys(mapped).length) mapped.form = err.message || 'Failed to reset password. Please try again.'
        setErrors(mapped)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  // ── Invalid / expired token ─────────────────────────────────────────────────
  if (!tokenValid) {
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
            Invalid reset link
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--c-text-muted)', maxWidth: 340, margin: '0 auto 2rem' }}>
            This password reset link is invalid or has expired. Reset links are only valid for 24 hours.
          </p>
          <div className="space-y-3">
            <Link to="/forgot-password" className="btn-primary inline-flex">
              <span>Request a new link</span>
            </Link>
            <div>
              <Link to="/login" className="text-sm underline underline-offset-2"
                style={{ color: 'var(--c-text-muted)' }}>Back to Sign In</Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // ── Success state ───────────────────────────────────────────────────────────
  if (success) {
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
            Password updated!
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--c-text-muted)', maxWidth: 340, margin: '0 auto 2rem' }}>
            Your password has been successfully reset. You'll be redirected to the sign in page in a moment.
          </p>
          <Link to="/login" className="btn-primary inline-flex">
            <span>Sign In Now</span>
          </Link>
        </div>
      </main>
    )
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <main
      className="page-transition flex-1 flex items-center justify-center px-4 py-20"
      style={{ background: 'var(--c-bg)', minHeight: 'calc(100vh - 72px)' }}
    >
      <div className="w-full max-w-[480px]">

        <div
          className="w-14 h-14 flex items-center justify-center mb-8"
          style={{ background: 'rgba(6,78,59,0.08)', color: 'var(--c-primary)' }}
        >
          <LockIcon />
        </div>

        <p className="section-eyebrow">Account Security</p>
        <h1 className="font-display text-4xl font-medium mb-3" style={{ color: 'var(--c-primary)', lineHeight: 1.15 }}>
          Set new<br />password
        </h1>
        <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--c-text-muted)' }}>
          Choose a strong password that's at least 8 characters long and includes a mix of letters, numbers, and symbols.
        </p>

        {/* Error banner */}
        {errors.form && (
          <div className="mb-5 p-4 text-sm flex items-start gap-3"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#DC2626' }}>
            <AlertIcon /><span>{errors.form}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-5 mb-8">

            {/* New password */}
            <div>
              <label className="form-label" htmlFor="new_password1">New Password</label>
              <div className="relative">
                <input
                  id="new_password1" name="new_password1"
                  type={showPw1 ? 'text' : 'password'}
                  className="form-input pr-12"
                  placeholder="Min. 8 characters"
                  value={formData.new_password1}
                  onChange={handleChange}
                  autoComplete="new-password"
                  autoFocus
                />
                <button type="button" onClick={() => setShowPw1(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity"
                  style={{ color: 'var(--c-text-muted)', opacity: 0.5 }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                  aria-label={showPw1 ? 'Hide password' : 'Show password'}>
                  {showPw1 ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {/* Strength */}
              {formData.new_password1 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength ? strengthColor[strength] : '#E5E7EB' }} />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strengthColor[strength] }}>
                    {strengthLabel[strength]} password
                  </p>
                </div>
              )}
              {errors.new_password1 && (
                <p className="mt-1.5 text-xs" style={{ color: '#DC2626' }}>{errors.new_password1}</p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="form-label" htmlFor="new_password2">Confirm New Password</label>
              <div className="relative">
                <input
                  id="new_password2" name="new_password2"
                  type={showPw2 ? 'text' : 'password'}
                  className="form-input pr-12"
                  placeholder="Repeat your new password"
                  value={formData.new_password2}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPw2(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity"
                  style={{ color: 'var(--c-text-muted)', opacity: 0.5 }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                  aria-label={showPw2 ? 'Hide password' : 'Show password'}>
                  {showPw2 ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {formData.new_password2 && formData.new_password1 && (
                <p className="mt-1.5 text-xs flex items-center gap-1.5"
                  style={{ color: formData.new_password1 === formData.new_password2 ? '#10B981' : '#EF4444' }}>
                  {formData.new_password1 === formData.new_password2
                    ? '✓ Passwords match'
                    : '✕ Passwords do not match'}
                </p>
              )}
              {errors.new_password2 && (
                <p className="mt-1.5 text-xs" style={{ color: '#DC2626' }}>{errors.new_password2}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full justify-center"
            disabled={loading}
            style={loading ? { opacity: 0.7, cursor: 'not-allowed', pointerEvents: 'none' } : {}}
          >
            <span>{loading ? 'Updating password…' : 'Update Password'}</span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-sm underline underline-offset-2 transition-colors"
            style={{ color: 'var(--c-text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--c-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-muted)'}
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </main>
  )
}
