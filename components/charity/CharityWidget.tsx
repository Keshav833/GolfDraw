import Link from 'next/link';
import type { Charity } from '@/lib/types/charity';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CharityWidget({
  charity,
  pct,
  planType,
}: {
  charity: Charity | null;
  pct: number;
  planType: 'monthly' | 'yearly';
}) {
  const monthlyRate = planType === 'yearly' ? 86 / 12 : 9;
  const donationAmount = ((monthlyRate * pct) / 100).toFixed(2);

  if (charity && pct > 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Your charity</p>
          <h3 className="mt-3 text-xl font-bold text-gray-900">{charity.name}</h3>
          <span className="mt-2 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
            {charity.category}
          </span>
        </div>

        <div className="mt-5">
          <div className="h-3 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-green-600" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-sm font-semibold text-gray-900">
            {pct}% · £{donationAmount}/mo
          </p>
          <p className="mt-1 text-sm text-gray-500">Donated this month</p>
        </div>

        <Link
          href="/charity"
          className={cn(buttonVariants({ variant: 'link' }), 'mt-3 h-auto px-0 text-green-700')}
        >
          Change charity →
        </Link>
      </div>
    );
  }

  if (pct > 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Your charity</p>
        <h3 className="mt-3 text-xl font-bold text-gray-900">{pct}% ready to allocate</h3>
        <p className="mt-2 text-sm text-gray-600">You haven&apos;t chosen a charity yet.</p>
        <Link
          href="/charity"
          className={cn(
            buttonVariants({ variant: 'default' }),
            'mt-5 bg-green-800 text-white hover:bg-green-700'
          )}
        >
          Choose a charity
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Your charity</p>
      <h3 className="mt-3 text-xl font-bold text-gray-900">Not donating yet</h3>
      <p className="mt-2 text-sm text-gray-600">
        Add a charity to give back with every draw.
      </p>
      <Link
        href="/charity"
        className={cn(
          buttonVariants({ variant: 'default' }),
          'mt-5 bg-green-800 text-white hover:bg-green-700'
        )}
      >
        Get started
      </Link>
    </div>
  );
}
