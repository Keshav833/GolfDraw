'use client'

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'

interface SubscriptionChartProps {
  data: Array<{
    month: string
    active: number
    cancelled: number
  }>
}

export default function SubscriptionChart({ data }: SubscriptionChartProps) {
  // Format month labels (e.g. 2026-03 -> Mar)
  const formattedData = data.map(d => {
    const [year, month] = d.month.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return {
      ...d,
      name: date.toLocaleString('default', { month: 'short' })
    }
  })

  return (
    <div className="bg-[var(--bg)] p-6 rounded-2xl shadow-[var(--raised-md)]">
      <h3 className="text-lg font-serif mb-6">Subscription trend — last 12 months</h3>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1a5e38" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#1a5e38" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e24b4a" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#e24b4a" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--sd)" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--bg)', 
                border: 'none', 
                borderRadius: '12px',
                boxShadow: 'var(--raised-sm)',
                fontSize: '12px'
              }}
              cursor={{ stroke: 'var(--sd)', strokeWidth: 1 }}
            />
            <Legend verticalAlign="top" align="right" iconType="circle" />
            <Area 
              type="monotone" 
              dataKey="active" 
              stroke="#1a5e38" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorActive)" 
            />
            <Area 
              type="monotone" 
              dataKey="cancelled" 
              stroke="#e24b4a" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorCancelled)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
