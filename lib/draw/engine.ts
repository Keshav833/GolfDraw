import type { DrawConfig, DrawResult, MatchResult } from '@/lib/types/draw';
import { applyAlgorithmicBias } from '@/lib/draw/algorithm';
import { detectMatches } from '@/lib/draw/matcher';
import { calculatePrizeBuckets, splitPrize } from '@/lib/draw/prizes';
import { generateDrawNumber } from '@/lib/draw/random';

export function runDrawEngine(config: DrawConfig): DrawResult {
  let drawNumber: number;
  let seed: string;

  if (config.draw_number && config.seed) {
    drawNumber = config.draw_number;
    seed = config.seed;
  } else {
    const generated = generateDrawNumber();
    drawNumber = generated.drawNumber;
    seed = generated.seed;
  }

  if (config.mode === 'algorithmic') {
    drawNumber = applyAlgorithmicBias(config.eligible_users, drawNumber, seed);
  }

  const prizeBuckets = calculatePrizeBuckets(
    config.prize_pool_total,
    config.rollover_amount ?? 0
  );

  const matches = detectMatches(config.eligible_users, drawNumber);
  const fiveMatchUsers = matches.filter(
    (match) => match.category === '5-match'
  );
  const fourMatchUsers = matches.filter(
    (match) => match.category === '4-match'
  );
  const threeMatchUsers = matches.filter(
    (match) => match.category === '3-match'
  );

  const prizePerFive = splitPrize(prizeBuckets.jackpot, fiveMatchUsers.length);
  const prizePerFour = splitPrize(
    prizeBuckets.four_match,
    fourMatchUsers.length
  );
  const prizePerThree = splitPrize(
    prizeBuckets.three_match,
    threeMatchUsers.length
  );

  const buildResults = (
    matchList: typeof matches,
    prizePerWinner: number
  ): MatchResult[] =>
    matchList.map((match) => ({
      user_id: match.user.user_id,
      full_name: match.user.full_name,
      email: match.user.email,
      match_count: match.matchCount,
      match_category: match.category,
      prize_amount: prizePerWinner,
    }));

  const fiveMatchResults = buildResults(fiveMatchUsers, prizePerFive);
  const fourMatchResults = buildResults(fourMatchUsers, prizePerFour);
  const threeMatchResults = buildResults(threeMatchUsers, prizePerThree);

  const jackpotRollover = fiveMatchUsers.length === 0;
  const rolloverAmount = jackpotRollover ? prizeBuckets.jackpot : 0;

  return {
    draw_number: drawNumber,
    seed,
    mode: config.mode,
    month: config.month,
    five_match: fiveMatchResults,
    four_match: fourMatchResults,
    three_match: threeMatchResults,
    jackpot_rollover: jackpotRollover,
    rollover_amount: rolloverAmount,
    prize_pool: {
      jackpot: prizeBuckets.jackpot,
      four_match: prizeBuckets.four_match,
      three_match: prizeBuckets.three_match,
      total: config.prize_pool_total + (config.rollover_amount ?? 0),
    },
    eligible_count: config.eligible_users.length,
    match_count: matches.length,
  };
}
