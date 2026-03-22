'use client'

import { useState, useEffect } from 'react'
import { Calendar, Info, RefreshCw, Save } from 'lucide-react'
import { format, addMonths } from 'date-fns'

interface DrawConfigFormProps {
  draw?: any
  onSave: (draw: any) => void
}

export default function DrawConfigForm({ draw, onSave }: DrawConfigFormProps) {
  const [month, setMonth] = useState(draw?.month || format(addMonths(new Date(), 1), 'yyyy-MM'))
  const [mode, setMode] = useState<'random' | 'algorithmic'>(draw?.mode || 'random')
  const [prizePoolOverride, setPrizePoolOverride] = useState<number>(draw?.prize_pool_total || 0)
  const [prepData, setPrepData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchPrep() {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/draws/prepare?month=${month}`)
        const json = await res.json()
        if (json.data) {
          setPrepData(json.data)
          if (!draw) setPrizePoolOverride(json.data.total)
        }
      } catch (err) {
        console.error('Fetch prep error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPrep()
  }, [month, draw])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/draws/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month,
          mode,
          prize_pool_total: prizePoolOverride
        })
      })
      const json = await res.json()
      if (json.data) {
        onSave(json.data)
      }
    } catch (err) {
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const isPublished = draw?.status === 'published'

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Month Picker */}
      <section className="space-y-3">
        <label className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
          <Calendar size={16} />
          Target Month
        </label>
        <select 
          disabled={!!draw || isPublished}
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-[var(--bg)] shadow-[var(--inset-sm)] focus:outline-none text-[var(--text)] disabled:opacity-50"
        >
          {Array.from({ length: 6 }).map((_, i) => {
            const d = addMonths(new Date(), i)
            const val = format(d, 'yyyy-MM')
            return <option key={val} value={val}>{format(d, 'MMMM yyyy')}</option>
          })}
        </select>
      </section>

      {/* Mode Toggle */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
            Draw Mode
          </label>
          <div className="flex items-center gap-2 group cursor-help">
            <Info size={14} className="text-[var(--text-muted)]" />
            <span className="text-[10px] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {mode === 'random' ? "Fair lottery — equal chance" : "Score-weighted — average-centric odds"}
            </span>
          </div>
        </div>
        <div 
          className="p-1 rounded-2xl bg-[var(--bg)] shadow-[var(--inset-sm)] flex"
        >
          <button
            disabled={isPublished}
            onClick={() => setMode('random')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              mode === 'random' 
                ? 'bg-[var(--bg)] shadow-[var(--raised-sm)] text-[var(--green-700)]' 
                : 'text-[var(--text-muted)]'
            }`}
          >
            Random
          </button>
          <button
            disabled={isPublished}
            onClick={() => setMode('algorithmic')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              mode === 'algorithmic' 
                ? 'bg-[var(--bg)] shadow-[var(--raised-sm)] text-[var(--green-700)]' 
                : 'text-[var(--text-muted)]'
            }`}
          >
            Algorithmic
          </button>
        </div>
      </section>

      {/* Prize Pool */}
      <section className="space-y-4">
        <label className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          Prize Pool
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[var(--bg)] shadow-[var(--raised-sm)]">
            <p className="text-[10px] text-[var(--text-muted)] uppercase mb-1">Monthly Subs</p>
            <p className="text-lg font-bold">£{prepData?.calculated?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--bg)] shadow-[var(--raised-sm)] text-amber-600">
            <p className="text-[10px] uppercase mb-1">Rollover</p>
            <p className="text-lg font-bold">£{prepData?.rollover?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
        
        <div className="p-6 rounded-2xl bg-[var(--bg)] shadow-[var(--inset-sm)]">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold">Total Prize Pool</span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--green-700)] font-bold">£</span>
              <input 
                type="number"
                disabled={isPublished}
                className="w-32 pl-7 pr-3 py-2 rounded-lg bg-[var(--bg)] shadow-[var(--raised-sm)] focus:outline-none text-right font-bold text-[var(--green-700)] disabled:opacity-50"
                value={prizePoolOverride}
                onChange={(e) => setPrizePoolOverride(Number(e.target.value))}
              />
            </div>
          </div>
          
          <div className="space-y-2 border-t border-[var(--sd)] pt-4">
            <PrizeSplit label="5-match (40%)" amount={prizePoolOverride * 0.4} />
            <PrizeSplit label="4-match (35%)" amount={prizePoolOverride * 0.35} />
            <PrizeSplit label="3-match (25%)" amount={prizePoolOverride * 0.25} />
          </div>
        </div>
      </section>

      {/* Eligible Users */}
      <section className="p-5 rounded-2xl bg-[var(--bg)] shadow-[var(--raised-sm)] flex items-center justify-between">
        <div>
          <p className="text-sm font-bold">{prepData?.eligible_count || 0} Eligible Users</p>
          <p className="text-[10px] text-[var(--text-muted)]">Active subscribers with at least 1 score</p>
        </div>
        {loading && <RefreshCw className="animate-spin text-[var(--green-700)]" size={18} />}
      </section>

      {/* Action */}
      {!isPublished && (
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="w-full py-4 rounded-2xl bg-[var(--bg)] shadow-[var(--raised-md)] hover:shadow-[var(--inset-sm)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-bold text-[var(--green-700)]"
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      )}
    </div>
  )
}

function PrizeSplit({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="font-semibold">£{amount.toFixed(2)}</span>
    </div>
  )
}
