import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { VerificationQueue } from '@/components/admin/VerificationQueue';

export default async function AdminWinnersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  if (user.app_metadata?.role !== 'admin') {
    redirect('/dashboard');
  }

  return <VerificationQueue />;
}
