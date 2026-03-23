import Link from 'next/link';
import { MatchBadge } from './MatchBadge';

const raisedSm =
  '3px 3px 8px var(--dashboard-shadow-dark), -3px -3px 8px var(--dashboard-shadow-light)';
const insetShadow =
  'inset 3px 3px 7px var(--dashboard-shadow-dark), inset -3px -3px 7px var(--dashboard-shadow-light)';

interface DrawCardProps {
  month: string;
  draw_number: number;
  match_category: '3-match' | '4-match' | '5-match' | null;
  prize_amount: number | null;
  payment_status: string;
}

export function DrawCard({
  month,
  draw_number,
  match_category,
  prize_amount,
  payment_status,
}: DrawCardProps) {
  const amount =
    prize_amount != null ? `₹${Number(prize_amount).toFixed(2)}` : null;

  return (
    <div
      className="rounded-[18px] bg-[var(--dashboard-bg)] p-5"
      style={{ boxShadow: raisedSm }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#2a3a2a]">{month} draw</h3>
          <p className="mt-1 text-sm text-[#6a7a6a]">
            Winning number:{' '}
            <span
              className="inline-flex rounded-[8px] px-2 py-1 font-mono text-[#2a3a2a]"
              style={{
                background: 'var(--dashboard-bg)',
                boxShadow: insetShadow,
              }}
            >
              {draw_number}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <MatchBadge category={match_category ?? 'no-match'} />
          {amount ? (
            <div className="text-right">
              <p className="font-semibold text-[#1a5e38]">{amount}</p>
              <p className="text-xs capitalize text-[#6a7a6a]">
                {payment_status.replace('_', ' ')}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {match_category && payment_status === 'pending' ? (
        <div className="mt-4 rounded-[12px] border border-[#e1cf8f] bg-[#fff5cf] px-4 py-3 text-sm text-[#6c5310]">
          Action required: Upload scorecard proof.{' '}
          <Link href="/draws" className="font-semibold hover:underline">
            Upload proof →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
