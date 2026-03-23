import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { paymentConfirmationEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/send';
import { verifyInternalSecret } from '@/lib/auth/verifyInternalSecret';

export async function POST(req: Request) {
  try {
    if (!verifyInternalSecret(req as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id, amount, next_billing_date } = await req.json();

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const db = createServiceRoleClient();
    const { data: user, error: userError } = await db
      .from('users')
      .select('*, subscriptions(*), charities(name)')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      console.error('Email Payment Confirmation: User not found', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const subscription = user.subscriptions?.[0];
    const charityName = user.charities?.name;
    const firstName = user.full_name?.split(' ')[0] ?? 'there';

    // Calculate charity amount if applicable
    const charityAmount =
      user.charity_contribution_pct > 0
        ? (amount * user.charity_contribution_pct) / 100
        : undefined;

    const { subject, html } = paymentConfirmationEmail({
      firstName,
      planType: subscription?.plan_type ?? 'monthly',
      amount,
      nextBillingDate: next_billing_date,
      charityName,
      charityAmount,
    });

    const result = await sendEmail({
      to: user.email,
      subject,
      html,
    });

    return NextResponse.json({ success: result.success });
  } catch (err: any) {
    console.error('Payment confirmation email route crashed:', err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
