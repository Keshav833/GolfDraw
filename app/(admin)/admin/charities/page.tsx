'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';

export default function AdminCharitiesPage() {
  const queryClient = useQueryClient();
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const { data: charities, isLoading } = useQuery({
    queryKey: ['admin_charities'],
    queryFn: async () => {
      const { data } = await supabase.from('charities').select('*').order('name');
      return data || [];
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string, is_active: boolean }) => {
      const { error } = await supabase.from('charities').update({ is_active: !is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_charities'] });
    }
  });

  if (isLoading) return <div className="p-8">Loading charities...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
       <div className="flex justify-between items-center mb-8">
         <h1 className="text-3xl font-extrabold font-serif">Charity Partners</h1>
         <Button>Add Charity</Button>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {charities?.map((c: any) => (
           <div key={c.id} className={`p-6 rounded-xl border ${c.is_active ? 'bg-white border-green-200 shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className={`font-bold text-lg ${!c.is_active && 'text-gray-500'}`}>{c.name}</h3>
                <span className={`text-[10px] font-bold uppercase py-1 px-2 rounded ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-500'}`}>
                  {c.is_active ? 'Active' : 'Hidden'}
                </span>
              </div>
              <p className="text-sm mb-4 line-clamp-2 min-h-[2.5rem]">{c.description}</p>
              <div className="flex justify-between items-center text-xs">
                 <span>{c.country} • {c.category}</span>
                 <Button variant="outline" size="sm" onClick={() => toggleMutation.mutate({ id: c.id, is_active: c.is_active })}>
                   {c.is_active ? 'Deactivate' : 'Activate'}
                 </Button>
              </div>
           </div>
         ))}
       </div>
    </div>
  );
}
