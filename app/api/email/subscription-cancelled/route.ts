import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { subscriptionCancelledEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/send';
import { verifyInternalSecret } from '@/lib/auth/verifyInternalSecret';

export async function POST(req: Request) {
  try {
    if (!verifyInternalSecret(req as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id, access_until } = await req.json();

    const db = createServiceRoleClient();
    const { data: user, error: userError } = await db
      .from('users')
      .select('email, full_name')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const firstName = user.full_name?.split(' ')[0] ?? 'there';

    const { subject, html } = subscriptionCancelledEmail({
      firstName,
      accessUntil: access_until,
    });

    const result = await sendEmail({
      to: user.email,
      subject,
      html,
    });

    return NextResponse.json({ success: result.success });
  } catch (err: any) {
    console.error('Subscription cancelled email route crashed:', err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
