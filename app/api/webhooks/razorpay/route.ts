import { format } from 'date-fns';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { verifyWebhookSignature } from '@/lib/razorpay/verify';

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

          if (!userId) return;

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
            .select('charity_contribution_pct, charity_id')
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

            // ⛳ WELCOME EMAIL
            fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/welcome`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-internal-secret': process.env.INTERNAL_SECRET ?? '',
              },
              body: JSON.stringify({ user_id: userId }),
            }).catch((err) => console.error('Welcome email failed:', err));
          }
        } else if (event.event === 'subscription.charged') {
          const subscriptionEntity = event.payload.subscription.entity;
          const paymentEntity = event.payload.payment.entity;
          const userId = subscriptionEntity.notes?.user_id;

          const nextBillingDate = format(
            new Date(subscriptionEntity.current_end * 1000),
            'dd MMMM yyyy'
          );

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
              const amountPaid = paymentEntity.amount / 100; // convert from paise
              const pct = Number(userRecord.charity_contribution_pct ?? 0);
              const charityAmount = amountPaid * (pct / 100);
              const prizePoolAmount = amountPaid - charityAmount;

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

              // ✅ PAYMENT CONFIRMATION EMAIL
              fetch(
                `${process.env.NEXT_PUBLIC_APP_URL}/api/email/payment-confirmation`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-internal-secret': process.env.INTERNAL_SECRET ?? '',
                  },
                  body: JSON.stringify({
                    user_id: userId,
                    amount: amountPaid,
                    next_billing_date: nextBillingDate,
                  }),
                }
              ).catch((err) => console.error('Payment email failed:', err));
            }
          }
        } else if (event.event === 'subscription.cancelled') {
          const subscriptionEntity = event.payload.subscription.entity;
          const userId = subscriptionEntity.notes?.user_id;

          const accessUntil = format(
            new Date(subscriptionEntity.current_end * 1000),
            'dd MMMM yyyy'
          );

          await supabase
            .from('subscriptions')
            .update({
              status: 'cancelled',
              cancelled_at: new Date().toISOString(),
            })
            .eq('razorpay_subscription_id', subscriptionEntity.id);

          if (userId) {
            await supabase
              .from('users')
              .update({ subscription_status: 'cancelled' })
              .eq('id', userId);

            // ❌ SUBSCRIPTION CANCELLED EMAIL
            fetch(
              `${process.env.NEXT_PUBLIC_APP_URL}/api/email/subscription-cancelled`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-internal-secret': process.env.INTERNAL_SECRET ?? '',
                },
                body: JSON.stringify({
                  user_id: userId,
                  access_until: accessUntil,
                }),
              }
            ).catch((err) => console.error('Cancel email failed:', err));
          }
        } else if (event.event === 'subscription.halted') {
          const subscriptionEntity = event.payload.subscription.entity;
          const userId = subscriptionEntity.notes?.user_id;

          await supabase
            .from('subscriptions')
            .update({ status: 'inactive' })
            .eq('razorpay_subscription_id', subscriptionEntity.id);

          if (userId) {
            await supabase
              .from('users')
              .update({ subscription_status: 'inactive' })
              .eq('id', userId);

            // ⚠️ PAYMENT FAILED EMAIL (on halted)
            fetch(
              `${process.env.NEXT_PUBLIC_APP_URL}/api/email/payment-failed`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-internal-secret': process.env.INTERNAL_SECRET ?? '',
                },
                body: JSON.stringify({ user_id: userId }),
              }
            ).catch((err) => console.error('Failed email failed:', err));
          }
        } else if (event.event === 'payment.failed') {
          const paymentEntity = event.payload.payment?.entity;
          const subscriptionId = paymentEntity?.subscription_id;

          if (subscriptionId) {
            const { data: sub } = await supabase
              .from('subscriptions')
              .select('user_id')
              .eq('razorpay_subscription_id', subscriptionId)
              .single();

            await supabase
              .from('subscriptions')
              .update({ status: 'past_due' })
              .eq('razorpay_subscription_id', subscriptionId);

            if (sub?.user_id) {
              // ⚠️ PAYMENT FAILED EMAIL
              fetch(
                `${process.env.NEXT_PUBLIC_APP_URL}/api/email/payment-failed`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-internal-secret': process.env.INTERNAL_SECRET ?? '',
                  },
                  body: JSON.stringify({ user_id: sub.user_id }),
                }
              ).catch((err) => console.error('Failed email failed:', err));
            }
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
