import React from 'react';
import { Badge } from '@/components/ui/badge';

interface MatchBadgeProps {
  category: '3-match' | '4-match' | '5-match' | null | string;
}

export function MatchBadge({ category }: MatchBadgeProps) {
  if (!category || category === 'no-match') {
    return <Badge variant="secondary" className="bg-gray-100 text-gray-500">No Match</Badge>;
  }

  const styles: Record<string, string> = {
    '5-match': 'bg-yellow-400 text-yellow-900 border-none shadow-sm',
    '4-match': 'bg-purple-100 text-purple-800 border-purple-200',
    '3-match': 'bg-teal-100 text-teal-800 border-teal-200'
  };

  return (
    <Badge variant="outline" className={`font-semibold ${styles[category] || ''}`}>
      {category.replace('-', ' ')}
    </Badge>
  );
}
