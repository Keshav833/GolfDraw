'use client';

import { useState } from 'react';
import type { Score } from '@/lib/types/score';
import { PageShell } from '@/components/dashboard/PageShell';
import { ScoreInput } from '@/components/scores/ScoreInput';
import { ScoreHistory } from '@/components/scores/ScoreHistory';

const raisedSm =
  '3px 3px 8px var(--dashboard-shadow-dark), -3px -3px 8px var(--dashboard-shadow-light)';

export function ScoresPageClient({
  initialScores,
  userName,
  membershipLabel,
  statusLabel,
}: {
  initialScores: Score[];
  userName: string;
  membershipLabel: string;
  statusLabel: string;
}) {
  const [scores, setScores] = useState(initialScores);

  return (
    <PageShell
      userName={userName}
      membershipLabel={membershipLabel}
      statusLabel={statusLabel}
      title="My scores"
      subtitle="Your last 5 scores are used in each monthly draw. Keep them fresh after every round."
    >
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <section
          className="rounded-[20px] bg-[var(--dashboard-bg)] p-5 sm:p-6"
          style={{ boxShadow: raisedSm }}
        >
          <div className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9aaa9a]">
              Submit score
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[#2a3a2a]">
              Add your latest round
            </h2>
            <p className="mt-1 text-sm text-[#6a7a6a]">
              Enter a score between 1 and 45. Your newest score is highlighted
              automatically.
            </p>
          </div>
          <ScoreInput onSuccess={setScores} />
        </section>

        <section
          className="rounded-[20px] bg-[var(--dashboard-bg)] p-5 sm:p-6"
          style={{ boxShadow: raisedSm }}
        >
          <div className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9aaa9a]">
              History
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[#2a3a2a]">
              Recent scores
            </h2>
            <p className="mt-1 text-sm text-[#6a7a6a]">
              Your most recent five scores stay visible here for draw tracking.
            </p>
          </div>
          <ScoreHistory scores={scores} isLoading={false} />
        </section>
      </div>
    </PageShell>
  );
}
