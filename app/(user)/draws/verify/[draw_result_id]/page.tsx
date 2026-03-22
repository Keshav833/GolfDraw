import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PageShell } from '@/components/dashboard/PageShell';
import { WinnerUploadForm } from '@/components/winners/WinnerUploadForm';

const raisedSm =
  '3px 3px 8px var(--dashboard-shadow-dark), -3px -3px 8px var(--dashboard-shadow-light)';
const raisedXs =
  '2px 2px 5px var(--dashboard-shadow-dark), -2px -2px 5px var(--dashboard-shadow-light)';

export default async function VerifyWinnerPage({
  params,
}: {
  params: { draw_result_id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [subscriptionResult, drawResultResponse] = await Promise.all([
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
      .eq('id', params.draw_result_id)
      .eq('user_id', user.id)
      .maybeSingle(),
  ]);

  const drawResult = drawResultResponse.data;

  if (!drawResult) {
    redirect('/dashboard');
  }

  const draw = Array.isArray(drawResult.draw)
    ? drawResult.draw[0]
    : drawResult.draw;
  const verification = Array.isArray(drawResult.verification)
    ? drawResult.verification[0]
    : drawResult.verification;

  const shellProps = {
    userName: user.user_metadata?.full_name || user.email || 'GolfDraw member',
    membershipLabel:
      subscriptionResult.data?.plan_type === 'yearly'
        ? 'Yearly member'
        : 'Monthly member',
    statusLabel: subscriptionResult.data?.status?.replace('_', ' ') || 'Active',
    title: 'Prize verification',
    subtitle:
      'Upload your scorecard so the GolfDraw team can verify and release your prize.',
  };

  if (drawResult.payment_status === 'paid') {
    return (
      <PageShell {...shellProps}>
        <div
          className="rounded-[20px] bg-[var(--dashboard-bg)] p-8 text-center"
          style={{ boxShadow: raisedSm }}
        >
          <h1 className="text-2xl font-semibold text-[#2a3a2a]">
            Already paid
          </h1>
          <p className="mt-3 text-sm text-[#6a7a6a]">
            This prize has already been paid. No further upload is needed.
          </p>
          <Link
            href="/draws"
            className="mt-6 inline-flex rounded-[14px] px-5 py-3 text-sm text-[#2a3a2a]"
            style={{ background: 'var(--dashboard-bg)', boxShadow: raisedXs }}
          >
            Back to draws →
          </Link>
        </div>
      </PageShell>
    );
  }

  if (
    verification?.status === 'approved' &&
    drawResult.payment_status !== 'rejected'
  ) {
    return (
      <PageShell {...shellProps}>
        <div
          className="rounded-[20px] bg-[var(--dashboard-bg)] p-8 text-center"
          style={{ boxShadow: raisedSm }}
        >
          <h1 className="text-2xl font-semibold text-[#2a3a2a]">
            Under review
          </h1>
          <p className="mt-3 text-sm text-[#6a7a6a]">
            Your proof has already been approved and payment is being prepared.
          </p>
          <Link
            href="/draws"
            className="mt-6 inline-flex rounded-[14px] px-5 py-3 text-sm text-[#2a3a2a]"
            style={{ background: 'var(--dashboard-bg)', boxShadow: raisedXs }}
          >
            Back to draws →
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell {...shellProps}>
      {verification?.status === 'rejected' ? (
        <div
          className="mb-5 rounded-[18px] bg-[#fde7e7] px-5 py-4 text-sm text-[#8d2828]"
          style={{ boxShadow: raisedSm }}
        >
          <strong>Previous upload was rejected.</strong>
          {verification.rejection_note ? ` ${verification.rejection_note}` : ''}
        </div>
      ) : null}
      <WinnerUploadForm
        drawResultId={drawResult.id}
        drawMonth={draw?.month ?? 'Draw'}
        drawNumber={Number(draw?.draw_number ?? 0)}
        matchCategory={drawResult.match_category}
        prizeAmount={Number(drawResult.prize_amount ?? 0)}
        existingStatus={verification?.status}
      />
    </PageShell>
  );
}
