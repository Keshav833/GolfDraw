import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getAuthenticatedUser,
  getOwnedPendingDrawResult,
  getVerificationForDrawResult,
} from '@/lib/verification/helpers';

const schema = z.string().uuid();

export async function GET(req: Request) {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { data: null, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const drawResultId = new URL(req.url).searchParams.get('draw_result_id');
    const parsedId = schema.safeParse(drawResultId);

    if (!parsedId.success) {
      return NextResponse.json(
        { data: null, error: { message: 'Invalid draw_result_id', code: 'VALIDATION_ERROR' } },
        { status: 422 }
      );
    }

    const ownership = await getOwnedPendingDrawResult(parsedId.data, user.id);
    if (!ownership.data) {
      return NextResponse.json(
        { data: null, error: { message: 'Draw result not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    if (
      ownership.data.payment_status !== 'pending' &&
      ownership.data.payment_status !== 'rejected'
    ) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'This prize has already been processed — no upload needed.',
            code: 'ALREADY_PROCESSED',
          },
        },
        { status: 400 }
      );
    }

    const existingVerification = await getVerificationForDrawResult(parsedId.data);
    if (existingVerification?.status === 'approved') {
      return NextResponse.json(
        {
          data: null,
          error: { message: 'This prize has already been verified.', code: 'ALREADY_VERIFIED' },
        },
        { status: 400 }
      );
    }

    const filePath = `${user.id}/${parsedId.data}/${Date.now()}.jpg`;
    const { data, error } = await supabase.storage
      .from('winner-proofs')
      .createSignedUploadUrl(filePath, { upsert: true });

    if (error || !data) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: error?.message ?? 'Failed to create upload URL',
            code: 'STORAGE_ERROR',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: {
        upload_url: data.signedUrl,
        file_path: filePath,
        expires_in: 900,
        expires_at: new Date(Date.now() + 900000).toISOString(),
      },
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Failed to create upload URL',
          code: 'ERR',
        },
      },
      { status: 500 }
    );
  }
}
