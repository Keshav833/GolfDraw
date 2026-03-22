'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const options = [10, 15, 30];

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

  const saveAndContinue = async (pct: number) => {
    setSaving(true);
    router.push(`/register/plan?charity_pct=${pct}`);
  };

  const handleSkip = async () => {
    await saveAndContinue(0);
  };

  const handleContinue = async () => {
    if (!selectedPct) {
      toast.error('Please choose a percentage or skip for now');
      return;
    }

    await saveAndContinue(selectedPct);
  };

  return (
    <div
      className="min-h-screen px-4 py-10 sm:px-6 lg:px-8"
      style={{
        width: 'min(1120px, calc(100vw - 32px))',
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      <div className="mx-auto max-w-4xl space-y-8">
        <div
          className="overflow-hidden rounded-[32px] border border-white/60 p-8 sm:p-10"
          style={{
            background:
              'radial-gradient(circle at top left, rgba(125,224,170,0.38), transparent 32%), linear-gradient(145deg, rgba(255,255,255,0.78), rgba(224,229,236,0.92))',
            boxShadow: 'var(--shadow-out)',
          }}
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.28em]" style={{ color: 'var(--accent-dark)' }}>
              Step 2 of 3
            </p>
            <h2
              className="mt-4 text-4xl font-extrabold sm:text-5xl"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}
            >
              Give a little back
            </h2>
            <p className="mt-4 text-base sm:text-lg" style={{ color: 'var(--text-muted)' }}>
              Choose how much of your subscription goes to charity each month. You can pick a specific
              organisation later from your dashboard.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {options.map((pct) => (
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
                  borderColor: selectedPct === pct ? '#2d8c55' : 'rgba(255,255,255,0.62)',
                  boxShadow: selectedPct === pct ? 'var(--shadow-hover)' : 'var(--shadow-out-sm)',
                  color: selectedPct === pct ? '#ffffff' : 'var(--text-main)',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-3xl font-extrabold">{pct}%</div>
                    <div
                      className="mt-2 text-sm"
                      style={{ color: selectedPct === pct ? 'rgba(240,255,247,0.88)' : 'var(--text-muted)' }}
                    >
                      £{((9 * pct) / 100).toFixed(2)}/mo
                    </div>
                  </div>
                  <div
                    className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]"
                    style={{
                      background: selectedPct === pct ? 'rgba(255,255,255,0.16)' : 'rgba(58,166,96,0.12)',
                      color: selectedPct === pct ? '#ffffff' : 'var(--accent-dark)',
                    }}
                  >
                    {pct === 15 ? 'Popular' : pct === 30 ? 'Maximum' : 'Starter'}
                  </div>
                </div>
                <p
                  className="mt-8 text-sm leading-6"
                  style={{ color: selectedPct === pct ? 'rgba(240,255,247,0.92)' : 'var(--text-muted)' }}
                >
                  {pct === 10
                    ? 'Keeps most of your payment in the prize pool while still making a monthly contribution.'
                    : pct === 15
                      ? 'Balanced giving. A clear contribution without shrinking the prize pool too aggressively.'
                      : 'Highest giving level for members who want a larger share of each subscription reserved for charity.'}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-[24px] px-6 py-5" style={{ boxShadow: 'var(--shadow-in-sm)' }}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: 'var(--accent-dark)' }}>
                  Current Selection
                </p>
                <p className="mt-2 text-lg font-semibold" style={{ color: 'var(--text-main)' }}>
                  {selectedPct ? `${selectedPct}% reserved for charity` : 'No charity contribution selected yet'}
                </p>
              </div>
              <p className="text-sm sm:text-right" style={{ color: 'var(--text-muted)' }}>
                {selectedPct
                  ? `£${(9 - (9 * selectedPct) / 100).toFixed(2)} goes to the prize pool each month.`
                  : 'Skip for now if you want the full £9 to go to the prize pool.'}
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto flex max-w-3xl flex-col justify-center gap-4 sm:flex-row">
          <Button
            onClick={handleSkip}
            size="lg"
            variant="outline"
            disabled={saving}
            className="min-w-[180px] border-white/50 bg-white/60"
          >
            Skip for now
          </Button>
          <Button
            onClick={handleContinue}
            size="lg"
            disabled={!selectedPct || saving}
            className="min-w-[220px] bg-green-800 text-white hover:bg-green-700"
          >
            {saving ? 'Saving...' : 'Continue to Plan'}
          </Button>
        </div>
      </div>
    </div>
  );
}
