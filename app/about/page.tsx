'use client'

import Link from 'next/link'
import { ArrowLeft, Target, Users, Heart, TrendingUp } from 'lucide-react'

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description: "To democratize access to credit by looking beyond traditional credit scores and evaluating financial behavior holistically."
  },
  {
    icon: Users,
    title: "Inclusive Finance",
    description: "We believe everyone deserves a fair chance at financial services, regardless of their credit history."
  },
  {
    icon: Heart,
    title: "Trust First",
    description: "Building trust through transparency, security, and putting our users' interests first in everything we do."
  },
  {
    icon: TrendingUp,
    title: "Innovation",
    description: "Leveraging AI and behavioral analytics to create a more accurate and fair assessment of creditworthiness."
  }
]

const team = [
  {
    name: "Sarah Johnson",
    role: "CEO & Founder",
    bio: "Former fintech executive with 15 years of experience in financial inclusion."
  },
  {
    name: "Michael Chen",
    role: "CTO",
    bio: "AI researcher specializing in behavioral analytics and machine learning."
  },
  {
    name: "Priya Sharma",
    role: "Head of Product",
    bio: "Product leader passionate about creating accessible financial solutions."
  },
  {
    name: "David Martinez",
    role: "Head of Risk",
    bio: "Risk management expert with deep expertise in alternative credit scoring."
  }
]

export default function AboutPage() {
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
            About Satix
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're on a mission to make financial services accessible to everyone by reimagining how creditworthiness is measured.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-10 rounded-lg border border-border/50">
            <h2 className="text-3xl font-bold uppercase tracking-tight mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Satix was born from a simple observation: millions of financially responsible people are denied credit simply because they lack a traditional credit history. We knew there had to be a better way.
              </p>
              <p>
                By analyzing behavioral financial signals—like utility bill payments, UPI transaction patterns, and location stability—we've created a more inclusive and accurate way to assess creditworthiness. Our AI-powered Trust Score looks at what you do, not just what you've borrowed.
              </p>
              <p>
                Today, we're proud to help thousands of people access the financial services they deserve, building a more inclusive financial future for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold uppercase tracking-tight text-center mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-lg border border-border/50"
              >
                <div className="w-14 h-14 rounded-full bg-[var(--red)] text-white flex items-center justify-center mb-6">
                  <value.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-6 bg-[var(--pink)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold uppercase tracking-tight text-center mb-12">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-lg border border-border/50 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-[var(--blue)] mx-auto mb-4"></div>
                <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                <p className="text-sm text-[var(--red)] font-semibold mb-3">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">
            Join Us on Our Mission
          </h2>
          <p className="text-muted-foreground mb-8">
            Be part of the financial inclusion revolution.
          </p>
          <Link
            href="/login"
            className="inline-block bg-foreground text-white px-8 py-4 rounded-lg font-semibold hover:bg-foreground/90 transition-colors"
          >
            Get Your Trust Score
          </Link>
        </div>
      </section>
    </main>
  )
}
