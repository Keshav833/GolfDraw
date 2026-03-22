import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getAuthenticatedUser,
  getFileFolderAndName,
  getOwnedPendingDrawResult,
  getVerificationForDrawResult,
} from '@/lib/verification/helpers';

const schema = z.object({
  draw_result_id: z.string().uuid(),
  file_path: z.string().min(1).max(500),
});

export async function POST(req: Request) {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { data: null, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

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

    const ownership = await getOwnedPendingDrawResult(parsed.data.draw_result_id, user.id);
    if (!ownership.data) {
      return NextResponse.json(
        { data: null, error: { message: 'Draw result not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    const { folder, fileName } = getFileFolderAndName(parsed.data.file_path);
    const { data: files, error: listError } = await supabase.storage
      .from('winner-proofs')
      .list(folder, { search: fileName });

    if (listError) {
      return NextResponse.json(
        { data: null, error: { message: listError.message, code: 'STORAGE_ERROR' } },
        { status: 500 }
      );
    }

    const fileExists = (files ?? []).some((file) => file.name === fileName);
    if (!fileExists) {
      return NextResponse.json(
        {
          data: null,
          error: { message: 'Uploaded file not found in storage.', code: 'FILE_NOT_FOUND' },
        },
        { status: 400 }
      );
    }

    const existingVerification = await getVerificationForDrawResult(parsed.data.draw_result_id);

    if (existingVerification?.status === 'approved') {
      return NextResponse.json(
        {
          data: null,
          error: { message: 'This prize has already been verified.', code: 'ALREADY_VERIFIED' },
        },
        { status: 400 }
      );
    }

    if (existingVerification?.status === 'pending' || existingVerification?.status === 'rejected') {
      const { data, error } = await supabase
        .from('winner_verifications')
        .update({
          proof_url: parsed.data.file_path,
          reviewed_by: null,
          reviewed_at: null,
          rejection_note: null,
          status: 'pending',
        })
        .eq('id', existingVerification.id)
        .select('id, status')
        .single();

      if (error || !data) {
        return NextResponse.json(
          {
            data: null,
            error: {
              message: error?.message ?? 'Failed to update verification',
              code: 'DB_ERR',
            },
          },
          { status: 500 }
        );
      }

      await supabase
        .from('draw_results')
        .update({ payment_status: 'pending' })
        .eq('id', parsed.data.draw_result_id);

      return NextResponse.json(
        { data: { verification_id: data.id, status: data.status }, error: null },
        { status: 201 }
      );
    }

    const { data, error } = await supabase
      .from('winner_verifications')
      .insert({
        draw_result_id: parsed.data.draw_result_id,
        proof_url: parsed.data.file_path,
        status: 'pending',
      })
      .select('id, status')
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: error?.message ?? 'Failed to create verification',
            code: 'DB_ERR',
          },
        },
        { status: 500 }
      );
    }

    await supabase
      .from('draw_results')
      .update({ payment_status: 'pending' })
      .eq('id', parsed.data.draw_result_id);

    return NextResponse.json(
      { data: { verification_id: data.id, status: data.status }, error: null },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Failed to confirm upload',
          code: 'ERR',
        },
      },
      { status: 500 }
    );
  }
}
