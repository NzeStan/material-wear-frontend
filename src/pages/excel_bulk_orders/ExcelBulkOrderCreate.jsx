import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { CONTACT } from '../../config/constants'

// ── Icons ──────────────────────────────────────────────────────────────────────
const SpinnerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
    <circle cx="12" cy="12" r="10" strokeOpacity=".2"/>
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
  </svg>
)
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
)
const AlertIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const ExcelIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
)
const CheckIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const CreditCardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
)

// ── Feature card ───────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-2xl" style={{ border: '1px solid var(--c-border)', background: '#fff' }}>
      <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: 'var(--c-bg-warm)', color: 'var(--c-primary)' }}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--c-text)' }}>{title}</p>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--c-text-muted)' }}>{desc}</p>
      </div>
    </div>
  )
}

// ── Step badge ─────────────────────────────────────────────────────────────────
function Step({ number, label, current }) {
  return (
    <div className={`flex items-center gap-2 ${current ? '' : 'opacity-50'}`}>
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{ background: current ? 'var(--c-accent)' : 'var(--c-border)', color: current ? '#fff' : 'var(--c-text-muted)' }}
      >
        {number}
      </div>
      <span className="text-xs font-medium hidden sm:block" style={{ color: current ? 'var(--c-text)' : 'var(--c-text-muted)' }}>
        {label}
      </span>
    </div>
  )
}

// ── Input style ────────────────────────────────────────────────────────────────
function inputStyle(hasError) {
  return {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem',
    border: `1.5px solid ${hasError ? '#ef4444' : 'var(--c-border)'}`,
    background: 'var(--c-bg)', color: 'var(--c-text)', fontSize: '0.875rem',
    outline: 'none', transition: 'border-color 0.15s', display: 'block',
  }
}

