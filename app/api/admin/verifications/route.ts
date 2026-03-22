import { NextResponse } from 'next/server';
import { createServiceSupabase, requireAdminUser } from '@/lib/draw/api';
import type { DrawResultWithWinner } from '@/lib/types/verification';

export async function GET(req: Request) {
  const adminCheck = await requireAdminUser();
  if ('response' in adminCheck) {
    return adminCheck.response;
  }

  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status') ?? 'pending';
    const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
    const pageSize = 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const supabase = createServiceSupabase();

    let query = supabase
      .from('winner_verifications')
      .select(
        `
        id,
        draw_result_id,
        proof_url,
        status,
        rejection_note,
        reviewed_by,
        reviewed_at,
        created_at,
        draw_result:draw_results (
          id,
          draw_id,
          user_id,
          match_category,
          prize_amount,
          payment_status,
          user:users ( full_name, email ),
          draw:draws ( month, draw_number )
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { data: null, error: { message: error.message, code: 'DB_ERR' } },
        { status: 500 }
      );
    }

    const items = ((data ?? []) as Array<Record<string, unknown>>)
      .map((item) => {
        const drawResult = Array.isArray(item.draw_result)
          ? item.draw_result[0]
          : item.draw_result;
        if (!drawResult) {
          return null;
        }

        const draw = Array.isArray((drawResult as { draw?: unknown }).draw)
          ? (
              drawResult as {
                draw?: Array<{ month: string; draw_number: number }>;
              }
            ).draw?.[0]
          : (drawResult as { draw?: { month: string; draw_number: number } })
              .draw;
        const user = Array.isArray((drawResult as { user?: unknown }).user)
          ? (
              drawResult as {
                user?: Array<{ full_name: string; email: string }>;
              }
            ).user?.[0]
          : (drawResult as { user?: { full_name: string; email: string } })
              .user;

        return {
          id: String((drawResult as { id: string }).id),
          draw_id: String((drawResult as { draw_id: string }).draw_id),
          user_id: String((drawResult as { user_id: string }).user_id),
          match_category: (
            drawResult as { match_category: '3-match' | '4-match' | '5-match' }
          ).match_category,
          prize_amount: Number(
            (drawResult as { prize_amount: number }).prize_amount ?? 0
          ),
          payment_status: (
            drawResult as {
              payment_status: 'pending' | 'approved' | 'paid' | 'rejected';
            }
          ).payment_status,
          user: {
            full_name: user?.full_name ?? 'Winner',
            email: user?.email ?? '',
          },
          draw: {
            month: draw?.month ?? '',
            draw_number: Number(draw?.draw_number ?? 0),
          },
          verification: {
            id: String(item.id),
            draw_result_id: String(item.draw_result_id),
            proof_url: String(item.proof_url),
            status: String(item.status) as 'pending' | 'approved' | 'rejected',
            rejection_note: (item.rejection_note as string | null) ?? null,
            reviewed_by: (item.reviewed_by as string | null) ?? null,
            reviewed_at: (item.reviewed_at as string | null) ?? null,
            created_at: String(item.created_at),
          },
        } satisfies DrawResultWithWinner;
      })
      .filter(Boolean) as DrawResultWithWinner[];

    items.sort((a, b) => b.prize_amount - a.prize_amount);

    return NextResponse.json({
      data: {
        items,
        total: count ?? 0,
        page,
      },
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Failed to load queue',
          code: 'ERR',
        },
      },
      { status: 500 }
    );
  }
}
