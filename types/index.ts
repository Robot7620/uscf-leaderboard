export interface Player {
  id: string
  name: string
  regular?: number
  quick?: number
  blitz?: number
  state?: string
  lastChange?: string
  lastEvent?: string
  overallRank?: string
  recentGames?: Game[]
}

export interface Game {
  date: string
  event: string
  opponent: string
  result: 'W' | 'L' | 'D'
  rating: number
  color: 'W' | 'B'
}

export interface USCFPlayerData {
  name: string
  id: string
  state?: string
  rating?: {
    regular?: number
    quick?: number
    blitz?: number
  }
  last_change_date?: string
}
