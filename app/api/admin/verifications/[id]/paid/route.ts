import { NextResponse } from 'next/server';
import { createServiceSupabase, requireAdminUser } from '@/lib/draw/api';

import { getAdminVerificationRecord } from '@/lib/verification/helpers';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const adminCheck = await requireAdminUser();
  if ('response' in adminCheck) {
    return adminCheck.response;
  }

  try {
    const verificationRecord = await getAdminVerificationRecord(params.id);
    if (!verificationRecord) {
      return NextResponse.json(
        {
          data: null,
          error: { message: 'Verification not found', code: 'NOT_FOUND' },
        },
        { status: 404 }
      );
    }
    if (!verificationRecord.verification) {
      return NextResponse.json(
        {
          data: null,
          error: { message: 'Verification not found', code: 'NOT_FOUND' },
        },
        { status: 404 }
      );
    }

    if (verificationRecord.verification.status !== 'approved') {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Verification must be approved before marking paid.',
            code: 'INVALID_STATUS',
          },
        },
        { status: 400 }
      );
    }

    const supabase = createServiceSupabase();
    const { data, error } = await supabase.rpc(
      'mark_winner_verification_paid',
      {
        p_verification_id: params.id,
      }
    );

    if (error) {
      return NextResponse.json(
        { data: null, error: { message: error.message, code: 'DB_ERR' } },
        { status: 500 }
      );
    }

    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/payment-processed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.INTERNAL_SECRET ?? '',
      },
      body: JSON.stringify({
        user_id: verificationRecord.user_id,
        prize_amount: verificationRecord.prize_amount,
        draw_month: verificationRecord.draw.month,
      }),
    }).catch((err) => console.error('Payment processed email failed:', err));

    return NextResponse.json({
      data: { payment_status: data?.[0]?.draw_result_status ?? 'paid' },
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Failed to mark paid',
          code: 'ERR',
        },
      },
      { status: 500 }
    );
  }
}
