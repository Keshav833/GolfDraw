'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import { ScoreInput } from '@/components/scores/ScoreInput';
import { ScoreHistory } from '@/components/scores/ScoreHistory';
import { StatusBadge } from '@/components/subscription/StatusBadge';
import { AllocationBar } from '@/components/charity/AllocationBar';
import { DrawCard } from '@/components/draw/DrawCard';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loggingOut, setLoggingOut] = useState(false);
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'mockurl',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mockkey'
    )
  );
  const { data: res, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => fetch('/api/users/me').then(r => r.json())
  });

  useEffect(() => {
    if (searchParams.get('account_created') === '1') {
      toast.success('Account created');
      router.replace('/dashboard');
    }
  }, [router, searchParams]);

  const handleLogout = async () => {
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error('Failed to log out');
      setLoggingOut(false);
      return;
    }

    router.push('/login');
    router.refresh();
  };

  if (isLoading) return <div className="p-8">Loading dashboard...</div>;
  if (!res?.data) return <div className="p-8">Failed to load user data</div>;

  const { user, subscription, scores, charity } = res.data;
  const isSubActive = subscription?.status === 'active';
  
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-extrabold font-serif">Welcome back, {user?.full_name?.split(' ')[0] || 'Golfer'}</h1>
        <div className="flex items-center gap-3">
          <StatusBadge status={subscription?.status || 'inactive'} />
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </div>

      {!isSubActive && (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 shadow-sm">
           <h3 className="font-bold">Subscription Inactive</h3>
           <p className="text-sm mt-1">You are not currently entered into the monthly draw. <a href="/account" className="underline font-medium hover:text-amber-900">Reactivate here</a>.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
         <div className="md:col-span-8 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h2 className="text-xl font-bold mb-4">Log a Score</h2>
               <p className="text-sm text-gray-500 mb-6">Enter your latest total score. We keep a rolling window of your 5 most recent scores to use in the monthly algorithmic draws.</p>
               <ScoreInput />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h2 className="text-xl font-bold mb-4">Your Recent Scores</h2>
               <ScoreHistory scores={scores} />
            </div>
         </div>

         <div className="md:col-span-4 space-y-8">
            <div className="bg-green-800 text-white p-6 rounded-xl shadow-lg">
               <h2 className="text-lg font-bold mb-2 text-green-100/90">Live Jackpot</h2>
               <p className="text-5xl font-extrabold leading-none mb-2">£2,450</p>
               <p className="text-green-200 text-sm font-medium">Draws on April 1st</p>
            </div>

            {charity ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                 <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Your Impact</h2>
                 <AllocationBar 
                   pct={user.charity_contribution_pct} 
                   charityName={charity.name} 
                   amount={9 * (user.charity_contribution_pct / 100)} 
                 />
              </div>
            ) : (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                 <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Give Back</h2>
                 <h3 className="text-lg font-bold text-gray-900">Add a charity to give back</h3>
                 <p className="mt-2 text-sm text-gray-600">
                   Choosing a charity does not change draw eligibility. If you skip it, more of your subscription goes into the jackpot.
                 </p>
                 <Link
                   href="/charity"
                   className="mt-4 inline-flex h-8 items-center justify-center rounded-lg bg-green-800 px-4 text-sm font-medium text-white transition-colors hover:bg-green-700"
                 >
                   Choose a charity
                 </Link>
              </div>
            )}
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Latest Result</h2>
               <DrawCard 
                 month="March 2025" 
                 draw_number={34} 
                 match_category={scores.length > 2 ? '3-match' : null} 
                 prize_amount={scores.length > 2 ? 15.00 : null}
                 payment_status="paid"
               />
            </div>
         </div>
      </div>
    </div>
  );
}
