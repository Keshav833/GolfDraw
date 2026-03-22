'use client';
import { useQuery } from '@tanstack/react-query';
import { StatusBadge } from '@/components/subscription/StatusBadge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AccountPage() {
  const { data: res, isLoading, refetch } = useQuery({
    queryKey: ['me'],
    queryFn: () => fetch('/api/users/me').then(r => r.json())
  });

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose entry to future draws.')) return;
    
    const resp = await fetch('/api/subscriptions/cancel', { method: 'DELETE' });
    if (resp.ok) {
      toast.success('Subscription cancelled successfully.');
      refetch();
    } else {
      toast.error('Failed to cancel subscription.');
    }
  };

  if (isLoading) return <div className="p-8">Loading account...</div>;
  if (!res?.data) return <div className="p-8">Failed to load account data</div>;

  const { user, subscription } = res.data;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
       <h1 className="text-3xl font-extrabold font-serif mb-8">Account Settings</h1>
       
       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-lg font-bold mb-1">Profile Details</h2>
            <p className="text-gray-900 font-medium">{user.full_name}</p>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
       </div>

       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <h2 className="text-lg font-bold">Subscription Plan</h2>
            <div className="flex items-center gap-3">
              <span className="capitalize font-medium text-gray-900">{subscription?.plan_type || 'None selected'}</span>
              <StatusBadge status={subscription?.status || 'inactive'} />
            </div>
            {subscription?.current_period_end && subscription.status === 'active' && (
              <p className="text-sm text-gray-500">Auto-renews on {new Date(subscription.current_period_end).toLocaleDateString()}</p>
            )}
            {subscription?.status === 'cancelled' && (
              <p className="text-sm text-red-600 font-medium">Subscription cancelled.</p>
            )}
          </div>
          
          {subscription?.status === 'active' && (
            <Button variant="destructive" onClick={handleCancel}>Cancel Subscription</Button>
          )}
       </div>
    </div>
  );
}
