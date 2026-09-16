export interface Player {
  id: string
  name: string
  regular?: number
}

export interface User {
  id: string
  username: string
  uscf_id: string
  uscf_verified: boolean
  created_at: string
}

export interface FriendRequest {
  id: string
  from_user_id: string
  to_user_id: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  from_user?: User
  to_user?: User
}

export interface Friendship {
  user_id: string
  friend_id: string
  created_at: string
  friend?: User
}

export interface WatchlistEntry {
  user_id: string
  uscf_id: string
  created_at: string
}

export type ListKind = 'friends' | 'watchlist'
