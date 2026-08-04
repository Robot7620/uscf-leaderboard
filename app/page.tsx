'use client'

import { useState, useEffect } from 'react'
import { Leaderboard } from '@/components/Leaderboard'
import { AddFriend } from '@/components/AddFriend'
import { ActivityFeed } from '@/components/ActivityFeed'
import type { Player } from '@/types'

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('uscf-friends')
    if (stored) {
      const ids = JSON.parse(stored)
      loadPlayers(ids)
    } else {
      setLoading(false)
    }
  }, [])

  const loadPlayers = async (ids: string[]) => {
    setLoading(true)
    const playerData = await Promise.all(
      ids.map(id => fetch(`/api/player/${id}`).then(r => r.json()))
    )
    setPlayers(playerData.filter(p => p.id))
    setLoading(false)
  }

  const addFriend = async (uscfId: string) => {
    const stored = localStorage.getItem('uscf-friends')
    const ids = stored ? JSON.parse(stored) : []

    if (ids.includes(uscfId)) {
      alert('Player already added!')
      return
    }

    const newIds = [...ids, uscfId]
    localStorage.setItem('uscf-friends', JSON.stringify(newIds))
    await loadPlayers(newIds)
  }

  const removeFriend = async (uscfId: string) => {
    const stored = localStorage.getItem('uscf-friends')
    const ids = stored ? JSON.parse(stored) : []
    const newIds = ids.filter((id: string) => id !== uscfId)
    localStorage.setItem('uscf-friends', JSON.stringify(newIds))
    await loadPlayers(newIds)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            USCF Leaderboard
          </h1>
          <p className="text-slate-400">Track your chess friends' ratings and activity</p>
        </header>

        <AddFriend onAdd={addFriend} />

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-400">Loading players...</p>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No friends added yet. Add a USCF ID to get started!</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Leaderboard players={players} onRemove={removeFriend} />
            </div>
            <div>
              <ActivityFeed players={players} />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
