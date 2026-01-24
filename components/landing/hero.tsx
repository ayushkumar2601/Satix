"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"

export function Hero() {
  const { ref, isInView } = useInView<HTMLElement>({ threshold: 0.2 })

  return (
    <section 
      ref={ref}
      className="section min-h-screen flex flex-col justify-center items-center px-4 md:px-6 py-16 md:py-24 bg-[var(--cream)] relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto text-center">
        <p 
          className={`text-xs md:text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6 md:mb-8 ${
            isInView ? "animate-fade-up" : "opacity-0"
          }`}
        >
          Alternative Credit Scoring
        </p>
        
        <h1 
          className={`text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight leading-[1.1] md:leading-[0.95] mb-6 md:mb-8 text-balance ${
            isInView ? "animate-fade-up stagger-1" : "opacity-0"
          }`}
        >
          No Credit Score?
          <br />
          <span className="text-[var(--red)]">No Problem.</span>
        </h1>
        
        <p 
          className={`text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-12 text-pretty leading-relaxed ${
            isInView ? "animate-fade-up stagger-2" : "opacity-0"
          }`}
        >
          We analyze your financial behavior—utility bills, UPI transactions, 
          location stability—to build your Trust Score and unlock micro-loans.
        </p>
        
        <div className={`${isInView ? "animate-fade-up stagger-3" : "opacity-0"}`}>
          <Link href="/login">
            <Button 
              size="lg" 
              className="bg-foreground text-white hover:bg-foreground/90 text-base md:text-lg px-6 md:px-10 py-3 md:py-7 rounded-lg md:rounded-full uppercase tracking-wider font-semibold group btn-hover transition-all duration-200"
            >
              Check Your Trust Score
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
      
      <div 
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 ${
          isInView ? "animate-fade-in stagger-4" : "opacity-0"
        }`}
      >
        <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-foreground/30 rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  )
}
