'use client';

import { Users, CheckCircle, AlertCircle, EyeOff, Info } from 'lucide-react';
import type { DrawResult, MatchResult } from '@/lib/types/draw';

interface DrawSimulationPreviewProps {
  result: DrawResult;
}

export default function DrawSimulationPreview({
  result,
}: DrawSimulationPreviewProps) {
  const winnerCount =
    result.five_match.length +
    result.four_match.length +
    result.three_match.length;

  return (
    <div className="space-y-8">
      {/* Simulation Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-800 shadow-[var(--raised-sm)]">
        <AlertCircle size={20} className="flex-shrink-0" />
        <div className="text-xs font-medium">
          <strong>Simulation Results Only:</strong> These results are not yet
          official. Review and publish the draw to notify winners and finalize
          the prize pool.
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 p-6 rounded-2xl bg-[#2a3a2a] text-white shadow-[var(--raised-md)] flex flex-col items-center justify-center text-center">
          <p className="text-[10px] uppercase tracking-widest opacity-70 mb-2">
            Draw Number
          </p>
          <h2 className="text-6xl font-serif">{result.draw_number}</h2>
        </div>

        <SummaryCard
          label="Eligible Users"
          value={result.eligible_count.toString()}
          icon={<Users size={18} />}
        />
        <SummaryCard
          label="Total Match"
          value={winnerCount.toString()}
          icon={<CheckCircle size={18} />}
          color="text-emerald-600"
        />
      </div>

      {/* Categories */}
      <div className="space-y-6">
        <WinnerCategory
          title="5-Match Jackpot"
          winners={result.five_match}
          prizePerWinner={
            result.five_match.length > 0
              ? result.prize_pool.jackpot / result.five_match.length
              : result.prize_pool.jackpot
          }
          rollover={result.jackpot_rollover}
          rolloverAmount={result.rollover_amount}
        />

        <WinnerCategory
          title="4-Match Prize"
          winners={result.four_match}
          prizePerWinner={
            result.four_match.length > 0
              ? result.prize_pool.four_match / result.four_match.length
              : 0
          }
        />

        <WinnerCategory
          title="3-Match Prize"
          winners={result.three_match}
          prizePerWinner={
            result.three_match.length > 0
              ? result.prize_pool.three_match / result.three_match.length
              : 0
          }
        />
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  color = 'text-[var(--text)]',
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="p-5 rounded-2xl bg-[var(--bg)] shadow-[var(--raised-sm)] flex flex-col justify-center">
      <div className="text-[var(--text-muted)] mb-2 flex items-center gap-2">
        {icon}
        <span className="text-[10px] uppercase font-bold tracking-wider">
          {label}
        </span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function WinnerCategory({
  title,
  winners,
  prizePerWinner,
  rollover = false,
  rolloverAmount = 0,
}: {
  title: string;
  winners: MatchResult[];
  prizePerWinner: number;
  rollover?: boolean;
  rolloverAmount?: number;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-serif text-lg">{title}</h3>
        <span className="text-sm font-bold text-[var(--green-700)]">
          £{prizePerWinner.toFixed(2)} each
        </span>
      </div>

      <div className="bg-[var(--bg)] rounded-3xl p-1 shadow-[var(--raised-md)] overflow-hidden min-h-[120px] flex flex-col justify-center">
        {rollover ? (
          <div className="py-10 text-center space-y-2">
            <Info size={32} className="mx-auto text-amber-500 mb-2" />
            <p className="text-sm font-bold text-amber-700">
              No Jackpot Winners
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              £{rolloverAmount.toFixed(2)} will roll over to next month's
              jackpot.
            </p>
          </div>
        ) : winners.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase text-[var(--text-muted)] border-b border-[var(--sd)]">
                  <th className="px-6 py-3 font-semibold">Winner</th>
                  <th className="px-6 py-3 font-semibold text-right">Prize</th>
                </tr>
              </thead>
              <tbody>
                {winners.map((winner, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-[var(--sd)]/30 last:border-0 hover:bg-[var(--sd)]/5"
                  >
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-[var(--bg)] shadow-[var(--inset-sm)] text-[var(--text-muted)]">
                        <EyeOff size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium blur-[4px] select-none">
                          Winner #{idx + 1}: {winner.full_name}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] blur-[3px] select-none">
                          {winner.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-[var(--green-700)]">
                        £{winner.prize_amount.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-xs text-[var(--text-muted)] italic">
              No winners in this category
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
