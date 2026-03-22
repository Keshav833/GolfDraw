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

  return <ScoresPageClient initialScores={(data ?? []) as Score[]} />;
}
