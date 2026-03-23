'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { loadRazorpayScript } from './loadScript';
import './razorpay.d';

interface CheckoutOptions {
  planType: 'monthly' | 'yearly';
  userName?: string;
  userEmail?: string;
  /** Called after payment is verified server-side */
  onSuccess: () => void;
  /** Called when the modal is dismissed without payment */
  onDismiss?: () => void;
}

interface UseRazorpayCheckoutReturn {
  checkout: (opts: CheckoutOptions) => Promise<void>;
  isPending: boolean;
}

export function useRazorpayCheckout(): UseRazorpayCheckoutReturn {
  const [isPending, setIsPending] = useState(false);

  const checkout = useCallback(async (opts: CheckoutOptions) => {
    const { planType, userName, userEmail, onSuccess, onDismiss } = opts;
    setIsPending(true);

    try {
      // 1. Load the Razorpay checkout script
      await loadRazorpayScript();

      // 2. Create a Razorpay subscription on the server
      const createRes = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_type: planType }),
      });
      const createJson = await createRes.json();

      if (!createRes.ok || createJson.error) {
        if (createJson.error?.code === 'ALREADY_SUBSCRIBED') {
          toast.info('You already have an active subscription.');
          onSuccess();
          return;
        }
        throw new Error(
          createJson.error?.message ||
            'Failed to create subscription. Please try again.'
        );
      }

      const { subscription_id, razorpay_key } = createJson.data;

      // 3. Open the Razorpay checkout widget
      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: razorpay_key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
          subscription_id,
          name: 'GolfDraw',
          description:
            planType === 'yearly'
              ? 'GolfDraw Yearly Membership'
              : 'GolfDraw Monthly Membership',
          theme: { color: '#1f5b39' },
          prefill: {
            name: userName,
            email: userEmail,
          },
          handler: async (response) => {
            // 4. Verify the payment server-side
            try {
              const verifyRes = await fetch('/api/subscriptions/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_subscription_id: response.razorpay_subscription_id,
                  razorpay_signature: response.razorpay_signature,
                  plan_type: planType,
                }),
              });
              const verifyJson = await verifyRes.json();

              if (!verifyRes.ok || verifyJson.error) {
                throw new Error(
                  verifyJson.error?.message || 'Payment verification failed.'
                );
              }

              toast.success('Subscription activated!');
              onSuccess();
              resolve();
            } catch (verifyErr: any) {
              toast.error(verifyErr.message);
              reject(verifyErr);
            }
          },
          modal: {
            ondismiss: () => {
              onDismiss?.();
              reject(new Error('Payment cancelled'));
            },
          },
        });

        rzp.open();
      });
    } catch (err: any) {
      if (err.message !== 'Payment cancelled') {
        toast.error(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsPending(false);
    }
  }, []);

  return { checkout, isPending };
}
