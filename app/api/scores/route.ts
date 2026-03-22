import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { ScoreApiResponse } from '@/lib/types/score';

const scoreSchema = z.object({
  value: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return undefined;
      }

      if (typeof value === 'string') {
        const trimmed = value.trim();

        if (!trimmed) {
          return undefined;
        }

        const parsed = Number(trimmed);
        return Number.isNaN(parsed) ? value : parsed;
      }

      if (typeof value === 'number' && Number.isNaN(value)) {
        return undefined;
      }

      return value;
    },
    z
      .number({
        required_error: 'Score must be a whole number',
        invalid_type_error: 'Score must be a whole number',
      })
      .int('Score must be a whole number')
      .min(1, 'Score must be at least 1')
      .max(45, 'Score cannot exceed 45')
  ),
});

function jsonResponse(body: ScoreApiResponse, status: number) {
  return NextResponse.json(body, { status });
}

function createSupabaseServerClient() {
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

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonResponse({ data: null, error: { message: 'Unauthorized', code: '401' } }, 401);
    }

    const { data, error } = await supabase
      .from('scores')
      .select('id, user_id, value, submitted_at')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })
      .limit(5);

    if (error) {
      return jsonResponse({ data: null, error: { message: error.message, code: 'DB_ERR' } }, 500);
    }

    return jsonResponse({ data: { scores: data ?? [] }, error: null }, 200);
  } catch (err: any) {
    return jsonResponse(
      { data: null, error: { message: err.message || 'Server error', code: 'ERR' } },
      500
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonResponse({ data: null, error: { message: 'Unauthorized', code: '401' } }, 401);
    }

    const rawBody = await req.json();
    const parsed = scoreSchema.safeParse(rawBody);

    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join(', ');
      return jsonResponse({ data: null, error: { message, code: 'VALIDATION_ERR' } }, 422);
    }

    const { error: insertError } = await supabase.from('scores').insert({
      user_id: user.id,
      value: parsed.data.value,
    });

    if (insertError) {
      return jsonResponse(
        { data: null, error: { message: insertError.message, code: 'DB_ERR' } },
        500
      );
    }

    const { data, error } = await supabase
      .from('scores')
      .select('id, user_id, value, submitted_at')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })
      .limit(5);

    if (error) {
      return jsonResponse({ data: null, error: { message: error.message, code: 'DB_ERR' } }, 500);
    }

    return jsonResponse({ data: { scores: data ?? [] }, error: null }, 201);
  } catch (err: any) {
    return jsonResponse(
      { data: null, error: { message: err.message || 'Server error', code: 'ERR' } },
      500
    );
  }
}
