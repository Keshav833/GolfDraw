'use client';

import { Check, ExternalLink, MapPin } from 'lucide-react';
import type { Charity } from '@/lib/types/charity';

const categoryStyles: Record<Charity['category'], string> = {
  'Golf & Sport': 'bg-[#d8f0e6] text-[#085041]',
  'Health & Research': 'bg-[#ece9fb] text-[#4b3e9e]',
  'Youth & Education': 'bg-[#dfeaf8] text-[#21558c]',
  Environment: 'bg-[#dff1ee] text-[#0c6560]',
};

const raisedSm = '3px 3px 8px var(--dashboard-shadow-dark), -3px -3px 8px var(--dashboard-shadow-light)';
const insetShadow =
  'inset 3px 3px 7px var(--dashboard-shadow-dark), inset -3px -3px 7px var(--dashboard-shadow-light)';

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
      className="group relative flex h-full flex-col rounded-[18px] bg-[var(--dashboard-bg)] p-5 text-left transition-all duration-200 hover:-translate-y-0.5"
      style={{
        boxShadow: selected
          ? '3px 3px 7px rgba(10,50,20,0.3), -2px -2px 5px rgba(60,140,80,0.2)'
          : raisedSm,
        border: selected ? '1px solid rgba(26,94,56,0.25)' : '1px solid transparent',
      }}
    >
      {selected ? (
        <span className="absolute right-4 top-4 rounded-full bg-[#1a5e38] p-1 text-white">
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
        <h3 className="text-[15px] font-bold text-[#2a3a2a]">{charity.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6a7a6a]">{charity.description}</p>
        <div
          className="mt-3 inline-flex items-center gap-1 rounded-full bg-[var(--dashboard-bg)] px-2.5 py-1 text-xs text-[#6a7a6a]"
          style={{ boxShadow: insetShadow }}
        >
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
            className="inline-flex items-center gap-1 text-sm font-medium text-[#2a3a2a] underline-offset-4 hover:text-[#1a5e38] hover:underline"
          >
            Visit website
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      ) : null}
    </button>
  );
}
