'use client'

import { useState, useEffect } from 'react'

interface IncomingRequest {
  id: string
  from_user_id: string
  from_username: string
  from_uscf_id: string
  created_at: string
}

interface OutgoingRequest {
  id: string
  to_user_id: string
  to_username: string
  to_uscf_id: string
  created_at: string
}

interface FriendRequestsProps {
  onFriendAccepted?: () => void
}

export function FriendRequests({ onFriendAccepted }: FriendRequestsProps) {
  const [incoming, setIncoming] = useState<IncomingRequest[]>([])
  const [outgoing, setOutgoing] = useState<OutgoingRequest[]>([])
  const [newRequestUscfId, setNewRequestUscfId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      const res = await fetch('/api/friends/requests')
      const data = await res.json()
      if (res.ok) {
        setIncoming(data.incoming || [])
        setOutgoing(data.outgoing || [])
      }
    } catch (err) {
      console.error('Failed to load friend requests:', err)
    }
  }

  const sendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uscfId: newRequestUscfId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to send friend request')
        setLoading(false)
        return
      }

      setSuccess('Friend request sent!')
      setNewRequestUscfId('')
      await loadRequests()
      setLoading(false)
    } catch (err) {
      setError('Failed to send friend request')
      setLoading(false)
    }
  }

  const respondToRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      const res = await fetch('/api/friends/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action }),
      })

      if (res.ok) {
        await loadRequests()
        if (action === 'accept') {
          onFriendAccepted?.()
        }
      }
    } catch (err) {
      console.error('Failed to respond to request:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Send Friend Request</h2>
        <form onSubmit={sendRequest} className="space-y-4">
          <div>
            <label htmlFor="uscfId" className="block text-sm font-medium text-slate-300 mb-2">
              Friend's USCF ID
            </label>
            <input
              id="uscfId"
              type="text"
              value={newRequestUscfId}
              onChange={(e) => setNewRequestUscfId(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter USCF ID"
              required
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-2 rounded-lg text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Sending...' : 'Send Request'}
          </button>
        </form>
      </div>

      {incoming.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">Incoming Requests</h2>
          <div className="space-y-3">
            {incoming.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between bg-slate-700 p-4 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{req.from_username}</p>
                  <p className="text-slate-400 text-sm">USCF ID: {req.from_uscf_id}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => respondToRequest(req.id, 'accept')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respondToRequest(req.id, 'decline')}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {outgoing.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">Pending Requests</h2>
          <div className="space-y-3">
            {outgoing.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between bg-slate-700 p-4 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{req.to_username}</p>
                  <p className="text-slate-400 text-sm">USCF ID: {req.to_uscf_id}</p>
                </div>
                <div className="text-slate-400 text-sm">Pending...</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
