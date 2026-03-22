npm i @supabase/ssr @supabase/supabase-js
npx shadcn@latest add card input label select
_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    categories TEXT[] DEFAULT '{}'::TEXT[],
    country TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Create Users table (extends auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL,
    contribution_percentage INTEGER DEFAULT 10 CHECK (contribution_percentage >= 10),
    country TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Subscriptions table
CREATE TABLE public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT CHECK (status IN ('active', 'past_due', 'inactive', 'cancelled')),
    plan_id TEXT,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Scores table
CREATE TABLE public.scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Draws table
CREATE TABLE public.draws (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    month DATE NOT NULL,
    mode TEXT CHECK (mode IN ('random', 'algorithmic')) NOT NULL,
    status TEXT CHECK (status IN ('draft', 'simulated', 'published')) NOT NULL,
    prize_pool_total NUMERIC DEFAULT 0,
    config JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Draw Results table
CREATE TABLE public.draw_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    category TEXT CHECK (category IN ('3-match', '4-match', '5-match')) NOT NULL,
    prize_amount NUMERIC NOT NULL,
    payment_status TEXT CHECK (payment_status IN ('pending', 'approved', 'paid')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Winner Verifications table
CREATE TABLE public.winner_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    result_id UUID REFERENCES public.draw_results(id) ON DELETE CASCADE UNIQUE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    proof_url TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    admin_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Prize Pool Ledger table
CREATE TABLE public.prize_pool_ledger (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winner_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prize_pool_ledger ENABLE ROW LEVEL SECURITY;

-- Charities RLS Policies (Public read)
CREATE POLICY "Charities are viewable by everyone" 
ON public.charities FOR SELECT USING (true);

-- Users RLS Policies
CREATE POLICY "Users can view their own profile"
ON public.users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE USING (auth.uid() = id);

-- Subscriptions RLS Policies
CREATE POLICY "Users can view their own subscriptions"
ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Scores RLS Policies
CREATE POLICY "Users can view their own scores"
ON public.scores FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scores"
ON public.scores FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scores"
ON public.scores FOR DELETE USING (auth.uid() = user_id);

-- Draws RLS Policies (Public read for published draws, simple rule)
CREATE POLICY "Anyone can view published draws"
ON public.draws FOR SELECT USING (status = 'published');

-- Draw Results RLS Policies
CREATE POLICY "Users can view their own results"
ON public.draw_results FOR SELECT USING (auth.uid() = user_id);

-- Winner Verifications RLS Policies
CREATE POLICY "Users can view their own verifications"
ON public.winner_verifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verifications"
ON public.winner_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Prize Pool Ledger RLS Policies
CREATE POLICY "Users can view their own ledger entries"
ON public.prize_pool_ledger FOR SELECT USING (auth.uid() = user_id);

-- Trigger to enforce 5-score limit
CREATE OR REPLACE FUNCTION enforce_score_limit()
RETURNS trigger AS $$
BEGIN
    DELETE FROM public.scores
    WHERE id IN (
        SELECT id FROM public.scores 
        WHERE user_id = NEW.user_id 
        ORDER BY created_at DESC 
        OFFSET 5
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_score_limit_trigger
AFTER INSERT ON public.scores
FOR EACH ROW
EXECUTE FUNCTION enforce_score_limit();
