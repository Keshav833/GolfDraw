import Link from 'next/link';
import type { PendingWinnings } from '@/lib/types/dashboard';

const raisedSm =
  '3px 3px 8px var(--dashboard-shadow-dark), -3px -3px 8px var(--dashboard-shadow-light)';

export function WinningsWidget({
  totalPaid,
  pendingResult,
}: {
  totalPaid: number;
  pendingResult: PendingWinnings;
}) {
  if (pendingResult) {
    return (
      <div
        className="rounded-[16px] border border-[#e1cf8f] bg-[#fff5cf] p-4"
        style={{ boxShadow: raisedSm }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a6500]">
          Claim needed
        </p>
        <h3 className="mt-2 text-lg font-bold text-[#4e3a00]">
          You won £{Number(pendingResult.prize_amount).toFixed(2)}!
        </h3>
        <p className="mt-1 text-[11px] text-[#6c5310]">
          {pendingResult.match_category.replace('-', ' ')} in{' '}
          {pendingResult.draw?.month ?? 'recent'} draw
        </p>
        <p className="mt-2 text-[11px] text-[#6c5310]">
          Upload your scorecard to claim your prize.
        </p>
        <Link
          href="/draws"
          className="mt-3 inline-flex text-[11px] font-semibold text-[#4e3a00] hover:underline"
        >
          Upload proof now →
        </Link>
        <p className="mt-3 text-[10px] text-[#6c5310]">
          Total earned: £{totalPaid.toFixed(2)}
        </p>
      </div>
    );
  }

  if (totalPaid > 0) {
    return (
      <div
        className="rounded-[16px] bg-[var(--dashboard-bg)] p-4"
        style={{ boxShadow: raisedSm }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6a7a6a]">
          Total winnings
        </p>
        <h3 className="mt-2 text-2xl font-bold text-[#0f3d2e]">
          £{totalPaid.toFixed(2)}
        </h3>
        <p className="mt-1 text-[11px] text-[#6a7a6a]">
          Across all verified draws
        </p>
        <Link
          href="/draws"
          className="mt-3 inline-flex text-[11px] font-semibold text-[#1a5e38] hover:underline"
        >
          View history →
        </Link>
      </div>
    );
  }

  return (
    <div
      className="rounded-[16px] bg-[var(--dashboard-bg)] p-4"
      style={{ boxShadow: raisedSm }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6a7a6a]">
        Winnings
      </p>
      <h3 className="mt-2 text-lg font-bold text-[#2a3a2a]">No winnings yet</h3>
      <p className="mt-1 text-[11px] text-[#6a7a6a]">
        Win by matching the monthly draw number with your scores.
      </p>
      <Link
        href="/draws"
        className="mt-3 inline-flex text-[11px] font-semibold text-[#1a5e38] hover:underline"
      >
        How draws work →
      </Link>
    </div>
  );
}
