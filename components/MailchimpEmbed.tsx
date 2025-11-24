"use client"
import { useState, FormEvent } from 'react'
import companyData from '@/content/company.json'

type Props = {
  action?: string
  botFieldName?: string
  title?: string
  description?: string
  className?: string
  compact?: boolean
  sourceMergeTag?: string
  sourceValue?: string
}

export default function MailchimpEmbed({
  action = ((companyData as any).contact?.newsletterMailchimpAction || '').trim(),
  botFieldName = ((companyData as any).contact?.newsletterMailchimpBotFieldName || '').trim(),
  title = "PaCE's Monthly Risk Prediction Report",
  description = "Every month the PaCE Project publishes a risk prediction report. Sign up here to receive it in your inbox!",
  className = '',
  compact = false,
  sourceMergeTag,
  sourceValue,
}: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [email, setEmail] = useState('')

  // Render nothing if we don't have an action
  if (!action) return null

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')

    // Convert action URL to JSONP format (Mailchimp supports this)
    const jsonpUrl = action.replace('/post?', '/post-json?')
    const params = new URLSearchParams()
    params.append('EMAIL', email)
    if (sourceMergeTag && sourceValue) {
      params.append(sourceMergeTag, sourceValue)
    }
    if (botFieldName) {
      params.append(botFieldName, '')
    }

    try {
      const response = await fetch(`${jsonpUrl}&${params.toString()}`, {
        method: 'GET',
        mode: 'no-cors',
      })
      // With no-cors, we can't read the response, so we assume success
      setStatus('success')
      setEmail('')
    } catch (error) {
      setStatus('error')
    }
  }

  return (
    <div className={`border border-gray-200 rounded-lg ${compact ? 'p-6' : 'p-8'} bg-white ${className}`}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-light text-gray-900 mb-4">{title}</h2>
        {description && <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>}

        {status === 'success' ? (
          <div className="text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded max-w-md mx-auto">
            You're subscribed! You'll receive the next newsletter when it's published.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                name="EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email here"
                autoComplete="email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pace-red focus:border-transparent"
                required
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3 bg-pace-red text-white rounded-lg hover:bg-pace-red-dark transition-colors font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
            {status === 'error' && (
              <p className="text-sm text-red-600 mt-3">
                There was a problem subscribing. Please try again.
              </p>
            )}
          </form>
        )}

        <p className="text-xs text-gray-500 mt-3">We respect your privacy. Unsubscribe at any time.</p>
      </div>
    </div>
  )
}
