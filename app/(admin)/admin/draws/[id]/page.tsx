'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Trophy,
  Settings,
  CheckCircle,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';

import DrawConfigForm from '@/components/admin/DrawConfigForm';
import DrawSimulationPreview from '@/components/admin/DrawSimulationPreview';
import DrawPublishConfirm from '@/components/admin/DrawPublishConfirm';
import SectionLoader from '@/components/ui/SectionLoader';
import { LoadingButton } from '@/components/ui/LoadingButton';

export default function DrawDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'config' | 'results'>('config');
  const [showPublishModal, setShowPublishModal] = useState(false);

  const {
    data: draw,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-draw', id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/draws/${id}`);
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error?.message || 'Failed to fetch draw');
      return json.data;
    },
  });

  const simulateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/draws/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draw_id: id }),
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error?.message || 'Failed to simulate draw');
      return json.data;
    },
    onSuccess: (data) => {
      toast.success('Simulation completed');
      queryClient.setQueryData(['admin-draw', id], (prev: any) => ({
        ...prev,
        ...data,
        status: 'simulated',
      }));
      setActiveTab('results');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  if (isLoading)
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <SectionLoader label="Loading draw..." />
      </div>
    );
  if (error)
    return (
      <div className="p-10 text-center text-red-500">
        Error: {(error as Error).message}
      </div>
    );
  if (!draw) return <div className="p-10 text-center">Draw not found</div>;

  const isPublished = draw.status === 'published';
  const isSimulated = draw.status === 'simulated';

  return (
    <div className="space-y-8 pb-20">
      <Link
        href="/admin/draws"
        className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
      >
        <ChevronLeft size={16} />
        Back to Draws
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-serif text-[var(--text)] mb-2">
            {format(new Date(draw.month), 'MMMM yyyy')} Draw
          </h1>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isPublished
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {draw.status}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              Prize Pool: £{Number(draw.prize_pool_total).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          {!isPublished && (
            <LoadingButton
              variant="primary"
              loading={simulateMutation.isPending}
              onClick={() => simulateMutation.mutate()}
              style={{
                padding: '12px 20px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                color: 'var(--green-700)',
                display: 'inline-flex',
                gap: 8,
                alignItems: 'center',
              }}
            >
              {isSimulated ? 'Re-run Simulation' : 'Run Simulation'}
            </LoadingButton>
          )}

          {isSimulated && !isPublished && (
            <button
              onClick={() => setShowPublishModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white shadow-[var(--raised-sm)] hover:bg-emerald-700 transition-all text-sm font-bold"
            >
              <CheckCircle size={18} />
              Publish Results
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-[var(--sd)] px-2">
        <button
          onClick={() => setActiveTab('config')}
          className={`pb-4 px-2 text-sm font-bold transition-all relative ${
            activeTab === 'config'
              ? 'text-[var(--green-700)]'
              : 'text-[var(--text-muted)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings size={16} />
            Configuration
          </div>
          {activeTab === 'config' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--green-700)] rounded-t-full shadow-[0_-2px_6px_var(--green-700)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`pb-4 px-2 text-sm font-bold transition-all relative ${
            activeTab === 'results'
              ? 'text-[var(--green-700)]'
              : 'text-[var(--text-muted)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Trophy size={16} />
            {isPublished ? 'Published Results' : 'Simulation Results'}
          </div>
          {activeTab === 'results' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--green-700)] rounded-t-full shadow-[0_-2px_6px_var(--green-700)]" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {activeTab === 'config' ? (
          <div className="bg-[var(--bg)] rounded-[32px] p-10 shadow-[var(--raised-md)]">
            <DrawConfigForm
              draw={draw}
              onSave={(updated) => {
                queryClient.setQueryData(['admin-draw', id], updated);
                toast.success('Configuration updated');
              }}
            />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {draw.status === 'draft' ? (
              <div className="p-20 text-center space-y-4">
                <Trophy
                  size={48}
                  className="mx-auto text-[var(--sd)] opacity-50"
                />
                <p className="text-[var(--text-muted)] font-medium">
                  Run a simulation first to see potential results.
                </p>
                <LoadingButton
                  variant="primary"
                  loading={simulateMutation.isPending}
                  onClick={() => simulateMutation.mutate()}
                  style={{
                    padding: '12px 32px',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 14,
                    color: 'var(--green-700)',
                  }}
                >
                  Start Simulation
                </LoadingButton>
              </div>
            ) : (
              <DrawSimulationPreview
                result={isPublished ? draw.config : draw}
              />
            )}
          </div>
        )}
      </div>

      {showPublishModal && (
        <DrawPublishConfirm
          drawId={id as string}
          winnerCount={(draw as any).match_count || 0}
          rolloverAmount={(draw as any).rollover_amount || 0}
          onClose={() => setShowPublishModal(false)}
        />
      )}
    </div>
  );
}
