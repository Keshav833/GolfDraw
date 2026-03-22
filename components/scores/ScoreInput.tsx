'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/LoadingButton';
import type { Score, ScoreApiResponse } from '@/lib/types/score';

const raisedSm =
  '3px 3px 8px var(--dashboard-shadow-dark), -3px -3px 8px var(--dashboard-shadow-light)';
const insetShadow =
  'inset 3px 3px 7px var(--dashboard-shadow-dark), inset -3px -3px 7px var(--dashboard-shadow-light)';

const scoreInputSchema = z.object({
  value: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return undefined;
      }

      if (typeof value === 'number' && Number.isNaN(value)) {
        return undefined;
      }

      return value;
    },
    z
      .number({
        required_error: 'Must be a whole number between 1 and 45',
        invalid_type_error: 'Must be a whole number between 1 and 45',
      })
      .int('Must be a whole number between 1 and 45')
      .min(1, 'Score cannot be below 1')
      .max(45, 'Score cannot exceed 45')
  ),
});

type ScoreInputForm = z.infer<typeof scoreInputSchema>;

export function ScoreInput({
  onSuccess,
}: {
  onSuccess: (scores: Score[]) => void;
}) {
  const valueField = formValueParser();
  const form = useForm<ScoreInputForm>({
    resolver: zodResolver(scoreInputSchema),
    defaultValues: {
      value: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (value: number) => {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });

      const json: ScoreApiResponse = await res.json();

      if (!res.ok || !json.data) {
        throw new Error(json.error?.message ?? 'Failed');
      }

      return json;
    },
    onSuccess: (data) => {
      onSuccess(data.data!.scores);
      toast.success('Score submitted');
      form.reset();
    },
    onError: (err: Error) => {
      toast.error(err.message);
      form.setError('value', { message: err.message });
    },
  });

  const valueError = form.formState.errors.value?.message;

  return (
    <form
      onSubmit={form.handleSubmit((values) => mutation.mutate(values.value))}
      className="space-y-4"
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          type="number"
          min={1}
          max={45}
          step={1}
          placeholder="Enter score (1-45)"
          disabled={mutation.isPending}
          aria-invalid={valueError ? 'true' : 'false'}
          className="h-12 rounded-[14px] border-0 bg-[var(--dashboard-bg)] px-4 text-[#2a3a2a] placeholder:text-[#9aaa9a]"
          style={{
            boxShadow: valueError ? insetShadow : insetShadow,
            border: valueError ? '1px solid #d97777' : undefined,
          }}
          {...form.register('value', valueField)}
        />
        <LoadingButton
          type="submit"
          variant="green"
          loading={mutation.isPending}
          className="h-12 w-full min-w-0 sm:w-auto sm:min-w-[170px]"
          style={{
            borderRadius: 14,
            padding: '0 20px',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Submit score
        </LoadingButton>
      </div>
      {valueError ? (
        <p className="text-sm text-[#b04747]">{valueError}</p>
      ) : null}
    </form>
  );
}

function formValueParser() {
  return {
    setValueAs: (value: unknown) => {
      if (value === '' || value === null || value === undefined) {
        return undefined;
      }

      if (typeof value === 'number') {
        return Number.isNaN(value) ? undefined : value;
      }

      if (typeof value === 'string') {
        const trimmed = value.trim();

        if (!trimmed) {
          return undefined;
        }

        const parsed = Number(trimmed);
        return Number.isNaN(parsed) ? trimmed : parsed;
      }

      return value;
    },
  } as const;
}
