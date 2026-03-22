'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function AdminDrawsPage() {
  const [month, setMonth] = useState('2025-04');
  const [pool, setPool] = useState('5000');
  const [mode, setMode] = useState<'random'|'algorithmic'>('algorithmic');
  
  const queryClient = useQueryClient();
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const { data: draws, isLoading } = useQuery({
    queryKey: ['admin_draws'],
    queryFn: async () => {
      const { data } = await supabase.from('draws').select('*').order('created_at', { ascending: false });
      return data || [];
    }
  });

  const configureMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/draws/configure', {
        method: 'POST', body: JSON.stringify({ month, mode, prize_pool_total: Number(pool) })
      });
      if (!res.ok) throw new Error('Failed to configure');
    },
    onSuccess: () => {
      toast.success('Draw configured');
      queryClient.invalidateQueries({ queryKey: ['admin_draws'] });
    }
  });

  const simulateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/draws/simulate', { method: 'POST', body: JSON.stringify({ draw_id: id }) });
      if (!res.ok) throw new Error('Simulation failed');
      return res.json();
    },
    onSuccess: (data) => {
      toast.success('Simulation complete');
      console.log('Simulation Results:', data);
      queryClient.invalidateQueries({ queryKey: ['admin_draws'] });
    }
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/draws/publish', { method: 'POST', body: JSON.stringify({ draw_id: id }) });
      if (!res.ok) throw new Error('Publish failed');
    },
    onSuccess: () => {
      toast.success('Draw published successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin_draws'] });
    }
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
       <h1 className="text-3xl font-extrabold font-serif mb-8">Draw Orchestrator</h1>
       
       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Month</label>
            <Input value={month} onChange={e => setMonth(e.target.value)} placeholder="YYYY-MM" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prize Pool (£)</label>
            <Input type="number" value={pool} onChange={e => setPool(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Engine Mode</label>
            <select value={mode} onChange={e => setMode(e.target.value as any)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
               <option value="algorithmic">Algorithmic (Skill Prox)</option>
               <option value="random">Pure Random</option>
            </select>
          </div>
          <Button onClick={() => configureMutation.mutate()} disabled={configureMutation.isPending} className="bg-green-800 hover:bg-green-700 text-white">
             Configure New Draw
          </Button>
       </div>

       <div className="space-y-4">
         {isLoading ? <p>Loading draws...</p> : draws?.map((d: any) => (
           <div key={d.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{d.month} <span className="text-sm font-normal text-gray-500 ml-2">({d.mode})</span></h3>
                <p className="text-sm text-gray-600">Status: <span className="font-bold uppercase text-xs">{d.status}</span> | Pool: £{d.prize_pool_total}</p>
                {d.draw_number && <p className="text-xs mt-1 text-gray-400">Winning No: {d.draw_number} | Seed: {d.seed.substring(0,8)}...</p>}
              </div>
              <div className="space-x-3">
                {d.status === 'draft' && (
                  <Button variant="outline" onClick={() => simulateMutation.mutate(d.id)} disabled={simulateMutation.isPending}>
                    Simulate
                  </Button>
                )}
                {d.status === 'simulated' && (
                  <Button onClick={() => publishMutation.mutate(d.id)} disabled={publishMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Publish & Finalize
                  </Button>
                )}
                {d.status === 'published' && (
                  <span className="text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded">Live</span>
                )}
              </div>
           </div>
         ))}
       </div>
    </div>
  );
}
