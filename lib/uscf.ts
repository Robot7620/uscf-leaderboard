import type { Player } from '@/types'

interface ChessToolsUscfPlayer {
  name: string
  rating: number
}

// Look up a player's USCF rating via the ChessTools ratings API
// (https://api.chesstools.org), which mirrors USCF's periodic bulk
// ratings list. uschess.org itself no longer allows automated lookups
// (it added a Cloudflare bot challenge that blocks all non-browser
// requests), so this replaces the previous direct-scrape approach.
// Returns null if no player exists for the given ID.
export async function fetchUscfPlayer(id: string): Promise<Player | null> {
  const response = await fetch(
    `https://api.chesstools.org/uscf/${encodeURIComponent(id)}`,
    {
      // Cache each player for 1 hour; the upstream list itself only
      // refreshes about once a day.
      next: { revalidate: 3600 }
    }
  )

  if (!response.ok) {
    return null
  }

  const data: ChessToolsUscfPlayer = await response.json()
  if (!data.name) {
    return null
  }

  return {
    id,
    name: formatName(data.name),
    regular: data.rating,
  }
}

// ChessTools returns names as "LAST,FIRST MIDDLE" - reformat to "First Middle Last"
function formatName(name: string): string {
  const [last, rest] = name.split(',')
  if (!rest) {
    return name.trim()
  }
  return `${rest.trim()} ${last.trim()}`
}
