"use client"
import { useState } from 'react'
import companyData from '@/content/company.json'

type Props = {
  title?: string
  description?: string
  source?: string
  className?: string
  compact?: boolean
}

export default function NewsletterSignup({
  title = "PaCE's Monthly Risk Prediction Report",
  description = "Every month the PaCE Project publishes a risk prediction report. Sign up here to receive it in your inbox!",
  source = 'newsletter',
  className = '',
  compact = false,
}: Props) {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')

  const endpoint = ((companyData as any).contact?.newsletterEndpoint || '').trim()
  const externalUrl = ((companyData as any).contact?.newsletterUrl || '').trim()
  const fallbackEmail = (companyData as any).contact?.email || 'info@forecastlab.org'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('idle')
    setErrorMsg('')
    const form = e.currentTarget
    const fd = new FormData(form)
    const email = (fd.get('email') as string || '').trim()
    const trap = (fd.get('_gotcha') as string || '').trim()
    if (trap) return // bot
    if (!email) {
      setStatus('error')
      setErrorMsg('Please enter a valid email address.')
      return
    }

    if (!endpoint) {
      // If no endpoint configured, fallback to mailto to ensure UX still works
      const subject = encodeURIComponent('Subscribe to PaCE Newsletter')
      const body = encodeURIComponent(`Email: ${email}`)
      window.location.href = `mailto:${fallbackEmail}?subject=${subject}&body=${body}`
      setStatus('success')
      form.reset()
      return
    }

    try {
      fd.append('_subject', 'PaCE Newsletter Signup')
      fd.append('_source', source)
      if (typeof window !== 'undefined') fd.append('_referrer', window.location.href)
      const res = await fetch(endpoint, {
        method: 'POST',
        body: fd,
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('success')
      form.reset()
    } catch (err) {
      setStatus('error')
      setErrorMsg('There was a problem subscribing. Please try again or contact us.')
    }
  }

  // External provider link (e.g., Google Form, Mailchimp) takes precedence if set
  if (!endpoint && externalUrl) {
    return (
      <div className={`border border-gray-200 rounded-lg p-8 bg-white ${className}`}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-light text-gray-900 mb-4">{title}</h2>
          {description && <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>}
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex items-center"
          >
            Subscribe to Newsletter
          </a>
          <p className="text-xs text-gray-500 mt-3">We respect your privacy. Unsubscribe at any time.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`border border-gray-200 rounded-lg ${compact ? 'p-6' : 'p-8'} bg-white ${className}`}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-light text-gray-900 mb-4">{title}</h2>
        {description && <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>}

        {status === 'success' ? (
          <div className="text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded">
            You’re subscribed! Check your inbox for the next update.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              name="email"
              placeholder="Enter your email here"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pace-red focus:border-transparent"
              required
            />
            {/* Honeypot */}
            <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <button
              type="submit"
              className="px-6 py-3 bg-pace-red text-white rounded-lg hover:bg-pace-red-dark transition-colors font-medium whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-sm text-red-600 mt-3">{errorMsg}</p>
        )}
        <p className="text-xs text-gray-500 mt-3">
          We respect your privacy. Unsubscribe at any time.
        </p>
        {!endpoint && !externalUrl && (
          <p className="text-xs text-gray-400 mt-1">Admin note: configure contact.newsletterEndpoint or contact.newsletterUrl in content/company.json.</p>
        )}
      </div>
    </div>
  )
}

