import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Lock, CheckCircle2, AlertCircle } from 'lucide-react'

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

const BUDGET_OPTIONS = [
  'Under $1,000',
  '$1,000 – $3,000',
  '$3,000 – $7,000',
  '$7,000+',
  'Not sure yet',
]

const TIMELINE_OPTIONS = [
  'ASAP',
  'Within 1 month',
  '1–3 months',
  'Just exploring',
]

const SOURCE_OPTIONS = [
  'Google search',
  'Social media',
  'Referral',
  'Past client',
  'Other',
]

const initialFields = {
  name: '',
  email: '',
  company: '',
  message: '',
  budget: '',
  timeline: '',
  source: '',
  details: '',
  // Honeypot — real visitors never see or fill this in.
  website: '',
}

/**
 * Loads the Google reCAPTCHA v3 script once, only while this component is
 * mounted, so no other page on the site pays for it.
 */
function useRecaptcha(siteKey) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!siteKey) return

    if (window.grecaptcha) {
      setReady(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true
    script.onload = () => {
      window.grecaptcha?.ready(() => setReady(true))
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [siteKey])

  return ready
}

export default function ContactForm() {
  const [fields, setFields] = useState(initialFields)
  // Explicit states: don't infer "is it loading" from booleans scattered
  // around — one status drives the whole UI.
  const [status, setStatus] = useState('IDLE') // IDLE | SUBMITTING | SUCCESS | ERROR
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const btnRef = useRef(null)

  const recaptchaReady = useRecaptcha(RECAPTCHA_SITE_KEY)

  function handleChange(e) {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
  }

  function validate() {
    const errors = {}
    if (!fields.name.trim()) errors.name = 'Your name is required.'
    if (!fields.email.trim()) {
      errors.email = 'Your email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      errors.email = 'That email address looks incomplete.'
    }
    if (!fields.message.trim()) errors.message = 'Tell me a little about the project.'
    return errors
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // Prevent duplicate submits while one is already in flight.
    if (status === 'SUBMITTING') return

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    // Honeypot tripped — silently pretend success, don't tip off the bot.
    if (fields.website) {
      setStatus('SUCCESS')
      return
    }

    setStatus('SUBMITTING')
    setErrorMessage('')

    try {
      let recaptchaToken = ''
      if (RECAPTCHA_SITE_KEY && window.grecaptcha) {
        recaptchaToken = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, {
          action: 'contact_submit',
        })
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, recaptchaToken }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong sending your message.')
      }

      setStatus('SUCCESS')
      setFields(initialFields)
    } catch (err) {
      setStatus('ERROR')
      setErrorMessage(err.message || 'Something went wrong. Please try again.')
    }
  }

  function handleMagneticMove(e) {
    const btn = btnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    btn.style.transform = `translate(${x * 0.12}px, ${y * 0.3}px)`
  }

  function handleMagneticLeave() {
    const btn = btnRef.current
    if (!btn) return
    btn.style.transform = 'translate(0, 0)'
  }

  if (status === 'SUCCESS') {
    return (
      <div className="contact-card flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-2xl bg-[#0d0f16] p-8 text-center ring-1 ring-white/10 sm:p-12">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-neon-teal)]/15 text-[var(--color-neon-teal)]">
          <CheckCircle2 size={28} strokeWidth={1.75} />
        </span>
        <h3 className="text-xl font-bold text-white sm:text-2xl">Thanks!</h3>
        <p className="max-w-sm text-sm leading-relaxed text-white/60 sm:text-base">
          I&rsquo;ve received your message and I&rsquo;ll get back to you within 24–48 hours.
        </p>
        <button
          type="button"
          onClick={() => setStatus('IDLE')}
          className="mt-2 text-xs font-semibold tracking-wide text-[var(--color-neon-teal)] uppercase hover:underline"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="contact-card space-y-5 rounded-2xl bg-[#0d0f16] p-6 ring-1 ring-white/10 sm:p-8"
    >
      {/* Honeypot field — visually hidden, off the tab order, ignored by real users */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={fields.website}
          onChange={handleChange}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field-group">
          <label className="field-label" htmlFor="name">
            Your Name <span className="text-[var(--color-neon-teal)]">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Your name"
            className="field-input"
            value={fields.name}
            onChange={handleChange}
          />
          {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="email">
            Email Address <span className="text-[var(--color-neon-teal)]">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@company.com"
            className="field-input"
            value={fields.email}
            onChange={handleChange}
          />
          {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
        </div>
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="company">
          Company <span className="text-white/35 normal-case">(optional)</span>
        </label>
        <input
          id="company"
          name="company"
          type="text"
          placeholder="Your company or brand"
          className="field-input"
          value={fields.company}
          onChange={handleChange}
        />
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="message">
          What Can I Help You With? <span className="text-[var(--color-neon-teal)]">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Tell me about your project, goals, or ideas..."
          className="field-input resize-y"
          value={fields.message}
          onChange={handleChange}
        />
        {fieldErrors.message && <p className="field-error">{fieldErrors.message}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field-group">
          <label className="field-label" htmlFor="budget">
            Budget Range <span className="text-white/35 normal-case">(optional)</span>
          </label>
          <select
            id="budget"
            name="budget"
            className="field-input"
            value={fields.budget}
            onChange={handleChange}
          >
            <option value="">Select budget range</option>
            {BUDGET_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="timeline">
            Timeline <span className="text-white/35 normal-case">(optional)</span>
          </label>
          <select
            id="timeline"
            name="timeline"
            className="field-input"
            value={fields.timeline}
            onChange={handleChange}
          >
            <option value="">Select timeline</option>
            {TIMELINE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="source">
          How Did You Find Me? <span className="text-white/35 normal-case">(optional)</span>
        </label>
        <select
          id="source"
          name="source"
          className="field-input"
          value={fields.source}
          onChange={handleChange}
        >
          <option value="">Select an option</option>
          {SOURCE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="details">
          Additional Details <span className="text-white/35 normal-case">(optional)</span>
        </label>
        <textarea
          id="details"
          name="details"
          rows={3}
          placeholder="Anything else you'd like to share?"
          className="field-input resize-y"
          value={fields.details}
          onChange={handleChange}
        />
      </div>

      {status === 'ERROR' && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        ref={btnRef}
        type="submit"
        disabled={status === 'SUBMITTING' || (Boolean(RECAPTCHA_SITE_KEY) && !recaptchaReady)}
        onMouseMove={handleMagneticMove}
        onMouseLeave={handleMagneticLeave}
        className="magnetic-btn group flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-neon-teal)] px-6 py-4 text-sm font-bold tracking-wide text-[#05060a] uppercase shadow-[0_0_24px_rgba(255,211,1,0.28),0_0_52px_rgba(255,211,1,0.12)] transition-colors duration-300 hover:bg-[#ffe05a] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'SUBMITTING' ? 'Sending…' : 'Send Message'}
        {status !== 'SUBMITTING' && (
          <ArrowRight
            size={18}
            strokeWidth={2.5}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        )}
      </button>

      <p className="flex items-center gap-2 text-xs text-white/35">
        <Lock size={13} className="shrink-0 text-white/30" />
        Your information is safe and will never be shared with anyone.
      </p>

      {RECAPTCHA_SITE_KEY && (
        <p className="text-center text-[10px] leading-relaxed text-white/25">
          This site is protected by reCAPTCHA and the Google{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white/40"
          >
            Privacy Policy
          </a>{' '}
          and{' '}
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white/40"
          >
            Terms of Service
          </a>{' '}
          apply.
        </p>
      )}
    </form>
  )
}
