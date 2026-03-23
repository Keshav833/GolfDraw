import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { verifySubscriptionSignature } from '@/lib/razorpay/verify';
import { z } from 'zod';

const schema = z.object({
  razorpay_payment_id: z.string().min(1),
  razorpay_subscription_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  plan_type: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // 1. Get user session (regular client)
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

    // 2. Parse and validate body
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      console.error('Verify validation error:', parsed.error.flatten());
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Missing payment verification fields',
            code: 'INVALID_INPUT',
          },
        },
        { status: 422 }
      );
    }

    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      plan_type,
    } = parsed.data;

    console.log('Verifying payment for user:', user.id);

    // 3. Verify signature
    const isValid = verifySubscriptionSignature(
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature
    );

    if (!isValid) {
      console.error(
        'Invalid signature for subscription:',
        razorpay_subscription_id
      );
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Payment signature invalid',
            code: 'INVALID_SIGNATURE',
          },
        },
        { status: 400 }
      );
    }

    // 4. Update database (Service Role to bypass RLS)
    const db = createServiceRoleClient();

    // Upsert subscription row
    const { error: subError } = await db.from('subscriptions').upsert(
      {
        user_id: user.id,
        razorpay_subscription_id,
        plan_type: plan_type || 'monthly',
        status: 'active',
      },
      { onConflict: 'razorpay_subscription_id' }
    );

    if (subError) {
      console.error('Subscription upsert error:', subError);
      // We don't return 500 here yet, because if sub was created in Razorpay,
      // we want to at least try updating user status or let webhook handle it.
    }

    // Update user subscription status
    const { error: userError } = await db
      .from('users')
      .update({ subscription_status: 'active' })
      .eq('id', user.id);

    if (userError) {
      console.error('User status update error:', userError);
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Payment verified but session update failed',
            code: 'STATUS_ERR',
          },
        },
        { status: 500 }
      );
    }

    console.log('Payment verified successfully for user:', user.id);

    return NextResponse.json({
      data: { verified: true, user_id: user.id },
      error: null,
    });
  } catch (err: any) {
    console.error('Verify route crashed:', err);
    return NextResponse.json(
      {
        data: null,
        error: {
          message: err.message || 'Internal server error',
          code: 'SERVER_ERR',
        },
      },
      { status: 500 }
    );
  }
}
