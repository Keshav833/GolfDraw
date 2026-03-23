import Link from 'next/link';
import type { DrawResult } from '@/lib/types/dashboard';

const raisedXs =
  '2px 2px 5px var(--dashboard-shadow-dark), -2px -2px 5px var(--dashboard-shadow-light)';
const insetShadow =
  'inset 3px 3px 7px var(--dashboard-shadow-dark), inset -3px -3px 7px var(--dashboard-shadow-light)';

export function DrawHistoryList({ results }: { results: DrawResult[] }) {
  return (
    <div>
      <div className="mb-[10px] flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold text-[#2a3a2a]">Draw history</h3>
        <Link
          href="/draws"
          className="text-[10px] text-[#6a7a6a] hover:text-[#2a3a2a]"
        >
          All →
        </Link>
      </div>

      {!results.length ? (
        <div
          className="rounded-[12px] bg-[var(--dashboard-bg)] px-4 py-5 text-[11px] text-[#6a7a6a]"
          style={{ boxShadow: insetShadow }}
        >
          No draws yet. Your first draw entry will appear here after the next
          monthly draw.
        </div>
      ) : (
        <div className="space-y-[6px]">
          {results.slice(0, 6).map((result) => {
            const category = result.match_category;
            const badgeClass =
              category === '4-match'
                ? 'bg-[#e8e6f8] text-[#3c3489]'
                : category === '3-match'
                  ? 'bg-[#d8f0e6] text-[#085041]'
                  : category === '5-match'
                    ? 'bg-[var(--dashboard-gold)] text-[#4e3a00]'
                    : '';

            return (
              <div
                key={result.id}
                className="flex items-center gap-2 rounded-[11px] bg-[var(--dashboard-bg)] px-[10px] py-2"
                style={{ boxShadow: raisedXs }}
              >
                <div
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-[var(--dashboard-bg)]"
                  style={{ boxShadow: insetShadow }}
                >
                  <span className="text-[11px] leading-none">
                    {category === '5-match'
                      ? '★'
                      : category === '4-match'
                        ? '✦'
                        : category === '3-match'
                          ? '•'
                          : '○'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium text-[#2a3a2a]">
                    {result.draw?.month ?? 'Draw result'}
                  </div>
                  <div className="mt-0.5">
                    {category ? (
                      <span
                        className={`inline-block rounded-[20px] px-1.5 py-[1px] text-[9px] font-medium ${badgeClass}`}
                      >
                        {category.replace('-', ' ')}
                      </span>
                    ) : (
                      <span
                        className="inline-block rounded-[20px] px-1.5 py-[1px] text-[9px] font-medium text-[#9aaa9a]"
                        style={{
                          background: 'var(--dashboard-bg-dark)',
                          boxShadow: insetShadow,
                        }}
                      >
                        No match
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className={`text-[11px] font-semibold ${prizeColor(result)}`}
                >
                  {prizeText(result)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function prizeText(result: DrawResult) {
  if (!result.match_category || result.prize_amount == null) {
    return '—';
  }

  const amount = `₹${Number(result.prize_amount).toFixed(2)}`;

  if (result.payment_status === 'pending') {
    return `${amount} ↗`;
  }

  if (result.payment_status === 'approved') {
    return `${amount}`;
  }

  if (result.payment_status === 'paid') {
    return `+${amount}`;
  }

  if (result.payment_status === 'rejected') {
    return 'Rejected';
  }

  return amount;
}

function prizeColor(result: DrawResult) {
  if (!result.match_category || result.prize_amount == null) {
    return 'text-[#9aaa9a]';
  }

  if (result.payment_status === 'pending') {
    return 'text-[#c8960e]';
  }

  if (result.payment_status === 'approved') {
    return 'text-[#3466b0]';
  }

  if (result.payment_status === 'paid') {
    return 'text-[#1a5e38]';
  }

  if (result.payment_status === 'rejected') {
    return 'text-[#b04747]';
  }

  return 'text-[#1a5e38]';
}
