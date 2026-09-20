import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { verifyPassword, setSessionCookie } from '@/lib/auth'
import { checkRequestRateLimit } from '@/lib/rate-limit'
import { parseJsonBody } from '@/lib/api-error'

export async function POST(request: NextRequest) {
  try {
    const rateLimit = await checkRequestRateLimit(request, 'login', 10, 15 * 60)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
      )
    }

    const body = await parseJsonBody(request)
    const password = body?.password

    if (
      !body ||
      typeof body.username !== 'string' ||
      typeof password !== 'string' ||
      !body.username.trim() ||
      !password
    ) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Trimmed to match how signup stores it - never trim the password itself.
    const username: string = body.username.trim()

    // Find user
    const users = await sql`
      SELECT id, username, uscf_id, uscf_verified, password_hash
      FROM users
      WHERE username = ${username}
      LIMIT 1
    `

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    const user = users[0]

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Create session
    await setSessionCookie({
      userId: user.id,
      username: user.username,
      uscfId: user.uscf_id,
    })

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        uscfId: user.uscf_id,
        uscfVerified: user.uscf_verified,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}
