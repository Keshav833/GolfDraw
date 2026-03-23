import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { paymentFailedEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/send';
import { verifyInternalSecret } from '@/lib/auth/verifyInternalSecret';

export async function POST(req: Request) {
  try {
    if (!verifyInternalSecret(req as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id } = await req.json();

    const db = createServiceRoleClient();
    const { data: user, error: userError } = await db
      .from('users')
      .select('*, subscriptions(*)')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const subscription = user.subscriptions?.[0];
    const firstName = user.full_name?.split(' ')[0] ?? 'there';

    const { subject, html } = paymentFailedEmail({
      firstName,
      planType: subscription?.plan_type ?? 'monthly',
    });

    const result = await sendEmail({
      to: user.email,
      subject,
      html,
    });

    return NextResponse.json({ success: result.success });
  } catch (err: any) {
    console.error('Payment failed email route crashed:', err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
