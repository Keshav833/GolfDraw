import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { razorpay } from '@/lib/razorpay/client';

export async function DELETE(_req: Request) {
  try {
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

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id, razorpay_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
    if (!sub || !sub.razorpay_subscription_id)
      return NextResponse.json(
        {
          data: null,
          error: { message: 'No active subscription', code: '404' },
        },
        { status: 404 }
      );

    await razorpay.subscriptions.cancel(sub.razorpay_subscription_id);

    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', sub.id);
    await supabase
      .from('users')
      .update({ subscription_status: 'cancelled' })
      .eq('id', user.id);

    return NextResponse.json({ data: { success: true }, error: null });
  } catch (err: any) {
    return NextResponse.json(
      { data: null, error: { message: err.message, code: 'ERR' } },
      { status: 500 }
    );
  }
}
