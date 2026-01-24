"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Receipt, Smartphone, MapPin, Check } from "lucide-react"
import { useSessionData } from "@/hooks/use-session-data"
import { useAuth } from "@/hooks/use-auth"

const permissions = [
  {
    id: "bills",
    icon: Receipt,
    title: "Utility Bills",
    description: "Upload electricity, water, or gas bills to verify payment history",
    benefit: "Shows consistent payment behavior"
  },
  {
    id: "upi",
    icon: Smartphone,
    title: "UPI Transactions",
    description: "Read-only access to your transaction history",
    benefit: "Demonstrates regular income & spending patterns"
  },
  {
    id: "location",
    icon: MapPin,
    title: "Address Verification",
    description: "Verify your residential address from documents",
    benefit: "Confirms residential stability"
  }
]

export default function ConsentPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { data: sessionData, updateData } = useSessionData()
  const [accepted, setAccepted] = useState<string[]>(() => sessionData.selectedPermissions || [])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const togglePermission = (id: string) => {
    setAccepted(prev => {
      const updated = prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
      
      // Save to session
      updateData({ selectedPermissions: updated })
      return updated
    })
  }

  const handleContinue = () => {
    if (accepted.length > 0) {
      setIsLoading(true)
      setTimeout(() => {
        router.push("/upload")
      }, 800)
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-[var(--cream)]">
      {/* Header - Mobile Sticky */}
      <header className="sticky top-0 z-40 bg-[var(--cream)]/95 backdrop-blur-sm px-4 md:px-6 py-4 flex items-center justify-between border-b border-border/40">
        <Link href="/" className="text-lg md:text-xl font-bold uppercase tracking-tight">
          Satix
        </Link>
        <Link href="/login" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-4 md:px-6 py-8 md:py-12">
        {/* Heading Section */}
        <div className="text-center mb-10 md:mb-12 animate-fade-up">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-balance mb-3 md:mb-4 leading-tight">
            Data Consent
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Choose what data to share. More data means a more accurate Trust Score 
            and better loan options.
          </p>
        </div>

        {/* Permissions Grid - Scrollable on Mobile */}
        <div className="space-y-3 md:space-y-4 mb-8 flex-1">
          {permissions.map((permission, idx) => {
            const isSelected = accepted.includes(permission.id)
            return (
              <button
                key={permission.id}
                type="button"
                onClick={() => togglePermission(permission.id)}
                className={`w-full p-4 md:p-6 rounded-lg border-2 text-left card-hover stagger-${idx + 1} animate-fade-up transition-all duration-200 ${
                  isSelected 
                    ? "border-foreground bg-white shadow-sm" 
                    : "border-border bg-white hover:border-foreground/30 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    isSelected ? "bg-foreground text-white scale-110" : "bg-muted text-foreground"
                  }`}>
                    {isSelected ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <permission.icon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg font-bold uppercase tracking-tight mb-1">
                      {permission.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-2 leading-relaxed">
                      {permission.description}
                    </p>
                    <p className="text-xs text-[var(--red)] uppercase tracking-wider font-medium">
                      ✓ {permission.benefit}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Sticky CTA on Mobile */}
        <div className="space-y-3 md:space-y-4">
          <Button
            onClick={handleContinue}
            disabled={accepted.length === 0 || isLoading}
            className="w-full bg-foreground text-white hover:bg-foreground/90 disabled:bg-gray-300 py-4 md:py-6 rounded-xl md:rounded-full uppercase tracking-wider font-semibold text-base md:text-lg btn-hover group transition-all duration-200"
          >
            {isLoading ? (
              <>
                <span className="inline-block animate-spin mr-2">⟳</span>
                Processing...
              </>
            ) : (
              <>
                Continue with {accepted.length} Permission{accepted.length !== 1 ? "s" : ""}
                {accepted.length > 0 && <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />}
              </>
            )}
          </Button>

          <p className="text-center text-xs md:text-sm text-muted-foreground leading-relaxed">
            Your data is encrypted and never shared with third parties.
            <br />
            <Link href="/privacy" className="text-[var(--red)] hover:underline font-medium">
              Read our Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
