'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'mockurl', 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mockkey'
    )
  );

  useEffect(() => {
    const redirectSignedInUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const role = data.user.app_metadata?.role;
        if (role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/dashboard');
        }
      }
    };

    redirectSignedInUser();
  }, [router, supabase.auth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.app_metadata?.role;
      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col w-full">
       <div className="w-full flex justify-center mb-8">
         <Link href="/" className="inline-flex items-center gap-3 text-decoration-none">
            <div style={{ width: '48px', height: '48px', background: 'var(--bg)', borderRadius: '50%', boxShadow: 'var(--shadow-out-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="/images/GolfDraw.png" alt="GolfDraw" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--text-main)' }}>GolfDraw</span>
         </Link>
       </div>

       <div className="neu-panel space-y-8">
         <div className="text-center">
            <h2 className="text-3xl font-extrabold font-serif" style={{ fontFamily: "var(--font-display)" }}>Welcome back</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>Sign in to your GolfDraw account</p>
         </div>
         <form className="mt-8 space-y-6" onSubmit={handleLogin}>
           <div className="space-y-5">
              <input type="email" placeholder="Email address" required value={email} onChange={e => setEmail(e.target.value)} className="neu-input" />
              <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} className="neu-input" />
           </div>
           <button type="submit" className="neu-btn neu-btn-primary mt-8" disabled={loading}>
             {loading ? 'Signing in...' : 'Sign In'}
           </button>
         </form>
         <div className="flex justify-between text-sm mt-6">
           <Link href="/forgot-password" style={{ color: 'var(--accent-dark)', fontWeight: 500 }}>Forgot password?</Link>
           <Link href="/register" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Register here</Link>
         </div>
       </div>
    </div>
  );
}
