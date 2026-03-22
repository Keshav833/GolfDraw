'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { CharityCard } from '@/components/charity/CharityCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function CharityPage() {
  const contributionOptions = [10, 15, 30];
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null);
  const [newPct, setNewPct] = useState(15);
  
  const queryClient = useQueryClient();

  const { data: res, isLoading: loadingMe } = useQuery({
    queryKey: ['me'],
    queryFn: () => fetch('/api/users/me').then(r => r.json())
  });

  const { data: charitiesRes, isLoading: loadingCatalog } = useQuery({
    queryKey: ['charities'],
    queryFn: () => fetch('/api/charities').then(r => r.json()),
    enabled: isEditing
  });

  useEffect(() => {
    if (res?.data?.user) {
      setSelectedCharity(res.data.user.charity_id || null);
      setNewPct(res.data.user.charity_contribution_pct || 15);
    }
  }, [res]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const resp = await fetch('/api/users/charity', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charity_id: selectedCharity, charity_contribution_pct: newPct })
      });
      if (!resp.ok) throw new Error('Failed to update');
    },
    onSuccess: () => {
      toast.success('Charity preferences updated');
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setIsEditing(false);
    }
  });

  if (loadingMe) return <div className="p-8">Loading charity data...</div>;
  if (!res?.data) return <div className="p-8">Failed to load data</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
       <div className="flex justify-between items-center mb-8">
         <h1 className="text-3xl font-extrabold font-serif">Your Impact</h1>
         {!isEditing && (
           <Button variant="outline" onClick={() => setIsEditing(true)}>
             {res.data.charity ? 'Change Charity' : 'Add Charity'}
           </Button>
         )}
       </div>

       {!isEditing ? (
         <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center max-w-lg mx-auto">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Current Beneficiary</h2>
            {res.data.charity ? (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{res.data.charity.name}</h3>
                <div className="w-full flex justify-between text-sm mb-2">
                  <span className="font-semibold">{res.data.user.charity_contribution_pct}% Contribution</span>
                  <span className="text-gray-500">of subscription</span>
                </div>
                <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex">
                  <div className="h-full bg-green-500 transition-all" style={{ width: `${res.data.user.charity_contribution_pct}%` }} />
                </div>
                <p className="mt-4 text-sm text-gray-500">Any change you make here applies from the next billing cycle.</p>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No charity selected</h3>
                <p className="text-sm text-gray-600">
                  {res.data.user.charity_contribution_pct > 0
                    ? `${res.data.user.charity_contribution_pct}% of your subscription is reserved for charity. Pick an organisation any time.`
                    : 'Pick a charity any time. Your change takes effect on the next billing cycle.'}
                </p>
              </>
            )}
         </div>
       ) : (
         <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {(charitiesRes?.data || []).map((c: any) => (
                 <CharityCard 
                   key={c.id} 
                   charity={c} 
                   selected={selectedCharity === c.id} 
                   onSelect={() => setSelectedCharity(c.id)} 
                 />
               ))}
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-lg mx-auto">
               <h4 className="font-bold mb-6 text-center text-lg">Choose Contribution Level</h4>
               <div className="grid grid-cols-3 gap-3">
                 {contributionOptions.map((option) => (
                   <button
                     key={option}
                     type="button"
                     onClick={() => setNewPct(option)}
                     className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                       newPct === option
                         ? 'border-green-700 bg-green-700 text-white'
                         : 'border-gray-200 bg-white text-gray-700 hover:border-green-400'
                     }`}
                   >
                     {option}%
                   </button>
                 ))}
               </div>
               <p className="mt-4 text-center text-sm text-gray-500">Changes take effect on the next billing cycle.</p>
            </div>

            <div className="flex justify-center space-x-4 pt-4">
              <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel Edit</Button>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !selectedCharity} className="bg-green-800 hover:bg-green-700 text-white min-w-[200px]">
                {saveMutation.isPending ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
         </div>
       )}
    </div>
  );
}
