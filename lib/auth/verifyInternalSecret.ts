import { NextRequest } from 'next/server';

export function verifyInternalSecret(req: NextRequest): boolean {
  const secret = req.headers.get('x-internal-secret');
  const expected = process.env.INTERNAL_SECRET;
  if (!expected) {
    console.warn('INTERNAL_SECRET not set');
    return false;
  }
  return secret === expected;
}
