'use client';

import { Check, ExternalLink, MapPin } from 'lucide-react';
import type { Charity } from '@/lib/types/charity';

const categoryStyles: Record<Charity['category'], string> = {
  'Golf & Sport': 'bg-green-100 text-green-800',
  'Health & Research': 'bg-fuchsia-100 text-fuchsia-800',
  'Youth & Education': 'bg-blue-100 text-blue-800',
  Environment: 'bg-teal-100 text-teal-800',
};

export function CharityCard({
  charity,
  selected,
  onSelect,
}: {
  charity: Charity;
  selected: boolean;
  onSelect: (charity: Charity) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(charity)}
      className={`group relative flex h-full flex-col rounded-xl border bg-white p-5 text-left transition-all duration-200 ${
        selected
          ? 'border-2 border-green-600 bg-green-50/60 shadow-sm'
          : 'border-gray-200 hover:-translate-y-0.5 hover:border-gray-400'
      }`}
    >
      {selected ? (
        <span className="absolute right-4 top-4 rounded-full bg-green-600 p-1 text-white">
          <Check className="h-3.5 w-3.5" />
        </span>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryStyles[charity.category]}`}
        >
          {charity.category}
        </span>
      </div>

      <div className="mt-4 flex-1">
        <h3 className="text-[15px] font-bold text-gray-900">{charity.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">{charity.description}</p>
        <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
          <MapPin className="h-3 w-3" />
          <span>{charity.country}</span>
        </div>
      </div>

      {charity.website ? (
        <div className="mt-5">
          <a
            href={charity.website}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 underline-offset-4 hover:text-gray-900 hover:underline"
          >
            Visit website
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      ) : null}
    </button>
  );
}
