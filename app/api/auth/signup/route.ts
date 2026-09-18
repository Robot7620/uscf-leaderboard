import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { hashPassword, setSessionCookie, validatePassword } from '@/lib/auth'
import { fetchUscfPlayer } from '@/lib/uscf'
import { checkRequestRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const rateLimit = await checkRequestRateLimit(request, 'signup', 5, 60 * 60)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
      )
    }

    const body = await request.json()
    const { username, password, uscfId } = body

    // Validate input
    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      typeof uscfId !== 'string' ||
      !username ||
      !password ||
      !uscfId
    ) {
      return NextResponse.json(
        { error: 'Username, password, and USCF ID are required' },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      )
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 })
    }

    // Verify USCF ID resolves to a real player
    const player = await fetchUscfPlayer(uscfId)
    if (!player) {
      return NextResponse.json(
        { error: 'Invalid USCF ID - player not found' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUsername = await sql`
      SELECT id FROM users WHERE username = ${username} LIMIT 1
    `
    if (existingUsername.length > 0) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      )
    }

    // Check if USCF ID already claimed
    const existingUscf = await sql`
      SELECT id FROM users WHERE uscf_id = ${uscfId} LIMIT 1
    `
    if (existingUscf.length > 0) {
      return NextResponse.json(
        { error: 'This USCF ID is already claimed by another account' },
        { status: 409 }
      )
    }

    // Create user
    const passwordHash = await hashPassword(password)
    const users = await sql`
      INSERT INTO users (username, uscf_id, password_hash)
      VALUES (${username}, ${uscfId}, ${passwordHash})
      RETURNING id, username, uscf_id, uscf_verified, created_at
    `

    const user = users[0]

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
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
