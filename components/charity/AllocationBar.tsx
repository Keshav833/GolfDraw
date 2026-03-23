import React from 'react';

export function AllocationBar({
  pct,
  charityName,
  amount,
}: {
  pct: number;
  charityName: string;
  amount: number;
}) {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-gray-700">
          {pct}% to {charityName}
        </span>
        <span className="font-bold text-green-700">
          ~₹{amount.toFixed(2)}/mo
        </span>
      </div>
      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-green-500 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
        <div className="h-full bg-gray-300 flex-1" />
      </div>
      <p className="text-xs text-gray-500 text-right">
        Remaining to Prize Pool & Admin
      </p>
    </div>
  );
}
