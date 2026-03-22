import { z } from 'zod';
import { NextResponse } from 'next/server';
import {
  createServiceSupabase,
  drawError,
  requireAdminUser,
} from '@/lib/draw/api';
import { simulateStoredDraw } from '@/lib/draw/workflow';

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
      return drawError(
        422,
        parsed.error.issues[0]?.message ?? 'Invalid request',
        'VALIDATION_ERROR'
      );
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
      return drawError(
        400,
        'Published draws cannot be simulated again',
        'INVALID_DRAW'
      );
    }

    const result = simulateStoredDraw(draw);

    const { error: updateError } = await serviceSupabase
      .from('draws')
      .update({
        status: 'simulated',
        draw_number: result.draw_number,
        seed: result.seed,
        config: {
          ...(draw.config ?? {}),
          draw_number: result.draw_number,
          seed: result.seed,
        },
      })
      .eq('id', draw.id);

    if (updateError) {
      return drawError(500, updateError.message, 'DB_ERR');
    }

    return NextResponse.json({
      data: result,
      error: null,
    });
  } catch (error) {
    return drawError(
      500,
      error instanceof Error ? error.message : 'Failed to simulate draw',
      'ERR'
    );
  }
}
