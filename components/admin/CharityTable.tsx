'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Globe, Heart, Users, Check, X } from 'lucide-react'
import { toast } from 'sonner'

interface Charity {
  id: string
  name: string
  description: string | null
  category: string
  country: string
  website: string | null
  is_active: boolean
  member_count: number
}

interface CharityTableProps {
  charities: Charity[]
  onEdit: (charity: Charity) => void
  onAdd: () => void
  onRefresh: () => void
}

export default function CharityTable({ charities, onEdit, onAdd, onRefresh }: CharityTableProps) {
  const [toggling, setToggling] = useState<string | null>(null)

  const handleToggleActive = async (charity: Charity) => {
    setToggling(charity.id)
    try {
      const res = await fetch(`/api/admin/charities/${charity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !charity.is_active })
      })

      if (res.ok) {
        toast.success(`Charity ${!charity.is_active ? 'activated' : 'deactivated'}`)
        onRefresh()
      } else {
        const json = await res.json()
        toast.error(json.error?.message || 'Failed to update status')
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setToggling(null)
    }
  }

  const handleDelete = async (charity: Charity) => {
    if (!confirm(`Are you sure you want to delete ${charity.name}?`)) return

    try {
      const res = await fetch(`/api/admin/charities/${charity.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('Charity deleted')
        onRefresh()
      } else {
        const json = await res.json()
        toast.error(json.error?.message || 'Failed to delete charity')
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-serif">Charity Directory</h2>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg)] shadow-[var(--raised-sm)] hover:shadow-[var(--inset-sm)] text-sm font-bold text-[var(--green-700)] transition-all"
        >
          <Plus size={18} />
          Add Charity
        </button>
      </div>

      <div className="bg-[var(--bg)] rounded-3xl p-1 shadow-[var(--raised-md)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--sd)]">
                <th className="px-6 py-4 font-semibold">Charity</th>
                <th className="px-6 py-4 font-semibold">Country</th>
                <th className="px-6 py-4 font-semibold text-center">Members</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--sd)]/50">
              {charities.map((charity) => (
                <tr key={charity.id} className="group hover:bg-[var(--sd)]/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--bg)] shadow-[var(--raised-sm)] text-[var(--green-700)]">
                        <Heart size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{charity.name}</span>
                        <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-tight">{charity.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-[var(--text-muted)]">{charity.country}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--bg)] shadow-[var(--inset-sm)] text-[var(--green-700)] text-xs font-bold">
                      <Users size={12} />
                      {charity.member_count}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      disabled={toggling === charity.id}
                      onClick={() => handleToggleActive(charity)}
                      className={`relative w-12 h-6 rounded-full transition-all duration-300 shadow-[var(--inset-sm)] ${
                        charity.is_active ? 'bg-emerald-100' : 'bg-slate-200'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-all duration-300 shadow-[var(--raised-sm)] ${
                        charity.is_active ? 'translate-x-6 bg-emerald-600' : 'translate-x-0 bg-slate-400'
                      }`} />
                    </button>
                    <p className="text-[9px] mt-1 text-[var(--text-muted)] uppercase font-bold tracking-widest">
                      {charity.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      {charity.website && (
                        <a 
                          href={charity.website} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-[var(--bg)] shadow-[var(--raised-sm)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
                        >
                          <Globe size={16} />
                        </a>
                      )}
                      <button 
                        onClick={() => onEdit(charity)}
                        className="p-2 rounded-lg bg-[var(--bg)] shadow-[var(--raised-sm)] text-[var(--text-muted)] hover:text-[var(--green-700)] transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(charity)}
                        className="p-2 rounded-lg bg-[var(--bg)] shadow-[var(--raised-sm)] text-red-400 hover:text-red-600 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="px-4 py-3 rounded-2xl bg-amber-50 border border-amber-100 text-[11px] text-amber-700 italic">
        <strong>Note:</strong> Existing members are unaffected by deactivation. New members cannot select an inactive charity.
      </div>
    </div>
  )
}
