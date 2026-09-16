# USCF Leaderboard

A web app to track your chess friends' USCF ratings.

## Features

- **Accounts**: Sign up with a username, password, and your USCF ID
- **Friends**: Send/accept/decline friend requests by USCF ID; friends appear on a shared leaderboard
- **Watchlist**: Privately track any player's USCF ID without sending a friend request
- **Rating Leaderboard**: View ratings sorted highest to lowest

## Getting Started

1. Set up the database - see [SETUP.md](SETUP.md)

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. Sign up with a username, password, and your own USCF ID
2. Send a friend request by entering someone else's USCF ID, or add a USCF ID to your private watchlist
3. Once a friend request is accepted, both accounts see each other on the Friends Leaderboard
4. Remove a friend or watchlist entry with the "Remove" button

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **PostgreSQL** (via [postgres.js](https://github.com/porsager/postgres)) - Users, friendships, and watchlist storage
- **jose** / **bcryptjs** - Session (JWT) auth and password hashing
- **[ChessTools ratings API](https://api.chesstools.org)** - USCF rating lookups

## Notes

- Ratings come from ChessTools' USCF ratings API, which mirrors USCF's own periodic bulk ratings list (refreshed roughly daily). uschess.org's own player-lookup pages no longer allow automated access.
- Only a single overall rating is available per player (no Quick/Blitz breakdown, state, or rating-change history) since that's what the upstream data provides.
- Accounts, friendships, and the watchlist are stored in Postgres, not the browser - your data follows your account across devices.
