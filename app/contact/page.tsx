'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle, Clock } from 'lucide-react'
import companyData from '@/content/company.json'

export default function Contact() {
  const [formStatus, setFormStatus] = useState<'idle' | 'submitted'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    setFormStatus('submitted')
    setTimeout(() => setFormStatus('idle'), 3000)
  }

  return (
    <>
      {/* Hero Section with transparent logo watermark */}
      <section className="py-24 hero-background-network-image logo-watermark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-12 leading-tight">
            Contact
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed">
            Ready to discuss how predictive intelligence can serve your organization? 
            Get in touch to explore pilot programs and partnerships.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-2xl font-light mb-6">Get in Touch</h2>
              <div className="space-y-4">
                <div>
                  <div className="font-medium mb-1">Email</div>
                  <a 
                    href={`mailto:${companyData.contact.email}`}
                    className="text-clairient-blue hover:text-clairient-dark"
                  >
                    {companyData.contact.email}
                  </a>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-light mb-6">What We Discuss</h2>
              <ul className="space-y-2 text-gray-600">
                <li>Pilot program design</li>
                <li>Technology demonstration</li>
                <li>Integration planning</li>
                <li>Custom solutions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-light mb-8">Send a Message</h2>

            {formStatus === 'submitted' ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-green-800 mb-2">
                  Message sent successfully
                </h4>
                <p className="text-green-600">
                  We&rsquo;ll be in touch within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-clairient-blue focus:border-clairient-blue"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-clairient-blue focus:border-clairient-blue"
                      placeholder="Smith"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-clairient-blue focus:border-clairient-blue"
                    placeholder="john.smith@company.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    id="company"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-clairient-blue focus:border-clairient-blue"
                    placeholder="Acme Corporation"
                  />
                </div>
                
                <div>
                  <label htmlFor="interest" className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Interest *
                  </label>
                  <select
                    id="interest"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-clairient-blue focus:border-clairient-blue"
                  >
                    <option value="">Please select...</option>
                    <option value="portfolio-risk">Portfolio Risk Intelligence</option>
                    <option value="insurance-srcc">Insurance Risk Forecasting</option>
                    <option value="esg-screening">ESG Screening</option>
                    <option value="early-warning">Early Warning Systems</option>
                    <option value="custom-solution">Custom Solution</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-clairient-blue focus:border-clairient-blue"
                    placeholder="Tell us about your needs and timeline..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="btn-primary flex items-center"
                >
                  Send Message
                  <Send className="ml-2" size={16} />
                </button>
                
                <p className="text-xs text-gray-500">
                  We respect your privacy and will never share your information.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
