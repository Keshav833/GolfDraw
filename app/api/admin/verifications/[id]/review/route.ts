import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceSupabase, requireAdminUser } from '@/lib/draw/api';
import { sendVerificationRejectedEmail } from '@/lib/email/templates';
import { getAdminVerificationRecord } from '@/lib/verification/helpers';

const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('approve') }),
  z.object({
    action: z.literal('reject'),
    rejection_note: z.string().min(1).max(500),
  }),
  z.object({ action: z.literal('re_review') }),
]);

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdminUser();
  if ('response' in adminCheck) {
    return adminCheck.response;
  }

  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: parsed.error.issues[0]?.message ?? 'Invalid request',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 422 }
      );
    }

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

    if (
      (verificationRecord.verification.status === 'approved' ||
        verificationRecord.verification.status === 'rejected') &&
      parsed.data.action !== 're_review'
    ) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Verification has already been reviewed.',
            code: 'ALREADY_REVIEWED',
          },
        },
        { status: 400 }
      );
    }

    const supabase = createServiceSupabase();
    const { data: rpcData, error } = await supabase.rpc(
      'review_winner_verification',
      {
        p_verification_id: params.id,
        p_action: parsed.data.action,
        p_rejection_note:
          'rejection_note' in parsed.data ? parsed.data.rejection_note : null,
        p_reviewed_by: adminCheck.user.id,
      }
    );

    if (error) {
      return NextResponse.json(
        { data: null, error: { message: error.message, code: 'DB_ERR' } },
        { status: 500 }
      );
    }

    if (parsed.data.action === 'reject') {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      await sendVerificationRejectedEmail({
        to: verificationRecord.user.email,
        name:
          verificationRecord.user.full_name.split(' ')[0] ||
          verificationRecord.user.full_name,
        rejectionNote: parsed.data.rejection_note,
        drawsUrl: `${appUrl}/draws`,
      });
    }

    return NextResponse.json({
      data: {
        status:
          rpcData?.[0]?.verification_status ??
          (parsed.data.action === 're_review' ? 'pending' : parsed.data.action),
      },
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to review verification',
          code: 'ERR',
        },
      },
      { status: 500 }
    );
  }
}
