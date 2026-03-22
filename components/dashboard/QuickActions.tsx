import Link from 'next/link';
import { CreditCard, Heart, PlusCircle, Trophy } from 'lucide-react';

const actions = [
  {
    href: '/scores',
    label: 'Submit a score',
    sublabel: 'After your round',
    icon: PlusCircle,
    iconColor: '#1a5e38',
  },
  {
    href: '/draws',
    label: 'View draws',
    sublabel: 'History + results',
    icon: Trophy,
    iconColor: '#534AB7',
  },
  {
    href: '/charity',
    label: 'Update charity',
    sublabel: 'Giving settings',
    icon: Heart,
    iconColor: '#993C1D',
  },
  {
    href: '/account',
    label: 'Manage billing',
    sublabel: 'Plan + payments',
    icon: CreditCard,
    iconColor: '#854F0B',
  },
] as const;

const raisedSm = '3px 3px 8px var(--dashboard-shadow-dark), -3px -3px 8px var(--dashboard-shadow-light)';
const raisedXs = '2px 2px 5px var(--dashboard-shadow-dark), -2px -2px 5px var(--dashboard-shadow-light)';
const insetShadow =
  'inset 3px 3px 7px var(--dashboard-shadow-dark), inset -3px -3px 7px var(--dashboard-shadow-light)';

export function QuickActions() {
  return (
    <div className="rounded-[16px] bg-[var(--dashboard-bg)] p-4" style={{ boxShadow: raisedSm }}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 rounded-[14px] bg-[var(--dashboard-bg)] px-4 py-3 transition duration-200 hover:translate-x-[2px]"
              style={{ boxShadow: raisedSm }}
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--dashboard-bg)]"
                style={{ boxShadow: insetShadow }}
              >
                <Icon className="h-[18px] w-[18px]" style={{ color: action.iconColor }} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-[#2a3a2a]">{action.label}</span>
                <span className="mt-0.5 block text-[10px] text-[#6a7a6a]">{action.sublabel}</span>
              </span>
              <span className="text-base text-[#9aaa9a]" style={{ textShadow: raisedXs }}>
                ›
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
