'use client';

import { useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ProofViewer } from '@/components/admin/ProofViewer';
import SectionLoader from '@/components/ui/SectionLoader';
import { LoadingButton } from '@/components/ui/LoadingButton';
import type { DrawResultWithWinner } from '@/lib/types/verification';

const raisedSm =
  '3px 3px 8px var(--dashboard-shadow-dark), -3px -3px 8px var(--dashboard-shadow-light)';
const raisedXs =
  '2px 2px 5px var(--dashboard-shadow-dark), -2px -2px 5px var(--dashboard-shadow-light)';
const FILTERS = ['pending', 'approved', 'rejected', 'all'] as const;

export function VerificationQueue({
  initialStatus = 'pending',
}: {
  initialStatus?: 'pending' | 'approved' | 'rejected' | 'all';
}) {
  const [status, setStatus] = useState<(typeof FILTERS)[number]>(initialStatus);
  const [page, setPage] = useState(1);
  const [activeViewer, setActiveViewer] = useState<DrawResultWithWinner | null>(
    null
  );
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-verifications', status, page],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/verifications?status=${status}&page=${page}`
      );
      const json = await res.json();
      if (!res.ok || !json.data) {
        throw new Error(
          json.error?.message ?? 'Failed to load verification queue'
        );
      }
      return json.data as {
        items: DrawResultWithWinner[];
        total: number;
        page: number;
      };
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      verificationId,
      action,
      rejectionNote,
    }: {
      verificationId: string;
      action: 'approve' | 'reject' | 're_review';
      rejectionNote?: string;
    }) => {
      const res = await fetch(
        `/api/admin/verifications/${verificationId}/review`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            action === 'reject'
              ? { action, rejection_note: rejectionNote }
              : { action }
          ),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message ?? 'Review failed');
      }
      return json.data;
    },
    onSuccess: () => {
      toast.success('Verification updated');
      void queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      setActiveViewer(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const paidMutation = useMutation({
    mutationFn: async (verificationId: string) => {
      const res = await fetch(
        `/api/admin/verifications/${verificationId}/paid`,
        {
          method: 'POST',
        }
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message ?? 'Failed to mark paid');
      }
      return json.data;
    },
    onSuccess: () => {
      toast.success('Winner marked as paid');
      void queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const pendingCount = useMemo(() => {
    if (status === 'pending') {
      return data?.total ?? 0;
    }
    return undefined;
  }, [data?.total, status]);

  const approveLoading =
    reviewMutation.isPending &&
    reviewMutation.variables?.action === 'approve';
  const rejectLoading =
    reviewMutation.isPending &&
    reviewMutation.variables?.action === 'reject';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#2a3a2a]">
            Winner verifications
          </h1>
          <p className="mt-1 text-sm text-[#6a7a6a]">
            Review uploaded scorecards and move verified winners to payment.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => {
                setStatus(filter);
                setPage(1);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                status === filter ? 'text-white' : 'text-[#2a3a2a]'
              }`}
              style={{
                background:
                  status === filter
                    ? 'var(--dashboard-green-700)'
                    : 'var(--dashboard-bg)',
                boxShadow: raisedXs,
              }}
            >
              {filter[0].toUpperCase() + filter.slice(1)}
              {filter === 'pending' && pendingCount !== undefined
                ? ` (${pendingCount})`
                : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <SectionLoader label="Loading verifications..." />
        ) : data?.items.length ? (
          data.items.map((item) => (
            <div
              key={item.verification?.id}
              className="rounded-[20px] bg-[var(--dashboard-bg)] p-5"
              style={{ boxShadow: raisedSm }}
            >
              <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr] lg:items-center">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--dashboard-bg)] text-sm font-semibold text-[#1a5e38]"
                    style={{ boxShadow: raisedXs }}
                  >
                    {item.user.full_name
                      .split(' ')
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-[#2a3a2a]">
                      {item.user.full_name}
                    </p>
                    <p className="text-sm text-[#6a7a6a]">{item.user.email}</p>
                  </div>
                </div>

                <div>
                  <div
                    className="inline-flex rounded-full px-3 py-1 text-xs font-semibold text-white"
                    style={{
                      background:
                        item.match_category === '5-match'
                          ? '#c8960e'
                          : item.match_category === '4-match'
                            ? '#5b47a8'
                            : '#1a7f63',
                    }}
                  >
                    {item.match_category}
                  </div>
                  <p className="mt-3 text-sm text-[#2a3a2a]">
                    {item.draw.month}
                  </p>
                  <p className="text-xs text-[#6a7a6a]">
                    Draw #{item.draw.draw_number}
                  </p>
                  <p className="mt-2 text-xs text-[#6a7a6a]">
                    Uploaded{' '}
                    {item.verification
                      ? formatDistanceToNow(
                          new Date(item.verification.created_at),
                          {
                            addSuffix: true,
                          }
                        )
                      : 'just now'}
                  </p>
                </div>

                <div className="flex flex-col gap-3 lg:items-end">
                  <div>
                    <p className="text-right text-2xl font-semibold text-[#2a3a2a]">
                      £{item.prize_amount.toFixed(2)}
                    </p>
                    <p className="text-right text-sm capitalize text-[#6a7a6a]">
                      {item.payment_status.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {item.verification ? (
                      <button
                        type="button"
                        onClick={() => setActiveViewer(item)}
                        className="rounded-[14px] px-4 py-2 text-sm text-[#2a3a2a]"
                        style={{
                          background: 'var(--dashboard-bg)',
                          boxShadow: raisedXs,
                        }}
                      >
                        View proof
                      </button>
                    ) : null}
                    {item.verification?.status === 'approved' ? (
                      <LoadingButton
                        variant="primary"
                        loading={
                          paidMutation.isPending &&
                          paidMutation.variables === item.verification!.id
                        }
                        onClick={() =>
                          paidMutation.mutate(item.verification!.id)
                        }
                        style={{
                          borderRadius: 14,
                          fontSize: 14,
                          padding: '8px 16px',
                          color: '#fff',
                          background: '#2563eb',
                          boxShadow: raisedXs,
                        }}
                      >
                        Mark as paid
                      </LoadingButton>
                    ) : null}
                    {item.verification?.status === 'rejected' ? (
                      <button
                        type="button"
                        onClick={() =>
                          reviewMutation.mutate({
                            verificationId: item.verification!.id,
                            action: 're_review',
                          })
                        }
                        className="rounded-[14px] px-4 py-2 text-sm text-[#2a3a2a]"
                        style={{
                          background: 'var(--dashboard-bg)',
                          boxShadow: raisedXs,
                        }}
                      >
                        Re-review
                      </button>
                    ) : null}
                  </div>
                  {item.verification?.status === 'rejected' &&
                  item.verification.rejection_note ? (
                    <p className="max-w-sm text-right text-xs text-[#6a7a6a]">
                      {item.verification.rejection_note}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            className="rounded-[20px] bg-[var(--dashboard-bg)] px-6 py-12 text-center text-[#6a7a6a]"
            style={{ boxShadow: raisedSm }}
          >
            No verifications found for this filter.
          </div>
        )}
      </div>

      {data && data.total > 20 ? (
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-[14px] px-4 py-2 text-sm text-[#2a3a2a] disabled:opacity-50"
            style={{ background: 'var(--dashboard-bg)', boxShadow: raisedXs }}
          >
            Previous
          </button>
          <span className="text-sm text-[#6a7a6a]">Page {page}</span>
          <button
            type="button"
            disabled={page * 20 >= data.total}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-[14px] px-4 py-2 text-sm text-[#2a3a2a] disabled:opacity-50"
            style={{ background: 'var(--dashboard-bg)', boxShadow: raisedXs }}
          >
            Next
          </button>
        </div>
      ) : null}

      {activeViewer?.verification ? (
        <ProofViewer
          verificationId={activeViewer.verification.id}
          winnerName={activeViewer.user.full_name}
          matchCategory={activeViewer.match_category}
          prizeAmount={activeViewer.prize_amount}
          drawMonth={activeViewer.draw.month}
          drawNumber={activeViewer.draw.draw_number}
          approveLoading={approveLoading}
          rejectLoading={rejectLoading}
          onApprove={() =>
            reviewMutation.mutate({
              verificationId: activeViewer.verification!.id,
              action: 'approve',
            })
          }
          onReject={(note) =>
            reviewMutation.mutate({
              verificationId: activeViewer.verification!.id,
              action: 'reject',
              rejectionNote: note,
            })
          }
          onClose={() => setActiveViewer(null)}
        />
      ) : null}
    </div>
  );
}
