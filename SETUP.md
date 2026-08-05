# Database Setup Instructions

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose an organization (or create one)
4. Set your project details:
   - **Name**: `uscf-leaderboard` (or any name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to you
5. Click "Create new project" and wait ~2 minutes for provisioning

## Step 2: Run the Database Schema

1. In your Supabase project dashboard, click "SQL Editor" in the left sidebar
2. Click "New query"
3. Copy the entire contents of `db/schema.sql` from this project
4. Paste it into the SQL editor
5. Click "Run" (or press Ctrl/Cmd + Enter)
6. You should see "Success. No rows returned" — this means all tables were created

## Step 3: Get Your Connection String

1. In Supabase, go to "Project Settings" (gear icon in sidebar)
2. Click "Database" in the left menu
3. Scroll down to "Connection string"
4. Select "URI" tab
5. Copy the connection string — it looks like:
   ```
   postgres://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
6. **Replace `[YOUR-PASSWORD]`** with the database password you set in Step 1

## Step 4: Set Environment Variables Locally

1. Open `.env.development.local` in this project (it already exists)
2. Add these two lines:
   ```
   DATABASE_URL=your-connection-string-from-step-3
   SESSION_SECRET=any-long-random-string-at-least-32-chars
   ```

   For `SESSION_SECRET`, generate a random string. Example on Windows:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Your final `.env.development.local` should look like:
   ```
   NODE_TLS_REJECT_UNAUTHORIZED=0
   DATABASE_URL=postgres://postgres.abcdefghijk:your-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   SESSION_SECRET=a1b2c3d4e5f6...long-random-hex-string
   ```

## Step 5: Test Locally

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. You should be redirected to `/login`

4. Create an account at `/signup` with:
   - A username (at least 3 characters)
   - A real USCF ID (e.g., `12910923` for Phil Hanna)
   - A password (at least 6 characters)

5. After signup, you should be logged in and see the home page with Friends and Watchlist sections

## Step 6: Test the Friends System

1. Open an incognito/private browser window
2. Go to http://localhost:3000
3. Sign up with a **different** username and **different** USCF ID
4. In one browser (Account A):
   - Click "Show Friend Requests"
   - Enter Account B's USCF ID in the "Send Friend Request" form
   - Click "Send Request"
5. In the other browser (Account B):
   - Click "Show Friend Requests"
   - You should see Account A's request in "Incoming Requests"
   - Click "Accept"
6. Both accounts should now see each other in the "Friends Leaderboard" with live ratings!

## Step 7: Deploy to Vercel

1. Add the environment variables to Vercel:
   - Go to your Vercel project dashboard
   - Settings → Environment Variables
   - Add `DATABASE_URL` (the same value from your `.env.development.local`)
   - Add `SESSION_SECRET` (the same value)
   - **DO NOT** add `NODE_TLS_REJECT_UNAUTHORIZED` (that's local-only)

2. Redeploy:
   ```bash
   git add -A
   git commit -m "Add friends system with auth and database"
   git push
   ```

3. Vercel will auto-deploy. Once done, visit your live URL and test signup/login!

## Troubleshooting

**"DATABASE_URL environment variable is not set"**
- Make sure `.env.development.local` exists and has `DATABASE_URL=...`
- Restart the dev server after adding env vars

**"Failed to create account" on signup**
- Check that the USCF ID is valid (try it in the old version first)
- Check the terminal for error logs

**"Unauthorized" on API calls**
- Clear cookies and try logging in again
- Check that `SESSION_SECRET` is set

**Connection errors to Supabase**
- Verify your connection string is correct (password replaced)
- Check that the Supabase project is active (not paused)

**Type errors on build**
- Run `npm run build` to see TypeScript errors
- Most likely missing `await` on `params` somewhere
