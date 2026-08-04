'use client'

import type { Player } from '@/types'

interface ActivityFeedProps {
  players: Player[]
}

export function ActivityFeed({ players }: ActivityFeedProps) {
  const playersWithActivity = players
    .filter(p => p.lastChange)
    .sort((a, b) => {
      const dateA = a.lastChange ? new Date(a.lastChange) : new Date(0)
      const dateB = b.lastChange ? new Date(b.lastChange) : new Date(0)
      return dateB.getTime() - dateA.getTime()
    })

  return (
    <div className="bg-slate-800 rounded-xl shadow-xl overflow-hidden">
      <div className="px-6 py-4 bg-slate-900 border-b border-slate-700">
        <h2 className="text-xl font-bold">Recent Activity</h2>
      </div>

      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {playersWithActivity.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No recent activity</p>
        ) : (
          playersWithActivity.map((player) => (
            <div
              key={player.id}
              className="bg-slate-900/50 rounded-lg p-4 border border-slate-700"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-white">{player.name}</h3>
                  <p className="text-sm text-slate-400">USCF ID: {player.id}</p>
                </div>
                {player.lastChange && (
                  <span className="text-xs text-slate-500">
                    {new Date(player.lastChange).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3">
                {player.regular && (
                  <div className="bg-slate-800 rounded p-2 text-center">
                    <div className="text-xs text-slate-400">Regular</div>
                    <div className="font-bold text-blue-400">{player.regular}</div>
                  </div>
                )}
                {player.quick && (
                  <div className="bg-slate-800 rounded p-2 text-center">
                    <div className="text-xs text-slate-400">Quick</div>
                    <div className="font-bold text-green-400">{player.quick}</div>
                  </div>
                )}
                {player.blitz && (
                  <div className="bg-slate-800 rounded p-2 text-center">
                    <div className="text-xs text-slate-400">Blitz</div>
                    <div className="font-bold text-purple-400">{player.blitz}</div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
