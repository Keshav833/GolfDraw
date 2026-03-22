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
    if (!draw || draw.status === 'published') return NextResponse.json({ data: null, error: { message: 'Invalid draw', code: '400' } }, { status: 400 });

    const pool = Number(draw.prize_pool_total);
    const prize_pool = {
      jackpot: pool * 0.40,
      four_match: pool * 0.35,
      three_match: pool * 0.25
    };

    const result = runDraw({
      draw_number: draw.draw_number,
      mode: draw.mode as 'random' | 'algorithmic',
      prize_pool,
      users: draw.config.users
    });

    await adminSupabase.from('draws').update({ status: 'simulated' }).eq('id', draw_id);

    return NextResponse.json({ data: result, error: null });
  } catch (err: any) {
    return NextResponse.json({ data: null, error: { message: err.message, code: 'ERR' } }, { status: 500 });
  }
}
