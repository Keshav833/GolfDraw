import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireAdmin();
    const id = params.id;
    const { status } = await request.json();

    if (!['pending', 'approved', 'paid', 'rejected'].includes(status)) {
      return NextResponse.json(
        { data: null, error: { message: 'Invalid status' } },
        { status: 400 }
      );
    }

    const updateData: any = { payment_status: status };
    if (status === 'paid') {
      updateData.verified_at = new Date().toISOString();
      updateData.verified_by = user.id;
    }

    const { data, error } = await supabaseAdmin
      .from('draw_results')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ data, error: null });
  } catch (err: any) {
    console.error('Winner PATCH Error:', err);
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
