"use client"
import { useEffect } from 'react'
import Script from 'next/script'

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
  useEffect(() => {
    // Initialize Mailchimp form validation once scripts are loaded
    const initializeMailchimp = () => {
      if (typeof window !== 'undefined' && (window as any).jQuery) {
        const $ = (window as any).jQuery;
        (window as any).fnames = new Array();
        (window as any).ftypes = new Array();
        (window as any).fnames[0] = 'EMAIL';
        (window as any).ftypes[0] = 'email';
        (window as any).$mcj = $.noConflict(true);
      }
    }

    // Wait a bit for jQuery and mc-validate to load
    const timer = setTimeout(initializeMailchimp, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <Script
        src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"
        strategy="lazyOnload"
      />
      <Script
        src="https://s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js"
        strategy="lazyOnload"
      />

      <div className={`border border-gray-200 rounded-lg ${compact ? 'p-6' : 'p-8'} bg-white ${className}`}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-light text-gray-900 mb-4">{title}</h2>
          {description && <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>}

          <div id="mc_embed_shell" className="mx-auto">
            <div id="mc_embed_signup">
              <form
                action="https://wixsite.us11.list-manage.com/subscribe/post?u=cb14170b980f1c1055469c89b&amp;id=69ee166416&amp;f_id=00323be0f0"
                method="post"
                id="mc-embedded-subscribe-form"
                name="mc-embedded-subscribe-form"
                className="validate"
                target="_blank"
              >
                <div id="mc_embed_signup_scroll">
                  <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                      type="email"
                      name="EMAIL"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pace-red focus:border-transparent"
                      id="mce-EMAIL"
                      placeholder="Enter your email here"
                      required
                    />
                    {/* Mailchimp bot prevention field */}
                    <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
                      <input
                        type="text"
                        name="b_cb14170b980f1c1055469c89b_69ee166416"
                        tabIndex={-1}
                      />
                    </div>
                    <button
                      type="submit"
                      name="subscribe"
                      id="mc-embedded-subscribe"
                      className="px-6 py-3 bg-pace-red text-white rounded-lg hover:bg-pace-red-dark transition-colors font-medium whitespace-nowrap"
                    >
                      Subscribe
                    </button>
                  </div>

                  {/* Response messages */}
                  <div id="mce-responses" className="mt-3">
                    <div className="response" id="mce-error-response" style={{ display: 'none' }}></div>
                    <div className="response" id="mce-success-response" style={{ display: 'none' }}></div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </>
  )
}

