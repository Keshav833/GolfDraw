'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/subscription/StatusBadge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AccountPage() {
  const { data: res, isLoading, refetch } = useQuery({
    queryKey: ['me'],
    queryFn: () => fetch('/api/users/me').then((response) => response.json()),
  });

  const handleCancel = async () => {
    if (
      !confirm(
        'Are you sure you want to cancel your subscription? You will lose entry to future draws.'
      )
    ) {
      return;
    }

    const response = await fetch('/api/subscriptions/cancel', { method: 'DELETE' });

    if (response.ok) {
      toast.success('Subscription cancelled successfully.');
      refetch();
      return;
    }

    toast.error('Failed to cancel subscription.');
  };

  if (isLoading) {
    return <div className="p-8">Loading account...</div>;
  }

  if (!res?.data) {
    return <div className="p-8">Failed to load account data</div>;
  }

  const { user, subscription, charity } = res.data;

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6 lg:p-8">
      <h1 className="mb-8 text-3xl font-extrabold font-serif">Account Settings</h1>

      <div className="flex flex-col gap-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="mb-1 text-lg font-bold">Profile Details</h2>
          <p className="font-medium text-gray-900">{user.full_name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <h2 className="text-lg font-bold">Subscription Plan</h2>
          <div className="flex items-center gap-3">
            <span className="capitalize font-medium text-gray-900">
              {subscription?.plan_type || 'None selected'}
            </span>
            <StatusBadge status={subscription?.status || 'inactive'} />
          </div>
          {subscription?.current_period_end && subscription.status === 'active' ? (
            <p className="text-sm text-gray-500">
              Auto-renews on {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          ) : null}
          {subscription?.status === 'cancelled' ? (
            <p className="text-sm font-medium text-red-600">Subscription cancelled.</p>
          ) : null}
        </div>

        {subscription?.status === 'active' ? (
          <Button variant="destructive" onClick={handleCancel}>
            Cancel Subscription
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h2 className="text-lg font-bold">Charity &amp; giving</h2>
          <p className="text-sm text-gray-600">
            Current charity: <span className="font-medium text-gray-900">{charity?.name ?? 'None selected'}</span>
          </p>
          <p className="text-sm text-gray-600">
            Current percentage:{' '}
            <span className="font-medium text-gray-900">
              {Number(user.charity_contribution_pct ?? 0)}%
            </span>
          </p>
        </div>

        <Link href="/charity" className={cn(buttonVariants({ variant: 'outline' }))}>
          Update
        </Link>
      </div>
    </div>
  );
}
