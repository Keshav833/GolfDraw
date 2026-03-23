'use client';

import { X, CreditCard, Heart, Trophy, History } from 'lucide-react';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { format } from 'date-fns';

interface UserDetailPanelProps {
  user: any | null;
  onClose: () => void;
  onCancelSubscription: (user: any) => void;
  cancelSubscriptionLoading?: boolean;
}

export default function UserDetailPanel({
  user,
  onClose,
  onCancelSubscription,
  cancelSubscriptionLoading = false,
}: UserDetailPanelProps) {
  if (!user) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-[var(--bg)] shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-50 flex flex-col transform transition-transform duration-300">
      {/* Header */}
      <div className="p-6 border-b border-[var(--sd)] flex items-center justify-between">
        <h2 className="text-xl font-serif">User Details</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-[var(--bg)] shadow-[var(--raised-sm)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Profile Summary */}
        <div className="flex flex-col items-center text-center">
          <div className="h-20 w-20 flex items-center justify-center rounded-full bg-[var(--bg)] shadow-[var(--raised-md)] text-[var(--green-700)] font-bold text-2xl mb-4">
            {user.full_name?.substring(0, 2).toUpperCase() ||
              user.email.substring(0, 2).toUpperCase()}
          </div>
          <h3 className="text-xl font-bold">{user.full_name || 'No Name'}</h3>
          <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
            {user.subscription_status}
          </div>
        </div>

        {/* Subscription Info */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm font-semibold uppercase tracking-wider">
            <CreditCard size={16} />
            <span>Subscription</span>
          </div>
          <div className="p-5 rounded-2xl bg-[var(--bg)] shadow-[var(--inset-sm)] space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Plan Type</span>
              <span className="font-semibold">{user.plan_type || 'None'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">
                Current Period End
              </span>
              <span className="font-semibold">
                {user.current_period_end
                  ? format(new Date(user.current_period_end), 'MMM d, yyyy')
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Status</span>
              <span className="font-semibold capitalize">
                {user.sub_status || 'Inactive'}
              </span>
            </div>
          </div>
        </section>

        {/* Charity Allocation */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm font-semibold uppercase tracking-wider">
            <Heart size={16} />
            <span>Charity Allocation</span>
          </div>
          <div className="p-5 rounded-2xl bg-[var(--bg)] shadow-[var(--raised-sm)]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold">
                {user.charity_name || 'No charity selected'}
              </span>
              <span className="text-sm font-bold text-[var(--green-700)]">
                {user.charity_contribution_pct}%
              </span>
            </div>
            <div className="h-2 w-full bg-[var(--sd)]/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--green-700)] transition-all duration-1000"
                style={{ width: `${user.charity_contribution_pct}%` }}
              />
            </div>
          </div>
        </section>

        {/* Scores & Activity */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm font-semibold uppercase tracking-wider">
            <History size={16} />
            <span>Latest Scores</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* These should ideally be real scores from the user dashboard */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--bg)] shadow-[var(--raised-sm)] text-sm font-bold"
              >
                —
              </div>
            ))}
            <span className="text-xs text-[var(--text-muted)] self-center ml-2">
              {user.score_count} total
            </span>
          </div>
        </section>

        {/* Draw History */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm font-semibold uppercase tracking-wider">
            <Trophy size={16} />
            <span>Recent Draws</span>
          </div>
          <div className="p-5 rounded-2xl bg-[var(--bg)] shadow-[var(--raised-sm)] text-center py-10">
            <Trophy size={32} className="mx-auto text-[var(--sd)] mb-2" />
            <p className="text-xs text-[var(--text-muted)]">
              No recent draw history
            </p>
          </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-[var(--sd)] bg-[var(--bg)]">
        {user.subscription_status === 'active' && (
          <LoadingButton
            variant="danger"
            loading={cancelSubscriptionLoading}
            fullWidth
            onClick={() => onCancelSubscription(user)}
            style={{
              padding: '16px 24px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14,
              color: '#b42318',
            }}
          >
            Cancel subscription
          </LoadingButton>
        )}
      </div>
    </div>
  );
}
