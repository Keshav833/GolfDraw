import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Score } from '@/lib/types/score';
import { ScoresPageClient } from './scores-page-client';

export default async function ScoresPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data } = await supabase
    .from('scores')
    .select('id, user_id, value, submitted_at')
    .eq('user_id', user.id)
    .order('submitted_at', { ascending: false })
    .limit(5);

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_type, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <ScoresPageClient
      initialScores={(data ?? []) as Score[]}
      userName={
        user.user_metadata?.full_name || user.email || 'GolfDraw member'
      }
      membershipLabel={
        subscription?.plan_type === 'yearly'
          ? 'Yearly member'
          : 'Monthly member'
      }
      statusLabel={subscription?.status?.replace('_', ' ') || 'Active'}
    />
  );
}
