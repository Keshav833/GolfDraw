import Link from 'next/link'
import { format } from 'date-fns'

interface DrawHistoryTableProps {
  data: Array<{
    month: string
    draw_id: string
    status: string
    prize_pool_total: number
    total_winners: number
    jackpot_winners: number
    four_match_winners: number
    three_match_winners: number
  }>
}

export default function DrawHistoryTable({ data }: DrawHistoryTableProps) {
  return (
    <div className="bg-[var(--bg)] rounded-3xl p-1 shadow-[var(--raised-md)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--sd)]">
              <th className="px-6 py-4 font-semibold">Month</th>
              <th className="px-6 py-4 font-semibold text-center">Prize Pool</th>
              <th className="px-6 py-4 font-semibold text-center">3-Match</th>
              <th className="px-6 py-4 font-semibold text-center">4-Match</th>
              <th className="px-6 py-4 font-semibold text-center">Jackpot</th>
              <th className="px-6 py-4 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--sd)]/50">
            {data.map((draw) => (
              <tr 
                key={draw.draw_id}
                className="group hover:bg-[var(--sd)]/10 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <Link href={`/admin/draws/${draw.draw_id}`} className="block">
                    <span className="text-sm font-semibold text-[var(--text)]">
                      {format(new Date(draw.month), 'MMMM yyyy')}
                    </span>
                  </Link>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm font-medium text-[var(--green-700)]">
                    £{Number(draw.prize_pool_total).toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--bg)] shadow-[var(--inset-sm)] text-[var(--text-muted)]">
                    {draw.three_match_winners}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--bg)] shadow-[var(--inset-sm)] text-[var(--text-muted)]">
                    {draw.four_match_winners}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-[var(--raised-sm)] ${
                    draw.jackpot_winners > 0 
                      ? 'bg-amber-100 text-amber-700 shadow-amber-200' 
                      : 'bg-[var(--bg)] text-[var(--text-muted)]'
                  }`}>
                    {draw.jackpot_winners}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    {draw.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
