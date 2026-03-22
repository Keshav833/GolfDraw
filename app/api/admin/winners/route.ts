import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const drawId = searchParams.get('drawId');

    let query = supabaseAdmin
      .from('draw_results')
      .select(
        `
        *,
        user:users(full_name, email),
        draw:draws(month)
      `
      )
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('payment_status', status);
    }
    if (drawId) {
      query = query.eq('draw_id', drawId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data, error: null });
  } catch (err: any) {
    console.error('Winners GET Error:', err);
    const status =
      err.message === 'UNAUTHENTICATED'
        ? 401
        : err.message === 'FORBIDDEN'
          ? 403
          : 500;
    return NextResponse.json(
      { data: null, error: { message: err.message } },
      { status }
    );
  }
}
