import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { razorpay } from '@/lib/razorpay/client';
import { z } from 'zod';

const schema = z.object({
  plan_type: z.enum(['monthly', 'yearly']),
});

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          data: null,
          error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          data: null,
          error: { message: 'Invalid plan type', code: 'INVALID_INPUT' },
        },
        { status: 422 }
      );
    }

    // Check if user already has an active or recently created subscription
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id, status')
      .eq('user_id', user.id)
      .in('status', ['active', 'created'])
      .maybeSingle();

    if (existingSub) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'You already have an active subscription.',
            code: 'ALREADY_SUBSCRIBED',
          },
        },
        { status: 409 }
      );
    }

    // Get user details for customer creation
    const { data: userRecord } = await supabase
      .from('users')
      .select('razorpay_customer_id, email, full_name')
      .eq('id', user.id)
      .single();

    if (!userRecord) {
      return NextResponse.json(
        {
          data: null,
          error: { message: 'User not found', code: 'USER_NOT_FOUND' },
        },
        { status: 404 }
      );
    }

    // Validate environment variables
    const plan_id =
      parsed.data.plan_type === 'yearly'
        ? process.env.RAZORPAY_YEARLY_PLAN_ID
        : process.env.RAZORPAY_MONTHLY_PLAN_ID;

    if (!plan_id || plan_id.startsWith('plan_mock')) {
      console.error(
        `Missing or mock Razorpay ${parsed.data.plan_type} plan ID`
      );
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Payment configuration error. Please contact support.',
            code: 'CONFIG_ERROR',
          },
        },
        { status: 500 }
      );
    }

    let customerId = userRecord.razorpay_customer_id;

    // Create Razorpay customer if not exists
    if (!customerId) {
      try {
        const customer = await razorpay.customers.create({
          name: userRecord.full_name || 'GolfDraw Member',
          email: userRecord.email || user.email || '',
          fail_existing: 0, // 0 = do not fail if email exists
        });
        customerId = customer.id;

        // Save customer ID back to users table
        await supabase
          .from('users')
          .update({ razorpay_customer_id: customerId })
          .eq('id', user.id);
      } catch (custErr: any) {
        console.error('Customer creation failed:', custErr);
        // If it fails because customer already exists but we didn't have ID,
        // Razorpay might return an error we can handle, but for now we log and fail.
        return NextResponse.json(
          {
            data: null,
            error: {
              message: 'Failed to initialize customer',
              code: 'CUSTOMER_ERR',
            },
          },
          { status: 500 }
        );
      }
    }

    // Create Razorpay subscription
    const subscription = (await razorpay.subscriptions.create({
      plan_id: plan_id,
      customer_notify: 1,
      total_count: 12,
      customer_id: customerId,
      notes: {
        user_id: user.id,
        plan_type: parsed.data.plan_type,
      },
    } as any)) as any;

    console.log('Subscription created:', subscription.id);

    return NextResponse.json({
      data: {
        subscription_id: subscription.id,
        razorpay_key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        plan_type: parsed.data.plan_type,
      },
      error: null,
    });
  } catch (err: any) {
    console.error('Subscription creation error:', err);
    const message =
      err?.error?.description || err.message || 'Something went wrong';
    return NextResponse.json(
      { data: null, error: { message, code: 'RAZORPAY_ERROR' } },
      { status: 500 }
    );
  }
}
