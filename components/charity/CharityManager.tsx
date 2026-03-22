'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { CharityCard } from '@/components/charity/CharityCard';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  CATEGORIES,
  CONTRIBUTION_OPTIONS,
  type Charity,
  type ContributionPct,
} from '@/lib/types/charity';

type CharityListResponse = {
  data: { charities: Charity[] } | null;
  error: { message: string; code?: string } | null;
};

type UserCharityResponse = {
  data:
    | { charity: Charity | null; pct: number }
    | { charity_id: string | null; charity_contribution_pct: number }
    | null;
  error: { message: string; code?: string } | null;
};

const FILTER_OPTIONS = ['All', ...CATEGORIES] as const;

export function CharityManager({
  initialCharities,
  initialUserCharity,
  planType,
}: {
  initialCharities: Charity[];
  initialUserCharity: { charity: Charity | null; pct: number };
  planType: 'monthly' | 'yearly';
}) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(initialUserCharity.charity?.id ?? null);
  const [selectedPct, setSelectedPct] = useState<ContributionPct>(
    normalisePct(initialUserCharity.pct) ?? 10
  );
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] =
    useState<(typeof FILTER_OPTIONS)[number]>('All');
  const [savedCharity, setSavedCharity] = useState<Charity | null>(initialUserCharity.charity);
  const [savedPct, setSavedPct] = useState<number>(initialUserCharity.pct);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['charities', debouncedSearch, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      }

      if (categoryFilter !== 'All') {
        params.set('category', categoryFilter);
      }

      const url = params.toString() ? `/api/charities?${params.toString()}` : '/api/charities';
      const res = await fetch(url);
      const json: CharityListResponse = await res.json();

      if (!res.ok || !json.data) {
        throw new Error(json.error?.message ?? 'Failed to load charities');
      }

      return json.data.charities;
    },
    initialData: initialCharities,
    staleTime: 1000 * 60 * 60,
  });

  const selectedCharity = useMemo(
    () => data.find((charity) => charity.id === selectedId) ?? savedCharity,
    [data, savedCharity, selectedId]
  );

  const monthlyRate = planType === 'yearly' ? 86 / 12 : 9;

  const mutation = useMutation({
    mutationFn: async (payload: { charity_id: string; charity_contribution_pct: ContributionPct }) => {
      const res = await fetch('/api/users/charity', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json: UserCharityResponse = await res.json();

      if (!res.ok || !json.data) {
        throw new Error(json.error?.message ?? 'Failed to update');
      }

      return json.data;
    },
    onSuccess: (response) => {
      setSavedCharity(selectedCharity ?? null);
      setSavedPct(
        'pct' in response ? response.pct : Number(response.charity_contribution_pct ?? selectedPct)
      );
      toast.success('Charity updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user-charity'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mb-4')}
          >
            Back to dashboard
          </Link>
          <h1 className="text-3xl font-extrabold font-serif text-gray-950">Choose your charity</h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            Pick the organisation that should receive your reserved charity contribution. Changes
            apply from your next billing date.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        {savedCharity ? (
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-green-700">
              Current selection
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{savedCharity.name}</h2>
                <p className="mt-1 text-sm text-gray-600">{savedCharity.category}</p>
              </div>
              <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-900">
                You donate {savedPct}% (£{((monthlyRate * savedPct) / 100).toFixed(2)}/mo) to{' '}
                {savedCharity.name}
              </div>
            </div>
            <p className="text-sm text-gray-500">Change below.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-green-700">
              No charity selected
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              You haven&apos;t selected a charity yet
            </h2>
            <p className="text-sm text-gray-600">Choose one below to start giving back.</p>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search charities..."
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCategoryFilter(option)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  categoryFilter === option
                    ? 'bg-green-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-56 animate-pulse rounded-xl border border-gray-100 bg-white"
              />
            ))}
          </div>
        ) : data.length ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data.map((charity) => (
              <CharityCard
                key={charity.id}
                charity={charity}
                selected={selectedId === charity.id}
                onSelect={(selected) => setSelectedId(selected.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center text-gray-500">
            No charities found for that search
          </div>
        )}
      </section>

      {selectedId ? (
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">How much would you like to donate?</h2>
          <p className="mt-2 text-sm text-gray-600">
            Minimum 10%. Change takes effect from your next billing cycle.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {CONTRIBUTION_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSelectedPct(option)}
                className={`rounded-2xl border px-5 py-4 text-left transition ${
                  selectedPct === option
                    ? 'border-green-700 bg-green-700 text-white'
                    : 'border-gray-200 bg-white text-gray-800 hover:border-green-400'
                }`}
              >
                <div className="text-xl font-bold">{option}%</div>
                <div
                  className={`mt-1 text-sm ${
                    selectedPct === option ? 'text-green-100' : 'text-gray-500'
                  }`}
                >
                  £{((monthlyRate * option) / 100).toFixed(2)}/mo
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">Changes apply from your next billing date.</p>
        <Button
          onClick={() =>
            selectedId
              ? mutation.mutate({
                  charity_id: selectedId,
                  charity_contribution_pct: selectedPct,
                })
              : null
          }
          disabled={!selectedId || mutation.isPending}
          className="min-w-[220px] bg-green-800 text-white hover:bg-green-700"
        >
          {mutation.isPending ? 'Saving...' : 'Save charity selection'}
        </Button>
      </section>
    </div>
  );
}

function normalisePct(value: number): ContributionPct | null {
  return CONTRIBUTION_OPTIONS.includes(value as ContributionPct) ? (value as ContributionPct) : null;
}
