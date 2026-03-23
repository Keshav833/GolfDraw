import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PlanPageClient } from './PlanPageClient';

export default async function RegisterPlan() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRecord = null;

  if (user) {
    // Check if user already has an active subscription
    const { data: record } = await supabase
      .from('users')
      .select('subscription_status, email, full_name')
      .eq('id', user.id)
      .single();
    
    userRecord = record;

    if (userRecord?.subscription_status === 'active') {
      redirect('/dashboard');
    }

    // Also check the subscriptions table directly for extra safety
    const { data: activeSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (activeSub) {
      redirect('/dashboard');
    }
  }

  return (
    <PlanPageClient
      userEmail={userRecord?.email || user?.email}
      userName={userRecord?.full_name}
    />
  );
}
