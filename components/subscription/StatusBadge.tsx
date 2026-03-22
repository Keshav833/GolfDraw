import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { SubscriptionStatus } from '@/lib/types/dashboard';

const variantMap: Record<SubscriptionStatus, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'border-green-200 bg-green-100 text-green-800 hover:bg-green-100',
  },
  past_due: {
    label: 'Payment due',
    className: 'border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100',
  },
  inactive: {
    label: 'Inactive',
    className: 'border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-100',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'border-red-200 bg-red-100 text-red-700 hover:bg-red-100',
  },
};

export function StatusBadge({
  status,
}: {
  status: SubscriptionStatus | string;
}) {
  const normalizedStatus = (status?.toLowerCase?.() as SubscriptionStatus) || 'inactive';
  const variant = variantMap[normalizedStatus] ?? variantMap.inactive;

  return (
    <Badge variant="outline" className={`font-medium ${variant.className}`}>
      {variant.label}
    </Badge>
  );
}
