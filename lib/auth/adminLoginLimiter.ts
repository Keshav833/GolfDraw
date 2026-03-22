const MAX_ATTEMPTS = 5
const WINDOW_MS    = 15 * 60 * 1000  // 15 minutes

// Simple in-memory store (works for single instance)
const attempts: Record<string, {
  count: number
  resetAt: number
}> = {}

export function checkRateLimit(email: string): {
  allowed: boolean
  remainingMs: number
} {
  const now = Date.now()
  const key = email.toLowerCase()
  const record = attempts[key]

  if (!record || now > record.resetAt) {
    attempts[key] = { count: 1, resetAt: now + WINDOW_MS }
    return { allowed: true, remainingMs: 0 }
  }

  if (record.count >= MAX_ATTEMPTS) {
    return { 
      allowed: false, 
      remainingMs: record.resetAt - now 
    }
  }

  record.count++
  return { allowed: true, remainingMs: 0 }
}

export function resetAttempts(email: string) {
  delete attempts[email.toLowerCase()]
}
