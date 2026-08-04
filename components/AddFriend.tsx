'use client'

import { useState } from 'react'

interface AddFriendProps {
  onAdd: (uscfId: string) => void
}

export function AddFriend({ onAdd }: AddFriendProps) {
  const [uscfId, setUscfId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uscfId.trim()) return

    setLoading(true)
    await onAdd(uscfId.trim())
    setUscfId('')
    setLoading(false)
  }

  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
        <input
          type="text"
          value={uscfId}
          onChange={(e) => setUscfId(e.target.value)}
          placeholder="Enter USCF ID (e.g., 12345678)"
          className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !uscfId.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
        >
          {loading ? 'Adding...' : 'Add Friend'}
        </button>
      </form>
    </div>
  )
}
