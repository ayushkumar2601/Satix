'use server'

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function signUp(email: string, password: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            console.error("[v0] Cookie setting error:", error)
          }
        },
      },
    }
  )

  try {
    // Sign up with email and password - with email confirmation
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback`,
      }
    })

    if (error) {
      console.error("[v0] Sign up error:", error.message)
      return { error: error.message }
    }

    if (data.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          email: data.user.email,
          created_at: new Date().toISOString(),
        })

      if (profileError) {
        console.error("[v0] Profile creation error:", profileError.message)
      }
    }

    return { data, success: true }
  } catch (error) {
    console.error("[v0] Sign up error:", error)
    return { error: "Failed to sign up" }
  }
}

export async function signIn(email: string, password: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            console.error("[v0] Cookie setting error:", error)
          }
        },
      },
    }
  )

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("[v0] Sign in error:", error.message)
      return { error: error.message }
    }

    return { data, success: true }
  } catch (error) {
    console.error("[v0] Sign in error:", error)
    return { error: "Failed to sign in" }
  }
}

export async function signOut() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            console.error("[v0] Cookie setting error:", error)
          }
        },
      },
    }
  )

  await supabase.auth.signOut()
  redirect("/")
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            console.error("[v0] Cookie setting error:", error)
          }
        },
      },
    }
  )

  try {
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) {
      return null
    }
    return data.user
  } catch (error) {
    console.error("[v0] Get user error:", error)
    return null
  }
}

export async function getUserProfile(userId: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            console.error("[v0] Cookie setting error:", error)
          }
        },
      },
    }
  )

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("[v0] Profile fetch error:", error.message)
      return null
    }

    return data
  } catch (error) {
    console.error("[v0] Get profile error:", error)
    return null
  }
}

export async function saveTrustScore(
  userId: string,
  score: number,
  breakdown: Record<string, number>
) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            console.error("[v0] Cookie setting error:", error)
          }
        },
      },
    }
  )

  try {
    // Update profile with latest score
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        trust_score: score,
        score_breakdown: breakdown,
        score_last_updated: new Date().toISOString(),
      })
      .eq("id", userId)

    if (profileError) {
      console.error("[v0] Profile update error:", profileError.message)
      return { error: profileError.message }
    }

    // Add to score history
    const { error: historyError } = await supabase
      .from("score_history")
      .insert({
        user_id: userId,
        score,
        breakdown,
      })

    if (historyError) {
      console.error("[v0] History insert error:", historyError.message)
      return { error: historyError.message }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Save score error:", error)
    return { error: "Failed to save trust score" }
  }
}

export async function createLoan(
  userId: string,
  amount: number,
  tenure: number,
  emiAmount: number
) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            console.error("[v0] Cookie setting error:", error)
          }
        },
      },
    }
  )

  try {
    const { data, error } = await supabase
      .from("loans")
      .insert({
        user_id: userId,
        principal_amount: amount,
        tenure_months: tenure,
        emi_amount: emiAmount,
        status: "active",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Loan creation error:", error.message)
      return { error: error.message }
    }

    return { data, success: true }
  } catch (error) {
    console.error("[v0] Create loan error:", error)
    return { error: "Failed to create loan" }
  }
}
