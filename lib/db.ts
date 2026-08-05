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
})

// Helper for parameterized queries with better typing
export async function query<T = any>(
  queryText: string,
  params: any[] = []
): Promise<T[]> {
  return sql.unsafe(queryText, params) as Promise<T[]>
}
