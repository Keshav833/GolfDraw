import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createServiceSupabase, drawError, isValidMonth, requireAdminUser } from '@/lib/draw/api';
import { createDraftDraw } from '@/lib/draw/workflow';

const schema = z.object({
  month: z.string().refine((value) => isValidMonth(value), {
    message: 'Month must be in YYYY-MM format',
  }),
  mode: z.enum(['random', 'algorithmic']),
  prize_pool_total: z.number().nonnegative().optional(),
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
    const { month, mode, prize_pool_total } = parsed.data;

    const { data: existingDraw, error: existingError } = await serviceSupabase
      .from('draws')
      .select('id')
      .eq('month', month)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      return drawError(500, existingError.message, 'DB_ERR');
    }

    if (existingDraw) {
      return drawError(409, 'A draw already exists for this month', 'DUPLICATE_DRAW');
    }

    const { draw, config } = await createDraftDraw({
      supabase: serviceSupabase,
      month,
      mode,
      prizePoolOverride: prize_pool_total,
    });

    return NextResponse.json({
      data: {
        draw_id: draw.id,
        month: draw.month,
        mode: draw.mode,
        status: draw.status,
        draw_number: draw.draw_number,
        seed: draw.seed,
        prize_pool_total: Number(draw.prize_pool_total ?? 0),
        eligible_count: config.eligible_users.length,
        rollover_amount: config.rollover_amount ?? 0,
      },
      error: null,
    });
  } catch (error) {
    return drawError(
      500,
      error instanceof Error ? error.message : 'Failed to configure draw',
      'ERR'
    );
  }
}
