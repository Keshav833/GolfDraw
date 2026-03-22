'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { PlanCard } from '@/components/subscription/PlanCard';

export default function RegisterPlan() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null);
  const [pendingRegistration, setPendingRegistration] = useState<{
    full_name: string;
    email: string;
    password: string;
  } | null>(null);

  const queryPct = Number(searchParams.get('charity_pct') ?? '0');
  const charityPct = Number.isFinite(queryPct) && queryPct >= 0 ? queryPct : 0;
  const monthlyCharityAmount = (9 * charityPct) / 100;
  const monthlyPrizePoolAmount = 9 - monthlyCharityAmount;
  const yearlyCharityAmount = (86 * charityPct) / 100;
  const yearlyPrizePoolAmount = 86 - yearlyCharityAmount;

  useEffect(() => {
    const pending = sessionStorage.getItem('pending_registration');

    if (!pending) {
      router.replace('/register');
      return;
    }

    try {
      setPendingRegistration(JSON.parse(pending));
    } catch {
      sessionStorage.removeItem('pending_registration');
      router.replace('/register');
    }
  }, [router]);

  const handleSelectPlan = async (planType: 'monthly' | 'yearly') => {
    if (!pendingRegistration) {
      toast.error('Please complete registration first.');
      router.push('/register');
      return;
    }

    setLoading(planType);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...pendingRegistration,
          charity_contribution_pct: charityPct,
          plan_type: planType,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error || !json.data) {
        throw new Error(json.error?.message || 'Failed to activate plan');
      }

      sessionStorage.removeItem('pending_registration');
      router.push('/dashboard?account_created=1');
    } catch (error: any) {
      toast.error(error.message);
      setLoading(null);
    }
  };

  if (!pendingRegistration) {
    return <div className="min-h-screen p-8">Loading plan options...</div>;
  }

  return (
    <div
      className="min-h-screen px-4 py-10 sm:px-6 lg:px-8"
      style={{
        width: 'min(1240px, calc(100vw - 32px))',
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <div
          className="rounded-[32px] border border-white/60 p-8 sm:p-10"
          style={{
            background:
              'radial-gradient(circle at top right, rgba(234,179,8,0.18), transparent 28%), radial-gradient(circle at top left, rgba(125,224,170,0.28), transparent 32%), linear-gradient(145deg, rgba(255,255,255,0.78), rgba(224,229,236,0.94))',
            boxShadow: 'var(--shadow-out)',
          }}
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.28em]" style={{ color: 'var(--accent-dark)' }}>
              Step 3 of 3
            </p>
            <h2
              className="mt-4 text-4xl font-extrabold sm:text-5xl"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}
            >
              Choose your plan
            </h2>
            <p className="mt-4 text-base sm:text-lg" style={{ color: 'var(--text-muted)' }}>
              Your selected charity percentage is shown below so the subscription split stays clear
              before you continue.
            </p>
          </div>

          <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div
              className="rounded-[28px] border border-white/60 p-6"
              style={{
                background: 'linear-gradient(155deg, rgba(255,255,255,0.8), rgba(224,229,236,0.96))',
                boxShadow: 'var(--shadow-out-sm)',
              }}
            >
              <h3 className="text-lg font-bold text-gray-900">
                {charityPct > 0 ? 'Your charity contribution' : 'No charity contribution selected'}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {charityPct > 0
                  ? `You reserved ${charityPct}% for charity. You will choose the actual organisation on your dashboard after signup.`
                  : 'You skipped charity for now, so the full monthly amount goes into the prize pool until you change it later.'}
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-green-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-700">
                    Monthly to charity
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-green-800">
                    £{monthlyCharityAmount.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
                    Monthly to prize pool
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-amber-800">
                    £{monthlyPrizePoolAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="rounded-[28px] p-6"
              style={{
                background: 'linear-gradient(160deg, #1f5b39 0%, #2d8c55 100%)',
                boxShadow: 'var(--shadow-hover)',
              }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-green-100">
                Why it matters
              </p>
              <h3 className="mt-3 text-2xl font-extrabold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Transparent from the start
              </h3>
              <p className="mt-4 text-sm leading-6 text-green-50">
                The prize pool gets what remains after your charity percentage is set aside. That
                makes the split visible before you commit.
              </p>
              <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm text-green-50">
                <p className="font-semibold">Prize pool grows with every subscriber.</p>
                <p className="mt-2 text-green-100">
                  Monthly jackpots are built from actual prize-pool contributions, not raw revenue.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="mx-auto max-w-6xl rounded-[32px] border border-white/60 p-4 sm:p-6"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.64), rgba(224,229,236,0.9))',
            boxShadow: 'var(--shadow-out-sm)',
          }}
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PlanCard
              plan="monthly"
              price={9}
              breakdown={
                charityPct > 0
                  ? [
                      `£${monthlyPrizePoolAmount.toFixed(2)} -> prize pool`,
                      `£${monthlyCharityAmount.toFixed(2)} -> charity (${charityPct}%)`,
                      'Cancel anytime',
                    ]
                  : ['£9.00 -> prize pool', 'Cancel anytime']
              }
              features={[
                'Entered into every monthly draw',
                charityPct > 0 ? `${charityPct}% reserved for charity` : 'Full amount to prize pool',
                'Pick your charity after signup',
              ]}
              onSelect={() => handleSelectPlan('monthly')}
              isLoading={loading === 'monthly'}
            />
            <PlanCard
              plan="yearly"
              price={86}
              breakdown={
                charityPct > 0
                  ? [
                      `£${yearlyPrizePoolAmount.toFixed(2)} -> prize pool / year`,
                      `£${yearlyCharityAmount.toFixed(2)} -> charity / year (${charityPct}%)`,
                      'Cancel anytime',
                    ]
                  : ['£86.00 -> prize pool / year', 'Cancel anytime']
              }
              features={[
                'Entered into every monthly draw',
                charityPct > 0 ? `${charityPct}% reserved for charity` : 'Full amount to prize pool',
                '2 months free (£22 savings)',
              ]}
              featured
              onSelect={() => handleSelectPlan('yearly')}
              isLoading={loading === 'yearly'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
