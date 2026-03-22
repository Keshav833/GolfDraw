'use client'

import { useState } from 'react'
import { 
  Search, 
  MoreHorizontal, 
  User as UserIcon,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface User {
  id: string
  full_name: string | null
  email: string
  subscription_status: string
  charity_contribution_pct: number
  created_at: string
  charity_name: string | null
  plan_type: string | null
  current_period_end: string | null
  sub_status: string | null
  score_count: number
  total_won: number
}

interface UserTableProps {
  users: User[]
  total: number
  page: number
  onPageChange: (page: number) => void
  onSearch: (search: string) => void
  onStatusFilter: (status: string) => void
  onViewDetails: (user: User) => void
  onCancelSubscription: (user: User) => void
}

export default function UserTable({
  users,
  total,
  page,
  onPageChange,
  onSearch,
  onStatusFilter,
  onViewDetails,
  onCancelSubscription
}: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeStatus, setActiveStatus] = useState('all')

  const statusFilters = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'past_due', label: 'Past Due' },
    { id: 'inactive', label: 'Inactive' },
    { id: 'cancelled', label: 'Cancelled' },
  ]

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setActiveStatus(f.id)
                onStatusFilter(f.id)
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeStatus === f.id
                  ? 'bg-[var(--bg)] shadow-[var(--inset-sm)] text-[var(--green-700)]'
                  : 'bg-[var(--bg)] shadow-[var(--raised-sm)] text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg)] shadow-[var(--inset-sm)] text-sm focus:outline-none placeholder:text-[var(--text-muted)]/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(searchTerm)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg)] rounded-3xl p-1 shadow-[var(--raised-md)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--sd)]">
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Plan</th>
                <th className="px-6 py-4 font-semibold">Charity</th>
                <th className="px-6 py-4 font-semibold text-center">Scores</th>
                <th className="px-6 py-4 font-semibold text-center">Total Won</th>
                <th className="px-6 py-4 font-semibold">Joined</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--sd)]/50">
              {users.map((user) => (
                <tr 
                  key={user.id}
                  className="group hover:bg-[var(--sd)]/10 transition-colors cursor-pointer"
                  onClick={() => onViewDetails(user)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[var(--bg)] shadow-[var(--raised-sm)] text-[var(--green-700)] font-bold text-xs">
                        {user.full_name?.substring(0, 2).toUpperCase() || user.email.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[var(--text)]">{user.full_name || 'No Name'}</span>
                        <span className="text-[11px] text-[var(--text-muted)]">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.subscription_status === 'active' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : user.subscription_status === 'past_due'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {user.subscription_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.plan_type ? (
                      <span className="text-xs font-medium px-2 py-1 rounded-lg bg-[var(--bg)] shadow-[var(--inset-sm)] text-[var(--text-muted)]">
                        {user.plan_type}
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)]/50">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div className="flex flex-col">
                      <span className="font-medium">{user.charity_name || 'None'}</span>
                      <span className="text-[var(--text-muted)]">{user.charity_contribution_pct}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold">{user.score_count}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold text-[var(--green-700)]">£{user.total_won.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-[var(--text-muted)]">
                    {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => onViewDetails(user)}
                        className="p-2 rounded-lg bg-[var(--bg)] shadow-[var(--raised-sm)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
                      >
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-[var(--sd)]">
          <p className="text-xs text-[var(--text-muted)]">
            Showing <span className="font-semibold">{Math.min(total, (page-1)*20 + 1)}-{Math.min(total, page*20)}</span> of <span className="font-semibold">{total}</span> users
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="p-2 rounded-lg bg-[var(--bg)] shadow-[var(--raised-sm)] disabled:opacity-50 text-[var(--text-muted)]"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="p-2 rounded-lg bg-[var(--bg)] shadow-[var(--raised-sm)] disabled:opacity-50 text-[var(--text-muted)]"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
