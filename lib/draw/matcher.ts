import type { EligibleUser, MatchCategory } from '@/lib/types/draw';

export function countMatches(scores: number[], drawNumber: number): number {
  return scores.filter((score) => score === drawNumber).length;
}

export function getMatchCategory(matchCount: number): MatchCategory | null {
  if (matchCount >= 5) {
    return '5-match';
  }

  if (matchCount === 4) {
    return '4-match';
  }

  if (matchCount === 3) {
    return '3-match';
  }

  return null;
}

export function detectMatches(
  users: EligibleUser[],
  drawNumber: number
): Array<{
  user: EligibleUser;
  matchCount: number;
  category: MatchCategory;
}> {
  const results: Array<{
    user: EligibleUser;
    matchCount: number;
    category: MatchCategory;
  }> = [];

  for (const user of users) {
    if (user.scores.length === 0) {
      continue;
    }

    const matchCount = countMatches(user.scores, drawNumber);
    const category = getMatchCategory(matchCount);

    if (category !== null) {
      results.push({ user, matchCount, category });
    }
  }

  return results;
}
