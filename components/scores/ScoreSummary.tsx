import Link from 'next/link';
import type { Score } from '@/lib/types/score';

const raisedXs = '2px 2px 5px var(--dashboard-shadow-dark), -2px -2px 5px var(--dashboard-shadow-light)';
const insetShadow =
  'inset 3px 3px 7px var(--dashboard-shadow-dark), inset -3px -3px 7px var(--dashboard-shadow-light)';

export function ScoreSummary({
  scores,
  isSubscriptionActive = true,
}: {
  scores: Score[];
  isSubscriptionActive?: boolean;
}) {
  const visibleScores = scores.slice(0, 5);
  const slots = Array.from({ length: 5 }, (_, index) => visibleScores[index] ?? null);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold text-[#2a3a2a]">My scores</h3>
        <Link href="/scores" className="text-[10px] text-[#6a7a6a] hover:text-[#2a3a2a]">
          Submit score →
        </Link>
      </div>

      <div className="flex flex-wrap gap-[6px]">
        {slots.map((score, index) =>
          score ? (
            <div
              key={score.id}
              className={`flex h-[34px] w-[34px] items-center justify-center rounded-[10px] text-xs font-semibold ${
                index === 0 ? 'text-white' : 'text-[#2a3a2a]'
              }`}
              style={{
                background: index === 0 ? 'var(--dashboard-green-700)' : 'var(--dashboard-bg)',
                boxShadow:
                  index === 0
                    ? '3px 3px 7px rgba(10,50,20,0.3), -2px -2px 5px rgba(60,140,80,0.2)'
                    : raisedXs,
              }}
            >
              {score.value}
            </div>
          ) : (
            <div
              key={`empty-${index}`}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] text-xs font-semibold text-[#9aaa9a]"
              style={{ background: 'var(--dashboard-bg)', boxShadow: insetShadow }}
            >
              —
            </div>
          )
        )}
      </div>

      <p className="mt-[6px] text-[10px] text-[#1a5e38]">
        {!visibleScores.length
          ? 'No scores yet — submit after your next round'
          : visibleScores.length < 5
            ? `Add ${5 - visibleScores.length} more score${5 - visibleScores.length === 1 ? '' : 's'} to fill your draw entry`
            : isSubscriptionActive
              ? "Full set · in this month's draw ✓"
              : 'Great scores — resubscribe to enter the draw'}
      </p>
    </div>
  );
}
