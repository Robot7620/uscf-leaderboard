import postgres from 'postgres'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Create postgres client
export const sql = postgres(databaseUrl, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  // Supabase's pooler requires TLS; local Postgres instances often don't
  // support it at all. Require it in production (where the connection
  // crosses the public internet) but allow falling back locally. Either
  // way this is scoped to this connection only - unlike
  // NODE_TLS_REJECT_UNAUTHORIZED, it doesn't weaken every other outbound
  // HTTPS call this process makes.
  ssl: process.env.NODE_ENV === 'production' ? 'require' : 'prefer',
})
