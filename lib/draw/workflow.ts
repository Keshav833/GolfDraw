import type { SupabaseClient } from '@supabase/supabase-js';
import { runDrawEngine } from '@/lib/draw/engine';
import { calculatePrizeBuckets } from '@/lib/draw/prizes';
import { generateDrawNumber } from '@/lib/draw/random';
import {
  getEligibleUsers,
  getPrizePoolTotal,
  getRolloverAmount,
} from '@/lib/draw/snapshot';
import type {
  DrawConfig,
  DrawMode,
  DrawResult,
  DrawStatus,
  MatchCategory,
} from '@/lib/types/draw';

type StoredDrawRow = {
  id: string;
  month: string;
  mode: DrawMode;
  status: DrawStatus;
  prize_pool_total: number | string | null;
  draw_number: number | null;
  seed: string | null;
  config: Partial<DrawConfig> | null;
  executed_at?: string | null;
};

export async function createDraftDraw(params: {
  supabase: SupabaseClient;
  month: string;
  mode: DrawMode;
  prizePoolOverride?: number;
}) {
  const eligibleUsers = await getEligibleUsers();
  const rolloverAmount = await getRolloverAmount(params.month);
  const calculatedPrizePool = await getPrizePoolTotal(params.month);
  const prizePoolTotal = params.prizePoolOverride ?? calculatedPrizePool;
  const generated = generateDrawNumber();
  const prizePool = calculatePrizeBuckets(prizePoolTotal, rolloverAmount);

  const config: DrawConfig = {
    mode: params.mode,
    month: params.month,
    prize_pool_total: prizePoolTotal,
    prize_pool: {
      jackpot: prizePool.jackpot,
      four_match: prizePool.four_match,
      three_match: prizePool.three_match,
    },
    eligible_users: eligibleUsers,
    draw_number: generated.drawNumber,
    seed: generated.seed,
    rollover_amount: rolloverAmount,
  };

  const { data: draw, error } = await params.supabase
    .from('draws')
    .insert({
      month: params.month,
      mode: params.mode,
      status: 'draft',
      prize_pool_total: prizePoolTotal,
      draw_number: generated.drawNumber,
      seed: generated.seed,
      config,
    })
    .select('*')
    .single();

  if (error || !draw) {
    throw new Error(error?.message ?? 'Failed to create draw');
  }

  return { draw: draw as StoredDrawRow, config };
}

export function normaliseStoredDraw(draw: StoredDrawRow): DrawConfig {
  const rawConfig = draw.config ?? {};
  const prizePoolTotal = Number(
    draw.prize_pool_total ?? rawConfig.prize_pool_total ?? 0
  );
  const rolloverAmount = Number(rawConfig.rollover_amount ?? 0);
  const prizePool = calculatePrizeBuckets(prizePoolTotal, rolloverAmount);

  return {
    mode: draw.mode,
    month: draw.month,
    prize_pool_total: prizePoolTotal,
    prize_pool: {
      jackpot: Number(rawConfig.prize_pool?.jackpot ?? prizePool.jackpot),
      four_match: Number(
        rawConfig.prize_pool?.four_match ?? prizePool.four_match
      ),
      three_match: Number(
        rawConfig.prize_pool?.three_match ?? prizePool.three_match
      ),
    },
    eligible_users: Array.isArray(rawConfig.eligible_users)
      ? rawConfig.eligible_users
      : [],
    draw_number: draw.draw_number ?? rawConfig.draw_number,
    seed: draw.seed ?? rawConfig.seed,
    rollover_amount: rolloverAmount,
  };
}

export function simulateStoredDraw(draw: StoredDrawRow): DrawResult {
  return runDrawEngine(normaliseStoredDraw(draw));
}

export async function publishStoredDraw(params: {
  supabase: SupabaseClient;
  draw: StoredDrawRow;
}) {
  const result = runDrawEngine(normaliseStoredDraw(params.draw));
  const winningResults = [
    ...result.five_match,
    ...result.four_match,
    ...result.three_match,
  ];

  const drawResultInserts: Array<{
    draw_id: string;
    user_id: string;
    match_category: MatchCategory;
    prize_amount: number;
    payment_status: 'pending';
  }> = winningResults.map((winner) => ({
    draw_id: params.draw.id,
    user_id: winner.user_id,
    match_category: winner.match_category,
    prize_amount: winner.prize_amount,
    payment_status: 'pending',
  }));

  if (drawResultInserts.length > 0) {
    const { error } = await params.supabase
      .from('draw_results')
      .insert(drawResultInserts);

    if (error) {
      throw new Error(error.message);
    }
  }

  if (winningResults.length > 0) {
    const winnerIds = Array.from(
      new Set(winningResults.map((winner) => winner.user_id))
    );
    const { data: subscriptions, error: subscriptionsError } =
      await params.supabase
        .from('subscriptions')
        .select('id, user_id')
        .in('user_id', winnerIds)
        .eq('status', 'active');

    if (subscriptionsError) {
      throw new Error(subscriptionsError.message);
    }

    const subscriptionByUser = new Map(
      (subscriptions ?? []).map((subscription) => [
        subscription.user_id,
        subscription.id,
      ])
    );

    const payoutLedgerEntries = winningResults.map((winner) => ({
      subscription_id: subscriptionByUser.get(winner.user_id) ?? null,
      user_id: winner.user_id,
      amount: winner.prize_amount,
      type: 'payout',
      period: params.draw.month,
    }));

    const { error: payoutError } = await params.supabase
      .from('prize_pool_ledger')
      .insert(payoutLedgerEntries);

    if (payoutError) {
      throw new Error(payoutError.message);
    }
  }

  if (result.jackpot_rollover && result.rollover_amount > 0) {
    const { error: rolloverError } = await params.supabase
      .from('prize_pool_ledger')
      .insert({
        subscription_id: null,
        user_id: null,
        amount: result.rollover_amount,
        type: 'rollover',
        period: params.draw.month,
      });

    if (rolloverError) {
      throw new Error(rolloverError.message);
    }
  }

  const { error: updateError } = await params.supabase
    .from('draws')
    .update({
      status: 'published',
      draw_number: result.draw_number,
      seed: result.seed,
      executed_at: new Date().toISOString(),
      config: {
        ...(params.draw.config ?? {}),
        draw_number: result.draw_number,
        seed: result.seed,
        prize_pool: result.prize_pool,
        rollover_amount: result.rollover_amount,
      },
    })
    .eq('id', params.draw.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return result;
}
