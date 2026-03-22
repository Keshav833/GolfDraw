import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, resetAttempts } from '@/lib/auth/adminLoginLimiter'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: { message: 'invalid_credentials' } }, { status: 400 })
    }

    // 1. Check rate limit
    const limiter = checkRateLimit(email)
    if (!limiter.allowed) {
      return NextResponse.json({ 
        error: { message: 'too_many_requests', retry_after_ms: limiter.remainingMs } 
      }, { status: 429 })
    }

    // 2. Sign in via Supabase (Cookie-based server client)
    const supabase = createClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    })

    if (signInError) {
      // Map common Supabase errors to generic messages for security
      if (signInError.message.includes('Invalid login')) {
        return NextResponse.json({ error: { message: 'invalid_credentials' } }, { status: 401 })
      }
      return NextResponse.json({ error: { message: 'default' } }, { status: 401 })
    }

    // 3. Check role IMMEDIATELY
    const role = data.user?.app_metadata?.role
    if (role !== 'admin') {
      // Sign them back out — unauthorized access attempt to admin portal
      await supabase.auth.signOut()
      return NextResponse.json({ error: { message: 'access_denied' } }, { status: 403 })
    }

    // 4. Success — reset attempts
    resetAttempts(email)

    // 5. Return success — cookie is already handled by middleware/server client setAll
    return NextResponse.json({ 
      data: { role: 'admin' }, 
      error: null 
    })

  } catch (error) {
    console.error('Admin Login API Error:', error)
    return NextResponse.json({ error: { message: 'default' } }, { status: 500 })
  }
}
