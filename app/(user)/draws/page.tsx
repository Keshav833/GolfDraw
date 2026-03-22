import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PageShell } from '@/components/dashboard/PageShell';
import { DrawCard } from '@/components/draw/DrawCard';

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
        id, match_category, prize_amount, payment_status,
        draw:draws (
          month, draw_number
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(12),
  ]);

  const results = (drawResults.data ?? []) as Array<{
    id: string;
    match_category: '3-match' | '4-match' | '5-match' | null;
    prize_amount: number | null;
    payment_status: string;
    draw: { month: string; draw_number: number }[] | { month: string; draw_number: number } | null;
  }>;

  return (
    <PageShell
      userName={user.user_metadata?.full_name || user.email || 'GolfDraw member'}
      membershipLabel={subscriptionResult.data?.plan_type === 'yearly' ? 'Yearly member' : 'Monthly member'}
      statusLabel={subscriptionResult.data?.status?.replace('_', ' ') || 'Active'}
      title="Draw history"
      subtitle="View past draws, match results, and any prize claims that still need action."
    >
      <div className="space-y-5">
        {results.length ? (
          results.map((result) => {
            const draw = Array.isArray(result.draw) ? result.draw[0] : result.draw;

            return (
              <DrawCard
                key={result.id}
                month={draw?.month ?? 'Draw result'}
                draw_number={Number(draw?.draw_number ?? 0)}
                match_category={result.match_category}
                prize_amount={result.prize_amount}
                payment_status={result.payment_status}
              />
            );
          })
        ) : (
          <div
            className="rounded-[18px] bg-[var(--dashboard-bg)] px-6 py-10 text-center text-[#6a7a6a]"
            style={{
              boxShadow:
                'inset 3px 3px 7px var(--dashboard-shadow-dark), inset -3px -3px 7px var(--dashboard-shadow-light)',
            }}
          >
            No draw history yet. Your first result will appear here after the next draw closes.
          </div>
        )}
      </div>
    </PageShell>
  );
}
