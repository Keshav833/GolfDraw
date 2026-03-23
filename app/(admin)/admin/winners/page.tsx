'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Clock, Filter, Mail, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function WinnersPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('pending');

  const { data: winners, isLoading } = useQuery({
    queryKey: ['admin-winners', statusFilter],
    queryFn: async () => {
      const res = await fetch(`/api/admin/winners?status=${statusFilter}`);
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error?.message || 'Failed to fetch winners');
      return json.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/winners/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error?.message || 'Failed to update status');
      return json.data;
    },
    onSuccess: () => {
      toast.success('Payment status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-winners'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleVerifyPayment = (id: string) => {
    if (
      confirm(
        'Mark this prize as PAID? This will record the time and your admin ID as the verifier.'
      )
    ) {
      updateStatusMutation.mutate({ id, status: 'paid' });
    }
  };

  const statusTabs = [
    { id: 'pending', label: 'Pending Payout', icon: <Clock size={16} /> },
    { id: 'paid', label: 'Paid', icon: <CheckCircle size={16} /> },
    { id: 'all', label: 'All History', icon: <Filter size={16} /> },
  ];

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h1 className="text-3xl font-serif text-[var(--text)] mb-2">
          Winner Verification
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Track matches and authorize prize payouts.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4">
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              statusFilter === tab.id
                ? 'bg-[var(--bg)] shadow-[var(--inset-sm)] text-[var(--green-700)]'
                : 'bg-[var(--bg)] shadow-[var(--raised-sm)] text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-[var(--bg)] rounded-[32px] p-1 shadow-[var(--raised-md)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--sd)]">
                <th className="px-6 py-4 font-semibold">Winner</th>
                <th className="px-6 py-4 font-semibold">Draw</th>
                <th className="px-6 py-4 font-semibold text-center">
                  Category
                </th>
                <th className="px-6 py-4 font-semibold text-center">Prize</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right">
                  Verification
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--sd)]/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td
                      colSpan={6}
                      className="px-6 py-6 h-16 bg-[var(--sd)]/5"
                    />
                  </tr>
                ))
              ) : winners?.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-20 text-center text-sm text-[var(--text-muted)] italic"
                  >
                    No matching winner records found.
                  </td>
                </tr>
              ) : (
                winners?.map((result: any) => (
                  <tr
                    key={result.id}
                    className="group hover:bg-[var(--sd)]/10 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[var(--bg)] shadow-[var(--raised-sm)] text-[var(--green-700)] font-bold text-xs">
                          {result.user?.full_name
                            ?.substring(0, 2)
                            .toUpperCase() ||
                            result.user?.email.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">
                            {result.user?.full_name || 'No Name'}
                          </span>
                          <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                            <Mail size={10} />
                            {result.user?.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold uppercase tracking-tight">
                        {format(new Date(result.draw?.month), 'MMM yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          result.match_category === '5-match'
                            ? 'bg-amber-100 text-amber-700'
                            : result.match_category === '4-match'
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {result.match_category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-[var(--green-700)]">
                      £{Number(result.prize_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          result.payment_status === 'paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {result.payment_status === 'paid' ? (
                          <CheckCircle size={12} />
                        ) : (
                          <Clock size={12} />
                        )}
                        {result.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {result.payment_status !== 'paid' ? (
                        <button
                          onClick={() => handleVerifyPayment(result.id)}
                          className="px-4 py-2 rounded-lg bg-[var(--bg)] shadow-[var(--raised-sm)] hover:shadow-[var(--inset-sm)] text-[10px] font-bold text-[var(--green-700)] uppercase transition-all flex items-center gap-2 ml-auto"
                        >
                          <CreditCard size={14} />
                          Authorize Pay
                        </button>
                      ) : (
                        <div className="text-[10px] text-[var(--text-muted)] text-right">
                          <p className="font-bold text-emerald-600">VERIFIED</p>
                          <p>
                            {format(
                              new Date(result.verified_at),
                              'dd/MM/yyyy HH:mm'
                            )}
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
