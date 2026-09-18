import { ipAddress } from '@vercel/functions'
import { sql } from './db'

interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds: number
}

// Fixed-window rate limiter backed by Postgres, so counts are shared
// across serverless instances - an in-memory counter would reset on every
// cold start and wouldn't be seen by other instances handling the same
// attacker's requests.
async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const [row] = await sql<{ count: number; window_start: Date }[]>`
    INSERT INTO rate_limits (key, count, window_start)
    VALUES (${key}, 1, now())
    ON CONFLICT (key) DO UPDATE SET
      count = CASE
        WHEN rate_limits.window_start <= now() - make_interval(secs => ${windowSeconds})
          THEN 1
        ELSE rate_limits.count + 1
      END,
      window_start = CASE
        WHEN rate_limits.window_start <= now() - make_interval(secs => ${windowSeconds})
          THEN now()
        ELSE rate_limits.window_start
      END
    RETURNING count, window_start
  `

  // Opportunistic cleanup so the table doesn't grow by one permanent row
  // per distinct key forever - no cron job needed for this small a table.
  // Fire-and-forget: not worth making the caller's request wait on it.
  if (Math.random() < 0.01) {
    sql`DELETE FROM rate_limits WHERE window_start < now() - interval '1 day'`.catch(
      (error) => console.error('[rate-limit] cleanup failed:', error)
    )
  }

  if (row.count <= limit) {
    return { allowed: true, retryAfterSeconds: 0 }
  }

  const elapsedSeconds = (Date.now() - new Date(row.window_start).getTime()) / 1000
  return {
    allowed: false,
    retryAfterSeconds: Math.max(1, Math.ceil(windowSeconds - elapsedSeconds)),
  }
}

// Resolves the client's identity, checks its rate limit, and fails open
// (allows the request) in two cases where failing closed would be worse
// than no rate limiting at all:
//  - The client can't be identified (ipAddress() returns undefined off
//    Vercel, e.g. local dev). Bucketing every such client into one shared
//    "unknown" key would let a single user's retries lock out everyone
//    else sharing it.
//  - The limit check itself errors (e.g. the rate_limits table hasn't
//    been migrated onto an existing deployment yet, or a transient DB
//    blip). Login/signup availability shouldn't depend on the limiter's
//    health.
export async function checkRequestRateLimit(
  request: Request,
  prefix: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const ip = ipAddress(request)
  if (!ip) {
    return { allowed: true, retryAfterSeconds: 0 }
  }

  try {
    return await checkRateLimit(`${prefix}:${ip}`, limit, windowSeconds)
  } catch (error) {
    console.error(`[rate-limit] check failed for "${prefix}:${ip}", failing open:`, error)
    return { allowed: true, retryAfterSeconds: 0 }
  }
}
