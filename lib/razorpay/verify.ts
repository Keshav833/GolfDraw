import crypto from 'crypto';

export function verifyWebhookSignature(
  body: string,
  signature: string | null
): boolean {
  if (!signature) return false;
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  if (!secret) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return signature === expected;
}

export function verifySubscriptionSignature(
  paymentId: string,
  subscriptionId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  if (!secret) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(paymentId + '|' + subscriptionId)
    .digest('hex');

  return signature === expected;
}
