import { format } from 'date-fns';
import { createServiceRoleClient } from '@/lib/supabase/server';
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
    const supabase = createServiceRoleClient();

    (async () => {
      try {
        if (event.event === 'subscription.activated') {
          const subscriptionEntity = event.payload.subscription.entity;
          const userId = subscriptionEntity.notes?.user_id;

          if (!userId) {
            return;
          }

          const planType =
            subscriptionEntity.notes?.plan_type === 'yearly'
              ? 'yearly'
              : 'monthly';
          const currentMonth = format(new Date(), 'yyyy-MM');

          const { data: subscriptionRecord } = await supabase
            .from('subscriptions')
            .upsert(
              {
                user_id: userId,
                razorpay_subscription_id: subscriptionEntity.id,
                plan_type: planType,
                status: 'active',
              },
              { onConflict: 'razorpay_subscription_id' }
            )
            .select()
            .single();

          await supabase
            .from('users')
            .update({ subscription_status: 'active' })
            .eq('id', userId);

          const { data: userRecord } = await supabase
            .from('users')
            .select('email, full_name, charity_contribution_pct, charity_id')
            .eq('id', userId)
            .single();

          if (subscriptionRecord && userRecord) {
            const total = planType === 'yearly' ? 999 : 100;
            const pct = Number(userRecord.charity_contribution_pct ?? 0);
            const charityAmount = total * (pct / 100);
            const prizePoolAmount = total - charityAmount;

            await supabase.from('prize_pool_ledger').insert({
              subscription_id: subscriptionRecord.id,
              amount: prizePoolAmount,
              type: 'contribution',
              period: currentMonth,
            });

            if (pct > 0) {
              await supabase.from('charity_allocations').insert({
                user_id: userId,
                charity_id: userRecord.charity_id,
                amount: charityAmount,
                period: currentMonth,
              });
            }

            await sendWelcomeEmail(
              userRecord.email,
              userRecord.full_name || 'Golfer'
            );
          }
        } else if (event.event === 'subscription.charged') {
          const subscriptionEntity = event.payload.subscription.entity;
          const userId = subscriptionEntity.notes?.user_id;

          await supabase
            .from('subscriptions')
            .update({
              current_period_end: new Date(
                subscriptionEntity.current_end * 1000
              ).toISOString(),
            })
            .eq('razorpay_subscription_id', subscriptionEntity.id);

          if (userId) {
            const { data: subscriptionRecord } = await supabase
              .from('subscriptions')
              .select('id, plan_type')
              .eq('razorpay_subscription_id', subscriptionEntity.id)
              .single();

            const { data: userRecord } = await supabase
              .from('users')
              .select('charity_contribution_pct, charity_id')
              .eq('id', userId)
              .single();

            if (subscriptionRecord && userRecord) {
              const currentMonth = format(new Date(), 'yyyy-MM');
              const total = subscriptionRecord.plan_type === 'yearly' ? 999 : 100;
              const pct = Number(userRecord.charity_contribution_pct ?? 0);
              const charityAmount = total * (pct / 100);
              const prizePoolAmount = total - charityAmount;

              await supabase.from('prize_pool_ledger').insert({
                subscription_id: subscriptionRecord.id,
                amount: prizePoolAmount,
                type: 'contribution',
                period: currentMonth,
              });

              if (pct > 0) {
                await supabase.from('charity_allocations').insert({
                  user_id: userId,
                  charity_id: userRecord.charity_id,
                  amount: charityAmount,
                  period: currentMonth,
                });
              }
            }
          }
        } else if (event.event === 'subscription.cancelled') {
          const subscriptionEntity = event.payload.subscription.entity;

          await supabase
            .from('subscriptions')
            .update({
              status: 'cancelled',
              cancelled_at: new Date().toISOString(),
            })
            .eq('razorpay_subscription_id', subscriptionEntity.id);

          if (subscriptionEntity.notes?.user_id) {
            await supabase
              .from('users')
              .update({ subscription_status: 'cancelled' })
              .eq('id', subscriptionEntity.notes.user_id);
          }
        } else if (event.event === 'subscription.halted') {
          const subscriptionEntity = event.payload.subscription.entity;

          await supabase
            .from('subscriptions')
            .update({ status: 'inactive' })
            .eq('razorpay_subscription_id', subscriptionEntity.id);

          if (subscriptionEntity.notes?.user_id) {
            await supabase
              .from('users')
              .update({ subscription_status: 'inactive' })
              .eq('id', subscriptionEntity.notes.user_id);
          }
        } else if (event.event === 'payment.failed') {
          const paymentEntity = event.payload.payment?.entity;
          const subscriptionId = paymentEntity?.subscription_id;

          if (subscriptionId) {
            await supabase
              .from('subscriptions')
              .update({ status: 'past_due' })
              .eq('razorpay_subscription_id', subscriptionId);
          }
        }
      } catch (error) {
        console.error('Webhook processing error', error);
      }
    })();

    return new Response('OK', { status: 200 });
  } catch {
    return new Response('Error', { status: 500 });
  }
}
