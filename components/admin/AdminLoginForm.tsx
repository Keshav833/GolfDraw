'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

interface Props {
  accessDenied: boolean
}

export default function AdminLoginForm({ accessDenied }: Props) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(accessDenied ? 'access_denied' : null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error?.message || 'default')
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('default')
    } finally {
      setLoading(false)
    }
  }

  const getErrorMessage = () => {
    switch (error) {
      case 'invalid_credentials': return 'Incorrect email or password'
      case 'access_denied': return 'This account does not have admin access'
      case 'too_many_requests': return 'Too many attempts. Please wait and try again'
      default: return 'Something went wrong. Please try again'
    }
  }

  return (
    <div className="w-full max-w-[420px] flex flex-col items-center">

      {/* Logo / Brand */}
      <div className="mb-10 flex flex-col items-center gap-4">
        <div
          className="h-20 w-20 rounded-2xl flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <ShieldCheck size={36} className="text-[#7de0aa]" />
        </div>

        <div className="text-center">
          <h1
            className="text-[30px] text-white tracking-[-0.5px]"
            style={{ fontFamily: '"DM Serif Display", serif' }}
          >
            GolfDraw
          </h1>
          <div
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest"
            style={{
              background: 'linear-gradient(135deg, rgba(180,140,40,0.25), rgba(220,180,60,0.15))',
              border: '1px solid rgba(200,160,50,0.4)',
              color: '#d4a94a',
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#d4a94a] opacity-80" />
            Admin Portal
          </div>
        </div>
      </div>

      <div className="w-full text-center mb-8">
        <h2
          className="text-[22px] text-white tracking-[-0.3px]"
          style={{ fontFamily: '"DM Serif Display", serif' }}
        >
          Secure Sign In
        </h2>
        <p className="text-[13px] text-white/45 mt-1">Access the GolfDraw admin dashboard</p>
      </div>

      {/* Card */}
      <div
        className="w-full rounded-[28px] p-8"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest ml-1">
              Email address
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl text-[14px] text-white placeholder:text-white/20 focus:outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
              }}
              onFocus={e => {
                e.currentTarget.style.border = '1px solid rgba(125,224,170,0.5)'
                e.currentTarget.style.boxShadow = 'inset 0 2px 8px rgba(0,0,0,0.3), 0 0 0 3px rgba(125,224,170,0.08)'
              }}
              onBlur={e => {
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'
                e.currentTarget.style.boxShadow = 'inset 0 2px 8px rgba(0,0,0,0.3)'
              }}
              placeholder="admin@golfdraw.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest ml-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full px-4 py-3 pr-12 rounded-xl text-[14px] text-white placeholder:text-white/20 focus:outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
                }}
                onFocus={e => {
                  e.currentTarget.style.border = '1px solid rgba(125,224,170,0.5)'
                  e.currentTarget.style.boxShadow = 'inset 0 2px 8px rgba(0,0,0,0.3), 0 0 0 3px rgba(125,224,170,0.08)'
                }}
                onBlur={e => {
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'
                  e.currentTarget.style.boxShadow = 'inset 0 2px 8px rgba(0,0,0,0.3)'
                }}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/30 hover:text-white/70 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="p-3.5 rounded-xl text-[13px] font-medium flex items-center gap-2.5"
              style={{
                background: 'rgba(200,50,50,0.15)',
                border: '1px solid rgba(200,50,50,0.3)',
                color: '#f08080',
              }}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
              {getErrorMessage()}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-[14px] font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 mt-2"
            style={{
              background: 'linear-gradient(135deg, #1a5e38, #0f3d24)',
              boxShadow: '0 4px 20px rgba(10,50,30,0.6), inset 0 1px 0 rgba(125,224,170,0.2)',
              border: '1px solid rgba(125,224,170,0.2)',
            }}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Signing in...
              </>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>
      </div>

      <Link
        href="/"
        className="mt-7 flex items-center gap-2 text-[12px] font-semibold text-white/30 hover:text-white/60 transition-colors"
      >
        <ArrowLeft size={13} />
        Back to main site
      </Link>
    </div>
  )
}
