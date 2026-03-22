import { Users, PoundSterling, Heart, Trophy } from 'lucide-react';

interface StatCardsProps {
  data: {
    subscriptions: {
      active: number;
    };
    mrr: number;
    charity_total: number;
    prizes_total: number;
  };
}

export default function StatCards({ data }: StatCardsProps) {
  const stats = [
    {
      label: 'Active Subscribers',
      value: data.subscriptions.active.toString(),
      subtext: 'Paying members',
      icon: <Users className="h-6 w-6 text-[var(--green-700)]" />,
    },
    {
      label: 'Monthly Recurring Revenue',
      value: `£${data.mrr.toFixed(2)}`,
      subtext: `${data.subscriptions.active} active plans`,
      icon: <PoundSterling className="h-6 w-6 text-[var(--green-700)]" />,
    },
    {
      label: 'Total Charity Donated',
      value: `£${data.charity_total.toFixed(2)}`,
      subtext: 'Across all members',
      icon: <Heart className="h-6 w-6 text-rose-500" />,
    },
    {
      label: 'Total Prizes Paid',
      value: `£${data.prizes_total.toFixed(2)}`,
      subtext: 'Across all draws',
      icon: <Trophy className="h-6 w-6 text-amber-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-[var(--bg)] p-6 rounded-2xl shadow-[var(--raised-md)]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-[var(--bg)] shadow-[var(--raised-sm)]">
              {stat.icon}
            </div>
          </div>
          <p className="text-sm font-medium text-[var(--text-muted)] mb-1">
            {stat.label}
          </p>
          <h3 className="text-2xl font-bold text-[var(--text)] mb-1">
            {stat.value}
          </h3>
          <p className="text-xs text-[var(--text-muted)]">{stat.subtext}</p>
        </div>
      ))}
    </div>
  );
}
