'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ScoreSummary } from '@/components/scores/ScoreSummary';
import { StatusBadge } from '@/components/subscription/StatusBadge';
import { DrawCard } from '@/components/draw/DrawCard';
import { CharityWidget } from '@/components/charity/CharityWidget';
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
    queryFn: () => fetch('/api/users/me').then((response) => response.json()),
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

  if (isLoading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  if (!res?.data) {
    return <div className="p-8">Failed to load user data</div>;
  }

  const { user, subscription, scores, charity, charity_pct: charityPct } = res.data;
  const isSubActive = subscription?.status === 'active';

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-extrabold font-serif">
          Welcome back, {user?.full_name?.split(' ')[0] || 'Golfer'}
        </h1>
        <div className="flex items-center gap-3">
          <StatusBadge status={subscription?.status || 'inactive'} />
          <Button variant="outline" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </div>

      {!isSubActive ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 shadow-sm">
          <h3 className="font-bold">Subscription Inactive</h3>
          <p className="mt-1 text-sm">
            You are not currently entered into the monthly draw.{' '}
            <a href="/account" className="font-medium underline hover:text-amber-900">
              Reactivate here
            </a>
            .
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        <div className="space-y-8 md:col-span-8">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <ScoreSummary scores={scores} />
          </div>
        </div>

        <div className="space-y-8 md:col-span-4">
          <div className="rounded-xl bg-green-800 p-6 text-white shadow-lg">
            <h2 className="mb-2 text-lg font-bold text-green-100/90">Live Jackpot</h2>
            <p className="mb-2 text-5xl font-extrabold leading-none">£2,450</p>
            <p className="text-sm font-medium text-green-200">Draws on April 1st</p>
          </div>

          <CharityWidget
            charity={charity}
            pct={Number(charityPct ?? 0)}
            planType={subscription?.plan_type === 'yearly' ? 'yearly' : 'monthly'}
          />

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-500">
              Latest Result
            </h2>
            <DrawCard
              month="March 2025"
              draw_number={34}
              match_category={scores.length > 2 ? '3-match' : null}
              prize_amount={scores.length > 2 ? 15.0 : null}
              payment_status="paid"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
