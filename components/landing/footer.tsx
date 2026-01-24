"use client"

import Link from "next/link"

export function Footer() {
  return (
    <>
      {/* Main Statement Footer - Beige with oversized typography */}
      <footer className="footer-main">
        <p className="footer-tagline">
          Building trust beyond traditional credit.
        </p>
        
        <h2 className="footer-title">
          SATIX
        </h2>
        
        <nav className="footer-nav">
          <Link href="/about">About</Link>
          <Link href="/education">Education</Link>
          <Link href="/documentation">Docs</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </footer>
      
      {/* Black Legal Footer */}
      <footer className="footer-legal">
        <p>&copy; {new Date().getFullYear()} Satix. All rights reserved.</p>
        
        <nav>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </footer>
    </>
  )
}
