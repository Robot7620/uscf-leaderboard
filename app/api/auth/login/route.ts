import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { verifyPassword, setSessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

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
