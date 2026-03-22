import { createClient } from '@/lib/supabase/server';
import { createServiceSupabase, createSessionSupabase } from '@/lib/draw/api';
import type {
  DrawResultWithWinner,
  WinnerVerification,
} from '@/lib/types/verification';

export function getFileFolderAndName(filePath: string) {
  const lastSlash = filePath.lastIndexOf('/');
  return {
    folder: lastSlash >= 0 ? filePath.slice(0, lastSlash) : '',
    fileName: lastSlash >= 0 ? filePath.slice(lastSlash + 1) : filePath,
  };
}

export async function getAuthenticatedUser() {
  const supabase = createSessionSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function getOwnedPendingDrawResult(
  drawResultId: string,
  userId: string
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('draw_results')
    .select('id, payment_status, user_id')
    .eq('id', drawResultId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return { data: null, error: 'not_found' as const };
  }

  return { data, error: null as null };
}

export async function getVerificationForDrawResult(drawResultId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('winner_verifications')
    .select('*')
    .eq('draw_result_id', drawResultId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as WinnerVerification | null;
}

export async function getAdminVerificationRecord(verificationId: string) {
  const supabase = createServiceSupabase();
  const { data, error } = await supabase
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
    `
    )
    .eq('id', verificationId)
    .single();

  if (error || !data) {
    return null;
  }

  const drawResult = Array.isArray(data.draw_result)
    ? data.draw_result[0]
    : data.draw_result;
  const draw = Array.isArray(drawResult?.draw)
    ? drawResult.draw[0]
    : drawResult?.draw;
  const user = Array.isArray(drawResult?.user)
    ? drawResult.user[0]
    : drawResult?.user;

  return {
    id: drawResult.id,
    draw_id: drawResult.draw_id,
    user_id: drawResult.user_id,
    match_category: drawResult.match_category,
    prize_amount: Number(drawResult.prize_amount ?? 0),
    payment_status: drawResult.payment_status,
    user: {
      full_name: user?.full_name ?? 'Winner',
      email: user?.email ?? '',
    },
    draw: {
      month: draw?.month ?? '',
      draw_number: Number(draw?.draw_number ?? 0),
    },
    verification: {
      id: data.id,
      draw_result_id: data.draw_result_id,
      proof_url: data.proof_url,
      status: data.status,
      rejection_note: data.rejection_note,
      reviewed_by: data.reviewed_by,
      reviewed_at: data.reviewed_at,
      created_at: data.created_at,
    },
  } as DrawResultWithWinner;
}
