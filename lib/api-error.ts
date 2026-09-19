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
