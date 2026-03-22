-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winner_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prize_pool_ledger ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role from JWT
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Charities
CREATE POLICY "Public charities are viewable by everyone" ON public.charities FOR SELECT USING (true);
CREATE POLICY "Admins can manage charities" ON public.charities FOR ALL USING (public.is_admin());

-- 2. Users
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can manage all users" ON public.users FOR ALL USING (public.is_admin());

-- 3. Subscriptions
CREATE POLICY "Users view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
-- Note: Inserts/Updates to subscriptions happen via service_role in backend webhooks

-- 4. Scores
CREATE POLICY "Users see own scores" ON public.scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own scores" ON public.scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own scores" ON public.scores FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all scores" ON public.scores FOR SELECT USING (public.is_admin());

-- 5. Draws
CREATE POLICY "Draws viewable by everyone" ON public.draws FOR SELECT USING (true);
CREATE POLICY "Admins can manage draws" ON public.draws FOR ALL USING (public.is_admin());

-- 6. Draw Results
CREATE POLICY "Users see own draw results" ON public.draw_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage draw results" ON public.draw_results FOR ALL USING (public.is_admin());

-- 7. Winner Verifications
CREATE POLICY "Users can view own verifications" ON public.winner_verifications FOR SELECT USING (
  draw_result_id IN (SELECT id FROM public.draw_results WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert own verifications" ON public.winner_verifications FOR INSERT WITH CHECK (
  draw_result_id IN (SELECT id FROM public.draw_results WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage verifications" ON public.winner_verifications FOR ALL USING (public.is_admin());

-- 8. Prize Pool Ledger
CREATE POLICY "Ledger is viewable by authenticated" ON public.prize_pool_ledger FOR SELECT USING (auth.role() = 'authenticated');
-- Note: Inserts handle by server webhooks
