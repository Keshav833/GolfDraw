import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MatchBadge } from './MatchBadge';

interface DrawCardProps {
  month: string;
  draw_number: number;
  match_category: '3-match'|'4-match'|'5-match'|null;
  prize_amount: number | null;
  payment_status: string;
  onUploadProof?: () => void;
}

export function DrawCard({ month, draw_number, match_category, prize_amount, payment_status, onUploadProof }: DrawCardProps) {
  return (
    <Card className="overflow-hidden mb-4">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 gap-4">
          <div className="flex flex-col space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold">{month} Draw</h3>
            <p className="text-sm text-gray-500">Winning number: <span className="font-mono bg-gray-100 px-1 rounded">{draw_number}</span></p>
          </div>
          
          <div className="flex items-center space-x-4">
            <MatchBadge category={match_category} />
            {prize_amount && (
              <div className="text-right">
                <p className="font-bold text-green-700">£{Number(prize_amount).toLocaleString()}</p>
                <p className="text-xs text-gray-500 capitalize">{payment_status}</p>
              </div>
            )}
          </div>
        </div>
        
        {match_category && payment_status === 'pending' && onUploadProof && (
          <div className="bg-amber-50 border-t border-amber-100 p-4 text-sm flex justify-between items-center">
            <span className="text-amber-800 leading-tight">Action required: Upload scorecard proof.</span>
            <button onClick={onUploadProof} className="text-amber-700 font-medium hover:underline text-sm whitespace-nowrap ml-4">Upload proof →</button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
