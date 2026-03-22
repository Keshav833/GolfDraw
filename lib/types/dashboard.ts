import type { Score } from '@/lib/types/score';

export type SubscriptionStatus = 'active' | 'past_due' | 'inactive' | 'cancelled';

export type DashboardSubscription = {
  id: string;
  plan_type: 'monthly' | 'yearly';
  status: SubscriptionStatus;
  current_period_end: string | null;
  cancelled_at: string | null;
} | null;

export type DashboardCharity = {
  id: string;
  name: string;
  category: 'Golf & Sport' | 'Health & Research' | 'Youth & Education' | 'Environment';
  country: string;
} | null;

export type DrawResult = {
  id: string;
  match_category: '3-match' | '4-match' | '5-match' | null;
  prize_amount: number | null;
  payment_status: 'pending' | 'approved' | 'paid' | 'rejected' | null;
  draw: {
    id: string;
    month: string;
    status: string | null;
    draw_number: number;
  } | null;
};

export type PendingWinnings = {
  id: string;
  prize_amount: number;
  match_category: '3-match' | '4-match' | '5-match';
  draw: {
    month: string;
  } | null;
} | null;

export type WinningsData = {
  totalPaid: number;
  pendingResult: PendingWinnings;
};

export type DashboardData = {
  user: {
    id: string;
    full_name: string | null;
    email: string | null;
    charity_contribution_pct: number | null;
  } | null;
  subscription: DashboardSubscription;
  scores: Score[];
  charity: DashboardCharity;
  draws: DrawResult[];
  winnings: WinningsData;
};
