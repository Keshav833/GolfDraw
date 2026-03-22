import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Score {
  id: string;
  value: number;
  submitted_at: string;
}

export function ScoreHistory({ scores }: { scores: Score[] }) {
  if (!scores || scores.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-4">No scores logged yet.</p>;
  }

  return (
    <div className="space-y-4">
      {scores.map((s, idx) => (
        <div 
          key={s.id} 
          className={`flex items-center justify-between p-3 rounded-lg border ${idx === 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}
        >
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${idx === 0 ? 'bg-green-600 text-white' : 'bg-white text-gray-700 shadow-sm'}`}>
              {s.value}
            </div>
            {idx === 0 && <span className="text-xs font-semibold uppercase text-green-700 tracking-wider">Latest</span>}
          </div>
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(s.submitted_at), { addSuffix: true })}
          </p>
        </div>
      ))}
    </div>
  );
}
