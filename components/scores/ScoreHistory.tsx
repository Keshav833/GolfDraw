import { format, formatDistanceToNow } from 'date-fns';
import type { Score } from '@/lib/types/score';

export function ScoreHistory({
  scores,
  isLoading,
}: {
  scores: Score[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4"
          >
            <div className="h-10 w-16 animate-pulse rounded-xl bg-gray-100" />
            <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  if (!scores.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center text-sm text-gray-500">
        No scores yet. Submit your first score after a round of golf.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {scores.slice(0, 5).map((score, index) => {
        const relative = formatDistanceToNow(new Date(score.submitted_at), { addSuffix: true });
        const absolute = format(new Date(score.submitted_at), "d MMM yyyy 'at' h:mmaaa");

        return (
          <div
            key={score.id}
            title={absolute}
            className={`flex items-center justify-between rounded-2xl border p-4 transition-colors ${
              index === 0 ? 'border-green-100 bg-green-50/70' : 'border-gray-100 bg-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`min-w-[64px] rounded-2xl px-4 py-3 text-center text-2xl font-bold ${
                  index === 0 ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                {score.value}
              </div>
              {index === 0 ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green-700">
                  Latest
                </span>
              ) : null}
            </div>
            <div className="text-right text-sm text-gray-500">{relative}</div>
          </div>
        );
      })}
    </div>
  );
}
