import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verificationRejectedEmail } from '@/lib/email/templates';

const schema = z.object({
  to: z.string().email(),
  name: z.string().min(1),
  rejectionNote: z.string().min(1),
  drawsUrl: z.string().url(),
});

export async function POST(req: Request) {
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

  await verificationRejectedEmail(parsed.data as any);
  return NextResponse.json({ data: { sent: true }, error: null });
}
