'use client'

import Link from 'next/link'
import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { HowItWorks } from "@/components/landing/how-it-works"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"
import FlowingMenuDemo from "@/components/landing/FlowingMenuDemo"
import SectionTransition from "@/components/ui/section-transition"

export default function LandingPage() {
  return (
    <main className="relative">
      <Header />
      
      {/* Hero - Cream/Beige */}
      <Hero />
      
      {/* Smooth transition: Cream → Pink */}
      <SectionTransition 
        from="oklch(0.97 0.01 90)" 
        to="oklch(0.92 0.04 350)" 
      />
      
      {/* Features - Pink */}
      <Features />
      
      {/* Smooth transition: Pink → Blue */}
      <SectionTransition 
        from="oklch(0.92 0.04 350)" 
        to="oklch(0.92 0.05 230)" 
      />
      
      {/* How It Works - Blue */}
      <HowItWorks />
      
      {/* Smooth transition: Blue → Pink */}
      <SectionTransition 
        from="oklch(0.92 0.05 230)" 
        to="oklch(0.92 0.04 350)" 
      />
      
      {/* Flowing Menu - Pink */}
      <FlowingMenuDemo />
      
      {/* Smooth transition: Pink → Cream */}
      <SectionTransition 
        from="oklch(0.92 0.04 350)" 
        to="oklch(0.97 0.01 90)" 
      />
      
      {/* CTA - Cream/Beige */}
      <CTA />
      
      {/* Footer blends seamlessly - no transition needed */}
      <Footer />

      {/* Sticky Mobile CTA - visible on mobile only */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-border/40 px-4 py-3 shadow-xl animate-slide-in-left z-50">
        <Link
          href="/login"
          className="block w-full bg-foreground text-white font-semibold py-3 px-4 rounded-lg text-center hover:bg-foreground/90 transition-colors duration-200 btn-hover"
        >
          Get Your Trust Score
        </Link>
      </div>
    </main>
  )
}
