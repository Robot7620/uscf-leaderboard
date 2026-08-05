'use client'

import type { Player } from '@/types'

interface LeaderboardProps {
  players: Player[]
  onRemove: (uscfId: string) => void
  title?: string
}

export function Leaderboard({ players, onRemove, title = 'Leaderboard' }: LeaderboardProps) {
  const sortedPlayers = [...players].sort((a, b) => {
    const ratingA = a.regular || a.quick || a.blitz || 0
    const ratingB = b.regular || b.quick || b.blitz || 0
    return ratingB - ratingA
  })

  return (
    <div className="bg-slate-800 rounded-xl shadow-xl overflow-hidden">
      <div className="px-6 py-4 bg-slate-900 border-b border-slate-700">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Player
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Regular
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Quick
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Blitz
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                State
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {sortedPlayers.map((player, index) => (
              <tr key={player.id} className="hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-2xl font-bold text-slate-500">
                    #{index + 1}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-semibold text-white">{player.name}</div>
                    <div className="text-sm text-slate-400">ID: {player.id}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-lg font-semibold">
                    {player.regular || '-'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-lg font-semibold">
                    {player.quick || '-'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-lg font-semibold">
                    {player.blitz || '-'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                  {player.state || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => onRemove(player.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
