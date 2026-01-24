"use client"

import { Receipt, Smartphone, MapPin, Users } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"

const features = [
  {
    icon: Receipt,
    title: "Utility Bill Analysis",
    description: "Your consistent bill payments show financial responsibility. Upload screenshots—we'll do the rest."
  },
  {
    icon: Smartphone,
    title: "UPI Behavior",
    description: "Connect read-only access to understand your transaction patterns and regular payment habits."
  },
  {
    icon: MapPin,
    title: "Location Stability",
    description: "Residential stability signals reliability. We check address consistency across your documents."
  },
  {
    icon: Users,
    title: "Social Trust",
    description: "Optional references from friends and family can boost your Trust Score even higher."
  }
]

export function Features() {
  const { ref: headerRef, isInView: headerInView } = useInView<HTMLDivElement>({ threshold: 0.3 })
  const { ref: gridRef, isInView: gridInView } = useInView<HTMLDivElement>({ threshold: 0.1 })

  return (
    <section className="section py-24 px-6 bg-[var(--pink)]">
      <div className="max-w-6xl mx-auto">
        <div ref={headerRef} className="text-center mb-16">
          <p 
            className={`text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4 ${
              headerInView ? "animate-fade-up" : "opacity-0"
            }`}
          >
            How It Works
          </p>
          <h2 
            className={`text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight ${
              headerInView ? "animate-fade-up stagger-1" : "opacity-0"
            }`}
          >
            We Look Beyond
            <br />
            Traditional Credit
          </h2>
        </div>
        
        <div ref={gridRef} className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`bg-[var(--cream)] p-8 md:p-10 rounded-lg border border-border/50 card-hover ${
                gridInView ? `animate-fade-up stagger-${index + 1}` : "opacity-0"
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-foreground text-background flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
