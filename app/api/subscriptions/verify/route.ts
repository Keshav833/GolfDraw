import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { verifySubscriptionSignature } from '@/lib/razorpay/verify';

export async function POST(req: Request) {
  try {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, plan_type } = await req.json();
    const cookieStore = cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ data: null, error: { message: 'Unauthorized', code: '401' } }, { status: 401 });

    const isValid = verifySubscriptionSignature(razorpay_payment_id, razorpay_subscription_id, razorpay_signature);
    if (!isValid) return NextResponse.json({ data: null, error: { message: 'Invalid signature', code: '400' } }, { status: 400 });

    // UPSERT subscription into our DB
    const { error } = await supabase.from('subscriptions').upsert({
      user_id: user.id,
      razorpay_subscription_id,
      plan_type: plan_type || 'monthly',
      status: 'active'
    }, { onConflict: 'razorpay_subscription_id' });

    if (error) return NextResponse.json({ data: null, error: { message: error.message, code: 'DB_ERR' } }, { status: 500 });

    await supabase.from('users').update({ subscription_status: 'active' }).eq('id', user.id);

    return NextResponse.json({ data: { verified: true }, error: null });
  } catch (err: any) {
    return NextResponse.json({ data: null, error: { message: err.message, code: 'ERR' } }, { status: 500 });
  }
}
