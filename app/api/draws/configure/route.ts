import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { month, mode, prize_pool_total } = await req.json();
    const cookieStore = cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.app_metadata?.role !== 'admin') {
      return NextResponse.json({ data: null, error: { message: 'Forbidden', code: '403' } }, { status: 403 });
    }

    const draw_number = crypto.randomInt(1, 46);
    const seed = crypto.randomUUID();

    const adminSupabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { cookies: { getAll() { return [] }, setAll() {} } });

    const { data: subs } = await adminSupabase.from('subscriptions').select('user_id').eq('status', 'active');
    const userIds = subs?.map(s => s.user_id) || [];
    
    const { data: allScores } = await adminSupabase.from('scores').select('user_id, value').in('user_id', userIds).order('submitted_at', { ascending: false });
    
    const userScores: Record<string, number[]> = {};
    if (allScores) {
      for (const s of allScores) {
        if (!userScores[s.user_id]) userScores[s.user_id] = [];
        if (userScores[s.user_id].length < 5) userScores[s.user_id].push(s.value);
      }
    }

    const snapshotUsers = userIds.map(uid => ({
      user_id: uid,
      scores: userScores[uid] || []
    }));

    const config = { users: snapshotUsers };

    const { data, error } = await adminSupabase.from('draws').insert({
      month,
      mode,
      prize_pool_total,
      draw_number,
      seed,
      config,
      status: 'draft'
    }).select().single();

    if (error) return NextResponse.json({ data: null, error: { message: error.message, code: 'DB_ERR' } }, { status: 500 });
    return NextResponse.json({ data, error: null });
  } catch (err: any) {
    return NextResponse.json({ data: null, error: { message: err.message, code: 'ERR' } }, { status: 500 });
  }
}
