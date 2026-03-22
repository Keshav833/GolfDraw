'use client';
import { useQuery } from '@tanstack/react-query';
import { ScoreInput } from '@/components/scores/ScoreInput';
import { ScoreHistory } from '@/components/scores/ScoreHistory';

export default function ScoresPage() {
  const { data: res, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => fetch('/api/users/me').then(r => r.json())
  });

  if (isLoading) return <div className="p-8">Loading scores...</div>;
  if (!res?.data) return <div className="p-8">Failed to load data</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
       <div className="mb-8">
         <h1 className="text-3xl font-extrabold font-serif">Score Center</h1>
         <p className="text-gray-600 mt-2">Manage your active score window. Only your 5 most recent rounds are kept active for the monthly draw.</p>
       </div>
       
       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">Submit New Score</h2>
          <ScoreInput />
       </div>

       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-6">Active Scorecard View</h2>
          <ScoreHistory scores={res.data.scores} />
       </div>
    </div>
  );
}
