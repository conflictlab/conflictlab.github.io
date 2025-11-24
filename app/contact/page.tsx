"use client"
import Breadcrumbs from '@/components/Breadcrumbs'
import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'
import companyData from '@/content/company.json'
import MailchimpEmbed from '@/components/MailchimpEmbed'

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg('')
    const formEl = e.currentTarget
    const fd = new FormData(formEl)
    const email = (fd.get('email') as string || '').trim()
    const message = (fd.get('message') as string || '').trim()
    if (!email || !message) {
      setFormStatus('error')
      setErrorMsg('Please provide your email and a message.')
      return
    }
    const endpoint = (companyData as any).contact?.formEndpoint?.trim?.() || ''
    if (!endpoint) {
      const subject = encodeURIComponent('Website Contact — PaCE')
      const parts = [
        fd.get('firstName') ? `First Name: ${fd.get('firstName')}` : '',
        fd.get('lastName') ? `Last Name: ${fd.get('lastName')}` : '',
        fd.get('company') ? `Company: ${fd.get('company')}` : '',
        `Email: ${email}`,
        '',
        message,
      ].filter(Boolean)
      const body = encodeURIComponent(parts.join('\n'))
      window.location.href = `mailto:${companyData.contact.email}?subject=${subject}&body=${body}`
      setFormStatus('success')
      formEl.reset()
      return
    }
    try {
      fd.append('_subject', 'Website Contact — PaCE')
      if (typeof window !== 'undefined') fd.append('_referrer', window.location.href)
      const res = await fetch(endpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error(String(res.status))
      setFormStatus('success')
      formEl.reset()
    } catch (err) {
      setFormStatus('error')
      setErrorMsg(`Sorry, there was a problem sending your message. You can email us directly at ${companyData.contact.email}.`)
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="pt-10 pb-6 md:pt-12 md:pb-8 hero-background-network-image border-b border-gray-200">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]"><Breadcrumbs /></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-2 leading-tight">Contact</h1>
            <p className="text-xl text-gray-600 font-light leading-relaxed">Get in touch with the PaCE team.</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
            <div>
              <h3 className="text-2xl font-light mb-6">Get in Touch</h3>
              <div className="space-y-4">
                <div>
                  <div className="font-medium mb-1">Email</div>
                  <a href={`mailto:${companyData.contact.email}`} className="text-pace-red hover:text-pace-red-dark">
                    {companyData.contact.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl">
            <h3 className="text-2xl font-light mb-8">Send a Message</h3>

            {formStatus === 'success' ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-green-800 mb-2">Message sent successfully</h4>
                <p className="text-green-600">We’ll be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input type="text" id="firstName" className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-pace-red focus:border-pace-red" placeholder="John" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input type="text" id="lastName" className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-pace-red focus:border-pace-red" placeholder="Smith" />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input type="email" id="email" name="email" required className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-pace-red focus:border-pace-red" placeholder="you@company.com" />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input type="text" id="company" className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-pace-red focus:border-pace-red" placeholder="Acme Corporation" />
                </div>

                

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea id="message" name="message" rows={4} required className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-pace-red focus:border-pace-red" placeholder="Tell us about your needs and timeline..."></textarea>
                </div>

                {/* Honeypot for spam bots */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="_gotcha" className="block text-sm mb-2">Leave this field empty</label>
                  <input type="text" id="_gotcha" name="_gotcha" tabIndex={-1} autoComplete="off" />
                </div>

                <button type="submit" className="btn-primary flex items-center">
                  Send Message
                  <Send className="ml-2" size={16} />
                </button>

                {formStatus === 'error' && (
                  <p className="text-sm text-red-600">{errorMsg}</p>
                )}
                <p className="text-xs text-gray-500">Only your email and message are required. We respect your privacy and will never share your information.</p>
              </form>
            )}
          </div>

          {/* Newsletter Signup */}
          <div className="max-w-2xl mt-16">
            <h3 className="text-2xl font-light mb-4">Newsletter</h3>
            <p className="text-gray-600 mb-4">Get monthly updates on research, forecasts, and events.</p>
            {(((companyData as any).contact?.newsletterMailchimpAction || '').trim()) ? (
              <MailchimpEmbed compact sourceMergeTag="MMERGE9" sourceValue="contact_page" />
            ) : (
              <>
                {((companyData as any).contact?.newsletterUrl || '').trim() ? (
                  <a
                    href={(companyData as any).contact.newsletterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary inline-flex items-center"
                  >
                    Subscribe to Newsletter
                  </a>
                ) : (
                  <a
                    href={`mailto:${companyData.contact.email}?subject=${encodeURIComponent('Subscribe to Newsletter')}`}
                    className="btn-secondary inline-flex items-center"
                  >
                    Subscribe via Email
                  </a>
                )}
                <p className="text-xs text-gray-500 mt-2">We send at most one email per month.</p>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
