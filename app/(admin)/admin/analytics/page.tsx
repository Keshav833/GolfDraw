'use client';
import { useQuery } from '@tanstack/react-query';
import { createBrowserClient } from '@supabase/ssr';

export default function AdminAnalyticsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin_analytics'],
    queryFn: async () => {
      const [{ count: subsCount }, { count: usersCount }, { data: ledger }] =
        await Promise.all([
          supabase
            .from('subscriptions')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'active'),
          supabase.from('users').select('id', { count: 'exact', head: true }),
          supabase.from('prize_pool_ledger').select('amount, type'),
        ]);

      const totalContributions = (ledger || [])
        .filter((l: any) => l.type === 'contribution')
        .reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
      const totalPayouts = (ledger || [])
        .filter((l: any) => l.type === 'payout')
        .reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

      return { subsCount, usersCount, totalContributions, totalPayouts };
    },
  });

  if (isLoading) return <div className="p-8">Loading analytics...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <h1 className="text-3xl font-extrabold font-serif mb-8">
        Platform Analytics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest border-b pb-2 mb-4">
            Total Users
          </h3>
          <p className="text-4xl font-extrabold">{stats?.usersCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest border-b pb-2 mb-4">
            Active Subs
          </h3>
          <p className="text-4xl font-extrabold text-green-700">
            {stats?.subsCount || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest border-b pb-2 mb-4">
            Total Handled
          </h3>
          <p className="text-4xl font-extrabold">
            £
            {stats?.totalContributions.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            }) || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest border-b pb-2 mb-4">
            Payouts YTD
          </h3>
          <p className="text-4xl font-extrabold text-blue-700">
            £{stats?.totalPayouts.toLocaleString() || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
