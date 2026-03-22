export type DrawMode = 'random' | 'algorithmic';
export type DrawStatus = 'draft' | 'simulated' | 'published';
export type MatchCategory = '3-match' | '4-match' | '5-match';
export type PaymentStatus = 'pending' | 'approved' | 'paid' | 'rejected';

export type EligibleUser = {
  user_id: string;
  full_name: string;
  email: string;
  scores: number[];
};

export type DrawConfig = {
  mode: DrawMode;
  month: string;
  prize_pool_total: number;
  prize_pool: {
    jackpot: number;
    four_match: number;
    three_match: number;
  };
  eligible_users: EligibleUser[];
  draw_number?: number;
  seed?: string;
  rollover_amount?: number;
};

export type MatchResult = {
  user_id: string;
  full_name: string;
  email: string;
  match_count: number;
  match_category: MatchCategory;
  prize_amount: number;
};

export type DrawResult = {
  draw_number: number;
  seed: string;
  mode: DrawMode;
  month: string;
  five_match: MatchResult[];
  four_match: MatchResult[];
  three_match: MatchResult[];
  jackpot_rollover: boolean;
  rollover_amount: number;
  prize_pool: {
    jackpot: number;
    four_match: number;
    three_match: number;
    total: number;
  };
  eligible_count: number;
  match_count: number;
};
