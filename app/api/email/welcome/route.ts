import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { welcomeEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/send';
import { verifyInternalSecret } from '@/lib/auth/verifyInternalSecret';

export async function POST(req: Request) {
  try {
    // 1. Verify internal secret
    if (!verifyInternalSecret(req as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // 2. Fetch user data with charity and subscription info
    const db = createServiceRoleClient();
    const { data: user, error: userError } = await db
      .from('users')
      .select('*, subscriptions(*), charities(name)')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      console.error('Email Welcome: User not found', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const subscription = user.subscriptions?.[0];
    const charityName = user.charities?.name;
    const firstName = user.full_name?.split(' ')[0] ?? 'there';

    // 3. Build email
    const { subject, html } = welcomeEmail({
      firstName,
      planType: subscription?.plan_type ?? 'monthly',
      charityName,
      contributionPct: user.charity_contribution_pct ?? 0,
    });

    // 4. Send email
    const result = await sendEmail({
      to: user.email,
      subject,
      html,
    });

    return NextResponse.json({ success: result.success });
  } catch (err: any) {
    console.error('Welcome email route crashed:', err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
