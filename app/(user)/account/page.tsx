'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { PageShell } from '@/components/dashboard/PageShell';
import { StatusBadge } from '@/components/subscription/StatusBadge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRazorpayCheckout } from '@/lib/razorpay/useRazorpayCheckout';

const raisedSm =
  '3px 3px 8px var(--dashboard-shadow-dark), -3px -3px 8px var(--dashboard-shadow-light)';
const raisedXs =
  '2px 2px 5px var(--dashboard-shadow-dark), -2px -2px 5px var(--dashboard-shadow-light)';
const insetShadow =
  'inset 3px 3px 7px var(--dashboard-shadow-dark), inset -3px -3px 7px var(--dashboard-shadow-light)';

type AccountResponse = {
  data: {
    user: {
      email: string;
      full_name: string | null;
      charity_contribution_pct?: number | null;
    };
    subscription: {
      plan_type?: 'monthly' | 'yearly' | null;
      status?: 'active' | 'past_due' | 'inactive' | 'cancelled' | string | null;
      current_period_end?: string | null;
    } | null;
    charity: {
      name?: string | null;
    } | null;
  } | null;
};

export default function AccountPage() {
  const {
    data: res,
    isLoading,
    refetch,
  } = useQuery<AccountResponse>({
    queryKey: ['me'],
    queryFn: () => fetch('/api/users/me').then((response) => response.json()),
  });
  const { checkout, isPending: checkoutPending } = useRazorpayCheckout();

  const handleCancel = async () => {
    if (
      !confirm(
        'Are you sure you want to cancel your subscription? You will lose entry to future draws.'
      )
    ) {
      return;
    }

    const response = await fetch('/api/subscriptions/cancel', {
      method: 'DELETE',
    });

    if (response.ok) {
      toast.success('Subscription cancelled successfully.');
      refetch();
      return;
    }

    toast.error('Failed to cancel subscription.');
  };

  const handleSubscribe = (planType: 'monthly' | 'yearly') => {
    checkout({
      planType,
      userName: res?.data?.user?.full_name ?? undefined,
      userEmail: res?.data?.user?.email,
      onSuccess: () => {
        refetch();
      },
    });
  };

  if (isLoading) {
    return (
      <PageShell
        userName="GolfDraw member"
        membershipLabel="Account"
        statusLabel="Loading"
        title="Account settings"
        subtitle="Manage your profile, billing, and giving preferences."
      >
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-56 animate-pulse rounded-[20px] bg-[#d9ddd9]"
              style={{ boxShadow: raisedSm }}
            />
          ))}
        </div>
      </PageShell>
    );
  }

  if (!res?.data) {
    return (
      <PageShell
        userName="GolfDraw member"
        membershipLabel="Account"
        statusLabel="Unavailable"
        title="Account settings"
        subtitle="Manage your profile, billing, and giving preferences."
      >
        <div
          className="rounded-[20px] bg-[var(--dashboard-bg)] px-6 py-12 text-center text-[#6a7a6a]"
          style={{ boxShadow: insetShadow }}
        >
          Failed to load account data.
        </div>
      </PageShell>
    );
  }

  const { user, subscription, charity } = res.data;
  const userName = user?.full_name?.trim() || user?.email || 'GolfDraw member';
  const membershipLabel =
    subscription?.plan_type === 'yearly'
      ? 'Yearly member'
      : subscription?.plan_type === 'monthly'
        ? 'Monthly member'
        : 'No active plan';
  const statusLabel = subscription?.status
    ? subscription.status
        .replace('_', ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : 'Inactive';
  const contributionPct = Number(user?.charity_contribution_pct ?? 0);
  const renewalDate =
    subscription?.current_period_end &&
    !Number.isNaN(new Date(subscription.current_period_end).getTime())
      ? format(new Date(subscription.current_period_end), 'd MMM yyyy')
      : null;

  return (
    <PageShell
      userName={userName}
      membershipLabel={membershipLabel}
      statusLabel={statusLabel}
      title="Account settings"
      subtitle="Manage your profile, billing, and giving preferences."
    >
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <section
          className="rounded-[20px] bg-[var(--dashboard-bg)] p-5 sm:p-6"
          style={{ boxShadow: raisedSm }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9aaa9a]">
            Profile
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#2a3a2a]">
            Your details
          </h2>
          <p className="mt-1 text-sm text-[#6a7a6a]">
            Basic account details used across your GolfDraw profile.
          </p>

          <div className="mt-6 grid gap-4">
            <div
              className="rounded-[16px] bg-[var(--dashboard-bg)] px-4 py-4"
              style={{ boxShadow: insetShadow }}
            >
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#9aaa9a]">
                Full name
              </p>
              <p className="mt-2 text-base font-semibold text-[#2a3a2a]">
                {user?.full_name || 'Not set'}
              </p>
            </div>
            <div
              className="rounded-[16px] bg-[var(--dashboard-bg)] px-4 py-4"
              style={{ boxShadow: insetShadow }}
            >
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#9aaa9a]">
                Email
              </p>
              <p className="mt-2 text-base font-semibold text-[#2a3a2a]">
                {user?.email}
              </p>
            </div>
          </div>
        </section>

        <section
          className="rounded-[20px] bg-[var(--dashboard-bg)] p-5 sm:p-6"
          style={{ boxShadow: raisedSm }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9aaa9a]">
                Subscription
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[#2a3a2a]">
                Plan and billing
              </h2>
            </div>
            <StatusBadge status={subscription?.status || 'inactive'} />
          </div>

          <div
            className="mt-6 rounded-[16px] bg-[var(--dashboard-bg)] px-4 py-4"
            style={{ boxShadow: insetShadow }}
          >
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#9aaa9a]">
              Current plan
            </p>
            <p className="mt-2 text-lg font-semibold capitalize text-[#2a3a2a]">
              {subscription?.plan_type
                ? `${subscription.plan_type} plan`
                : 'None selected'}
            </p>
            <p className="mt-1 text-sm text-[#6a7a6a]">
              {subscription?.plan_type === 'yearly'
                ? 'GBP 86.00 per year'
                : subscription?.plan_type === 'monthly'
                  ? 'GBP 9.00 per month'
                  : 'Subscribe to enter upcoming draws.'}
            </p>
            {renewalDate && subscription?.status === 'active' ? (
              <p className="mt-3 text-sm text-[#1a5e38]">
                Renews on {renewalDate}
              </p>
            ) : null}
            {renewalDate && subscription?.status === 'cancelled' ? (
              <p className="mt-3 text-sm text-[#b45309]">
                Access until {renewalDate}
              </p>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {subscription?.status !== 'active' ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleSubscribe('monthly')}
                  disabled={checkoutPending}
                  className="rounded-[14px] border-0 bg-[var(--dashboard-bg)] text-[#2a3a2a] hover:bg-[var(--dashboard-bg)]"
                  style={{ boxShadow: raisedXs }}
                >
                  {checkoutPending ? 'Opening...' : 'Monthly — £9/mo'}
                </Button>
                <Button
                  onClick={() => handleSubscribe('yearly')}
                  disabled={checkoutPending}
                  className="rounded-[14px] border-0 bg-green-800 text-white hover:bg-green-700"
                  style={{ boxShadow: raisedXs }}
                >
                  {checkoutPending ? 'Opening...' : 'Yearly — £86/yr'}
                </Button>
              </>
            ) : (
              <Button
                variant="destructive"
                onClick={handleCancel}
                className="rounded-[14px] border-0"
                style={{ boxShadow: raisedXs }}
              >
                Cancel subscription
              </Button>
            )}
          </div>
        </section>

        <section
          className="rounded-[20px] bg-[var(--dashboard-bg)] p-5 sm:p-6 lg:col-span-2"
          style={{ boxShadow: raisedSm }}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9aaa9a]">
                Charity &amp; giving
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[#2a3a2a]">
                Your current allocation
              </h2>
              <p className="mt-1 text-sm text-[#6a7a6a]">
                Update your chosen charity and reserved contribution from the
                charity page.
              </p>
            </div>

            <Link
              href="/charity"
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'rounded-[14px] border-0 bg-[var(--dashboard-bg)] text-[#2a3a2a] hover:bg-[var(--dashboard-bg)]'
              )}
              style={{ boxShadow: raisedXs }}
            >
              Update charity
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div
              className="rounded-[16px] bg-[var(--dashboard-bg)] px-4 py-4"
              style={{ boxShadow: insetShadow }}
            >
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#9aaa9a]">
                Current charity
              </p>
              <p className="mt-2 text-base font-semibold text-[#2a3a2a]">
                {charity?.name ?? 'None selected'}
              </p>
            </div>
            <div
              className="rounded-[16px] bg-[var(--dashboard-bg)] px-4 py-4"
              style={{ boxShadow: insetShadow }}
            >
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#9aaa9a]">
                Contribution
              </p>
              <p className="mt-2 text-base font-semibold text-[#2a3a2a]">
                {contributionPct}%
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
