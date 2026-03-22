'use client';
import { useQuery } from '@tanstack/react-query';
import { createBrowserClient } from '@supabase/ssr';
import { StatusBadge } from '@/components/subscription/StatusBadge';

export default function AdminUsersPage() {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin_users'],
    queryFn: async () => {
      const { data } = await supabase.from('users').select('*, charities(name)');
      return data || [];
    }
  });

  if (isLoading) return <div className="p-8">Loading users...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
       <h1 className="text-3xl font-extrabold font-serif mb-8">User Management</h1>
       
       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users?.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={u.subscription_status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.charities?.name || 'None'} ({u.charity_contribution_pct}%)</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
         </table>
       </div>
    </div>
  );
}
