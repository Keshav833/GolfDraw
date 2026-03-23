import { Suspense } from 'react';
import Link from 'next/link';
import { format, getHours } from 'date-fns';
import { Bell, Search, User2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { CharityWidget } from '@/components/charity/CharityWidget';
import { DrawHistoryList } from '@/components/draw/DrawHistoryList';
import { WinningsWidget } from '@/components/draw/WinningsWidget';
import { ScoreSummary } from '@/components/scores/ScoreSummary';
import type {
  DashboardCharity,
  DashboardSubscription,
  DrawResult,
  PendingWinnings,
} from '@/lib/types/dashboard';
import type { Score } from '@/lib/types/score';

const raised =
  '5px 5px 12px var(--dashboard-shadow-dark), -5px -5px 12px var(--dashboard-shadow-light)';
const raisedSm =
  '3px 3px 8px var(--dashboard-shadow-dark), -3px -3px 8px var(--dashboard-shadow-light)';
const raisedXs =
  '2px 2px 5px var(--dashboard-shadow-dark), -2px -2px 5px var(--dashboard-shadow-light)';
const insetShadow =
  'inset 3px 3px 7px var(--dashboard-shadow-dark), inset -3px -3px 7px var(--dashboard-shadow-light)';

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const userId = session.user.id;

  const [
    userResult,
    subscriptionResult,
    scoresResult,
    charityResult,
    drawsResult,
    winningsResult,
    pendingResult,
  ] = await Promise.all([
    supabase
      .from('users')
      .select('id, full_name, email, charity_contribution_pct')
      .eq('id', userId)
      .single(),
    supabase
      .from('subscriptions')
      .select('id, plan_type, status, current_period_end, cancelled_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('scores')
      .select('id, value, submitted_at')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(5),
    supabase
      .from('users')
      .select(
        `
        charity_contribution_pct,
        charity:charities (
          id, name, category, country
        )
      `
      )
      .eq('id', userId)
      .single(),
    supabase
      .from('draw_results')
      .select(
        `
        id, match_category, prize_amount, payment_status,
        draw:draws (
          id, month, status, draw_number
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('draw_results')
      .select('prize_amount')
      .eq('user_id', userId)
      .eq('payment_status', 'paid'),
    supabase
      .from('draw_results')
      .select(
        `
        id, prize_amount, match_category,
        draw:draws ( month )
      `
      )
      .eq('user_id', userId)
      .eq('payment_status', 'pending')
      .limit(1)
      .maybeSingle(),
  ]);

  const user = userResult.data;
  const subscription =
    (subscriptionResult.data as DashboardSubscription) ?? null;
  const scores = (scoresResult.data as Score[]) ?? [];
  const charity = normalizeCharity(charityResult.data?.charity);
  const charityPct = Number(
    charityResult.data?.charity_contribution_pct ??
      user?.charity_contribution_pct ??
      0
  );
  const drawResults = (
    (drawsResult.data ?? []) as Array<Record<string, unknown>>
  ).map(normalizeDrawResult);
  const totalWinnings =
    winningsResult.data?.reduce(
      (sum, row) => sum + Number(row.prize_amount ?? 0),
      0
    ) ?? 0;
  const pending = normalizePending(
    pendingResult.data as Record<string, unknown> | null
  );

  const firstName = user?.full_name?.split(' ')[0] || 'Golfer';
  const initials =
    user?.full_name
      ?.split(' ')
      .slice(0, 2)
      .map((part: string) => part[0])
      .join('')
      .toUpperCase() || 'GD';
  const currentHour = getHours(new Date());
  const greeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 17
        ? 'Good afternoon'
        : 'Good evening';
  const drawDate = getNextDrawDate();
  const drawCountdown = Math.max(
    0,
    Math.ceil((drawDate.getTime() - Date.now()) / 86400000)
  );
  const monthLabel = format(new Date(), 'MMMM yyyy');
  const monthlyDonation = (
    (subscription?.plan_type === 'yearly' ? 999 / 12 : 100) *
    (charityPct / 100)
  ).toFixed(2);
  const scoreSeries = buildScoreSeries(scores);
  const chartPath = buildChartPath(scoreSeries);
  const chartAreaPath = buildAreaPath(scoreSeries);
  const currentValue = scoreSeries[scoreSeries.length - 1] ?? 0;
  const isActive = subscription?.status === 'active';

  return (
    <div className="mx-auto max-w-[1400px] h-screen px-4 py-6 overflow-hidden">
      <div
        className="h-full overflow-hidden rounded-[24px] bg-[var(--dashboard-bg)] p-4 sm:p-5 lg:p-6"
        style={{ boxShadow: raised }}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <StatusBanner subscription={subscription} />

          <div className="flex flex-1 h-full gap-6 lg:flex-row flex-col min-h-0 overflow-hidden">
            <Sidebar
              userName={user?.full_name ?? 'GolfDraw member'}
              membershipLabel={
                subscription?.plan_type === 'yearly'
                  ? 'Yearly member'
                  : 'Monthly member'
              }
              statusLabel={
                isActive
                  ? 'Active'
                  : subscription?.status?.replace('_', ' ') || 'Inactive'
              }
              initials={initials}
            />

            <div className="flex-[1.5] min-w-0 flex flex-col relative h-full">
              <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar lg:py-0 py-4 space-y-4">
                <header className="sticky top-0 z-20 bg-[var(--dashboard-bg)] pb-6 flex items-center justify-between gap-4">
                  <div>
                    <h1
                      className="text-[21px] tracking-[-0.3px] text-[#2a3a2a]"
                      style={{ fontFamily: '"DM Serif Display", serif' }}
                    >
                      {greeting}, {firstName}
                    </h1>
                    <p className="mt-0.5 text-[11px] text-[#6a7a6a]">
                      {monthLabel} · Draw in {drawCountdown} day
                      {drawCountdown === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <HeaderIcon
                      href="/draws"
                      icon={<Search className="h-3.5 w-3.5" />}
                    />
                    <HeaderIcon
                      href="/draws"
                      icon={<Bell className="h-3.5 w-3.5" />}
                    />
                    <HeaderIcon
                      href="/account"
                      icon={<User2 className="h-3.5 w-3.5" />}
                    />
                  </div>
                </header>

                <section
                  className="rounded-[20px] bg-[var(--dashboard-bg)] p-5"
                  style={{ boxShadow: raised }}
                >
                  <div
                    className="relative overflow-hidden rounded-[16px] px-5 py-5"
                    style={{
                      background: 'var(--dashboard-green-700)',
                      boxShadow:
                        '4px 4px 10px rgba(10,40,20,0.35), -2px -2px 6px rgba(60,140,80,0.2)',
                    }}
                  >
                    <div className="absolute -right-10 -top-10 h-[130px] w-[130px] rounded-full bg-white/10" />
                    <div className="absolute bottom-[-20px] left-5 h-20 w-20 rounded-full bg-white/[0.04]" />
                    <svg
                      className="absolute right-[100px] top-4 z-[1] opacity-45"
                      width="90"
                      height="36"
                      viewBox="0 0 90 36"
                      fill="none"
                    >
                      <polyline
                        points="0,30 18,22 36,26 54,12 72,16 90,8"
                        fill="none"
                        stroke="rgba(125,224,170,0.5)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="relative z-[1] flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] text-white/55">
                          This month&apos;s jackpot
                        </p>
                        <h2
                          className="mt-1 text-[34px] tracking-[-0.5px] text-white"
                          style={{ fontFamily: '"DM Serif Display", serif' }}
                        >
                          ₹40,000.00
                        </h2>
                      </div>
                      <div className="flex items-center gap-[5px] rounded-[20px] border border-white/20 bg-white/10 px-[10px] py-[3px] text-[10px] text-white/80">
                        <span className="h-[5px] w-[5px] rounded-full bg-[#7de0aa]" />
                        Draw in {drawCountdown} days
                      </div>
                    </div>
                    <div className="relative z-[1] mt-4 flex flex-wrap gap-2">
                      <HeroButton
                        href="/scores"
                        variant="solid"
                        label="Submit score"
                      />
                      <HeroButton
                        href="/draws"
                        variant="ghost"
                        label="View draws"
                      />
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <StatCard
                    label="Total winnings"
                    value={`₹${totalWinnings.toFixed(2)}`}
                    change={
                      totalWinnings > 0
                        ? `${drawResults.filter((result) => result.match_category).length} winning result${drawResults.filter((result) => result.match_category).length === 1 ? '' : 's'}`
                        : 'No verified payouts yet'
                    }
                    lineColor="#1a5e38"
                    icon="star"
                  />
                  <StatCard
                    label="Charity donated"
                    value={`₹${monthlyDonation}`}
                    change={
                      charityPct > 0
                        ? `${charityPct}% of subscription`
                        : 'Not donating yet'
                    }
                    lineColor="#534AB7"
                    icon="drop"
                  />
                  <StatCard
                    label="Draws entered"
                    value={String(drawResults.length)}
                    change={
                      isActive ? 'Subscription live' : 'Inactive subscription'
                    }
                    lineColor="#BA7517"
                    icon="calendar"
                  />
                </section>

                <section
                  className="rounded-[16px] bg-[var(--dashboard-bg)] p-4"
                  style={{ boxShadow: raisedSm }}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-[13px] font-semibold text-[#2a3a2a]">
                      Score history
                    </div>
                    <div
                      className="flex cursor-default items-center gap-1 rounded-[8px] px-2.5 py-1 text-[11px] text-[#6a7a6a]"
                      style={{
                        background: 'var(--dashboard-bg)',
                        boxShadow: insetShadow,
                      }}
                    >
                      Last {scoreSeries.length}
                    </div>
                  </div>
                  {scores.length ? (
                    <>
                      <svg
                        width="100%"
                        height="72"
                        viewBox="0 0 380 72"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient
                            id="dashboard-score-fill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#1a5e38"
                              stopOpacity="0.12"
                            />
                            <stop
                              offset="100%"
                              stopColor="#1a5e38"
                              stopOpacity="0"
                            />
                          </linearGradient>
                        </defs>
                        <path
                          d={chartPath}
                          fill="none"
                          stroke="#1a5e38"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d={chartAreaPath}
                          fill="url(#dashboard-score-fill)"
                        />
                        {scoreSeries.map((value, index) => {
                          const x =
                            10 +
                            index * (360 / Math.max(scoreSeries.length - 1, 1));
                          const y = getChartY(value, scoreSeries);

                          return (
                            <circle
                              key={`${value}-${index}`}
                              cx={x}
                              cy={y}
                              r={index === scoreSeries.length - 1 ? 5 : 3}
                              fill={
                                index === scoreSeries.length - 1
                                  ? '#1a5e38'
                                  : 'var(--dashboard-bg)'
                              }
                              stroke="#1a5e38"
                              strokeWidth="1.5"
                            />
                          );
                        })}
                        <rect
                          x="336"
                          y="2"
                          width="44"
                          height="16"
                          rx="5"
                          fill="#1a3a2a"
                        />
                        <text
                          x="358"
                          y="13"
                          textAnchor="middle"
                          fontSize="9"
                          fill="#7de0aa"
                          style={{
                            fontFamily: 'DM Sans, sans-serif',
                            fontWeight: 600,
                          }}
                        >
                          {currentValue} ↑
                        </text>
                      </svg>
                      <div className="mt-1 flex justify-between text-[10px] text-[#9aaa9a]">
                        {scoreSeries.map((value, index) => (
                          <span key={`${value}-${index}-label`}>{value}</span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div
                      className="rounded-[12px] bg-[var(--dashboard-bg)] px-4 py-8 text-center text-[11px] text-[#6a7a6a]"
                      style={{ boxShadow: insetShadow }}
                    >
                      No score history yet. Submit your first score after your
                      next round.
                    </div>
                  )}
                </section>

                <QuickActions />
              </main>
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--dashboard-bg)] to-transparent pointer-events-none z-10" />
            </div>

            <aside className="w-full lg:w-[260px] flex-shrink-0 flex flex-col h-full overflow-hidden relative">
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-[18px] pb-20">
                <div
                  className="rounded-[16px] bg-[var(--dashboard-bg)] p-[14px]"
                  style={{ boxShadow: raisedSm }}
                >
                  <div
                    className="rounded-[12px] p-[14px] text-white"
                    style={{
                      background: '#1a3a2a',
                      boxShadow:
                        '3px 3px 8px rgba(0,0,0,0.3), -1px -1px 4px rgba(80,160,100,0.15)',
                    }}
                  >
                    <p className="text-[10px] text-white/45">
                      Next jackpot draw
                    </p>
                    <h3
                      className="mt-1 text-[22px] text-white"
                      style={{ fontFamily: '"DM Serif Display", serif' }}
                    >
                      ₹40,000
                    </h3>
                    <p className="mb-2 text-[10px] text-white/40">
                      Rolls over if unclaimed
                    </p>
                    <div className="flex items-center gap-[5px] rounded-[7px] bg-white/10 px-2 py-[5px] text-[10px] text-white/60">
                      <span className="h-[5px] w-[5px] rounded-full bg-[#7de0aa]" />
                      {format(drawDate, 'd MMMM yyyy')}
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-[16px] bg-[var(--dashboard-bg)] p-[14px]"
                  style={{ boxShadow: raisedSm }}
                >
                  <DrawHistoryList results={drawResults} />
                </div>

                <div
                  className="rounded-[16px] bg-[var(--dashboard-bg)] p-[14px]"
                  style={{ boxShadow: raisedSm }}
                >
                  <ScoreSummary
                    scores={scores}
                    isSubscriptionActive={isActive}
                  />
                </div>

                <div
                  className="rounded-[16px] bg-[var(--dashboard-bg)] p-[14px]"
                  style={{ boxShadow: raisedSm }}
                >
                  <CharityWidget
                    charity={charity}
                    pct={charityPct}
                    planType={subscription?.plan_type ?? 'monthly'}
                  />
                  <div
                    className="mt-2 inline-flex items-center gap-[7px] rounded-[20px] px-3 py-1 text-[10px] font-medium text-[#1a5e38]"
                    style={{
                      background: 'var(--dashboard-bg)',
                      boxShadow: insetShadow,
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1a5e38]" />
                    {(subscription?.plan_type === 'yearly'
                      ? 'Yearly'
                      : 'Monthly') +
                      ' · ' +
                      (isActive
                        ? 'Active'
                        : subscription?.status?.replace('_', ' ') ||
                          'Inactive')}
                  </div>
                </div>

                <WinningsWidget
                  totalPaid={totalWinnings}
                  pendingResult={pending}
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--dashboard-bg)] to-transparent pointer-events-none z-10" />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeaderIcon({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--dashboard-bg)] text-[#6a7a6a] transition"
      style={{ boxShadow: raisedXs }}
    >
      {icon}
    </Link>
  );
}

function HeroButton({
  href,
  label,
  variant,
}: {
  href: string;
  label: string;
  variant: 'solid' | 'ghost';
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-[6px] rounded-[10px] px-[14px] py-2 text-xs font-medium transition ${
        variant === 'solid'
          ? 'bg-white text-[#1a5e38]'
          : 'border border-white/20 bg-white/10 text-white/85'
      }`}
      style={
        variant === 'solid'
          ? { boxShadow: '2px 2px 6px rgba(0,0,0,0.15)' }
          : undefined
      }
    >
      {label}
    </Link>
  );
}

function StatCard({
  label,
  value,
  change,
  lineColor,
  icon,
}: {
  label: string;
  value: string;
  change: string;
  lineColor: string;
  icon: 'star' | 'drop' | 'calendar';
}) {
  const linePoints =
    icon === 'star'
      ? '0,20 20,16 40,18 60,10 80,12 100,6 120,8'
      : icon === 'drop'
        ? '0,18 20,14 40,16 60,12 80,14 100,8 120,10'
        : '0,22 20,20 40,20 60,18 80,18 100,16 120,16';

  return (
    <div
      className="rounded-[16px] bg-[var(--dashboard-bg)] px-4 py-[14px]"
      style={{ boxShadow: raisedSm }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[10px] text-[#6a7a6a]">{label}</div>
        <div
          className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[var(--dashboard-bg)]"
          style={{ boxShadow: raisedXs }}
        >
          <span className="text-[13px]" style={{ color: lineColor }}>
            {icon === 'star' ? '★' : icon === 'drop' ? '◔' : '▣'}
          </span>
        </div>
      </div>
      <svg width="100%" height="26" viewBox="0 0 120 26">
        <polyline
          points={linePoints}
          fill="none"
          stroke={lineColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
      </svg>
      <div className="mb-1 text-[20px] font-semibold tracking-[-0.5px] text-[#2a3a2a]">
        {value}
      </div>
      <div className="text-[10px] text-[#1a5e38]">{change}</div>
    </div>
  );
}

function StatusBanner({
  subscription,
}: {
  subscription: DashboardSubscription;
}) {
  if (subscription?.status === 'past_due') {
    return (
      <div className="mb-4 rounded-[16px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Your payment failed.{' '}
        <Link href="/account" className="font-semibold hover:underline">
          Update your payment method
        </Link>{' '}
        to stay in draws.
      </div>
    );
  }

  if (
    !subscription ||
    subscription.status === 'inactive' ||
    subscription.status === 'cancelled'
  ) {
    return (
      <div className="mb-4 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Your subscription is inactive.{' '}
        <Link href="/account" className="font-semibold hover:underline">
          Resubscribe
        </Link>{' '}
        to enter next month&apos;s draw.
      </div>
    );
  }

  return null;
}

function getNextDrawDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

function normalizeCharity(value: unknown): DashboardCharity {
  if (!value) return null;
  if (Array.isArray(value)) return (value[0] as DashboardCharity) ?? null;
  return value as DashboardCharity;
}

function normalizeDrawResult(value: Record<string, unknown>): DrawResult {
  return {
    id: String(value.id),
    match_category:
      (value.match_category as DrawResult['match_category']) ?? null,
    prize_amount:
      value.prize_amount == null ? null : Number(value.prize_amount),
    payment_status:
      (value.payment_status as DrawResult['payment_status']) ?? null,
    draw: normalizeDraw(value.draw),
  };
}

function normalizeDraw(value: unknown) {
  if (!value) return null;
  const draw = Array.isArray(value) ? value[0] : value;
  if (!draw || typeof draw !== 'object') return null;
  return {
    id: String((draw as Record<string, unknown>).id ?? ''),
    month: String((draw as Record<string, unknown>).month ?? ''),
    status: ((draw as Record<string, unknown>).status as string | null) ?? null,
    draw_number: Number((draw as Record<string, unknown>).draw_number ?? 0),
  };
}

function normalizePending(
  value: Record<string, unknown> | null
): PendingWinnings {
  if (!value) return null;
  const draw = Array.isArray(value.draw) ? value.draw[0] : value.draw;
  return {
    id: String(value.id),
    prize_amount: Number(value.prize_amount ?? 0),
    match_category:
      (value.match_category as '3-match' | '4-match' | '5-match') ?? '3-match',
    draw:
      draw && typeof draw === 'object'
        ? { month: String((draw as Record<string, unknown>).month ?? '') }
        : null,
  };
}

function buildScoreSeries(scores: Score[]) {
  const values = scores
    .slice(0, 6)
    .map((score) => score.value)
    .reverse();
  return values.length ? values : [27, 28, 30, 35, 30, 32];
}

function buildChartPath(values: number[]) {
  return values
    .map((value, index) => {
      const x = 10 + index * (360 / Math.max(values.length - 1, 1));
      const y = getChartY(value, values);
      return `${index === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');
}

function buildAreaPath(values: number[]) {
  const line = buildChartPath(values);
  const lastX =
    10 + (values.length - 1) * (360 / Math.max(values.length - 1, 1));
  return `${line} L${lastX},72 L10,72 Z`;
}

function getChartY(value: number, values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  return 54 - ((value - min) / range) * 40;
}
