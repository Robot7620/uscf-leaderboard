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

  // `data: ChessToolsUscfPlayer = ...` would only be a type assertion, not
  // runtime validation - the API is a third party we don't control, so a
  // non-string or blank `name` field must be treated as "no player found"
  // rather than trusted into formatName() (which would throw on a non-
  // string, or silently produce an empty display name on whitespace).
  const raw: unknown = await response.json()
  const name = raw && typeof raw === 'object' ? (raw as ChessToolsUscfPlayer).name : undefined
  if (typeof name !== 'string' || !name.trim()) {
    return null
  }

  return {
    id,
    name: formatName(name),
    regular: (raw as ChessToolsUscfPlayer).rating,
  }
}

// ChessTools returns names as "LAST,FIRST MIDDLE" - reformat to "First Middle
// Last". Some records carry a suffix after a second comma (e.g.
// "GARCIA,JUAN,JR"), which must be appended after the last name rather than
// silently dropped.
export function formatName(name: string): string {
  const parts = name.split(',').map((part) => part.trim())
  const [last, first, ...suffixes] = parts
  // Only a bare name with no comma at all skips reordering. Branching on
  // whether `first` happens to be empty (rather than on comma count) would
  // silently drop a suffix again whenever the first-name field is blank,
  // e.g. "SMITH,,JR".
  if (parts.length === 1) {
    return last
  }
  return [first, last, ...suffixes].filter(Boolean).join(' ')
}
