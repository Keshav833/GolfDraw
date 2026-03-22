import { Badge } from '@/components/ui/badge';
import type { DrawResult } from '@/lib/types/dashboard';

export function MatchBadge({
  category,
}: {
  category: DrawResult['match_category'] | 'no-match';
}) {
  if (!category || category === 'no-match') {
    return (
      <Badge
        variant="outline"
        className="border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-100"
      >
        No match
      </Badge>
    );
  }

  if (category === '3-match') {
    return (
      <Badge
        variant="outline"
        className="border-teal-200 bg-teal-100 text-teal-800 hover:bg-teal-100"
      >
        3 match
      </Badge>
    );
  }

  if (category === '4-match') {
    return (
      <Badge
        variant="outline"
        className="border-purple-200 bg-purple-100 text-purple-800 hover:bg-purple-100"
      >
        4 match
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-yellow-200 bg-[#f0c040] text-[#4e3a00] hover:bg-[#f0c040]"
    >
      5 match ★
    </Badge>
  );
}
