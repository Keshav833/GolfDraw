'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminWinnersPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const { data: winners, isLoading } = useQuery({
    queryKey: ['admin_winners'],
    queryFn: async () => {
      const { data } = await supabase
        .from('draw_results')
        .select('*, draws(month), users(full_name, email), winner_verifications(status, proof_url)')
        .order('prize_amount', { ascending: false });
      return data || [];
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string, action: 'approve'|'reject' }) => {
      const res = await fetch('/api/winners/verify', {
        method: 'POST', body: JSON.stringify({ draw_result_id: id, action })
      });
      if (!res.ok) throw new Error('Verification failed');
    },
    onSuccess: () => {
      toast.success('Winner status updated');
      queryClient.invalidateQueries({ queryKey: ['admin_winners'] });
      setExpandedId(null);
    }
  });

  if (isLoading) return <div className="p-8">Loading winners...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
       <h1 className="text-3xl font-extrabold font-serif mb-8">Winner Verification</h1>
       
       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left indent-0 text-xs font-medium text-gray-500 uppercase">Draw</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Winner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Match</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prize</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {winners?.map((w: any) => (
                <React.Fragment key={w.id}>
                  <tr 
                    className="hover:bg-gray-50 cursor-pointer" 
                    onClick={() => setExpandedId(expandedId === w.id ? null : w.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{w.draws?.month}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{w.users?.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">{w.match_category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700 font-bold">£{Number(w.prize_amount).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${w.payment_status === 'pending' ? 'bg-amber-100 text-amber-800' : w.payment_status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                         {w.payment_status}
                      </span>
                    </td>
                  </tr>
                  {expandedId === w.id && w.winner_verifications && w.winner_verifications.length > 0 && (
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="px-6 py-6 border-b border-gray-200">
                         <div className="flex flex-col md:flex-row gap-6 mx-auto w-full max-w-4xl">
                            <div className="flex-1 bg-gray-200 rounded-lg flex items-center justify-center min-h-[200px] overflow-hidden">
                               <img src={w.winner_verifications[0].proof_url} alt="Scorecard Proof" className="max-w-full h-auto object-contain" />
                               {/* Real app uses signed URL fetch, here we rely on the url string */}
                            </div>
                            <div className="w-full md:w-64 space-y-4 pt-2">
                               <h4 className="font-bold text-sm uppercase text-gray-500">Review Actions</h4>
                               <p className="text-xs text-gray-600 mb-4">Compare the uploaded scorecard against the user's logged score.</p>
                               <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => verifyMutation.mutate({ id: w.id, action: 'approve' })}>Approve Proof</Button>
                               <Button variant="destructive" className="w-full" onClick={() => verifyMutation.mutate({ id: w.id, action: 'reject' })}>Reject Proof</Button>
                            </div>
                         </div>
                      </td>
                    </tr>
                  )}
                  {expandedId === w.id && (!w.winner_verifications || w.winner_verifications.length === 0) && (
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 border-b border-gray-200">
                         Waiting for user to upload proof document.
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
         </table>
       </div>
    </div>
  );
}
