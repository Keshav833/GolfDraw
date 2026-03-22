import { createClient } from '@/lib/supabase/server';

export async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('UNAUTHENTICATED');
  }

  if (session.user.app_metadata?.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  return session;
}
