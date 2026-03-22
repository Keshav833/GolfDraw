export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export type PaymentStatus = 'pending' | 'approved' | 'paid' | 'rejected';

export type WinnerVerification = {
  id: string;
  draw_result_id: string;
  proof_url: string;
  status: VerificationStatus;
  rejection_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type DrawResultWithWinner = {
  id: string;
  draw_id: string;
  user_id: string;
  match_category: '3-match' | '4-match' | '5-match';
  prize_amount: number;
  payment_status: PaymentStatus;
  user: {
    full_name: string;
    email: string;
  };
  draw: {
    month: string;
    draw_number: number;
  };
  verification: WinnerVerification | null;
};
