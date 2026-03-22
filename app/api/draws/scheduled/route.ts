import { z } from 'zod';
import { NextResponse } from 'next/server';
import {
  createServiceSupabase,
  currentUtcMonth,
  drawError,
  isValidMonth,
} from '@/lib/draw/api';
import { createDraftDraw, publishStoredDraw } from '@/lib/draw/workflow';

const schema = z
  .object({
    month: z.string().optional(),
    mode: z.enum(['random', 'algorithmic']).optional(),
    prize_pool_total: z.number().nonnegative().optional(),
  })
  .optional();

export async function POST(req: Request) {
  try {
    const authorization = req.headers.get('authorization');
    const expectedSecret = process.env.DRAW_CRON_SECRET;

    if (!expectedSecret || authorization !== `Bearer ${expectedSecret}`) {
      return drawError(401, 'Unauthorized', 'UNAUTHORIZED');
    }

    const parsed = schema.safeParse(await req.json().catch(() => undefined));

    if (!parsed.success) {
      return drawError(
        422,
        parsed.error.issues[0]?.message ?? 'Invalid request',
        'VALIDATION_ERROR'
      );
    }

    const month = parsed.data?.month ?? currentUtcMonth();
    const mode = parsed.data?.mode ?? 'random';

    if (!isValidMonth(month)) {
      return drawError(
        422,
        'Month must be in YYYY-MM format',
        'VALIDATION_ERROR'
      );
    }

    const serviceSupabase = createServiceSupabase();
    const { data: existingDraw, error: existingError } = await serviceSupabase
      .from('draws')
      .select('*')
      .eq('month', month)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      return drawError(500, existingError.message, 'DB_ERR');
    }

    if (existingDraw?.status === 'published') {
      return NextResponse.json({
        data: {
          scheduled: true,
          skipped: true,
          reason: 'already_published',
          draw_id: existingDraw.id,
        },
        error: null,
      });
    }

    const draw =
      existingDraw ??
      (
        await createDraftDraw({
          supabase: serviceSupabase,
          month,
          mode,
          prizePoolOverride: parsed.data?.prize_pool_total,
        })
      ).draw;

    const result = await publishStoredDraw({
      supabase: serviceSupabase,
      draw,
    });

    return NextResponse.json({
      data: {
        scheduled: true,
        draw_id: draw.id,
        result,
      },
      error: null,
    });
  } catch (error) {
    return drawError(
      500,
      error instanceof Error ? error.message : 'Failed to run scheduled draw',
      'ERR'
    );
  }
}
