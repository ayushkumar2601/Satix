'use client'

import Link from 'next/link'
import { ArrowLeft, Code, Book, Zap, Shield } from 'lucide-react'

const docSections = [
  {
    icon: Zap,
    title: "Quick Start",
    description: "Get up and running with Satix in minutes.",
    links: [
      { name: "Create an Account", href: "#" },
      { name: "Upload Documents", href: "#" },
      { name: "Get Your Score", href: "#" },
      { name: "Apply for Loans", href: "#" }
    ]
  },
  {
    icon: Book,
    title: "User Guide",
    description: "Comprehensive guide to using Satix effectively.",
    links: [
      { name: "Dashboard Overview", href: "#" },
      { name: "Document Requirements", href: "#" },
      { name: "Score Breakdown", href: "#" },
      { name: "Loan Application Process", href: "#" }
    ]
  },
  {
    icon: Code,
    title: "API Documentation",
    description: "Integrate Satix into your applications.",
    links: [
      { name: "Authentication", href: "#" },
      { name: "API Endpoints", href: "#" },
      { name: "Webhooks", href: "#" },
      { name: "Rate Limits", href: "#" }
    ]
  },
  {
    icon: Shield,
    title: "Security & Privacy",
    description: "Learn how we protect your data and ensure privacy.",
    links: [
      { name: "Data Encryption", href: "#" },
      { name: "Privacy Policy", href: "#" },
      { name: "Compliance", href: "#" },
      { name: "Data Retention", href: "#" }
    ]
  }
]

export default function DocumentationPage() {
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
            Documentation
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete guides, API references, and resources to help you make the most of Satix.
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <section className="px-6 pb-12">
        <div className="max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search documentation..."
            className="w-full px-6 py-4 rounded-lg border border-border/50 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--red)]"
          />
        </div>
      </section>

      {/* Documentation Grid */}
      <section className="py-12 px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {docSections.map((section, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-lg border border-border/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-[var(--blue)] text-foreground flex items-center justify-center mb-6">
                  <section.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-tight mb-3">
                  {section.title}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {section.description}
                </p>
                <ul className="space-y-3">
                  {section.links.map((link, idx) => (
                    <li key={idx}>
                      <Link 
                        href={link.href}
                        className="text-[var(--red)] hover:underline font-medium"
                      >
                        {link.name} →
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-16 px-6 bg-[var(--pink)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">
            Need More Help?
          </h2>
          <p className="text-muted-foreground mb-8">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-foreground text-white px-8 py-4 rounded-lg font-semibold hover:bg-foreground/90 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </main>
  )
}