function FormField({ label, required, optional, hint, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--c-text)' }}>
        {label}
        {required && <span className="ml-1" style={{ color: 'var(--c-accent)' }}>*</span>}
        {optional && <span className="ml-1.5 text-xs font-normal" style={{ color: 'var(--c-text-muted)' }}>(optional)</span>}
      </label>
      {children}
      {error && <p className="text-xs mt-1.5" style={{ color: '#ef4444' }}>{error}</p>}
      {hint && !error && <p className="text-xs mt-1.5" style={{ color: 'var(--c-text-muted)' }}>{hint}</p>}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function ExcelBulkOrderCreate() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    coordinator_name: '',
    coordinator_email: '',
    coordinator_phone: '',
    price_per_participant: '',
    requires_custom_name: false,
  })
  const [errors, setErrors]   = useState({})
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    document.title = 'Start Excel Bulk Order — Material Wear'
    return () => { document.title = 'Material Wear Limited' }
  }, [])

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
    setError('')
  }

  function validate() {
    const errs = {}
    if (!form.title.trim())               errs.title               = 'Campaign title is required'
    if (!form.coordinator_name.trim())    errs.coordinator_name    = 'Coordinator name is required'
    if (!form.coordinator_email.trim())   errs.coordinator_email   = 'Email address is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.coordinator_email))
      errs.coordinator_email = 'Enter a valid email address'
    if (!form.coordinator_phone.trim())   errs.coordinator_phone   = 'Phone number is required'
    if (!form.price_per_participant || isNaN(Number(form.price_per_participant)) || Number(form.price_per_participant) <= 0)
      errs.price_per_participant = 'Enter a valid price per participant'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSaving(true)
    setError('')
    try {
      const data = await api.post('/excel-bulk-orders/', {
        title:                  form.title.trim(),
        coordinator_name:       form.coordinator_name.trim(),
        coordinator_email:      form.coordinator_email.trim().toLowerCase(),
        coordinator_phone:      form.coordinator_phone.trim(),
        price_per_participant:  Number(form.price_per_participant),
        requires_custom_name:   form.requires_custom_name,
      })

      // Save to localStorage so coordinator can resume later
      const saved = JSON.parse(localStorage.getItem('mw_excel_orders') || '[]')
      saved.unshift({ id: data.id, reference: data.reference, title: data.title, created_at: new Date().toISOString() })
      localStorage.setItem('mw_excel_orders', JSON.stringify(saved.slice(0, 10)))

      navigate(`/excel-bulk-order/${data.id}`)
    } catch (err) {
      if (err.data && typeof err.data === 'object') {
        const mapped = {}
        Object.entries(err.data).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v })
        setErrors(mapped)
        setError(mapped.detail || mapped.non_field_errors || '')
      } else {
        setError(err.message || 'Failed to create order. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  const steps = ['Create', 'Download', 'Upload', 'Validate', 'Pay', 'Done']

  return (
    <main className="page-transition flex-1" style={{ background: 'var(--c-bg)' }}>

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-20 px-4" style={{ background: 'var(--c-primary)' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg,rgba(255,255,255,0.03) 0,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,rgba(255,255,255,0.03) 0,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 40px)',
          }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
          style={{ background: 'radial-gradient(circle at top right,rgba(245,158,11,0.1) 0%,transparent 60%)' }} />

        <div className="max-w-4xl mx-auto relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-5"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <ExcelIcon />
            <span className="uppercase tracking-widest">Excel Bulk Order</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white mb-5 leading-tight tracking-tight">
            Order for Your<br />Entire Group at Once
          </h1>
          <p className="text-lg max-w-xl mb-10" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Perfect for coordinators managing large groups — upload a spreadsheet with all participant
            details and make one payment for everyone.
          </p>

          {/* Progress steps */}
          <div className="flex items-center gap-2 flex-wrap">
            {steps.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <Step number={i + 1} label={label} current={i === 0} />
                {i < steps.length - 1 && (
                  <div className="w-6 h-px hidden sm:block" style={{ background: 'rgba(255,255,255,0.2)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BODY ──────────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="grid lg:grid-cols-5 gap-10 items-start">

          {/* FORM */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid var(--c-border)', background: '#fff', boxShadow: '0 4px 32px rgba(0,0,0,0.06)' }}>

              <div className="px-7 pt-7 pb-5" style={{ borderBottom: '1px solid var(--c-border)' }}>
                <p className="section-eyebrow mb-1">Step 1 of 6</p>
                <h2 className="font-display text-2xl" style={{ color: 'var(--c-primary)' }}>
                  Create Your Order Campaign
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--c-text-muted)' }}>
                  After submitting, you will receive an Excel template to fill with participant details.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="px-7 py-7 space-y-6" noValidate>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-xl text-sm"
                    style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <AlertIcon /><span>{error}</span>
                  </div>
                )}

                {/* Campaign title */}
                <FormField label="Campaign Title" required error={errors.title}
                  hint="e.g. NYSC Batch C Stream 1 Camp, Finale Ceremony 2024">
                  <input
                    type="text" value={form.title}
                    onChange={e => setField('title', e.target.value)}
                    placeholder="e.g. LAGOS TECH ALUMNI UNIFORMS 2024"
                    style={inputStyle(errors.title)}
                  />
                </FormField>

                {/* Divider */}
                <div className="pt-1">
                  <p className="text-xs uppercase tracking-widest font-semibold mb-4" style={{ color: 'var(--c-text-muted)' }}>
                    Coordinator Details
                  </p>
                  <div className="space-y-5">
                    <FormField label="Coordinator Full Name" required error={errors.coordinator_name}
                      hint="The person responsible for this order">
                      <input
                        type="text" value={form.coordinator_name}
                        onChange={e => setField('coordinator_name', e.target.value)}
                        placeholder="e.g. AMAKA OKONKWO"
                        style={inputStyle(errors.coordinator_name)}
                      />
                    </FormField>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <FormField label="Email Address" required error={errors.coordinator_email}
                        hint="Order confirmation will be sent here">
                        <input
                          type="email" value={form.coordinator_email}
                          onChange={e => setField('coordinator_email', e.target.value)}
                          placeholder="you@example.com"
                          style={inputStyle(errors.coordinator_email)}
                        />
                      </FormField>
                      <FormField label="Phone Number" required error={errors.coordinator_phone}>
                        <input
                          type="tel" value={form.coordinator_phone}
                          onChange={e => setField('coordinator_phone', e.target.value)}
                          placeholder="+234 800 000 0000"
                          style={inputStyle(errors.coordinator_phone)}
                        />
                      </FormField>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <p className="text-xs uppercase tracking-widest font-semibold mb-4" style={{ color: 'var(--c-text-muted)' }}>
                    Pricing
                  </p>
                  <FormField label="Price per Participant (₦)" required error={errors.price_per_participant}
                    hint="7.5% VAT will be added at checkout. This is the base price per person.">
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: 'var(--c-text-muted)' }}>₦</span>
                      <input
                        type="number" min="1" step="0.01"
                        value={form.price_per_participant}
                        onChange={e => setField('price_per_participant', e.target.value)}
                        placeholder="0.00"
                        style={{ ...inputStyle(errors.price_per_participant), paddingLeft: '2rem' }}
                      />
                    </div>
                  </FormField>
                </div>

                {/* Options */}
                <div>
                  <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--c-text-muted)' }}>
                    Options
                  </p>
                  <div
                    className="flex items-center justify-between p-4 rounded-xl cursor-pointer"
                    style={{ border: '1.5px solid var(--c-border)', background: 'var(--c-bg)' }}
                    onClick={() => setField('requires_custom_name', !form.requires_custom_name)}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>
                        Include Custom Name Column
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>
                        Add a "Custom Name" column to the template for printing/embroidery text
                      </p>
                    </div>
                    <div
                      className="relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-200"
                      style={{ background: form.requires_custom_name ? 'var(--c-primary)' : 'var(--c-border)' }}
                    >
                      <div
                        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200"
                        style={{ left: form.requires_custom_name ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
                  >
                    {saving
                      ? <><SpinnerIcon /><span>Creating Campaign & Generating Template...</span></>
                      : <><span>Create Campaign & Get Template</span><ArrowRightIcon /></>
                    }
                  </button>
                  <p className="text-xs text-center mt-3" style={{ color: 'var(--c-text-muted)' }}>
                    An Excel template will be generated immediately.
                    By continuing you agree to our{' '}
                    <Link to="/terms" className="underline" style={{ color: 'var(--c-primary)' }}>
                      Terms & Conditions
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-2 space-y-4">

            {/* How it works */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--c-border)', background: 'var(--c-bg-warm)' }}>
              <div className="px-5 pt-5 pb-3">
                <h3 className="font-display text-lg" style={{ color: 'var(--c-primary)' }}>How It Works</h3>
              </div>
              <div className="px-5 pb-5 space-y-4">
                {[
                  { n: 1, title: 'Create Campaign',    desc: 'Fill in your details and get an Excel template instantly' },
                  { n: 2, title: 'Download Template',  desc: 'Open the Excel file — it has all required columns pre-formatted' },
                  { n: 3, title: 'Fill Participant Data', desc: 'Enter each participant\'s name, size, and optional coupon code' },
                  { n: 4, title: 'Upload & Validate',  desc: 'Upload the filled Excel — our system checks for errors automatically' },
                  { n: 5, title: 'One Payment',        desc: 'Pay for all participants in a single secure transaction via Paystack' },
                  { n: 6, title: 'Done',               desc: 'All participants are registered and confirmation emails are sent' },
                ].map(({ n, title, desc }) => (
                  <div key={n} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: 'var(--c-primary)', marginTop: 1 }}>
                      {n}
                    </span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>{title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <FeatureCard
              icon={<UsersIcon />}
              title="Built for Large Groups"
              desc="Coordinate hundreds of participants with one upload — schools, associations, corps members, event teams."
            />
            <FeatureCard
              icon={<ShieldIcon />}
              title="Secure Single Payment"
              desc="Pay for everyone at once via Paystack. Your financial data is never stored on our servers."
            />
            <FeatureCard
              icon={<CreditCardIcon />}
              title="Coupon Support"
              desc="Include coupon codes per-participant in the Excel to mark selected members as free."
            />

            {/* Resume existing */}
            <div className="rounded-2xl p-5" style={{ border: '1px solid var(--c-border)', background: '#fff' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--c-text)' }}>Returning coordinator?</p>
              <p className="text-xs mb-3" style={{ color: 'var(--c-text-muted)' }}>
                If you've already started an order, you can pick up where you left off.
              </p>
              <div className="flex gap-2">
                <Link to="/excel-my-orders"
                  className="flex-1 text-center py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{ border: '1.5px solid var(--c-border)', color: 'var(--c-text)' }}>
                  View My Orders
                </Link>
              </div>
            </div>

            {/* Contact */}
            <div className="rounded-2xl p-5" style={{ border: '1px solid var(--c-border)', background: '#fff' }}>
              <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>
                Need help with your Excel order? Email{' '}
                <a href={`mailto:${CONTACT.email}`} className="underline" style={{ color: 'var(--c-primary)' }}>
                  {CONTACT.email}
                </a>{' '}or call{' '}
                <a href={`tel:${CONTACT.phone}`} className="underline" style={{ color: 'var(--c-primary)' }}>
                  {CONTACT.phone}
                </a>
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
