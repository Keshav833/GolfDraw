import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CharityManager } from '@/components/charity/CharityManager';
import type { Charity } from '@/lib/types/charity';

export default async function CharityPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [{ data: charitiesData }, { data: userCharityData }, { data: subscriptionData }] =
    await Promise.all([
      supabase
        .from('charities')
        .select('id, name, description, category, country, is_active, created_at')
        .eq('is_active', true)
        .order('name', { ascending: true }),
      supabase
        .from('users')
        .select(
          'charity_id, charity_contribution_pct, charities(id, name, description, category, country, is_active, created_at)'
        )
        .eq('id', user.id)
        .single(),
      supabase
        .from('subscriptions')
        .select('plan_type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  return (
    <CharityManager
      initialCharities={(charitiesData ?? []) as Charity[]}
      initialUserCharity={{
        charity: firstCharity(userCharityData?.charities),
        pct: Number(userCharityData?.charity_contribution_pct ?? 0),
      }}
      planType={subscriptionData?.plan_type === 'yearly' ? 'yearly' : 'monthly'}
      userName={user.user_metadata?.full_name || user.email || 'GolfDraw member'}
      membershipLabel={subscriptionData?.plan_type === 'yearly' ? 'Yearly member' : 'Monthly member'}
      statusLabel={subscriptionData?.plan_type ? 'Active' : 'Inactive'}
    />
  );
}

function firstCharity(value: Charity | Charity[] | null | undefined) {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}
