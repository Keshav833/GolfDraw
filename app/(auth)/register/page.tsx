'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';

export default function RegisterStep1() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const full_name = formData.get('full_name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    sessionStorage.setItem(
      'pending_registration',
      JSON.stringify({ full_name, email, password })
    );

    setLoading(false);
    toast.success('Details saved.');
    router.push('/register/charity');
  };

  return (
    <div className="flex flex-col w-full">
      <div className="w-full flex justify-center mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-decoration-none"
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <Image
              src="/images/GolfDraw.png"
              alt="GolfDraw"
              width={40}
              height={40}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              color: 'var(--text-main)',
            }}
          >
            GolfDraw
          </span>
        </Link>
      </div>

      <div className="neu-panel relative space-y-8">
        <Link
          href="/"
          className="group absolute left-6 top-6 flex items-center gap-1.5 rounded-full bg-white/40 px-3.5 py-1.5 text-xs font-bold transition-all hover:bg-white/60 hover:text-green-800"
          style={{ color: 'var(--text-muted)' }}
        >
          <ChevronLeft
            size={14}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          BACK
        </Link>

        <div className="text-center">
          <p
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--accent-dark)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px',
            }}
          >
            Step 1 of 3
          </p>
          <h2
            className="text-3xl font-extrabold font-serif"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Create Account
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Register with your name, email, and password.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-5">
            <input
              type="text"
              name="full_name"
              placeholder="Full Name"
              required
              className="neu-input"
            />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              required
              className="neu-input"
            />
            <input
              type="password"
              name="password"
              placeholder="Password (min 6 chars)"
              minLength={6}
              required
              className="neu-input"
            />
          </div>
          <button
            type="submit"
            className="neu-btn neu-btn-primary mt-8"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Continue'}
          </button>
        </form>
        <div className="text-center text-sm mt-6">
          <span style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
          </span>
          <Link
            href="/login"
            style={{ color: 'var(--accent-dark)', fontWeight: 600 }}
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
