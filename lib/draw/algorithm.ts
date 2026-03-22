import crypto from 'crypto';
import type { EligibleUser } from '@/lib/types/draw';

export function calculateWeight(scores: number[], drawNumber: number): number {
  if (scores.length === 0) {
    return 0;
  }

  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return 1 / (1 + Math.abs(average - drawNumber));
}

export function weightedSelect(
  users: Array<{ user: EligibleUser; weight: number }>
): EligibleUser | null {
  if (users.length === 0) {
    return null;
  }

  const totalWeight = users.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of users) {
    random -= item.weight;
    if (random <= 0) {
      return item.user;
    }
  }

  return users[users.length - 1]?.user ?? null;
}

export function applyAlgorithmicBias(
  users: EligibleUser[],
  drawNumber: number,
  seed?: string
): number {
  const scoreCounts: Record<number, number> = {};

  for (const user of users) {
    for (const score of user.scores) {
      scoreCounts[score] = (scoreCounts[score] ?? 0) + 1;
    }
  }

  const hotZone = Object.entries(scoreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([score]) => Number(score));

  if (hotZone.length === 0 || hotZone.includes(drawNumber)) {
    return drawNumber;
  }

  const decisionSeed = seed ?? String(drawNumber);
  const hash = crypto.createHash('sha256').update(decisionSeed).digest();
  const rerollChance = hash[0] / 255;

  if (rerollChance < 0.3) {
    return hotZone[hash[1] % hotZone.length] ?? drawNumber;
  }

  return drawNumber;
}
