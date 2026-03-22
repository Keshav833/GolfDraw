import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: { message: 'Unauthorized', code: '401' } }, { status: 401 });

  const [{ data: userProfile }, { data: subscription }, { data: scores }, { data: charData }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('scores').select('*').eq('user_id', user.id).order('submitted_at', { ascending: false }).limit(5),
    supabase.from('users').select('charities(*)').eq('id', user.id).single()
  ]);

  return NextResponse.json({ 
    data: { 
      user: userProfile, 
      subscription: subscription || null, 
      scores: scores || [], 
      charity: charData?.charities || null 
    }, 
    error: null 
  });
}
