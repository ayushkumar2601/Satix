"use client"

import { useInView } from "@/hooks/use-in-view"

const steps = [
  {
    number: "01",
    title: "Sign Up",
    description: "Quick OTP verification with your mobile number. No paperwork, no hassle."
  },
  {
    number: "02",
    title: "Share Data",
    description: "Grant consent and upload bills or connect UPI. Your data stays secure."
  },
  {
    number: "03",
    title: "Get Analyzed",
    description: "Our AI reviews your financial behavior in minutes, not days."
  },
  {
    number: "04",
    title: "Unlock Loans",
    description: "Receive your Trust Score and eligible micro-loan options instantly."
  }
]

export function HowItWorks() {
  const { ref: headerRef, isInView: headerInView } = useInView<HTMLDivElement>({ threshold: 0.3 })
  const { ref: gridRef, isInView: gridInView } = useInView<HTMLDivElement>({ threshold: 0.1 })

  return (
    <section className="section py-24 px-6 bg-[var(--blue)]">
      <div className="max-w-6xl mx-auto">
        <div ref={headerRef} className="text-center mb-16">
          <p 
            className={`text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4 ${
              headerInView ? "animate-fade-up" : "opacity-0"
            }`}
          >
            Simple Process
          </p>
          <h2 
            className={`text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight ${
              headerInView ? "animate-fade-up stagger-1" : "opacity-0"
            }`}
          >
            Four Steps To
            <br />
            Financial Freedom
          </h2>
        </div>
        
        <div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`relative group ${
                gridInView ? `animate-fade-up stagger-${index + 1}` : "opacity-0"
              }`}
            >
              <div className="text-7xl md:text-8xl font-bold text-foreground/10 absolute -top-4 -left-2 transition-all duration-500 group-hover:text-foreground/20">
                {step.number}
              </div>
              <div className="relative pt-16 pl-2">
                <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight mb-3 transition-colors duration-300 group-hover:text-[var(--red)]">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
