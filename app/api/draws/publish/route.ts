import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createServiceSupabase, drawError, requireAdminUser } from '@/lib/draw/api';
import { publishStoredDraw } from '@/lib/draw/workflow';

const schema = z.object({
  draw_id: z.string().uuid(),
});

export async function POST(req: Request) {
  try {
    const adminCheck = await requireAdminUser();
    if ('response' in adminCheck) {
      return adminCheck.response;
    }

    const parsed = schema.safeParse(await req.json());

    if (!parsed.success) {
      return drawError(422, parsed.error.issues[0]?.message ?? 'Invalid request', 'VALIDATION_ERROR');
    }

    const serviceSupabase = createServiceSupabase();
    const { data: draw, error } = await serviceSupabase
      .from('draws')
      .select('*')
      .eq('id', parsed.data.draw_id)
      .single();

    if (error || !draw) {
      return drawError(404, error?.message ?? 'Draw not found', 'NOT_FOUND');
    }

    if (draw.status === 'published') {
      return drawError(409, 'Draw has already been published', 'ALREADY_PUBLISHED');
    }

    const result = await publishStoredDraw({
      supabase: serviceSupabase,
      draw,
    });

    return NextResponse.json({
      data: {
        published: true,
        draw_id: draw.id,
        result,
      },
      error: null,
    });
  } catch (error) {
    return drawError(
      500,
      error instanceof Error ? error.message : 'Failed to publish draw',
      'ERR'
    );
  }
}
