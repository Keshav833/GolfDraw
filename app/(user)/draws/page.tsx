'use client';
import { useQuery } from '@tanstack/react-query';
import { DrawCard } from '@/components/draw/DrawCard';

export default function DrawsPage() {
  const { data: res, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => fetch('/api/users/me').then(r => r.json())
  });

  if (isLoading) return <div className="p-8">Loading history...</div>;
  if (!res?.data) return <div className="p-8">Failed to load data</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
       <div className="mb-8">
         <h1 className="text-3xl font-extrabold font-serif">Draw History</h1>
         <p className="text-gray-600 mt-2">View past draws and match results.</p>
       </div>
       
       <div className="space-y-6">
          <DrawCard 
            month="March 2025" 
            draw_number={34} 
            match_category={null} 
            prize_amount={null}
            payment_status="pending"
          />
          <DrawCard 
            month="February 2025" 
            draw_number={18} 
            match_category="3-match" 
            prize_amount={25.00}
            payment_status="approved"
          />
          <DrawCard 
            month="January 2025" 
            draw_number={42} 
            match_category="no-match" 
            prize_amount={null}
            payment_status="paid"
          />
       </div>
    </div>
  );
}
