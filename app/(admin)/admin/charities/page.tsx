'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import CharityTable from '@/components/admin/CharityTable'
import CharityForm from '@/components/admin/CharityForm'
import { Loader2 } from 'lucide-react'

export default function CharitiesPage() {
  const queryClient = useQueryClient()
  const [selectedCharity, setSelectedCharity] = useState<any | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const { data: charities, isLoading, error } = useQuery({
    queryKey: ['admin-charities'],
    queryFn: async () => {
      const res = await fetch('/api/admin/charities')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch charities')
      return json.data.charities
    }
  })

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h1 className="text-3xl font-serif text-[var(--text)] mb-2">Charity Management</h1>
        <p className="text-sm text-[var(--text-muted)]">Manage the directory of eligible charities for member contributions.</p>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-[var(--green-700)]" size={40} />
        </div>
      ) : error ? (
        <div className="p-10 text-center text-red-500 font-medium">Error: {(error as Error).message}</div>
      ) : (
        <CharityTable 
          charities={charities || []}
          onEdit={(charity) => {
            setSelectedCharity(charity)
            setIsAdding(true)
          }}
          onAdd={() => {
            setSelectedCharity(null)
            setIsAdding(true)
          }}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['admin-charities'] })}
        />
      )}

      {isAdding && (
        <CharityForm 
          charity={selectedCharity}
          onSave={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-charities'] })
            setIsAdding(false)
          }}
          onClose={() => setIsAdding(false)}
        />
      )}
    </div>
  )
}
