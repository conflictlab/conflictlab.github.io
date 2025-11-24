"use client"
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
  // Render nothing if we don't have an action
  if (!action) return null

  return (
    <div className={`border border-gray-200 rounded-lg ${compact ? 'p-6' : 'p-8'} bg-white ${className}`}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-light text-gray-900 mb-4">{title}</h2>
        {description && <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>}

        <form action={action} method="post" target="_blank" noValidate className="max-w-md mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          {/* Optional First and Last Name — include to satisfy audiences that require names */}
          <input
            type="text"
            name="FNAME"
            placeholder="First name"
            autoComplete="given-name"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pace-red focus:border-transparent sm:col-span-1"
          />
          <input
            type="text"
            name="LNAME"
            placeholder="Last name"
            autoComplete="family-name"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pace-red focus:border-transparent sm:col-span-1"
          />
          <input
            type="email"
            name="EMAIL"
            placeholder="Email address"
            autoComplete="email"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pace-red focus:border-transparent sm:col-span-1"
            required
          />
          {/* Optional source tracking to a Mailchimp merge tag */}
          {sourceMergeTag && sourceValue && (
            <input type="hidden" name={sourceMergeTag} value={sourceValue} />
          )}
          {/* Mailchimp anti-bot hidden field */}
          {botFieldName && (
            <div aria-hidden="true" style={{ position: 'absolute', left: '-5000px' }}>
              <input type="text" name={botFieldName} tabIndex={-1} defaultValue="" />
            </div>
          )}
          <div className="sm:col-span-3 flex justify-center">
            <button
              type="submit"
              className="px-6 py-3 bg-pace-red text-white rounded-lg hover:bg-pace-red-dark transition-colors font-medium whitespace-nowrap"
            >
              Subscribe
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 mt-3">We respect your privacy. Unsubscribe at any time.</p>
      </div>
    </div>
  )
}
