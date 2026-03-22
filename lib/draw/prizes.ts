export function splitPrize(poolAmount: number, winnerCount: number): number {
  if (winnerCount === 0) {
    return 0;
  }

  return Math.round((poolAmount / winnerCount) * 100) / 100;
}

export function calculatePrizeBuckets(
  total: number,
  rolloverAmount: number = 0
): {
  jackpot: number;
  four_match: number;
  three_match: number;
} {
  return {
    jackpot: Math.round((total * 0.4 + rolloverAmount) * 100) / 100,
    four_match: Math.round(total * 0.35 * 100) / 100,
    three_match: Math.round(total * 0.25 * 100) / 100,
  };
}
