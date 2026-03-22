import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const {
      full_name,
      email,
      password,
      charity_contribution_pct = 0,
      plan_type,
    } = await req.json();

    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name },
      },
    });

    if (authError) {
      return NextResponse.json(
        { data: null, error: { message: authError.message, code: 'AUTH_ERR' } },
        { status: 400 }
      );
    }

    if (authData.user) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const charityPct = [10, 15, 30].includes(Number(charity_contribution_pct))
        ? Number(charity_contribution_pct)
        : 0;

      const { error: dbError } = await supabaseAdmin.from('users').insert({
        id: authData.user.id,
        email,
        full_name,
        charity_id: null,
        charity_contribution_pct: charityPct,
        subscription_status: plan_type ? 'active' : 'inactive',
      });

      if (dbError) {
        return NextResponse.json(
          { data: null, error: { message: dbError.message, code: 'DB_ERR' } },
          { status: 500 }
        );
      }

      if (plan_type) {
        const selectedPlan = plan_type === 'yearly' ? 'yearly' : 'monthly';
        const demoSubscriptionId = `demo_${selectedPlan}_${authData.user.id}`;

        const { error: subError } = await supabaseAdmin.from('subscriptions').insert({
          user_id: authData.user.id,
          razorpay_subscription_id: demoSubscriptionId,
          plan_type: selectedPlan,
          status: 'active',
        });

        if (subError) {
          return NextResponse.json(
            { data: null, error: { message: subError.message, code: 'DB_ERR' } },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({ data: authData, error: null });
  } catch (err: any) {
    return NextResponse.json(
      { data: null, error: { message: err.message || 'Server error', code: 'ERR' } },
      { status: 500 }
    );
  }
}
