import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { data: null, error: { message: 'Unauthorized', code: '401' } },
      { status: 401 }
    );
  }

  const [{ data: userProfile }, { data: subscription }, { data: scores }, { data: charityJoin }] =
    await Promise.all([
      supabase.from('users').select('*').eq('id', user.id).single(),
      supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('scores')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(5),
      supabase
        .from('users')
        .select(
          'charity_contribution_pct, charities(id, name, description, category, country, is_active, created_at)'
        )
        .eq('id', user.id)
        .single(),
    ]);

  return NextResponse.json({
    data: {
      user: userProfile || {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || null,
        charity_contribution_pct: 0,
      },
      subscription: subscription || null,
      scores: scores || [],
      charity: firstCharity(charityJoin?.charities),
      charity_pct: Number(charityJoin?.charity_contribution_pct ?? userProfile?.charity_contribution_pct ?? 0),
    },
    error: null,
  });
}

function firstCharity<T>(value: T | T[] | null | undefined) {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}
