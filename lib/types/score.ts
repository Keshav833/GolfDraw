export type Score = {
  id: string;
  user_id: string;
  value: number;
  submitted_at: string;
};

export type ScoreApiResponse = {
  data: { scores: Score[] } | null;
  error: { message: string; code?: string } | null;
};
