import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/subscription/StatusBadge';
import type { DashboardSubscription } from '@/lib/types/dashboard';

export function SubscriptionCard({
  subscription,
}: {
  subscription: DashboardSubscription;
}) {
  if (!subscription) {
    return (
      <Card className="border border-[#e3e7dd] bg-white shadow-sm">
        <CardContent className="space-y-4 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Your plan</p>
          <div>
            <h2 className="text-xl font-bold text-gray-950">No active plan</h2>
            <p className="mt-2 text-sm text-gray-600">
              Subscribe now to enter future GolfDraw draws.
            </p>
          </div>
          <Link
            href="/register/plan"
            className="inline-flex text-sm font-semibold text-[#1a5e38] hover:text-[#0f3d2e]"
          >
            Subscribe now →
          </Link>
        </CardContent>
      </Card>
    );
  }

  const planLabel = subscription.plan_type === 'yearly' ? 'Yearly plan' : 'Monthly plan';
  const planPrice = subscription.plan_type === 'yearly' ? '£86 / year' : '£9 / month';
  const showRenewal = subscription.status === 'active' && subscription.current_period_end;
  const showCancellation = subscription.status === 'cancelled' && subscription.current_period_end;
  const renewalDate = showRenewal
    ? format(new Date(subscription.current_period_end!), 'd MMM yyyy')
    : null;
  const cancellationDate = showCancellation
    ? format(new Date(subscription.current_period_end!), 'd MMM yyyy')
    : null;

  return (
    <Card className="border border-[#e3e7dd] bg-white shadow-sm">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Your plan</p>
          <StatusBadge status={subscription.status} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-950">{planLabel}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span>{planPrice}</span>
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            <span>Monthly draw included</span>
          </div>
        </div>

        {showRenewal ? (
          <p className="text-sm text-gray-600">Renews on {renewalDate}</p>
        ) : null}

        {showCancellation ? (
          <p className="text-sm text-gray-600">Access until {cancellationDate}</p>
        ) : null}

        <Link
          href="/account"
          className="inline-flex text-sm font-semibold text-[#1a5e38] hover:text-[#0f3d2e]"
        >
          Manage subscription →
        </Link>
      </CardContent>
    </Card>
  );
}
