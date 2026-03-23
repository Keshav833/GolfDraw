'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CONTRIBUTION_OPTIONS } from '@/lib/types/charity';
import { ChevronLeft } from 'lucide-react';

const optionLabels: Record<(typeof CONTRIBUTION_OPTIONS)[number], string> = {
  10: 'A great start',
  15: 'Most popular',
  30: 'Generous giver',
};

export default function RegisterCharity() {
  const router = useRouter();
  const [selectedPct, setSelectedPct] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const pendingRegistration = sessionStorage.getItem('pending_registration');

    if (!pendingRegistration) {
      router.replace('/register');
    }
  }, [router]);

  const handleContinue = (pct: number) => {
    setSaving(true);
    router.push(`/register/plan?charity_pct=${pct}`);
  };

  return (
    <div
      className="min-h-screen px-4 py-10 sm:px-6 lg:px-8"
      style={{
        width: 'min(1080px, calc(100vw - 32px))',
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      <div className="mx-auto max-w-5xl space-y-8">
        <div
          className="relative rounded-[32px] border border-white/60 p-8 sm:p-10"
          style={{
            background:
              'radial-gradient(circle at top left, rgba(125,224,170,0.34), transparent 32%), linear-gradient(145deg, rgba(255,255,255,0.8), rgba(224,229,236,0.94))',
            boxShadow: 'var(--shadow-out)',
          }}
        >
          <button
            onClick={() => router.push('/register')}
            className="group absolute left-6 top-6 flex items-center gap-1.5 rounded-full bg-white/40 px-3.5 py-1.5 text-xs font-bold transition-all hover:bg-white/60 hover:text-green-800"
            style={{ color: 'var(--text-muted)' }}
          >
            <ChevronLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
            BACK
          </button>

          <div className="mx-auto max-w-3xl text-center">
            <p
              className="text-sm font-bold uppercase tracking-[0.28em]"
              style={{ color: 'var(--accent-dark)' }}
            >
              Step 2 of 3
            </p>
            <h1
              className="mt-4 text-4xl font-extrabold sm:text-5xl"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--text-main)',
              }}
            >
              Give a little back
            </h1>
            <p
              className="mt-4 text-base sm:text-lg"
              style={{ color: 'var(--text-muted)' }}
            >
              Choose how much of your subscription goes to charity each month.
              You can pick your charity after signing up.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {CONTRIBUTION_OPTIONS.map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setSelectedPct(pct)}
                className="rounded-[24px] border p-6 text-left transition-all duration-200"
                style={{
                  background:
                    selectedPct === pct
                      ? 'linear-gradient(160deg, #2d8c55 0%, #3aa660 100%)'
                      : 'linear-gradient(155deg, rgba(255,255,255,0.76), rgba(224,229,236,0.98))',
                  borderColor:
                    selectedPct === pct ? '#2d8c55' : 'rgba(255,255,255,0.62)',
                  boxShadow:
                    selectedPct === pct
                      ? 'var(--shadow-hover)'
                      : 'var(--shadow-out-sm)',
                  color: selectedPct === pct ? '#ffffff' : 'var(--text-main)',
                }}
              >
                <div className="text-4xl font-extrabold">{pct}%</div>
                <p
                  className="mt-3 text-base font-medium"
                  style={{
                    color:
                      selectedPct === pct
                        ? 'rgba(240,255,247,0.92)'
                        : 'var(--text-muted)',
                  }}
                >
                  ₹{((100 * pct) / 100).toFixed(2)} per month
                </p>
                <p
                  className="mt-8 text-sm font-semibold uppercase tracking-[0.22em]"
                  style={{
                    color:
                      selectedPct === pct ? '#ffffff' : 'var(--accent-dark)',
                  }}
                >
                  {optionLabels[pct]}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => handleContinue(0)}
              disabled={saving}
              className="text-sm font-medium text-gray-600 underline-offset-4 hover:text-gray-900 hover:underline"
            >
              Skip for now — I&apos;ll decide later
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={() => handleContinue(selectedPct ?? 0)}
            disabled={saving}
            className="min-w-[240px] bg-green-800 text-white hover:bg-green-700"
          >
            {saving
              ? 'Continuing...'
              : selectedPct
                ? `Continue with ${selectedPct}%`
                : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
