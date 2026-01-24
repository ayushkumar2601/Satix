"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-[var(--cream)]/80 backdrop-blur-sm border-b border-border/50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold uppercase tracking-tight">
          Satix
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm uppercase tracking-wider hover:text-[var(--red)] transition-colors">
            How It Works
          </Link>
          <Link href="#about" className="text-sm uppercase tracking-wider hover:text-[var(--red)] transition-colors">
            About
          </Link>
        </nav>
        
        <Link href="/login">
          <Button 
            variant="outline" 
            className="rounded-full uppercase text-sm tracking-wider border-foreground hover:bg-foreground hover:text-background bg-transparent"
          >
            Login
          </Button>
        </Link>
      </div>
    </header>
  )
}
