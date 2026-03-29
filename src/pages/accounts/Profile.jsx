import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useScrollRevealGroup } from '../../hooks/useScrollAnimation'
import { APP } from '../../config/constants'

// ── Icons ─────────────────────────────────────────────────────────────────────
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)
const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const ShoppingBagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
)
const LogOutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const XIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const EyeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const EyeOffIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)
const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const SuccessIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/>
  </svg>
)

// ── Helper: user initials ─────────────────────────────────────────────────────
function getInitials(user) {
  if (!user) return '?'
  if (user.first_name && user.last_name)
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
  if (user.username)
    return user.username.slice(0, 2).toUpperCase()
  return user.email?.[0]?.toUpperCase() || '?'
}

function getDisplayName(user) {
  if (!user) return ''
  if (user.first_name) return `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`
  return user.username || user.email || ''
}

// ── Alert component ───────────────────────────────────────────────────────────
function Alert({ type, message, onClose }) {
  if (!message) return null
  const isError = type === 'error'
  return (
    <div className="flex items-start gap-3 p-4 text-sm mb-6 transition-all"
      style={{
        background: isError ? 'rgba(239,68,68,0.06)' : 'rgba(6,78,59,0.06)',
        border: `1px solid ${isError ? 'rgba(239,68,68,0.2)' : 'rgba(6,78,59,0.2)'}`,
        color: isError ? '#DC2626' : 'var(--c-primary)',
      }}>
      {isError ? <AlertIcon /> : <SuccessIcon />}
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0">
          <XIcon />
        </button>
      )}
    </div>
  )
}

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
  { id: 'profile',  label: 'Profile',  icon: <UserIcon /> },
  { id: 'security', label: 'Security', icon: <LockIcon /> },
  { id: 'orders',   label: 'Orders',   icon: <ShoppingBagIcon /> },
]

// ── Main component ────────────────────────────────────────────────────────────
export default function Profile() {
  const { user, isAuthenticated, loading, logout, updateProfile, changePassword } = useAuth()
  const navigate = useNavigate()
  const groupRef = useScrollRevealGroup()

  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    document.title = `My Account — ${APP.name}`
    if (!loading && !isAuthenticated) navigate('/login', { state: { from: { pathname: '/profile' } }, replace: true })
  }, [loading, isAuthenticated, navigate])

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center" style={{ minHeight: '60vh', background: 'var(--c-bg)' }}>
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          style={{ borderColor: 'var(--c-primary)', borderTopColor: 'transparent' }} />
        <p className="text-sm" style={{ color: 'var(--c-text-muted)' }}>Loading your account…</p>
      </div>
    </div>
  )

  if (!user) return null

  return (
    <main className="page-transition flex-1" style={{ background: 'var(--c-bg)', minHeight: 'calc(100vh - 72px)' }}>

      {/* ── HERO HEADER ──────────────────────────────────────────────── */}
      <div style={{ background: 'var(--c-primary)', color: 'var(--c-white)' }}>
        <div className="relative overflow-hidden">
          {/* Decorative background rings */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full"
              style={{ border: '1px solid rgba(245,158,11,0.1)' }} />
            <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full"
              style={{ border: '1px solid rgba(245,158,11,0.08)' }} />
          </div>

          <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center font-display text-3xl sm:text-4xl font-light"
                  style={{ background: 'rgba(245,158,11,0.2)', border: '2px solid rgba(245,158,11,0.4)', color: 'var(--c-accent-light)' }}
                >
                  {getInitials(user)}
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--c-accent)', border: '2px solid var(--c-primary)' }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </div>

              {/* Info */}
              <div>
                <p className="section-eyebrow" style={{ color: 'var(--c-accent)' }}>Member</p>
                <h1 className="font-display text-3xl sm:text-4xl font-light text-white mb-1">
                  {getDisplayName(user)}
                </h1>
                <p className="text-sm opacity-60">{user.email}</p>
                {user.username && (
                  <p className="text-xs mt-1 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    @{user.username}
                  </p>
                )}
              </div>

              {/* Logout — desktop */}
              <div className="sm:ml-auto">
                <button
                  onClick={handleLogout}
                  className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold tracking-widest uppercase transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                >
                  <LogOutIcon /> Sign Out
                </button>
              </div>
            </div>

            {/* ── TAB NAVIGATION ───────────────────────────────────────── */}
            <div className="mt-10 flex gap-1">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-widest uppercase transition-all duration-200 border-b-2"
                  style={{
                    color: activeTab === tab.id ? 'var(--c-accent-light)' : 'rgba(255,255,255,0.5)',
                    borderColor: activeTab === tab.id ? 'var(--c-accent)' : 'transparent',
                    background: 'transparent',
                  }}
                  onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
                  onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB CONTENT ──────────────────────────────────────────────── */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16" ref={groupRef}>
        <div className="max-w-2xl">

          {activeTab === 'profile' && (
            <ProfileTab user={user} updateProfile={updateProfile} />
          )}

          {activeTab === 'security' && (
            <SecurityTab changePassword={changePassword} />
          )}

          {activeTab === 'orders' && (
            <OrdersTab />
          )}
        </div>
      </div>

      {/* ── Mobile logout ─────────────────────────────────────────────── */}
      <div className="sm:hidden container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: 'var(--c-text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-muted)'}
        >
          <LogOutIcon /> Sign Out
        </button>
      </div>
    </main>
  )
}

// ── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab({ user, updateProfile }) {
  const [editing, setEditing]     = useState(false)
  const [formData, setFormData]   = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    username:   user?.username   || '',
  })
  const [loading, setLoading]     = useState(false)
  const [alert, setAlert]         = useState({ type: '', message: '' })

  const handleSave = async () => {
    setLoading(true)
    setAlert({ type: '', message: '' })
    try {
      await updateProfile(formData)
      setAlert({ type: 'success', message: 'Profile updated successfully.' })
      setEditing(false)
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to update profile. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({ first_name: user?.first_name || '', last_name: user?.last_name || '', username: user?.username || '' })
    setEditing(false)
    setAlert({ type: '', message: '' })
  }

  const Field = ({ label, name, placeholder, autoComplete }) => (
    <div className="reveal">
      <label className="form-label" htmlFor={`profile-${name}`}>{label}</label>
      {editing ? (
        <input
          id={`profile-${name}`} name={name} type="text"
          className="form-input"
          placeholder={placeholder}
          value={formData[name]}
          onChange={e => setFormData(p => ({ ...p, [name]: e.target.value }))}
          autoComplete={autoComplete}
        />
      ) : (
        <div
          className="px-4 py-3.5 text-sm"
          style={{ background: 'white', border: '1.5px solid #E5E7EB', color: formData[name] ? 'var(--c-text)' : 'var(--c-text-light)' }}
        >
          {formData[name] || <span style={{ color: 'var(--c-text-light)' }}>Not set</span>}
        </div>
      )}
    </div>
  )

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="section-eyebrow">Personal Details</p>
          <h2 className="font-display text-3xl font-medium" style={{ color: 'var(--c-primary)' }}>
            Profile Information
          </h2>
        </div>
        {!editing ? (
          <button
            onClick={() => { setEditing(true); setAlert({ type: '', message: '' }) }}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-widest uppercase transition-all duration-200"
            style={{ border: '1.5px solid var(--c-primary)', color: 'var(--c-primary)', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-primary)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-primary)' }}
          >
            <EditIcon /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave} disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-widest uppercase text-white transition-all duration-200"
              style={{ background: 'var(--c-primary)', opacity: loading ? 0.7 : 1 }}
            >
              <CheckIcon /> {loading ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-widest uppercase transition-all duration-200"
              style={{ border: '1.5px solid #D1D5DB', color: 'var(--c-text-muted)', background: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--c-primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#D1D5DB'}
            >
              <XIcon /> Cancel
            </button>
          </div>
        )}
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="First Name" name="first_name" placeholder="Jane" autoComplete="given-name" />
          <Field label="Last Name"  name="last_name"  placeholder="Doe"  autoComplete="family-name" />
        </div>
        <Field label="Username" name="username" placeholder="janedoe" autoComplete="username" />

        {/* Email — always read-only */}
        <div className="reveal">
          <label className="form-label">Email Address</label>
          <div
            className="px-4 py-3.5 text-sm flex items-center justify-between"
            style={{ background: 'rgba(6,78,59,0.04)', border: '1.5px solid rgba(6,78,59,0.1)' }}
          >
            <span style={{ color: 'var(--c-text)' }}>{user?.email}</span>
            <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--c-primary)', opacity: 0.6 }}>Verified</span>
          </div>
          <p className="mt-1.5 text-xs" style={{ color: 'var(--c-text-light)' }}>
            Email cannot be changed here. Contact support if you need to update it.
          </p>
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-10 pt-8 border-t reveal" style={{ borderColor: '#E5E7EB' }}>
        <p className="text-xs tracking-widest uppercase mb-4 font-semibold" style={{ color: 'var(--c-text-muted)' }}>
          Quick Links
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Browse Collections', to: '/collections' },
            { label: 'Size Guide',         to: '/size-guide' },
            { label: 'Contact Support',    to: '/contact' },
          ].map(({ label, to }) => (
            <Link key={to} to={to}
              className="px-4 py-3 text-xs font-medium tracking-wide text-center border transition-all duration-200"
              style={{ border: '1.5px solid #E5E7EB', color: 'var(--c-text-muted)', background: 'white' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--c-primary)'; e.currentTarget.style.color = 'var(--c-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = 'var(--c-text-muted)' }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Security Tab ──────────────────────────────────────────────────────────────
function SecurityTab({ changePassword }) {
  const [formData, setFormData] = useState({ old_password: '', new_password1: '', new_password2: '' })
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)
  const [alert, setAlert]       = useState({ type: '', message: '' })
  const [showOld, setShowOld]   = useState(false)
  const [showNew, setShowNew]   = useState(false)
  const [showCon, setShowCon]   = useState(false)

  const validate = () => {
    const e = {}
    if (!formData.old_password)   e.old_password   = 'Current password is required'
    if (!formData.new_password1)  e.new_password1  = 'New password is required'
    else if (formData.new_password1.length < 8) e.new_password1 = 'Must be at least 8 characters'
    if (!formData.new_password2)  e.new_password2  = 'Please confirm your new password'
    else if (formData.new_password1 !== formData.new_password2) e.new_password2 = 'Passwords do not match'
    if (formData.old_password && formData.new_password1 && formData.old_password === formData.new_password1)
      e.new_password1 = 'New password must be different from current password'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setAlert({ type: '', message: '' })
    try {
      await changePassword(formData)
      setAlert({ type: 'success', message: 'Password updated successfully. Use your new password next time you sign in.' })
      setFormData({ old_password: '', new_password1: '', new_password2: '' })
      setErrors({})
    } catch (err) {
      const data = err.data || {}
      const mapped = {}
      if (data.old_password)  mapped.old_password  = Array.isArray(data.old_password)  ? data.old_password[0]  : data.old_password
      if (data.new_password1) mapped.new_password1 = Array.isArray(data.new_password1) ? data.new_password1[0] : data.new_password1
      if (data.new_password2) mapped.new_password2 = Array.isArray(data.new_password2) ? data.new_password2[0] : data.new_password2
      if (!Object.keys(mapped).length) mapped.form = err.message || 'Failed to update password.'
      if (mapped.form) setAlert({ type: 'error', message: mapped.form })
      else setErrors(mapped)
    } finally {
      setLoading(false)
    }
  }

  const PwField = ({ id, name, label, show, toggle, placeholder }) => (
    <div className="reveal">
      <label className="form-label" htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          id={id} name={name}
          type={show ? 'text' : 'password'}
          className="form-input pr-12"
          placeholder={placeholder}
          value={formData[name]}
          onChange={e => { setFormData(p => ({ ...p, [name]: e.target.value })); if (errors[name]) setErrors(pr => ({ ...pr, [name]: '' })) }}
          autoComplete={name === 'old_password' ? 'current-password' : 'new-password'}
        />
        <button type="button" onClick={toggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity"
          style={{ color: 'var(--c-text-muted)', opacity: 0.5 }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
          aria-label={show ? 'Hide' : 'Show'}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {errors[name] && <p className="mt-1.5 text-xs" style={{ color: '#DC2626' }}>{errors[name]}</p>}
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <p className="section-eyebrow">Account Security</p>
        <h2 className="font-display text-3xl font-medium" style={{ color: 'var(--c-primary)' }}>
          Change Password
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--c-text-muted)' }}>
          Keep your account secure. We recommend using a unique password you don't use elsewhere.
        </p>
      </div>

      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-5">
          <PwField
            id="old_password" name="old_password" label="Current Password"
            show={showOld} toggle={() => setShowOld(p => !p)} placeholder="Your current password"
          />
          <div className="pt-2 border-t" style={{ borderColor: '#F3F4F6' }} />
          <PwField
            id="new_password1" name="new_password1" label="New Password"
            show={showNew} toggle={() => setShowNew(p => !p)} placeholder="Min. 8 characters"
          />
          <PwField
            id="new_password2" name="new_password2" label="Confirm New Password"
            show={showCon} toggle={() => setShowCon(p => !p)} placeholder="Repeat your new password"
          />
        </div>

        <button
          type="submit"
          className="btn-primary mt-8"
          disabled={loading}
          style={loading ? { opacity: 0.7, cursor: 'not-allowed', pointerEvents: 'none' } : {}}
        >
          <span>{loading ? 'Updating…' : 'Update Password'}</span>
        </button>
      </form>

      {/* Security tips */}
      <div className="mt-10 pt-8 border-t reveal" style={{ borderColor: '#E5E7EB' }}>
        <p className="text-xs tracking-widest uppercase mb-4 font-semibold" style={{ color: 'var(--c-text-muted)' }}>
          Security Tips
        </p>
        <ul className="space-y-2">
          {[
            'Use at least 8 characters with a mix of letters, numbers, and symbols',
            'Avoid using the same password across multiple sites',
            'Never share your password with anyone, including our support team',
          ].map(tip => (
            <li key={tip} className="flex items-start gap-2.5 text-xs leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>
              <span className="mt-0.5 flex-shrink-0" style={{ color: 'var(--c-accent)' }}>✦</span>
              {tip}
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <Link to="/forgot-password" className="text-xs underline underline-offset-2 transition-colors"
            style={{ color: 'var(--c-text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--c-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-muted)'}
          >
            Forgot your current password? Reset it here
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Orders Tab ────────────────────────────────────────────────────────────────
function OrdersTab() {
  return (
    <div>
      <div className="mb-8">
        <p className="section-eyebrow">Purchase History</p>
        <h2 className="font-display text-3xl font-medium" style={{ color: 'var(--c-primary)' }}>
          My Orders
        </h2>
      </div>

      {/* Empty state */}
      <div className="reveal text-center py-20"
        style={{ background: 'white', border: '1px solid #F3F4F6' }}
      >
        <div
          className="w-16 h-16 mx-auto mb-5 flex items-center justify-center"
          style={{ background: 'rgba(6,78,59,0.06)', color: 'var(--c-primary)' }}
        >
          <ShoppingBagIcon />
        </div>
        <p className="font-display text-2xl font-medium mb-2" style={{ color: 'var(--c-primary)' }}>
          No orders yet
        </p>
        <p className="text-sm mb-8 max-w-xs mx-auto" style={{ color: 'var(--c-text-muted)' }}>
          When you place an order, it'll appear here so you can track and manage it.
        </p>
        <Link to="/collections" className="btn-primary inline-flex">
          <span>Explore Collections</span>
        </Link>
      </div>
    </div>
  )
}
