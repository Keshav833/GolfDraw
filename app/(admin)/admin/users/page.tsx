'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import UserTable from '@/components/admin/UserTable';
import UserDetailPanel from '@/components/admin/UserDetailPanel';
import { toast } from 'sonner';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-users', search, status, page],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/users?search=${search}&status=${status}&page=${page}`
      );
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error?.message || 'Failed to fetch users');
      return json.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error?.message || 'Failed to cancel subscription');
      return json.data;
    },
    onSuccess: () => {
      toast.success('Subscription cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUser(null);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleCancelSubscription = (user: any) => {
    if (
      confirm(
        `Are you sure you want to cancel the subscription for ${user.email}? This will take effect immediately in Razorpay.`
      )
    ) {
      cancelMutation.mutate(user.id);
    }
  };

  return (
    <div className="space-y-10 pb-20 relative">
      <header>
        <h1 className="text-3xl font-serif text-[var(--text)] mb-2">
          User Management
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Manage platform members and their subscriptions.
        </p>
      </header>

      {isLoading ? (
        <div className="h-[600px] w-full bg-[var(--sd)]/20 animate-pulse rounded-3xl shadow-[var(--raised-sm)]" />
      ) : error ? (
        <div className="p-10 text-center text-red-500">
          Error: {(error as Error).message}
        </div>
      ) : (
        <UserTable
          users={usersData?.users || []}
          total={usersData?.total || 0}
          page={page}
          onPageChange={setPage}
          onSearch={(val) => {
            setSearch(val);
            setPage(1);
          }}
          onStatusFilter={(val) => {
            setStatus(val);
            setPage(1);
          }}
          onViewDetails={setSelectedUser}
          onCancelSubscription={handleCancelSubscription}
        />
      )}

      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[40]"
          onClick={() => setSelectedUser(null)}
        />
      )}

      <UserDetailPanel
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onCancelSubscription={handleCancelSubscription}
      />
    </div>
  );
}
