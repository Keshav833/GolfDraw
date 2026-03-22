'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { CharityCard } from '@/components/charity/CharityCard';
import { PageShell } from '@/components/dashboard/PageShell';
import { LoadingButton } from '@/components/ui/LoadingButton';
import SectionLoader from '@/components/ui/SectionLoader';
import { Input } from '@/components/ui/input';
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
const raised =
  '5px 5px 12px var(--dashboard-shadow-dark), -5px -5px 12px var(--dashboard-shadow-light)';
const raisedSm =
  '3px 3px 8px var(--dashboard-shadow-dark), -3px -3px 8px var(--dashboard-shadow-light)';
const raisedXs =
  '2px 2px 5px var(--dashboard-shadow-dark), -2px -2px 5px var(--dashboard-shadow-light)';
const insetShadow =
  'inset 3px 3px 7px var(--dashboard-shadow-dark), inset -3px -3px 7px var(--dashboard-shadow-light)';

export function CharityManager({
  initialCharities,
  initialUserCharity,
  planType,
  userName,
  membershipLabel,
  statusLabel,
}: {
  initialCharities: Charity[];
  initialUserCharity: { charity: Charity | null; pct: number };
  planType: 'monthly' | 'yearly';
  userName: string;
  membershipLabel: string;
  statusLabel: string;
}) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(
    initialUserCharity.charity?.id ?? null
  );
  const [selectedPct, setSelectedPct] = useState<ContributionPct>(
    normalisePct(initialUserCharity.pct) ?? 10
  );
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] =
    useState<(typeof FILTER_OPTIONS)[number]>('All');
  const [savedCharity, setSavedCharity] = useState<Charity | null>(
    initialUserCharity.charity
  );
  const [savedPct, setSavedPct] = useState<number>(initialUserCharity.pct);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      300
    );
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

      const url = params.toString()
        ? `/api/charities?${params.toString()}`
        : '/api/charities';
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
    mutationFn: async (payload: {
      charity_id: string;
      charity_contribution_pct: ContributionPct;
    }) => {
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
        'pct' in response
          ? response.pct
          : Number(response.charity_contribution_pct ?? selectedPct)
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
    <PageShell
      userName={userName}
      membershipLabel={membershipLabel}
      statusLabel={statusLabel}
      title="Choose your charity"
      subtitle="Pick the organisation that should receive your reserved charity contribution. Changes apply from your next billing date."
    >
      <section
        className="rounded-[20px] bg-[var(--dashboard-bg)] p-5 sm:p-6"
        style={{ boxShadow: raisedSm }}
      >
        {savedCharity ? (
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9aaa9a]">
              Current selection
            </p>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-[#2a3a2a]">
                  {savedCharity.name}
                </h2>
                <p className="mt-1 text-sm text-[#6a7a6a]">
                  {savedCharity.category}
                </p>
              </div>
              <div
                className="rounded-[16px] bg-[var(--dashboard-bg)] px-4 py-3 text-sm text-[#1a5e38]"
                style={{ boxShadow: insetShadow }}
              >
                You donate {savedPct}% (£
                {((monthlyRate * savedPct) / 100).toFixed(2)}/mo) to{' '}
                {savedCharity.name}
              </div>
            </div>
            <p className="text-sm text-[#6a7a6a]">Change below.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9aaa9a]">
              No charity selected
            </p>
            <h2 className="text-2xl font-semibold text-[#2a3a2a]">
              You haven&apos;t selected a charity yet
            </h2>
            <p className="text-sm text-[#6a7a6a]">
              Choose one below to start giving back.
            </p>
          </div>
        )}
      </section>

      <section
        className="mt-5 rounded-[20px] bg-[var(--dashboard-bg)] p-5 sm:p-6"
        style={{ boxShadow: raisedSm }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aaa9a]" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search charities..."
              className="h-12 rounded-[14px] border-0 bg-[var(--dashboard-bg)] pl-11 text-[#2a3a2a] placeholder:text-[#9aaa9a]"
              style={{ boxShadow: insetShadow }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCategoryFilter(option)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  categoryFilter === option ? 'text-white' : 'text-[#6a7a6a]'
                }`}
                style={{
                  background:
                    categoryFilter === option
                      ? 'var(--dashboard-green-700)'
                      : 'var(--dashboard-bg)',
                  boxShadow: categoryFilter === option ? raisedXs : raisedXs,
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5">
        {isLoading ? (
          <SectionLoader label="Loading charities..." />
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
          <div
            className="rounded-[18px] bg-[var(--dashboard-bg)] px-6 py-12 text-center text-[#6a7a6a]"
            style={{ boxShadow: insetShadow }}
          >
            No charities found for that search
          </div>
        )}
      </section>

      {selectedId ? (
        <section
          className="mt-5 rounded-[20px] bg-[var(--dashboard-bg)] p-5 sm:p-6"
          style={{ boxShadow: raisedSm }}
        >
          <h2 className="text-xl font-semibold text-[#2a3a2a]">
            How much would you like to donate?
          </h2>
          <p className="mt-2 text-sm text-[#6a7a6a]">
            Minimum 10%. Change takes effect from your next billing cycle.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {CONTRIBUTION_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSelectedPct(option)}
                className={`rounded-[18px] px-5 py-4 text-left transition ${
                  selectedPct === option ? 'text-white' : 'text-[#2a3a2a]'
                }`}
                style={{
                  background:
                    selectedPct === option
                      ? 'var(--dashboard-green-700)'
                      : 'var(--dashboard-bg)',
                  boxShadow:
                    selectedPct === option
                      ? '3px 3px 7px rgba(10,50,20,0.3), -2px -2px 5px rgba(60,140,80,0.2)'
                      : raisedXs,
                }}
              >
                <div className="text-xl font-bold">{option}%</div>
                <div
                  className={`mt-1 text-sm ${selectedPct === option ? 'text-[#dff4e7]' : 'text-[#6a7a6a]'}`}
                >
                  £{((monthlyRate * option) / 100).toFixed(2)}/mo
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section
        className="mt-5 flex flex-col gap-3 rounded-[20px] bg-[var(--dashboard-bg)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        style={{ boxShadow: raisedSm }}
      >
        <p className="text-sm text-[#6a7a6a]">
          Changes apply from your next billing date.
        </p>
        <LoadingButton
          variant="green"
          loading={mutation.isPending}
          fullWidth
          disabled={!selectedId}
          onClick={() =>
            selectedId
              ? mutation.mutate({
                  charity_id: selectedId,
                  charity_contribution_pct: selectedPct,
                })
              : undefined
          }
          style={{
            minWidth: 220,
            borderRadius: 14,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Save charity selection
        </LoadingButton>
      </section>
    </PageShell>
  );
}

function normalisePct(value: number): ContributionPct | null {
  return CONTRIBUTION_OPTIONS.includes(value as ContributionPct)
    ? (value as ContributionPct)
    : null;
}
