import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')

  // Handle errors (expired links, etc.)
  if (error) {
    console.error('Auth callback error:', error, error_description)
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(error_description || error)}`
    )
  }

  // Exchange code for session
  if (code) {
    const supabase = createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Code exchange error:', exchangeError)
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      )
    }

    // Successful authentication - redirect to consent (onboarding) for new users
    return NextResponse.redirect(`${requestUrl.origin}/consent`)
  }

  // No code or error - redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
