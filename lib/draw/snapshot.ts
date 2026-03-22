import { createClient } from '@/lib/supabase/server';
import type { EligibleUser } from '@/lib/types/draw';

export async function getEligibleUsers(): Promise<EligibleUser[]> {
  const supabase = createClient();

  const { data: activeUsers, error: usersError } = await supabase
    .from('users')
    .select('id, full_name, email')
    .eq('subscription_status', 'active');

  if (usersError || !activeUsers) {
    throw new Error(`Failed to fetch active users: ${usersError?.message ?? 'Unknown error'}`);
  }

  if (activeUsers.length === 0) {
    return [];
  }

  const userIds = activeUsers.map((user) => user.id);

  const { data: scores, error: scoresError } = await supabase
    .from('scores')
    .select('user_id, value, submitted_at')
    .in('user_id', userIds)
    .order('submitted_at', { ascending: false });

  if (scoresError) {
    throw new Error(`Failed to fetch scores: ${scoresError.message}`);
  }

  const scoresByUser: Record<string, number[]> = {};

  for (const score of scores ?? []) {
    if (!scoresByUser[score.user_id]) {
      scoresByUser[score.user_id] = [];
    }

    if (scoresByUser[score.user_id].length < 5) {
      scoresByUser[score.user_id].push(score.value);
    }
  }

  return activeUsers
    .filter((user) => (scoresByUser[user.id]?.length ?? 0) > 0)
    .map((user) => ({
      user_id: user.id,
      full_name: user.full_name ?? 'Unknown',
      email: user.email,
      scores: scoresByUser[user.id] ?? [],
    }));
}

export async function getRolloverAmount(month: string): Promise<number> {
  const supabase = createClient();
  const [year, monthNumber] = month.split('-').map(Number);
  const previousMonth =
    monthNumber === 1
      ? `${year - 1}-12`
      : `${year}-${String(monthNumber - 1).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from('prize_pool_ledger')
    .select('amount')
    .eq('type', 'rollover')
    .eq('period', previousMonth);

  if (error) {
    return 0;
  }

  return data?.reduce((sum, row) => sum + Number(row.amount ?? 0), 0) ?? 0;
}

export async function getPrizePoolTotal(month: string): Promise<number> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('prize_pool_ledger')
    .select('amount')
    .eq('type', 'contribution')
    .eq('period', month);

  if (error) {
    return 0;
  }

  return data?.reduce((sum, row) => sum + Number(row.amount ?? 0), 0) ?? 0;
}
