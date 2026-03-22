import { NextResponse } from 'next/server';
import { createServiceSupabase, requireAdminUser } from '@/lib/draw/api';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const adminCheck = await requireAdminUser();
  if ('response' in adminCheck) {
    return adminCheck.response;
  }

  const supabase = createServiceSupabase();
  const { data: verification, error } = await supabase
    .from('winner_verifications')
    .select('id, proof_url')
    .eq('id', params.id)
    .single();

  if (error || !verification) {
    return NextResponse.json(
      {
        data: null,
        error: { message: 'Verification not found', code: 'NOT_FOUND' },
      },
      { status: 404 }
    );
  }

  const { data, error: signedUrlError } = await supabase.storage
    .from('winner-proofs')
    .createSignedUrl(verification.proof_url, 1800);

  if (signedUrlError || !data) {
    return NextResponse.json(
      {
        data: null,
        error: {
          message: signedUrlError?.message ?? 'Failed to create signed URL',
          code: 'STORAGE_ERROR',
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: {
      signed_url: data.signedUrl,
      expires_in: 1800,
    },
    error: null,
  });
}
