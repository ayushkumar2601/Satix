'use client'

import React from "react"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { PhantomWallet } from '@/components/auth/phantom-wallet'
import { signUp, signIn } from '@/lib/auth/actions'

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')

  // Check for error in URL params (from auth callback)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlError = params.get('error')
    if (urlError) {
      setError(decodeURIComponent(urlError))
      // Clean up URL
      window.history.replaceState({}, '', '/login')
    }
  }, [])

  const validateEmail = (email: string) => {
    return email.includes('@') && email.includes('.')
  }

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    // Validate email
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    // Validate password
    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long')
      return
    }

    // Validate confirm password for signup
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      if (isSignUp) {
        // Sign up
        const result = await signUp(email, password)
        if (result.error) {
          setError(result.error)
          setIsLoading(false)
          return
        }
        setSuccessMessage('Account created successfully! Redirecting...')
        setTimeout(() => {
          router.push('/consent')
        }, 1500)
      } else {
        // Sign in
        const result = await signIn(email, password)
        if (result.error) {
          setError(result.error)
          setIsLoading(false)
          return
        }
        setSuccessMessage('Logged in successfully! Redirecting...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      }
    } catch (err) {
      console.error('[v0] Auth error:', err)
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleWalletConnect = (address: string) => {
    setWalletConnected(true)
    setWalletAddress(address)
  }

  return (
    <main className="min-h-screen flex flex-col bg-[var(--cream)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--cream)]/95 backdrop-blur-sm px-4 md:px-6 py-4 flex items-center justify-between border-b border-border/40">
        <Link href="/" className="text-lg md:text-xl font-bold uppercase tracking-tight">
          Satix
        </Link>
        <Link href="/" className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-8 md:py-12">
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="text-center mb-8 md:mb-10 animate-fade-up">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-balance mb-2 md:mb-4 leading-tight">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {isSignUp
                ? 'Sign up to get your Trust Score and unlock micro-loans'
                : 'Sign in to your account and continue your journey'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-up">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-up">
              <p className="text-sm text-green-700 font-medium">{successMessage}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 mb-8">
            {/* Email Input */}
            <div className="animate-fade-up stagger-1">
              <label htmlFor="email" className="block text-xs md:text-sm uppercase tracking-wider mb-2 font-medium">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 text-base py-6 px-4 bg-white border-border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-foreground/10"
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div className="animate-fade-up stagger-2">
              <label htmlFor="password" className="block text-xs md:text-sm uppercase tracking-wider mb-2 font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="flex-1 text-base py-6 px-4 bg-white border-border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-foreground/10"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
            </div>

            {/* Confirm Password Input (Sign Up Only) */}
            {isSignUp && (
              <div className="animate-fade-up stagger-3">
                <label htmlFor="confirmPassword" className="block text-xs md:text-sm uppercase tracking-wider mb-2 font-medium">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 text-base py-6 px-4 bg-white border-border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-foreground/10"
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="animate-fade-up stagger-4 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-foreground text-white hover:bg-foreground/90 disabled:bg-gray-300 py-4 md:py-6 rounded-xl md:rounded-full uppercase tracking-wider font-semibold text-base md:text-lg btn-hover group transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⟳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <div className="text-center mb-8 animate-fade-up stagger-5">
            <p className="text-sm text-muted-foreground">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                  setSuccessMessage('')
                  setEmail('')
                  setPassword('')
                  setConfirmPassword('')
                }}
                className="text-[var(--red)] hover:underline font-medium ml-2 transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[var(--cream)] text-muted-foreground">or</span>
            </div>
          </div>

          {/* Phantom Wallet Section */}
          <div className="animate-fade-up stagger-6">
            <PhantomWallet onConnect={handleWalletConnect} isLoading={isLoading} />
          </div>

          {/* Privacy Notice */}
          <p className="text-center text-xs md:text-sm text-muted-foreground mt-8 leading-relaxed">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-[var(--red)] hover:underline font-medium">
              Terms
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-[var(--red)] hover:underline font-medium">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
