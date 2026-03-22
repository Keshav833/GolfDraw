import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PageShell } from '@/components/dashboard/PageShell';
import { MatchBadge } from '@/components/draw/MatchBadge';

const raisedSm =
  '3px 3px 8px var(--dashboard-shadow-dark), -3px -3px 8px var(--dashboard-shadow-light)';
const raisedXs =
  '2px 2px 5px var(--dashboard-shadow-dark), -2px -2px 5px var(--dashboard-shadow-light)';

export default async function DrawsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [subscriptionResult, drawResults] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('plan_type, status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('draw_results')
      .select(
        `
        id,
        draw_id,
        user_id,
        match_category,
        prize_amount,
        payment_status,
        draw:draws(month, draw_number),
        verification:winner_verifications(
          id,
          draw_result_id,
          proof_url,
          status,
          rejection_note,
          reviewed_by,
          reviewed_at,
          created_at
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const results = (drawResults.data ?? []) as Array<{
    id: string;
    match_category: '3-match' | '4-match' | '5-match';
    prize_amount: number | null;
    payment_status: 'pending' | 'approved' | 'paid' | 'rejected';
    draw:
      | { month: string; draw_number: number }[]
      | { month: string; draw_number: number }
      | null;
    verification:
      | Array<{
          id: string;
          status: 'pending' | 'approved' | 'rejected';
          rejection_note: string | null;
        }>
      | {
          id: string;
          status: 'pending' | 'approved' | 'rejected';
          rejection_note: string | null;
        }
      | null;
  }>;

  return (
    <PageShell
      userName={
        user.user_metadata?.full_name || user.email || 'GolfDraw member'
      }
      membershipLabel={
        subscriptionResult.data?.plan_type === 'yearly'
          ? 'Yearly member'
          : 'Monthly member'
      }
      statusLabel={
        subscriptionResult.data?.status?.replace('_', ' ') || 'Active'
      }
      title="Draw history"
      subtitle="View past draws, match results, and any prize claims that still need action."
    >
      <div className="space-y-5">
        {results.length ? (
          results.map((result) => {
            const draw = Array.isArray(result.draw)
              ? result.draw[0]
              : result.draw;
            const verification = Array.isArray(result.verification)
              ? result.verification[0]
              : result.verification;
            const canUpload =
              result.payment_status === 'pending' && !verification;
            const canReupload = result.payment_status === 'rejected';

            return (
              <div
                key={result.id}
                className="rounded-[18px] bg-[var(--dashboard-bg)] p-5"
                style={{ boxShadow: raisedSm }}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#2a3a2a]">
                      {draw?.month} draw
                    </h3>
                    <p className="mt-1 text-sm text-[#6a7a6a]">
                      Draw #{Number(draw?.draw_number ?? 0)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <MatchBadge category={result.match_category} />
                    <p className="text-lg font-semibold text-[#1a5e38]">
                      £{Number(result.prize_amount ?? 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="text-sm text-[#6a7a6a]">
                    {canUpload ? 'Upload proof to claim' : null}
                    {verification?.status === 'pending'
                      ? 'Awaiting your proof review'
                      : null}
                    {result.payment_status === 'approved'
                      ? 'Being processed'
                      : null}
                    {result.payment_status === 'paid' ? 'Paid ✓' : null}
                    {result.payment_status === 'rejected'
                      ? `Rejected${verification?.rejection_note ? `: ${verification.rejection_note}` : ''}`
                      : null}
                  </div>

                  {canUpload || canReupload ? (
                    <Link
                      href={`/draws/verify/${result.id}`}
                      className="inline-flex rounded-[14px] px-4 py-2 text-sm font-medium text-[#2a3a2a]"
                      style={{
                        background: 'var(--dashboard-bg)',
                        boxShadow: raisedXs,
                      }}
                    >
                      {canReupload ? 'Re-upload' : 'Upload now'}
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          <div
            className="rounded-[18px] bg-[var(--dashboard-bg)] px-6 py-10 text-center text-[#6a7a6a]"
            style={{ boxShadow: raisedSm }}
          >
            No draw history yet. Your first result will appear here after the
            next draw closes.
          </div>
        )}
      </div>
    </PageShell>
  );
}
