import { NextResponse } from 'next/server'
import { UnauthorizedError } from './auth'

// Shared catch-block handler for API routes. Replaces the previous
// `error.message === 'Unauthorized'` string-matching, which would have
// silently miscategorized any other error that happened to say the same
// thing as an auth failure.
export function handleApiError(error: unknown, fallbackMessage: string, logPrefix: string) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  console.error(logPrefix, error)
  return NextResponse.json({ error: fallbackMessage }, { status: 500 })
}

// Parses a request body as JSON and returns it only if it's a plain
// object. Both invalid JSON (request.json() throwing) and valid-but-wrong-
// shape JSON (bare `null`, an array, a string/number) would otherwise
// reach a route's field destructuring and throw there instead - caught
// only by the route's generic catch block, turning what should be a clean
// 400 into an opaque 500.
export async function parseJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return null
  }
  return body as Record<string, unknown>
}
