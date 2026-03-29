import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { APP } from '../../config/constants'

// ── Icon helpers ─────────────────────────────────────────────────────────────
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
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)
const GithubIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
)

const BACKEND = (import.meta.env.VITE_API_BASE_URL || '').replace('/api', '')
const goToGoogle = () => { window.location.href = `${BACKEND}/accounts/google/login/` }
const goToGithub = () => { window.location.href = `${BACKEND}/accounts/github/login/` }

// Password strength checker
function getStrength(pw) {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8)              s++
  if (/[A-Z]/.test(pw))           s++
  if (/[0-9]/.test(pw))           s++
  if (/[^A-Za-z0-9]/.test(pw))    s++
  return s  // 0–4
}
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
const strengthColor = ['', '#EF4444', '#F59E0B', '#10B981', '#064E3B']

// ── Component ─────────────────────────────────────────────────────────────────
export default function Register() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', username: '', email: '', password1: '', password2: '',
  })
  const [errors, setErrors]             = useState({})
  const [loading, setLoading]           = useState(false)
  const [showPw1, setShowPw1]           = useState(false)
  const [showPw2, setShowPw2]           = useState(false)
  const [agreed, setAgreed]             = useState(false)

  const strength = getStrength(formData.password1)

  useEffect(() => {
    document.title = `Create Account — ${APP.name}`
    if (isAuthenticated) navigate('/profile', { replace: true })
  }, [isAuthenticated, navigate])

  const validate = () => {
    const e = {}
    if (!formData.first_name.trim())  e.first_name = 'First name is required'
    if (!formData.last_name.trim())   e.last_name  = 'Last name is required'
    if (!formData.username.trim())    e.username   = 'Username is required'
    else if (formData.username.length < 3) e.username = 'Username must be at least 3 characters'
    if (!formData.email)              e.email      = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email address'
    if (!formData.password1)          e.password1  = 'Password is required'
    else if (formData.password1.length < 8) e.password1 = 'Password must be at least 8 characters'
    if (!formData.password2)          e.password2  = 'Please confirm your password'
    else if (formData.password1 !== formData.password2) e.password2 = 'Passwords do not match'
    if (!agreed)                      e.agreed     = 'You must accept the terms to continue'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setErrors({})
    try {
      await register({
        username:  formData.username,
        email:     formData.email,
        password1: formData.password1,
        password2: formData.password2,
      })
      navigate('/profile', { replace: true })
    } catch (err) {
      const data = err.data || {}
      const mapped = {}
      if (data.username)   mapped.username  = Array.isArray(data.username)  ? data.username[0]  : data.username
      if (data.email)      mapped.email     = Array.isArray(data.email)     ? data.email[0]     : data.email
      if (data.password1)  mapped.password1 = Array.isArray(data.password1) ? data.password1[0] : data.password1
      if (data.password2)  mapped.password2 = Array.isArray(data.password2) ? data.password2[0] : data.password2
      if (!Object.keys(mapped).length) mapped.form = err.message || 'Registration failed. Please try again.'
      setErrors(mapped)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  const FieldError = ({ name }) =>
    errors[name] ? <p className="mt-1.5 text-xs" style={{ color: '#DC2626' }}>{errors[name]}</p> : null

  const SocialBtn = ({ onClick, icon, label }) => (
    <button
      type="button" onClick={onClick}
      className="flex items-center justify-center gap-2.5 px-4 py-3 text-xs font-medium tracking-wide border transition-all duration-200 w-full"
      style={{ border: '1.5px solid #D1D5DB', background: 'white', color: 'var(--c-text)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--c-primary)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none' }}
    >
      {icon}<span>Sign up with {label}</span>
    </button>
  )

  return (
    <main className="page-transition flex-1 flex" style={{ minHeight: 'calc(100vh - 72px)' }}>

      {/* ── LEFT: Brand Panel ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[44%] xl:w-[40%] relative overflow-hidden p-14 xl:p-16"
        style={{ background: 'var(--c-primary-dark)' }}
      >
        {/* Decorative rings */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full"
            style={{ border: '1px solid rgba(245,158,11,0.1)' }} />
          <div className="absolute top-8 -left-4 w-48 h-48 rounded-full"
            style={{ border: '1px solid rgba(245,158,11,0.07)' }} />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full"
            style={{ border: '1px solid rgba(245,158,11,0.08)' }} />
          <div className="absolute top-0 right-0 w-64 h-64"
            style={{ background: 'radial-gradient(circle at 100% 0%, rgba(245,158,11,0.05) 0%, transparent 70%)' }} />
        </div>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 relative z-10 group">
          <div
            className="w-9 h-9 flex items-center justify-center font-display font-bold text-white text-sm"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
          >MW</div>
          <span className="font-display font-light tracking-widest text-white text-lg opacity-90">
            {APP.name}
          </span>
        </Link>

        {/* Center copy */}
        <div className="relative z-10">
          <div className="divider-gold mb-8" />
          <h2 className="font-display font-light text-white leading-tight mb-6"
            style={{ fontSize: 'clamp(2.8rem, 4vw, 4rem)' }}>
            Join the<br /><em>family.</em>
          </h2>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Become a member and enjoy early access to new collections, personalised styling, and exclusive rewards.
          </p>

          {/* Member benefits */}
          <ul className="mt-8 space-y-3">
            {[
              'Early access to new drops',
              'Personalised size & style profile',
              'Exclusive member-only discounts',
              'Priority customer support',
            ].map(b => (
              <li key={b} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--c-accent)' }}>
                  <CheckIcon />
                </span>
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-10 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Already a member?
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium transition-all duration-200"
              style={{ color: 'var(--c-accent-light)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--c-accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--c-accent-light)'}
            >
              Sign in to your account
              <ArrowIcon />
            </Link>
          </div>
        </div>

        {/* Footer links */}
        <div className="relative z-10 flex gap-6">
          {[['Privacy', '/privacy-policy'], ['Terms', '/terms'], ['Support', '/contact']].map(([l, p]) => (
            <Link key={p} to={p}
              className="text-xs transition-opacity"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >{l}</Link>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Form Panel ─────────────────────────────────────────── */}
      <div
        className="flex-1 flex items-start justify-center p-6 sm:p-10 xl:p-16 overflow-y-auto"
        style={{ background: 'var(--c-bg)' }}
      >
        <div className="w-full max-w-[440px] py-8 lg:py-0">

          {/* Mobile logo */}
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-10">
            <div className="w-7 h-7 flex items-center justify-center font-display font-bold text-white text-xs"
              style={{ background: 'var(--c-primary)' }}>MW</div>
            <span className="font-display font-medium" style={{ color: 'var(--c-primary)' }}>{APP.name}</span>
          </Link>

          <p className="section-eyebrow">Join Material Wear</p>
          <h1 className="font-display text-4xl font-medium mb-2" style={{ color: 'var(--c-primary)', lineHeight: 1.15 }}>
            Create Account
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--c-text-muted)' }}>
            Already a member?{' '}
            <Link to="/login" className="font-semibold underline underline-offset-2"
              style={{ color: 'var(--c-primary)' }}>Sign in</Link>
          </p>

          {/* Social signup */}
          <div className="space-y-3 mb-6">
            <SocialBtn onClick={goToGoogle} icon={<GoogleIcon />} label="Google" />
            <SocialBtn onClick={goToGithub} icon={<GithubIcon />} label="GitHub" />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: '#E5E7EB' }} />
            <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--c-text-light)' }}>or with email</span>
            <div className="flex-1 h-px" style={{ background: '#E5E7EB' }} />
          </div>

          {/* Error banner */}
          {errors.form && (
            <div className="mb-5 p-4 text-sm flex items-start gap-3"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#DC2626' }}>
              <AlertIcon />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">

              {/* Name row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label" htmlFor="first_name">First Name</label>
                  <input id="first_name" name="first_name" type="text" className="form-input"
                    placeholder="Jane" value={formData.first_name} onChange={handleChange} autoComplete="given-name" />
                  <FieldError name="first_name" />
                </div>
                <div>
                  <label className="form-label" htmlFor="last_name">Last Name</label>
                  <input id="last_name" name="last_name" type="text" className="form-input"
                    placeholder="Doe" value={formData.last_name} onChange={handleChange} autoComplete="family-name" />
                  <FieldError name="last_name" />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="form-label" htmlFor="username">Username</label>
                <input id="username" name="username" type="text" className="form-input"
                  placeholder="janedoe" value={formData.username} onChange={handleChange} autoComplete="username" />
                <FieldError name="username" />
              </div>

              {/* Email */}
              <div>
                <label className="form-label" htmlFor="reg-email">Email Address</label>
                <input id="reg-email" name="email" type="email" className="form-input"
                  placeholder="you@example.com" value={formData.email} onChange={handleChange} autoComplete="email" />
                <FieldError name="email" />
              </div>

              {/* Password */}
              <div>
                <label className="form-label" htmlFor="reg-password1">Password</label>
                <div className="relative">
                  <input id="reg-password1" name="password1"
                    type={showPw1 ? 'text' : 'password'}
                    className="form-input pr-12" placeholder="Min. 8 characters"
                    value={formData.password1} onChange={handleChange} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPw1(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity"
                    style={{ color: 'var(--c-text-muted)', opacity: 0.5 }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                    aria-label={showPw1 ? 'Hide password' : 'Show password'}>
                    {showPw1 ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {/* Strength bar */}
                {formData.password1 && (
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
                <FieldError name="password1" />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="form-label" htmlFor="reg-password2">Confirm Password</label>
                <div className="relative">
                  <input id="reg-password2" name="password2"
                    type={showPw2 ? 'text' : 'password'}
                    className="form-input pr-12" placeholder="Repeat your password"
                    value={formData.password2} onChange={handleChange} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPw2(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity"
                    style={{ color: 'var(--c-text-muted)', opacity: 0.5 }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                    aria-label={showPw2 ? 'Hide password' : 'Show password'}>
                    {showPw2 ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {/* Match indicator */}
                {formData.password2 && formData.password1 && (
                  <p className="mt-1.5 text-xs flex items-center gap-1.5"
                    style={{ color: formData.password1 === formData.password2 ? '#10B981' : '#EF4444' }}>
                    {formData.password1 === formData.password2
                      ? <><CheckIcon /> Passwords match</>
                      : '✕ Passwords do not match'}
                  </p>
                )}
                <FieldError name="password2" />
              </div>

              {/* Terms */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input type="checkbox" className="sr-only" checked={agreed}
                      onChange={e => { setAgreed(e.target.checked); if (errors.agreed) setErrors(p => ({ ...p, agreed: '' })) }} />
                    <div
                      className="w-5 h-5 border-2 flex items-center justify-center transition-all duration-200"
                      style={{
                        borderColor: agreed ? 'var(--c-primary)' : (errors.agreed ? '#EF4444' : '#D1D5DB'),
                        background: agreed ? 'var(--c-primary)' : 'white',
                      }}
                      onClick={() => { setAgreed(p => !p); if (errors.agreed) setErrors(pr => ({ ...pr, agreed: '' })) }}
                    >
                      {agreed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                  </div>
                  <span className="text-xs leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>
                    I agree to Material Wear's{' '}
                    <Link to="/terms" className="underline underline-offset-2 font-medium" style={{ color: 'var(--c-text)' }}>
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy-policy" className="underline underline-offset-2 font-medium" style={{ color: 'var(--c-text)' }}>
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.agreed && (
                  <p className="mt-1.5 text-xs" style={{ color: '#DC2626' }}>{errors.agreed}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full justify-center mt-8"
              disabled={loading}
              style={loading ? { opacity: 0.7, cursor: 'not-allowed', pointerEvents: 'none' } : {}}
            >
              <span>{loading ? 'Creating account…' : 'Create Account'}</span>
              {!loading && <ArrowIcon />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t text-center lg:hidden" style={{ borderColor: '#E5E7EB' }}>
            <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
              Already a member?{' '}
              <Link to="/login" className="font-semibold" style={{ color: 'var(--c-primary)' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
