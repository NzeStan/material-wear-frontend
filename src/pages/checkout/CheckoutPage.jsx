import { useState, useEffect } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { api } from '../../services/api'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

// ── helpers ───────────────────────────────────────────────────────────────────

function fmt(amount) {
  if (amount == null) return '—'
  return `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

// ── form primitives ───────────────────────────────────────────────────────────

function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--c-text)' }}>
        {label}{' '}{required && <span style={{ color: '#DC2626' }}>*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs mt-1" style={{ color: 'var(--c-text-muted)' }}>{hint}</p>
      )}
      {error && (
        <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{error}</p>
      )}
    </div>
  )
}

function SectionCard({ icon, title, subtitle, children }) {
  return (
    <div className="p-6 rounded-lg" style={{ background: 'white', border: '1px solid var(--c-border)' }}>
      <div className="flex items-start gap-3 mb-5 pb-4 border-b" style={{ borderColor: 'var(--c-border)' }}>
        <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(6,78,59,0.08)' }}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>{title}</h3>
          {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-muted)' }}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

// ── icons ─────────────────────────────────────────────────────────────────────

const PersonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--c-primary)' }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)
const NyscIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--c-primary)' }}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
)
const ChurchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--c-primary)' }}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

// ── main page ─────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading, user } = useAuth()
  const { cart, cartLoading, refreshCartState, summary } = useCart()

  const [form, setForm] = useState({
    first_name:       '',
    middle_name:      '',
    last_name:        '',
    phone_number:     '',
    call_up_number:   '',
    state:            '',
    local_government: '',
    pickup_on_camp:   true,
    delivery_state:   '',
    delivery_lga:     '',
  })

  const [errors,      setErrors]      = useState({})
  const [submitting,  setSubmitting]  = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [states,      setStates]      = useState([])
  const [sizeOptions, setSizeOptions] = useState({ vest_sizes: [], church_sizes: [] })
  const [churchOptions, setChurchOptions] = useState([])
  const [lgas,        setLgas]        = useState([])
  const [deliveryLgas, setDeliveryLgas] = useState([])

  useEffect(() => {
    document.title = 'Checkout — Material Wear Limited'
    refreshCartState()
    loadStates()
  }, []) // eslint-disable-line

  // Pre-fill name from logged-in user
  useEffect(() => {
    if (user) {
      setForm(p => ({
        ...p,
        first_name: p.first_name || user.first_name || '',
        last_name:  p.last_name  || user.last_name  || '',
      }))
    }
  }, [user])

  async function loadStates() {
    try {
      const [statesData, allData] = await Promise.all([
        api.get('/products/dropdowns/states/'),
        api.get('/products/dropdowns/all/'),
      ])
      setStates(statesData.states || [])
      setSizeOptions(allData.sizes || { vest_sizes: [], church_sizes: [] })
      setChurchOptions(allData.churches || [])
    } catch { /* silent */ }
  }

  // LGAs for NYSC Kit state
  useEffect(() => {
    if (!form.state) { setLgas([]); return }
    api.get(`/products/dropdowns/lgas/?state=${encodeURIComponent(form.state)}`)
      .then(data => setLgas(data?.lgas || []))
      .catch(() => setLgas([]))
  }, [form.state])

  // LGAs for delivery state (church home delivery)
  useEffect(() => {
    if (form.pickup_on_camp || !form.delivery_state) { setDeliveryLgas([]); return }
    api.get(`/products/dropdowns/lgas/?state=${encodeURIComponent(form.delivery_state)}`)
      .then(data => setDeliveryLgas(data?.lgas || []))
      .catch(() => setDeliveryLgas([]))
  }, [form.delivery_state, form.pickup_on_camp])

  const items      = cart?.items || []
  const summaryCount = Number(summary?.count ?? 0)
  const isCartSyncing = cartLoading || (summaryCount > 0 && items.length === 0)
  const vestSizeOptions = (sizeOptions.vest_sizes || []).map(size => ({
    value: typeof size === 'string' ? size : size?.value,
    label: typeof size === 'string' ? size : (size?.display || size?.value),
  })).filter(option => option.value)
  const churchSizeOptions = (sizeOptions.church_sizes || []).map(size => ({
    value: typeof size === 'string' ? size : size?.value,
    label: typeof size === 'string' ? size : (size?.display || size?.value),
  })).filter(option => option.value)
  const stateOptions = states.map(state => ({
    value: typeof state === 'string' ? state : state?.value,
    label: typeof state === 'string' ? state : (state?.display || state?.value),
  })).filter(option => option.value)
  const lgaOptions = lgas.map(lga => ({
    value: typeof lga === 'string' ? lga : lga?.value,
    label: typeof lga === 'string' ? lga : (lga?.display || lga?.value),
  })).filter(option => option.value)
  const deliveryLgaOptions = deliveryLgas.map(lga => ({
    value: typeof lga === 'string' ? lga : lga?.value,
    label: typeof lga === 'string' ? lga : (lga?.display || lga?.value),
  })).filter(option => option.value)
  const hasNyscKit = items.some(i => i.product_type === 'nysc_kit')
  const hasChurch  = items.some(i => i.product_type === 'church')

  function setField(field, value) {
    setForm(p => ({ ...p, [field]: value }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: null }))
  }

  function validate() {
    const e = {}
    if (!form.first_name.trim())  e.first_name  = 'Required'
    if (!form.last_name.trim())   e.last_name   = 'Required'
    if (!form.phone_number.trim()) e.phone_number = 'Required'
    else if (!/^\d{11}$/.test(form.phone_number)) e.phone_number = 'Must be exactly 11 digits'

    if (hasNyscKit) {
      if (!form.call_up_number.trim()) e.call_up_number   = 'Required for NYSC Kit orders'
      if (!form.state)                 e.state            = 'Required for NYSC Kit orders'
      if (!form.local_government)      e.local_government = 'Required'
    }

    if (hasChurch && !form.pickup_on_camp) {
      if (!form.delivery_state) e.delivery_state = 'Required for home delivery'
      if (!form.delivery_lga)   e.delivery_lga   = 'Required for home delivery'
    }
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError(null)
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const payload = {
      first_name:   form.first_name.trim(),
      middle_name:  form.middle_name.trim(),
      last_name:    form.last_name.trim(),
      phone_number: form.phone_number.trim(),
    }
    if (hasNyscKit) {
      payload.call_up_number   = form.call_up_number.trim()
      payload.state            = form.state
      payload.local_government = form.local_government
    }
    if (hasChurch) {
      payload.pickup_on_camp = form.pickup_on_camp
      if (!form.pickup_on_camp) {
        payload.delivery_state = form.delivery_state
        payload.delivery_lga   = form.delivery_lga
      }
    }

    setSubmitting(true)
    try {
      const data = await api.post('/order/checkout/', payload)
      if (data.payment_url) {
        window.location.href = data.payment_url
      } else {
        navigate('/orders')
      }
    } catch (err) {
      const errData = err?.data
      if (errData && typeof errData === 'object' && !errData.detail) {
        const fieldErrors = {}
        Object.entries(errData).forEach(([k, v]) => {
          fieldErrors[k] = Array.isArray(v) ? v[0] : String(v)
        })
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors)
          setSubmitError('Please fix the errors above.')
        } else {
          setSubmitError(err.message || 'Checkout failed')
        }
      } else {
        setSubmitError(err.message || 'Checkout failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── guards ─────────────────────────────────────────────────────────────────

  if (authLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (isCartSyncing) {
    return (
      <main className="flex-1 flex items-center justify-center py-20 px-4" style={{ background: 'var(--c-bg)' }}>
        <div className="text-center max-w-sm">
          <div
            style={{
              width: 40,
              height: 40,
              margin: '0 auto 16px',
              border: '3px solid var(--c-border)',
              borderTopColor: 'var(--c-primary)',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }}
          />
          <h2 className="font-display text-2xl mb-3" style={{ color: 'var(--c-primary)' }}>Syncing your cart</h2>
          <p className="text-sm mb-5" style={{ color: 'var(--c-text-muted)' }}>
            We&apos;re confirming your latest cart items before checkout.
          </p>
          <button type="button" onClick={refreshCartState} className="btn-secondary">
            Refresh Cart
          </button>
        </div>
      </main>
    )
  }

  if (!cartLoading && items.length === 0) {
    return (
      <main className="flex-1 flex items-center justify-center py-20 px-4" style={{ background: 'var(--c-bg)' }}>
        <div className="text-center max-w-sm">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
            style={{ color: '#E5E7EB', margin: '0 auto 16px' }}>
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <h2 className="font-display text-2xl mb-3" style={{ color: 'var(--c-primary)' }}>Your cart is empty</h2>
          <Link to="/collections" className="btn-primary">Browse Collections</Link>
        </div>
      </main>
    )
  }

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <main className="flex-1 py-10 px-4" style={{ background: 'var(--c-bg-warm)', minHeight: '80vh' }}>
      <div className="max-w-5xl mx-auto">

        <div className="mb-8">
          <p className="section-eyebrow mb-1">Secure Checkout</p>
          <h1 className="font-display text-3xl" style={{ color: 'var(--c-primary)' }}>Complete Your Order</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6 items-start">

            {/* ── Left: form ──────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Personal info */}
              <SectionCard icon={<PersonIcon />} title="Personal Information"
                subtitle="Your name as it should appear on the order">
                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  <Field label="First Name" required error={errors.first_name}>
                    <input className="form-input w-full text-sm" value={form.first_name}
                      onChange={e => setField('first_name', e.target.value)} placeholder="John" />
                  </Field>
                  <Field label="Middle Name" error={errors.middle_name}>
                    <input className="form-input w-full text-sm" value={form.middle_name}
                      onChange={e => setField('middle_name', e.target.value)} placeholder="A." />
                  </Field>
                  <Field label="Last Name" required error={errors.last_name}>
                    <input className="form-input w-full text-sm" value={form.last_name}
                      onChange={e => setField('last_name', e.target.value)} placeholder="Doe" />
                  </Field>
                </div>
                <Field label="Phone Number" required error={errors.phone_number}
                  hint="11-digit Nigerian number, e.g. 08012345678">
                  <input className="form-input w-full text-sm" value={form.phone_number}
                    onChange={e => setField('phone_number', e.target.value)}
                    placeholder="08012345678" maxLength={11} inputMode="numeric" />
                </Field>
              </SectionCard>

              {/* NYSC Kit fields */}
              {hasNyscKit && (
                <SectionCard icon={<NyscIcon />} title="NYSC Details"
                  subtitle="Required information for your NYSC Kit order">
                  <div className="space-y-4">
                    <Field label="Call-Up Number" required error={errors.call_up_number}
                      hint="Found on your NYSC call-up letter (e.g. AB/22C/1234)">
                      <input className="form-input w-full text-sm" value={form.call_up_number}
                        onChange={e => setField('call_up_number', e.target.value)}
                        placeholder="e.g. AB/22C/1234" />
                    </Field>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="State of Deployment" required error={errors.state}>
                        <select className="form-input w-full text-sm" value={form.state}
                          onChange={e => { setField('state', e.target.value); setField('local_government', '') }}>
                          <option value="">Select state…</option>
                          {stateOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Local Government Area" required error={errors.local_government}>
                        <select className="form-input w-full text-sm" value={form.local_government}
                          onChange={e => setField('local_government', e.target.value)}
                          disabled={!form.state || lgaOptions.length === 0}>
                          <option value="">Select LGA…</option>
                          {lgaOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* Church delivery fields */}
              {hasChurch && (
                <SectionCard icon={<ChurchIcon />} title="Church Order Delivery"
                  subtitle="How would you like to receive your church item?">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: true,  label: 'Pick up on camp', emoji: '🏕️' },
                        { value: false, label: 'Home delivery',   emoji: '🚚' },
                      ].map(opt => (
                        <button
                          key={String(opt.value)}
                          type="button"
                          onClick={() => setField('pickup_on_camp', opt.value)}
                          className="flex items-center gap-2 p-3 text-sm font-medium transition-all rounded"
                          style={{
                            border: `1.5px solid ${form.pickup_on_camp === opt.value ? 'var(--c-primary)' : 'var(--c-border)'}`,
                            background: form.pickup_on_camp === opt.value ? 'rgba(6,78,59,0.06)' : 'white',
                            color: 'var(--c-text)',
                          }}
                        >
                          <span>{opt.emoji}</span>
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>

                    {!form.pickup_on_camp && (
                      <div className="grid sm:grid-cols-2 gap-4 pt-2">
                        <Field label="Delivery State" required error={errors.delivery_state}>
                          <select className="form-input w-full text-sm" value={form.delivery_state}
                            onChange={e => { setField('delivery_state', e.target.value); setField('delivery_lga', '') }}>
                            <option value="">Select state…</option>
                            {stateOptions.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Delivery LGA" required error={errors.delivery_lga}>
                          <select className="form-input w-full text-sm" value={form.delivery_lga}
                            onChange={e => setField('delivery_lga', e.target.value)}
                            disabled={!form.delivery_state || deliveryLgaOptions.length === 0}>
                          <option value="">Select LGA…</option>
                          {deliveryLgaOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </Field>
                      </div>
                    )}
                  </div>
                </SectionCard>
              )}

              {(vestSizeOptions.length > 0 || churchSizeOptions.length > 0 || churchOptions.length > 0) && (
                <SectionCard
                  icon={<ChurchIcon />}
                  title="Store Options"
                  subtitle="Helpful reference from the live product dropdown endpoints"
                >
                  <div className="space-y-4 text-xs">
                    {vestSizeOptions.length > 0 && (
                      <div>
                        <p className="font-semibold mb-2" style={{ color: 'var(--c-text)' }}>Vest sizes</p>
                        <div className="flex flex-wrap gap-2">
                          {vestSizeOptions.map(option => (
                            <span
                              key={option.value}
                              className="px-2.5 py-1 rounded-full"
                              style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}
                            >
                              {option.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {churchSizeOptions.length > 0 && (
                      <div>
                        <p className="font-semibold mb-2" style={{ color: 'var(--c-text)' }}>Church sizes</p>
                        <div className="flex flex-wrap gap-2">
                          {churchSizeOptions.map(option => (
                            <span
                              key={option.value}
                              className="px-2.5 py-1 rounded-full"
                              style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
                            >
                              {option.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {churchOptions.length > 0 && (
                      <div>
                        <p className="font-semibold mb-2" style={{ color: 'var(--c-text)' }}>Supported church brands</p>
                        <p style={{ color: 'var(--c-text-muted)' }}>
                          {churchOptions.map(option => option.display || option.value).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </SectionCard>
              )}
            </div>

            {/* ── Right: order summary ─────────────────────────── */}
            <div className="lg:sticky lg:top-24">
              <div className="rounded-lg overflow-hidden" style={{ background: 'white', border: '1px solid var(--c-border)' }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-warm)' }}>
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--c-text)' }}>Order Summary</h3>
                </div>

                <div className="px-5 py-4">
                  {/* Items list */}
                  <div className="space-y-3 mb-4 pb-4 border-b" style={{ borderColor: 'var(--c-border)' }}>
                    {items.map(item => (
                      <div key={item.item_key} className="flex justify-between gap-3 text-xs">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate" style={{ color: 'var(--c-text)' }}>
                            {item.product?.name || 'Product'}
                          </p>
                          <p style={{ color: 'var(--c-text-muted)' }}>Qty {item.quantity}</p>
                        </div>
                        <span className="font-semibold flex-shrink-0" style={{ color: 'var(--c-text)' }}>
                          {fmt(item.total_price)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 text-sm mb-5">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--c-text-muted)' }}>Subtotal</span>
                      <span style={{ color: 'var(--c-text)' }}>{fmt(summary?.subtotal ?? cart?.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--c-text-muted)' }}>VAT ({summary?.vat_rate ?? 15}%)</span>
                      <span style={{ color: 'var(--c-text)' }}>{fmt(summary?.vat_amount ?? cart?.vat_amount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-2 border-t"
                      style={{ borderColor: 'var(--c-border)' }}>
                      <span style={{ color: 'var(--c-text)' }}>Total</span>
                      <span style={{ color: 'var(--c-primary)' }}>{fmt(summary?.total ?? cart?.total_cost)}</span>
                    </div>
                  </div>

                  {/* Submit error */}
                  {submitError && (
                    <div className="flex items-start gap-2 p-3 rounded mb-4 text-xs"
                      style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2"
                        style={{ flexShrink: 0, marginTop: 1 }}>
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || cartLoading}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                    style={{ opacity: submitting ? 0.7 : 1 }}
                  >
                    {submitting ? (
                      <>
                        <div style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                        Processing…
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="4" width="22" height="16" rx="2"/>
                          <line x1="1" y1="10" x2="23" y2="10"/>
                        </svg>
                        Pay with Paystack
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ color: 'var(--c-text-muted)' }}>
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <p className="text-xs" style={{ color: 'var(--c-text-muted)' }}>Secured by Paystack</p>
                  </div>
                </div>
              </div>

              <Link
                to="/collections"
                className="flex items-center justify-center gap-1.5 mt-3 text-xs"
                style={{ color: 'var(--c-text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--c-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--c-text-muted)'}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}
