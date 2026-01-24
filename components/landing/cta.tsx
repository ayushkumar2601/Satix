"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"

export function CTA() {
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.3 })

  return (
    <section ref={ref} className="section py-24 px-6 bg-[var(--cream)]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 
          className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight leading-[0.9] mb-8 ${
            isInView ? "animate-fade-up" : "opacity-0"
          }`}
        >
          Ready To Build
          <br />
          Your Trust?
        </h2>
        
        <p 
          className={`text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-12 ${
            isInView ? "animate-fade-up stagger-1" : "opacity-0"
          }`}
        >
          Join thousands of credit-invisible individuals who have already 
          unlocked micro-loans through Satix.
        </p>
        
        <div className={isInView ? "animate-fade-up stagger-2" : "opacity-0"}>
          <Link href="/login">
            <Button 
              size="lg" 
              className="bg-[var(--red)] hover:bg-[var(--red)]/90 text-primary-foreground text-lg px-10 py-7 rounded-full uppercase tracking-wider font-semibold group btn-hover"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
        
        <p 
          className={`text-sm text-muted-foreground mt-8 ${
            isInView ? "animate-fade-in stagger-3" : "opacity-0"
          }`}
        >
          No credit check required • 100% secure • Results in minutes
        </p>
      </div>
    </section>
  )
}
