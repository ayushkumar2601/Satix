'use client'

import Link from 'next/link'
import { ArrowLeft, BookOpen, GraduationCap, FileText, Video } from 'lucide-react'

const educationResources = [
  {
    icon: BookOpen,
    title: "Understanding Trust Scores",
    description: "Learn how Satix evaluates your financial behavior beyond traditional credit scores.",
    topics: [
      "What is a Trust Score?",
      "How it differs from credit scores",
      "Factors that influence your score",
      "Improving your Trust Score"
    ]
  },
  {
    icon: GraduationCap,
    title: "Financial Literacy",
    description: "Build your financial knowledge with our comprehensive guides and tutorials.",
    topics: [
      "Budgeting basics",
      "Managing utility bills",
      "Understanding UPI transactions",
      "Building financial stability"
    ]
  },
  {
    icon: FileText,
    title: "Documentation Guide",
    description: "Step-by-step instructions on preparing and uploading your documents.",
    topics: [
      "Required documents",
      "Document preparation tips",
      "Privacy and security",
      "Common mistakes to avoid"
    ]
  },
  {
    icon: Video,
    title: "Video Tutorials",
    description: "Watch our video guides to get started quickly and understand the process.",
    topics: [
      "Getting started with Satix",
      "Uploading your first documents",
      "Understanding your score breakdown",
      "Applying for loans"
    ]
  }
]

export default function EducationPage() {
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
            Education Center
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Satix, financial literacy, and building your creditworthiness.
          </p>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-12 px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {educationResources.map((resource, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-lg border border-border/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-[var(--red)] text-white flex items-center justify-center mb-6">
                  <resource.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-tight mb-3">
                  {resource.title}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {resource.description}
                </p>
                <ul className="space-y-2">
                  {resource.topics.map((topic, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[var(--red)] mt-1">•</span>
                      <span className="text-sm">{topic}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-6 text-[var(--red)] font-semibold hover:underline">
                  Learn More →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-[var(--pink)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-8">
            Apply your knowledge and build your Trust Score today.
          </p>
          <Link
            href="/login"
            className="inline-block bg-foreground text-white px-8 py-4 rounded-lg font-semibold hover:bg-foreground/90 transition-colors"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </main>
  )
}
