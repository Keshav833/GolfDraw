import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variantMap: Record<string, string> = {
    active: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100',
    cancelled: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
    past_due: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100'
  };

  const css = variantMap[status?.toLowerCase()] || variantMap.inactive;

  return (
    <Badge variant="outline" className={`capitalize font-medium ${css}`}>
      {(status || 'inactive').replace('_', ' ')}
    </Badge>
  );
}
