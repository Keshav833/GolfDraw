import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { runDraw } from '@/lib/draw/engine';

export async function POST(req: Request) {
  try {
    const { draw_id } = await req.json();
    const cookieStore = cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.app_metadata?.role !== 'admin') return NextResponse.json({ data: null, error: { message: 'Forbidden', code: '403' } }, { status: 403 });

    const adminSupabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { cookies: { getAll() { return [] }, setAll() {} } });

    const { data: draw } = await adminSupabase.from('draws').select('*').eq('id', draw_id).single();
    if (!draw || draw.status !== 'simulated') return NextResponse.json({ data: null, error: { message: 'Not simulated', code: '400' } }, { status: 400 });

    const pool = Number(draw.prize_pool_total);
    const prize_pool = {
      jackpot: pool * 0.40,
      four_match: pool * 0.35,
      three_match: pool * 0.25
    };

    // run pure engine deterministic on same inputs
    const result = runDraw({
      draw_number: draw.draw_number,
      mode: draw.mode as 'random' | 'algorithmic',
      prize_pool,
      users: draw.config.users
    });

    const inserts = [];
    if (result.five_match.length > 0) {
      const split = prize_pool.jackpot / result.five_match.length;
      result.five_match.forEach(w => inserts.push({ draw_id, user_id: w.user_id, match_category: '5-match', prize_amount: split }));
    } else {
      await adminSupabase.from('prize_pool_ledger').insert({
        amount: prize_pool.jackpot,
        type: 'rollover',
        period: draw.month
      });
    }

    if (result.four_match.length > 0) {
      const split = prize_pool.four_match / result.four_match.length;
      result.four_match.forEach(w => inserts.push({ draw_id, user_id: w.user_id, match_category: '4-match', prize_amount: split }));
    }

    if (result.three_match.length > 0) {
      const split = prize_pool.three_match / result.three_match.length;
      result.three_match.forEach(w => inserts.push({ draw_id, user_id: w.user_id, match_category: '3-match', prize_amount: split }));
    }

    if (inserts.length > 0) {
      await adminSupabase.from('draw_results').insert(inserts);
    }

    await adminSupabase.from('draws').update({ status: 'published', executed_at: new Date().toISOString() }).eq('id', draw_id);

    return NextResponse.json({ data: { published: true }, error: null });
  } catch (err: any) {
    return NextResponse.json({ data: null, error: { message: err.message, code: 'ERR' } }, { status: 500 });
  }
}
