import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { verifyWebhookSignature } from '@/lib/razorpay/verify';
import { sendWelcomeEmail } from '@/lib/email/templates';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!verifyWebhookSignature(body, signature)) {
       return new Response('Invalid signature', { status: 400 });
    }

    const event = JSON.parse(body);
    
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { cookies: { getAll() { return [] }, setAll() {} } });

    // Process entirely async to unblock razorpay
    (async () => {
      try {
        if (event.event === 'subscription.activated') {
          const sub = event.payload.subscription.entity;
          const user_id = sub.notes?.user_id;
          
          if (!user_id) return;

          // UPSERT subscription
          const { data: subRecord } = await supabase.from('subscriptions').upsert({
            user_id,
            razorpay_subscription_id: sub.id,
            plan_type: sub.notes?.plan_type || 'monthly',
            status: 'active'
          }, { onConflict: 'razorpay_subscription_id' }).select().single();

          await supabase.from('users').update({ subscription_status: 'active' }).eq('id', user_id);

          // Get user details for charity & email
          const { data: userRecord } = await supabase.from('users').select('*').eq('id', user_id).single();

          if (userRecord && subRecord) {
            // Log ledger contribution (simulate amount ~£9 for monthly)
            const amt = sub.notes?.plan_type === 'yearly' ? 86 : 9;
            const charityPct = Number(userRecord.charity_contribution_pct) || 0;
            const prizePoolAmount = amt * (1 - charityPct / 100);
            await supabase.from('prize_pool_ledger').insert({
              subscription_id: subRecord.id,
              amount: prizePoolAmount,
              type: 'contribution',
              period: new Date().toISOString().substring(0, 7)
            });

            await sendWelcomeEmail(userRecord.email, userRecord.full_name || 'Golfer');
          }

        } else if (event.event === 'subscription.charged') {
          const sub = event.payload.subscription.entity;
          const user_id = sub.notes?.user_id;

          if (user_id) {
            await supabase.from('subscriptions').update({
              current_period_end: new Date(sub.current_end * 1000).toISOString()
            }).eq('razorpay_subscription_id', sub.id);
          }
        } else if (event.event === 'subscription.cancelled') {
           const sub = event.payload.subscription.entity;
           await supabase.from('subscriptions').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('razorpay_subscription_id', sub.id);
           if (sub.notes?.user_id) {
             await supabase.from('users').update({ subscription_status: 'cancelled' }).eq('id', sub.notes.user_id);
           }
        } else if (event.event === 'subscription.halted') {
           const sub = event.payload.subscription.entity;
           await supabase.from('subscriptions').update({ status: 'inactive' }).eq('razorpay_subscription_id', sub.id);
           if (sub.notes?.user_id) {
             await supabase.from('users').update({ subscription_status: 'inactive' }).eq('id', sub.notes.user_id);
           }
        } else if (event.event === 'payment.failed') {
           // We could mark it past due, but let razorpay retry logic handle it or just update sync
        }
      } catch (err) {
        console.error("Webhook processing error", err);
      }
    })();

    return new Response('OK', { status: 200 });
  } catch (err: any) {
    return new Response('Error', { status: 500 });
  }
}
