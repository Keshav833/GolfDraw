CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.charities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  country text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  subscription_status text DEFAULT 'inactive',
  charity_id uuid REFERENCES public.charities(id),
  charity_contribution_pct int DEFAULT 10,
  razorpay_customer_id text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  razorpay_subscription_id text UNIQUE,
  plan_type text CHECK (plan_type IN ('monthly','yearly')),
  status text CHECK (status IN ('active','past_due','inactive','cancelled')),
  current_period_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  value int CHECK (value BETWEEN 1 AND 45),
  submitted_at timestamptz DEFAULT now()
);

CREATE TABLE public.draws (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month text NOT NULL,
  mode text CHECK (mode IN ('random','algorithmic')),
  status text CHECK (status IN ('draft','simulated','published')),
  prize_pool_total numeric,
  draw_number int,
  seed text,
  config jsonb,
  executed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.draw_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id uuid REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  match_category text CHECK (match_category IN ('3-match','4-match','5-match')),
  prize_amount numeric,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending','approved','paid','rejected'))
);

CREATE TABLE public.winner_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_result_id uuid REFERENCES public.draw_results(id) ON DELETE CASCADE,
  proof_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  rejection_note text,
  reviewed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz
);

CREATE TABLE public.prize_pool_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  type text CHECK (type IN ('contribution','rollover','payout')),
  period text,
  created_at timestamptz DEFAULT now()
);
