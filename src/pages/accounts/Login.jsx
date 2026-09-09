import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { APP } from '../../config/constants'
import { goToGoogleRedirect, goToGithubRedirect, requestGoogleAccessToken, GOOGLE_CLIENT_ID } from '../../utils/socialAuth'

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

// ── Component ─────────────────────────────────────────────────────────────────
export default function Login() {
  const { login, loginWithGoogleToken, isAuthenticated, user } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || '/'

  const [formData, setFormData]       = useState({ email: '', password: '' })
  const [errors, setErrors]           = useState({})
  const [loading, setLoading]         = useState(false)
  const [socialLoading, setSocialLoading] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    document.title = `Sign In — ${APP.name}`
    if (isAuthenticated) {
      const dest = from !== '/' ? from : (user?.is_staff ? '/admin' : '/')
      navigate(dest, { replace: true })
    }
  }, [isAuthenticated, navigate, from, user])

  const validate = () => {
    const e = {}
    if (!formData.email)                       e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email address'
    if (!formData.password)                    e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setErrors({})
    try {
      const userData = await login(formData)
      const dest = from !== '/' ? from : (userData?.is_staff ? '/admin' : '/')
      navigate(dest, { replace: true })
    } catch (err) {
      setErrors({ form: err.message || 'Invalid email or password. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  const handleGoogleApiLogin = async () => {
    setErrors({})
    setSocialLoading('google')
    try {
      if (!GOOGLE_CLIENT_ID) {
        goToGoogleRedirect()
        return
      }
      const accessToken = await requestGoogleAccessToken()
      const userData = await loginWithGoogleToken(accessToken)
      const dest = from !== '/' ? from : (userData?.is_staff ? '/admin' : '/')
      navigate(dest, { replace: true })
    } catch (err) {
      setErrors({ form: err.message || 'Google sign-in failed. Please try again.' })
    } finally {
      setSocialLoading('')
    }
  }

  const SocialBtn = ({ onClick, icon, label, busy, hint }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={!!busy}
      className="flex items-center justify-center gap-2.5 px-4 py-3 text-xs font-medium tracking-wide border transition-all duration-200 w-full"
      style={{ border: '1.5px solid #D1D5DB', background: 'var(--c-surface)', color: 'var(--c-text)', opacity: busy ? 0.7 : 1 }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--c-primary)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = 'none' }}
    >
      {icon}
      <span>{busy ? `Connecting ${label}…` : `Continue with ${label}`}</span>
      {hint ? <span className="sr-only">{hint}</span> : null}
    </button>
  )

  return (
    <main className="page-transition flex-1 flex" style={{ minHeight: 'calc(100vh - 72px)' }}>

      {/* ── LEFT: Brand Panel ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[44%] xl:w-[40%] relative overflow-hidden p-14 xl:p-16"
        style={{ background: 'var(--c-primary)' }}
      >
        {/* Decorative rings */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full"
            style={{ border: '1px solid rgba(245,158,11,0.12)' }} />
          <div className="absolute -top-8 -right-8 w-56 h-56 rounded-full"
            style={{ border: '1px solid rgba(245,158,11,0.08)' }} />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full"
            style={{ border: '1px solid rgba(245,158,11,0.1)' }} />
          <div className="absolute bottom-0 left-0 w-64 h-64"
            style={{ background: 'radial-gradient(circle at 0% 100%, rgba(245,158,11,0.06) 0%, transparent 70%)' }} />
        </div>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 relative z-10 group">
          <div
            className="w-9 h-9 flex items-center justify-center font-display font-bold text-white text-sm transition-all duration-300"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
          >MW</div>
          <span className="font-display font-light tracking-widest text-white text-lg opacity-90 group-hover:opacity-100 transition-opacity">
            {APP.name}
          </span>
        </Link>

        {/* Center copy */}
        <div className="relative z-10">
          <div className="divider-gold mb-8" />
          <h2 className="font-display font-light text-white leading-tight mb-6"
            style={{ fontSize: 'clamp(2.8rem, 4vw, 4rem)' }}>
            Welcome<br /><em>back.</em>
          </h2>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Sign in to access your orders, saved measurements, wishlist, and exclusive member offers.
          </p>

          <div className="mt-10 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
              New to Material Wear?
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-sm font-medium transition-all duration-200 group"
              style={{ color: 'var(--c-accent-light)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--c-accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--c-accent-light)'}
            >
              Create your account
              <ArrowIcon />
            </Link>
          </div>

          {/* Stats strip */}
          <div className="mt-10 grid grid-cols-3 gap-4 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            {[['5k+', 'Members'], ['98%', 'Satisfaction'], ['4 yrs', 'Excellence']].map(([n, l]) => (
              <div key={l}>
                <p className="font-display text-2xl font-light" style={{ color: 'var(--c-accent-light)' }}>{n}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{l}</p>
              </div>
            ))}
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
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 xl:p-16" style={{ background: 'var(--c-bg)' }}>
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-10">
            <div className="w-7 h-7 flex items-center justify-center font-display font-bold text-white text-xs"
              style={{ background: 'var(--c-primary)' }}>MW</div>
            <span className="font-display font-medium" style={{ color: 'var(--c-primary)' }}>{APP.name}</span>
          </Link>

          <p className="section-eyebrow">Member Access</p>
          <h1 className="font-display text-4xl font-medium mb-2" style={{ color: 'var(--c-primary)', lineHeight: 1.15 }}>
            Sign In
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--c-text-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold underline underline-offset-2 transition-colors"
              style={{ color: 'var(--c-primary)' }}>
              Create one free
            </Link>
          </p>

          {/* Social login */}
          <div className="space-y-3 mb-6">
            <SocialBtn onClick={handleGoogleApiLogin} icon={<GoogleIcon />} label="Google" busy={socialLoading === 'google'} />
            <SocialBtn onClick={goToGithubRedirect} icon={<GithubIcon />} label="GitHub" busy={socialLoading === 'github'} />
            <p className="text-[11px]" style={{ color: 'var(--c-text-light)' }}>
              Google now uses direct token exchange with the account API. GitHub still uses the secure redirect flow.
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: '#E5E7EB' }} />
            <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--c-text-light)' }}>
              or with email
            </span>
            <div className="flex-1 h-px" style={{ background: '#E5E7EB' }} />
          </div>

          {/* Error banner */}
          {errors.form && (
            <div className="mb-5 p-4 text-sm flex items-center gap-3"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#DC2626' }}>
              <AlertIcon />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">

              {/* Email */}
              <div>
                <label className="form-label" htmlFor="login-email">Email Address</label>
                <input
                  id="login-email" name="email" type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-xs" style={{ color: '#DC2626' }}>{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="form-label" style={{ marginBottom: 0 }} htmlFor="login-password">Password</label>
                  <Link to="/forgot-password"
                    className="text-xs underline underline-offset-2 transition-colors"
                    style={{ color: 'var(--c-text-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--c-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-muted)'}
                  >Forgot password?</Link>
                </div>
                <div className="relative">
                  <input
                    id="login-password" name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input pr-12"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    aria-describedby={errors.password ? 'pw-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity"
                    style={{ color: 'var(--c-text-muted)', opacity: 0.5 }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password && (
                  <p id="pw-error" className="mt-1.5 text-xs" style={{ color: '#DC2626' }}>{errors.password}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full justify-center mt-8"
              disabled={loading}
              style={loading ? { opacity: 0.7, cursor: 'not-allowed', pointerEvents: 'none' } : {}}
            >
              <span>{loading ? 'Signing in…' : 'Sign In'}</span>
              {!loading && <ArrowIcon />}
            </button>
          </form>

          <p className="mt-8 text-center text-xs leading-relaxed" style={{ color: 'var(--c-text-light)' }}>
            By signing in you agree to our{' '}
            <Link to="/terms" className="underline underline-offset-2" style={{ color: 'var(--c-text-muted)' }}>Terms of Service</Link>{' '}
            and{' '}
            <Link to="/privacy-policy" className="underline underline-offset-2" style={{ color: 'var(--c-text-muted)' }}>Privacy Policy</Link>.
          </p>

          {/* Mobile: link to register */}
          <div className="mt-8 pt-6 border-t lg:hidden text-center" style={{ borderColor: '#E5E7EB' }}>
            <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>
              New to Material Wear?{' '}
              <Link to="/register" className="font-semibold" style={{ color: 'var(--c-primary)' }}>
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
