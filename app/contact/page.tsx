'use client'

import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MapPin, MessageSquare } from 'lucide-react'

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[var(--cream)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--cream)]/95 backdrop-blur-sm border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            href="/"
            className="flex items-center gap-2 text-sm font-medium hover:text-[var(--red)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/login"
            className="bg-foreground text-white px-6 py-2 rounded-lg hover:bg-foreground/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tight mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-lg border border-border/50">
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-6">Send us a Message</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-border/50 focus:outline-none focus:ring-2 focus:ring-[var(--red)]"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border border-border/50 focus:outline-none focus:ring-2 focus:ring-[var(--red)]"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Subject</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-border/50 focus:outline-none focus:ring-2 focus:ring-[var(--red)]"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Message</label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-border/50 focus:outline-none focus:ring-2 focus:ring-[var(--red)]"
                  placeholder="Tell us more..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-foreground text-white py-3 rounded-lg font-semibold hover:bg-foreground/90 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-lg border border-border/50">
              <h2 className="text-2xl font-bold uppercase tracking-tight mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--red)] text-white flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-muted-foreground">support@satix.com</p>
                    <p className="text-muted-foreground">hello@satix.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--blue)] text-foreground flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <p className="text-muted-foreground">+91 1800-123-4567</p>
                    <p className="text-sm text-muted-foreground">Mon-Fri, 9am-6pm IST</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--pink)] text-foreground flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Office</h3>
                    <p className="text-muted-foreground">
                      123 Financial District<br />
                      Mumbai, Maharashtra 400001<br />
                      India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--pink)] p-8 rounded-lg border border-border/50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-foreground text-white flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Live Chat</h3>
                  <p className="text-muted-foreground mb-4">
                    Need immediate assistance? Chat with our support team.
                  </p>
                  <button className="bg-foreground text-white px-6 py-2 rounded-lg font-semibold hover:bg-foreground/90 transition-colors">
                    Start Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 bg-[var(--blue)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground mb-8">
            Check out our FAQ section for quick answers to common questions.
          </p>
          <Link
            href="/documentation"
            className="inline-block bg-foreground text-white px-8 py-4 rounded-lg font-semibold hover:bg-foreground/90 transition-colors"
          >
            View Documentation
          </Link>
        </div>
      </section>
    </main>
  )
}
