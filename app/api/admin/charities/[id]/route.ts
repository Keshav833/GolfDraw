import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { supabaseAdmin } from '@/lib/supabase/admin';

const charitySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().max(300).optional(),
  category: z
    .enum([
      'Golf & Sport',
      'Health & Research',
      'Youth & Education',
      'Environment',
    ])
    .optional(),
  country: z.string().min(1).optional(),
  website: z.string().url().optional().or(z.literal('')),
  is_active: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const id = params.id;
    const body = await request.json();
    const validated = charitySchema.parse(body);

    const { data, error } = await supabaseAdmin
      .from('charities')
      .update(validated)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      data,
      error: null,
    });
  } catch (err: any) {
    console.error('Charity PATCH Error:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { data: null, error: { message: err.errors[0].message } },
        { status: 400 }
      );
    }
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const id = params.id;

    // Check if member_count > 0
    const { count, error: countError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('charity_id', id);

    if (countError) throw countError;

    if (count && count > 0) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message:
              'Cannot delete a charity with active members. Deactivate it instead.',
          },
        },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('charities')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      data: { deleted: true },
      error: null,
    });
  } catch (err: any) {
    console.error('Charity DELETE Error:', err);
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
