'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Score, ScoreApiResponse } from '@/lib/types/score';

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

export function ScoreInput({ onSuccess }: { onSuccess: (scores: Score[]) => void }) {
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
      className="space-y-3"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="number"
          min={1}
          max={45}
          step={1}
          placeholder="Enter score (1-45)"
          disabled={mutation.isPending}
          aria-invalid={valueError ? 'true' : 'false'}
          className={valueError ? 'border-red-500 focus-visible:ring-red-200' : ''}
          {...form.register('value', valueField)}
        />
        <Button type="submit" disabled={mutation.isPending} className="sm:min-w-[140px]">
          {mutation.isPending ? 'Saving...' : 'Submit score'}
        </Button>
      </div>
      {valueError ? <p className="text-sm text-red-600">{valueError}</p> : null}
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
