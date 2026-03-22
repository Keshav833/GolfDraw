import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { plan_type } = await req.json();
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

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const selectedPlan = plan_type === 'yearly' ? 'yearly' : 'monthly';
    const demoSubscriptionId = `demo_${selectedPlan}_${user.id}`;

    const { data: existingSubscription } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const payload = {
      user_id: user.id,
      razorpay_subscription_id: demoSubscriptionId,
      plan_type: selectedPlan,
      status: 'active',
    };

    const subscriptionQuery = existingSubscription
      ? supabaseAdmin
          .from('subscriptions')
          .update(payload)
          .eq('id', existingSubscription.id)
      : supabaseAdmin.from('subscriptions').insert(payload);

    const { error } = await subscriptionQuery;
    if (error) {
      return NextResponse.json(
        { data: null, error: { message: error.message, code: 'DB_ERR' } },
        { status: 500 }
      );
    }

    await supabaseAdmin
      .from('users')
      .update({ subscription_status: 'active' })
      .eq('id', user.id);

    return NextResponse.json({
      data: { activated: true, plan_type: selectedPlan },
      error: null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { data: null, error: { message: err.message, code: 'ERR' } },
      { status: 500 }
    );
  }
}
