'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Score } from '@/lib/types/score';
import { ScoreInput } from '@/components/scores/ScoreInput';
import { ScoreHistory } from '@/components/scores/ScoreHistory';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ScoresPageClient({ initialScores }: { initialScores: Score[] }) {
  const [scores, setScores] = useState(initialScores);

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mb-4')}
        >
          Back to dashboard
        </Link>
        <h1 className="text-3xl font-extrabold font-serif">My scores</h1>
        <p className="mt-2 text-gray-600">Your last 5 scores are used in each monthly draw</p>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <ScoreInput onSuccess={setScores} />
      </section>

      <div className="border-t border-gray-200" />

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <ScoreHistory scores={scores} isLoading={false} />
      </section>
    </div>
  );
}
