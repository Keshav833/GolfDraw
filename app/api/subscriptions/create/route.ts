import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { razorpay } from '@/lib/razorpay/client';

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
    if (!user)
      return NextResponse.json(
        { data: null, error: { message: 'Unauthorized', code: '401' } },
        { status: 401 }
      );

    const plan_id =
      plan_type === 'monthly'
        ? process.env.RAZORPAY_MONTHLY_PLAN_ID
        : process.env.RAZORPAY_YEARLY_PLAN_ID;
    if (!plan_id || plan_id.startsWith('plan_mock')) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: `Razorpay ${plan_type} test plan ID is not configured. Replace the mock plan ID in your env with a real test mode plan_... value.`,
            code: '500',
          },
        },
        { status: 500 }
      );
    }

    const razorpaySub = await razorpay.subscriptions.create({
      plan_id: plan_id,
      customer_notify: 1,
      total_count: 12,
      notes: { user_id: user.id, plan_type },
    });

    return NextResponse.json({
      data: {
        subscription_id: razorpaySub.id,
        razorpay_key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      },
      error: null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { data: null, error: { message: err.message, code: 'ERR' } },
      { status: 500 }
    );
  }
}
