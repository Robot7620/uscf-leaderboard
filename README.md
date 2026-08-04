# USCF Leaderboard

A web app to track your chess friends' USCF ratings and tournament activity.

## Features

- **Add Friends by USCF ID**: Track multiple players by entering their USCF identification numbers
- **Rating Leaderboard**: View all your friends' ratings sorted by highest rating
- **Multiple Time Controls**: See Regular, Quick, and Blitz ratings
- **Recent Activity Feed**: Track when players last had rating changes
- **Persistent Storage**: Friends list saved in browser local storage

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. Enter a USCF ID (8-digit number) in the input field
2. Click "Add Friend" to add them to your leaderboard
3. View the leaderboard sorted by rating
4. Check the activity feed for recent rating changes
5. Remove friends by clicking the "Remove" button

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **USCF API** - Player data scraping

## Notes

- Player data is fetched from the official USCF website
- Friends list is stored locally in your browser
- Ratings are cached and update when you reload
