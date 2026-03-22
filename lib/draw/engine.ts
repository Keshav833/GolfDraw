export interface Winner {
  user_id: string;
}

export type DrawInput = {
  draw_number: number;
  mode: 'random' | 'algorithmic';
  prize_pool: {
    jackpot: number;
    four_match: number;
    three_match: number;
  };
  users: Array<{
    user_id: string;
    scores: number[];
  }>;
};

export type DrawResult = {
  five_match: Winner[];
  four_match: Winner[];
  three_match: Winner[];
  jackpot_rollover: boolean;
};

export function runDraw(input: DrawInput, randomFunction: () => number = Math.random): DrawResult {
  const { draw_number, mode, users } = input;
  
  const result: DrawResult = {
    five_match: [],
    four_match: [],
    three_match: [],
    jackpot_rollover: false
  };

  // Pure deterministic bucketing first
  for (const u of users) {
    let matches = 0;
    for (const s of u.scores) {
      if (s === draw_number) matches++;
    }
    
    // We only push to the highest corresponding tier to avoid duplicate claims
    if (matches >= 5) result.five_match.push({ user_id: u.user_id });
    else if (matches === 4) result.four_match.push({ user_id: u.user_id });
    else if (matches === 3) result.three_match.push({ user_id: u.user_id });
  }

  // If algorithmic mode is enabled and nobody naturally hit 5 matches,
  // we select the user whose average score is closest to the draw number
  // using weighted random selection to fill the jackpot bucket.
  if (mode === 'algorithmic' && result.five_match.length === 0 && users.length > 0) {
    
    // Calculate weights (inverse of distance). Max weight to lowest distance.
    const weightedUsers = users.map(u => {
      const activeScores = u.scores.length > 0 ? u.scores : [draw_number + 10]; // punish empty 
      const avg = activeScores.reduce((a, b) => a + b, 0) / activeScores.length;
      const dist = Math.abs(avg - draw_number);
      // Ensure distance isn't exactly 0 to avoid Infinity
      const safeDist = Math.max(dist, 0.001); 
      return {
        user_id: u.user_id,
        weight: 1 / safeDist
      };
    });

    const totalWeight = weightedUsers.reduce((sum, u) => sum + u.weight, 0);
    const randomTarget = randomFunction() * totalWeight;

    let cumulative = 0;
    let selectedUserId = weightedUsers[0].user_id;

    for (const u of weightedUsers) {
      cumulative += u.weight;
      if (randomTarget <= cumulative) {
        selectedUserId = u.user_id;
        break;
      }
    }

    result.five_match.push({ user_id: selectedUserId });
  }

  if (result.five_match.length === 0) {
    result.jackpot_rollover = true;
  }

  return result;
}
