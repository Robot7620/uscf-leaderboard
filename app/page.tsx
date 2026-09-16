'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Leaderboard } from '@/components/Leaderboard'
import { AddFriend } from '@/components/AddFriend'
import { FriendRequests } from '@/components/FriendRequests'
import type { Player } from '@/types'

interface Friend {
  id: string
  uscf_id: string
  username: string
}

interface WatchlistEntry {
  uscf_id: string
}

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [friendsPlayers, setFriendsPlayers] = useState<Player[]>([])
  const [watchlistPlayers, setWatchlistPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [showRequests, setShowRequests] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()

      if (!data.user) {
        router.push('/login')
        return
      }

      setUser(data.user)
      setAuthLoading(false)
      loadData()
    } catch (err) {
      router.push('/login')
    }
  }

  const loadData = async () => {
    setLoading(true)
    await Promise.all([loadFriends(), loadWatchlist()])
    setLoading(false)
  }

  const loadFriends = async () => {
    try {
      const res = await fetch('/api/friends')
      const data = await res.json()

      if (res.ok && data.friends) {
        const uscfIds = data.friends.map((f: Friend) => f.uscf_id)
        const playerData = await Promise.all(
          uscfIds.map((id: string) => fetch(`/api/player/${id}`).then(r => r.json()))
        )
        setFriendsPlayers(playerData.filter(p => p.id))
      }
    } catch (err) {
      console.error('Failed to load friends:', err)
    }
  }

  const loadWatchlist = async () => {
    try {
      const res = await fetch('/api/watchlist')
      const data = await res.json()

      if (res.ok && data.watchlist) {
        const uscfIds = data.watchlist.map((w: WatchlistEntry) => w.uscf_id)
        const playerData = await Promise.all(
          uscfIds.map((id: string) => fetch(`/api/player/${id}`).then(r => r.json()))
        )
        setWatchlistPlayers(playerData.filter(p => p.id))
      }
    } catch (err) {
      console.error('Failed to load watchlist:', err)
    }
  }

  const addToWatchlist = async (uscfId: string) => {
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uscfId }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Failed to add to watchlist')
        return
      }

      await loadWatchlist()
    } catch (err) {
      alert('Failed to add to watchlist')
    }
  }

  const removeFromWatchlist = async (uscfId: string) => {
    try {
      await fetch(`/api/watchlist?uscfId=${uscfId}`, {
        method: 'DELETE',
      })
      await loadWatchlist()
    } catch (err) {
      console.error('Failed to remove from watchlist:', err)
    }
  }

  const removeFriend = async (friendId: string) => {
    if (!confirm('Remove this friend? This will remove the friendship for both of you.')) {
      return
    }

    try {
      await fetch(`/api/friends/${friendId}`, {
        method: 'DELETE',
      })
      await loadFriends()
    } catch (err) {
      console.error('Failed to remove friend:', err)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              USCF Leaderboard
            </h1>
            <p className="text-slate-400">
              Welcome back, {user?.username}! (USCF ID: {user?.uscfId})
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowRequests(!showRequests)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {showRequests ? 'Hide' : 'Show'} Friend Requests
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {showRequests && (
          <div className="mb-8">
            <FriendRequests />
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-400">Loading players...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">Friends</h2>
              {friendsPlayers.length === 0 ? (
                <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
                  <p className="text-slate-400">No friends yet. Send a friend request to get started!</p>
                </div>
              ) : (
                <Leaderboard
                  players={friendsPlayers}
                  onRemove={removeFriend}
                  title="Friends Leaderboard"
                />
              )}
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-4">Watchlist</h2>
              <AddFriend onAdd={addToWatchlist} />
              {watchlistPlayers.length === 0 ? (
                <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700 mt-6">
                  <p className="text-slate-400">Your watchlist is empty. Add a USCF ID above to track players!</p>
                </div>
              ) : (
                <div className="mt-6">
                  <Leaderboard
                    players={watchlistPlayers}
                    onRemove={removeFromWatchlist}
                    title="Watchlist"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
