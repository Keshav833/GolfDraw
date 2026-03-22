'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password reset link sent! Check your email.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
       <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
         <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 font-serif">Reset Password</h2>
            <p className="mt-2 text-sm text-gray-600">Enter your email and we'll send a reset link</p>
         </div>
         <form className="mt-8 space-y-6" onSubmit={handleReset}>
           <Input type="email" placeholder="Email address" required value={email} onChange={e => setEmail(e.target.value)} />
           <Button type="submit" className="w-full bg-green-800 hover:bg-green-700 text-white" disabled={loading}>
             {loading ? 'Sending...' : 'Send Reset Link'}
           </Button>
         </form>
         <div className="text-center text-sm mt-4">
           <Link href="/login" className="text-green-700 hover:underline">Back to login</Link>
         </div>
       </div>
    </div>
  );
}
