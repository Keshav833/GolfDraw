import Link from 'next/link';
import type { Score } from '@/lib/types/score';

export function ScoreSummary({ scores }: { scores: Score[] }) {
  const visibleScores = scores.slice(0, 5);
  const slots = Array.from({ length: 5 }, (_, index) => visibleScores[index] ?? null);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-900">Your scores</h2>
        <Link href="/scores" className="text-sm font-medium text-green-700 hover:text-green-800">
          Manage →
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {slots.map((score, index) =>
          score ? (
            <div
              key={score.id}
              className={`flex h-11 min-w-[52px] items-center justify-center rounded-full px-4 text-sm font-bold ${
                index === 0 ? 'scale-105 bg-green-700 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {score.value}
            </div>
          ) : (
            <div
              key={`empty-${index}`}
              className="flex h-11 min-w-[52px] items-center justify-center rounded-full border border-dashed border-gray-300 px-4 text-sm font-medium text-gray-400"
            >
              —
            </div>
          )
        )}
      </div>

      <p className="mt-5 text-sm text-gray-500">
        {!visibleScores.length
          ? 'Submit your first score to enter draws'
          : visibleScores.length < 5
            ? 'Add more scores to improve your draw chances'
            : 'You have a full set of scores for this draw'}
      </p>
    </div>
  );
}
