import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function drawError(status: number, message: string, code: string) {
  return NextResponse.json(
    {
      data: null,
      error: { message, code },
    },
    { status }
  );
}

export function createSessionSupabase() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );
}

export function createServiceSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
}

export async function requireAdminUser() {
  const supabase = createSessionSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { response: drawError(401, 'Unauthorized', 'UNAUTHORIZED') };
  }

  if (user.app_metadata?.role !== 'admin') {
    return { response: drawError(403, 'Forbidden', 'FORBIDDEN') };
  }

  return { user };
}

export function isValidMonth(month: string) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}

export function currentUtcMonth() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}
