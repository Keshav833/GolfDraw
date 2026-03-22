'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Trophy,
  Calendar,
  CheckCircle,
  Play,
  Trash2,
  Edit,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import DrawConfigForm from '@/components/admin/DrawConfigForm';

export default function DrawsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isConfiguring, setIsConfiguring] = useState(false);

  const {
    data: draws,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-draws'],
    queryFn: async () => {
      const res = await fetch('/api/admin/draws');
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error?.message || 'Failed to fetch draws');
      return json.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (drawId: string) => {
      const res = await fetch(`/api/admin/draws/${drawId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error?.message || 'Failed to delete draw');
      return json.data;
    },
    onSuccess: () => {
      toast.success('Draw deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-draws'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleDelete = (draw: any) => {
    if (
      confirm(
        `Are you sure you want to delete the draw for ${format(new Date(draw.month), 'MMMM yyyy')}?`
      )
    ) {
      deleteMutation.mutate(draw.id);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-[var(--text)] mb-2">
            Draw Management
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Configure, simulate, and publish monthly prize draws.
          </p>
        </div>
        <button
          onClick={() => setIsConfiguring(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--bg)] shadow-[var(--raised-sm)] hover:shadow-[var(--inset-sm)] text-[var(--green-700)] font-bold transition-all"
        >
          <Plus size={20} />
          Configure New Draw
        </button>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-[var(--sd)]/20 animate-pulse rounded-[32px] shadow-[var(--raised-sm)]"
            />
          ))}
        </div>
      ) : error ? (
        <div className="p-10 text-center text-red-500 font-medium">
          Error: {(error as Error).message}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {draws?.map((draw: any) => (
            <div
              key={draw.id}
              className="bg-[var(--bg)] rounded-[32px] p-8 flex flex-col shadow-[var(--raised-md)] group transition-all hover:translate-y-[-4px]"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-serif text-[var(--text)] mb-1">
                    {format(new Date(draw.month), 'MMMM')}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest">
                    {format(new Date(draw.month), 'yyyy')}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    draw.status === 'published'
                      ? 'bg-emerald-100 text-emerald-700'
                      : draw.status === 'simulated'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {draw.status}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)] font-medium">
                    Prize Pool
                  </span>
                  <span className="font-bold text-[var(--green-700)]">
                    £{Number(draw.prize_pool_total).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)] font-medium">
                    Winners
                  </span>
                  <span className="font-bold">{draw.winner_count}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)] font-medium">
                    Mode
                  </span>
                  <span className="font-bold capitalize">{draw.mode}</span>
                </div>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-3">
                <Link
                  href={`/admin/draws/${draw.id}`}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--bg)] shadow-[var(--raised-sm)] hover:shadow-[var(--inset-sm)] text-xs font-bold text-[var(--text)] transition-all"
                >
                  {draw.status === 'draft' ? (
                    <Edit size={14} />
                  ) : (
                    <Trophy size={14} />
                  )}
                  {draw.status === 'draft' ? 'Configure' : 'View Results'}
                </Link>
                {draw.status !== 'published' && (
                  <button
                    onClick={() => handleDelete(draw)}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--bg)] shadow-[var(--raised-sm)] hover:shadow-[var(--inset-sm)] text-xs font-bold text-red-500 transition-all"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Configure Modal */}
      {isConfiguring && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-[var(--sd)]/40 backdrop-blur-sm"
            onClick={() => setIsConfiguring(false)}
          />
          <div className="relative w-full max-w-2xl bg-[var(--bg)] rounded-[32px] shadow-[var(--raised-md)] overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-serif">Configure Draw</h2>
                <button
                  onClick={() => setIsConfiguring(false)}
                  className="p-2 rounded-xl bg-[var(--bg)] shadow-[var(--raised-sm)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>
              <DrawConfigForm
                onSave={(newDraw) => {
                  queryClient.invalidateQueries({ queryKey: ['admin-draws'] });
                  setIsConfiguring(false);
                  toast.success('Draw configured successfully');
                  router.push(`/admin/draws/${newDraw.draw_id}`);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
