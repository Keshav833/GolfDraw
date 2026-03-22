import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { razorpay } from '@/lib/razorpay/client';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const userId = params.id;

    // 2. Fetch user's active subscription
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('id, razorpay_subscription_id')
      .eq('user_id', userId)
      .neq('status', 'cancelled')
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        {
          data: null,
          error: { message: 'No active subscription found for this user' },
        },
        { status: 404 }
      );
    }

    // 3. Call razorpay.subscriptions.cancel(razorpay_sub_id)
    if (subscription.razorpay_subscription_id) {
      try {
        await razorpay.subscriptions.cancel(
          subscription.razorpay_subscription_id
        );
      } catch (rzpErr: any) {
        console.error('Razorpay cancellation error:', rzpErr);
        // Even if Razorpay fails (e.g. already cancelled on their side), we proceed to sync DB
      }
    }

    // 4. UPDATE subscriptions SET status='cancelled', cancelled_at = now()
    const { error: updateSubError } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    if (updateSubError) throw updateSubError;

    // 5. UPDATE users SET subscription_status='cancelled'
    const { error: updateUserError } = await supabaseAdmin
      .from('users')
      .update({
        subscription_status: 'cancelled',
      })
      .eq('id', userId);

    if (updateUserError) throw updateUserError;

    return NextResponse.json({
      data: { cancelled: true },
      error: null,
    });
  } catch (err: any) {
    console.error('Subscription Cancel Error:', err);
    const status =
      err.message === 'UNAUTHENTICATED'
        ? 401
        : err.message === 'FORBIDDEN'
          ? 403
          : 500;
    return NextResponse.json(
      { data: null, error: { message: err.message } },
      { status }
    );
  }
}
