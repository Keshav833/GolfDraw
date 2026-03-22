import { format, formatDistanceToNow } from 'date-fns';
import type { Score } from '@/lib/types/score';
import SectionLoader from '@/components/ui/SectionLoader';

const raisedXs =
  '2px 2px 5px var(--dashboard-shadow-dark), -2px -2px 5px var(--dashboard-shadow-light)';
const insetShadow =
  'inset 3px 3px 7px var(--dashboard-shadow-dark), inset -3px -3px 7px var(--dashboard-shadow-light)';

export function ScoreHistory({
  scores,
  isLoading,
}: {
  scores: Score[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <SectionLoader label="Loading scores..." />;
  }

  if (!scores.length) {
    return (
      <div
        className="rounded-[16px] bg-[var(--dashboard-bg)] px-5 py-8 text-center text-sm text-[#6a7a6a]"
        style={{ boxShadow: insetShadow }}
      >
        No scores yet. Submit your first score after a round of golf.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {scores.slice(0, 5).map((score, index) => {
        const relative = formatDistanceToNow(new Date(score.submitted_at), {
          addSuffix: true,
        });
        const absolute = format(
          new Date(score.submitted_at),
          "d MMM yyyy 'at' h:mmaaa"
        );

        return (
          <div
            key={score.id}
            title={absolute}
            className="flex items-center justify-between rounded-[16px] bg-[var(--dashboard-bg)] p-4"
            style={{ boxShadow: raisedXs }}
          >
            <div className="flex items-center gap-4">
              <div
                className="min-w-[64px] rounded-[14px] px-4 py-3 text-center text-2xl font-bold"
                style={{
                  background:
                    index === 0
                      ? 'var(--dashboard-green-700)'
                      : 'var(--dashboard-bg)',
                  color: index === 0 ? '#ffffff' : '#2a3a2a',
                  boxShadow:
                    index === 0
                      ? '3px 3px 7px rgba(10,50,20,0.3), -2px -2px 5px rgba(60,140,80,0.2)'
                      : insetShadow,
                }}
              >
                {score.value}
              </div>
              {index === 0 ? (
                <span
                  className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#1a5e38]"
                  style={{
                    background: 'var(--dashboard-green-50)',
                    boxShadow: raisedXs,
                  }}
                >
                  Latest
                </span>
              ) : null}
            </div>
            <div className="text-right text-sm text-[#6a7a6a]">{relative}</div>
          </div>
        );
      })}
    </div>
  );
}
