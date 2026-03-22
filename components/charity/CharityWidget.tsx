import Link from 'next/link';
import type { DashboardCharity } from '@/lib/types/dashboard';

const insetShadow =
  'inset 3px 3px 7px var(--dashboard-shadow-dark), inset -3px -3px 7px var(--dashboard-shadow-light)';

export function CharityWidget({
  charity,
  pct,
  planType,
}: {
  charity: DashboardCharity;
  pct: number;
  planType: 'monthly' | 'yearly';
}) {
  const monthlyRate = planType === 'yearly' ? 86 / 12 : 9;
  const donationAmount = ((monthlyRate * pct) / 100).toFixed(2);

  return (
    <div>
      <div className="mb-[10px] flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold text-[#2a3a2a]">My charity</h3>
        <Link href="/charity" className="text-[10px] text-[#6a7a6a] hover:text-[#2a3a2a]">
          Update →
        </Link>
      </div>

      {charity && pct > 0 ? (
        <>
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-[#2a3a2a]">{charity.name}</span>
            <span className="font-semibold text-[#1a5e38]">{pct}%</span>
          </div>
          <div
            className="mt-[6px] h-2 overflow-hidden rounded bg-[var(--dashboard-bg)]"
            style={{ boxShadow: insetShadow }}
          >
            <div
              className="h-full rounded bg-[#1a5e38]"
              style={{ width: `${pct}%`, boxShadow: '1px 1px 3px rgba(10,50,20,0.3)' }}
            />
          </div>
          <p className="mt-[5px] text-[10px] text-[#6a7a6a]">£{donationAmount} donated this month</p>
        </>
      ) : pct > 0 ? (
        <>
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-[#2a3a2a]">{pct}% ready to allocate</span>
            <span className="font-semibold text-[#1a5e38]">Pending</span>
          </div>
          <div
            className="mt-[6px] h-2 overflow-hidden rounded bg-[var(--dashboard-bg)]"
            style={{ boxShadow: insetShadow }}
          >
            <div
              className="h-full rounded bg-[#1a5e38]"
              style={{ width: `${pct}%`, boxShadow: '1px 1px 3px rgba(10,50,20,0.3)' }}
            />
          </div>
          <p className="mt-[5px] text-[10px] text-[#6a7a6a]">Choose a charity to start giving back</p>
        </>
      ) : (
        <div className="text-[11px] text-[#6a7a6a]">
          Add a charity to give back with every draw.
        </div>
      )}
    </div>
  );
}
