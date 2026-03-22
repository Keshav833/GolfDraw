import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { draw_result_id, action, rejection_note } = await req.json();
    const cookieStore = cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.app_metadata?.role !== 'admin') return NextResponse.json({ data: null, error: { message: 'Forbidden', code: '403' } }, { status: 403 });

    const adminSupabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { cookies: { getAll() { return [] }, setAll() {} } });

    const status = action === 'approve' ? 'approved' : 'rejected';
    
    const { error: verErr } = await adminSupabase.from('winner_verifications').update({
      status,
      rejection_note: rejection_note || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString()
    }).eq('draw_result_id', draw_result_id);

    if (verErr) return NextResponse.json({ data: null, error: { message: verErr.message, code: 'DB_ERR' } }, { status: 500 });

    if (status === 'approved') {
      await adminSupabase.from('draw_results').update({ payment_status: 'approved' }).eq('id', draw_result_id);
    } else {
      await adminSupabase.from('draw_results').update({ payment_status: 'rejected' }).eq('id', draw_result_id);
    }

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (err: any) {
    return NextResponse.json({ data: null, error: { message: err.message, code: 'ERR' } }, { status: 500 });
  }
}
