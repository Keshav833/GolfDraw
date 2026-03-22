import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { z } from 'zod';
import { CONTRIBUTION_OPTIONS, type Charity } from '@/lib/types/charity';

type UserCharityGetResponse = {
  data: { charity: Charity | null; pct: number } | null;
  error: { message: string; code?: string } | null;
};

type UserCharityPatchResponse = {
  data: { charity_id: string | null; charity_contribution_pct: number } | null;
  error: { message: string; code?: string } | null;
};

const patchSchema = z.object({
  charity_id: z.string().uuid(),
  charity_contribution_pct: z
    .number()
    .int()
    .refine((value) => CONTRIBUTION_OPTIONS.includes(value as (typeof CONTRIBUTION_OPTIONS)[number]), {
      message: 'Must be 10, 15, or 30',
    })
    .optional(),
});

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

function jsonResponse<T extends UserCharityGetResponse | UserCharityPatchResponse>(
  body: T,
  status: number
) {
  return NextResponse.json(body, { status });
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
      .from('users')
      .select(
        'charity_id, charity_contribution_pct, charities(id, name, description, category, country, is_active, created_at)'
      )
      .eq('id', user.id)
      .single();

    if (error) {
      return jsonResponse(
        { data: null, error: { message: error.message, code: 'DB_ERR' } },
        500
      );
    }

    return jsonResponse(
      {
        data: {
          charity: firstCharity(data?.charities),
          pct: Number(data?.charity_contribution_pct ?? 0),
        },
        error: null,
      },
      200
    );
  } catch (error: any) {
    return jsonResponse(
      { data: null, error: { message: error.message ?? 'Server error', code: 'ERR' } },
      500
    );
  }
}

function firstCharity(value: Charity | Charity[] | null | undefined) {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function PATCH(req: Request) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonResponse({ data: null, error: { message: 'Unauthorized', code: '401' } }, 401);
    }

    const rawBody = await req.json();
    const parsedBody = patchSchema.safeParse(rawBody);

    if (!parsedBody.success) {
      return jsonResponse(
        {
          data: null,
          error: {
            message: parsedBody.error.issues.map((issue) => issue.message).join(', '),
            code: 'VALIDATION_ERR',
          },
        },
        422
      );
    }

    const updateValues = {
      charity_id: parsedBody.data.charity_id,
      charity_contribution_pct: parsedBody.data.charity_contribution_pct,
    };

    const { data, error } = await supabase
      .from('users')
      .update(updateValues)
      .eq('id', user.id)
      .select('charity_id, charity_contribution_pct')
      .single();

    if (error) {
      return jsonResponse(
        { data: null, error: { message: error.message, code: 'DB_ERR' } },
        500
      );
    }

    return jsonResponse(
      {
        data: {
          charity_id: data?.charity_id ?? null,
          charity_contribution_pct: Number(data?.charity_contribution_pct ?? 0),
        },
        error: null,
      },
      200
    );
  } catch (error: any) {
    return jsonResponse(
      { data: null, error: { message: error.message ?? 'Server error', code: 'ERR' } },
      500
    );
  }
}
