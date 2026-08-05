import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    const user = await requireAuth()

    // Get all accepted friendships with user data
    const friends = await sql`
      SELECT
        u.id,
        u.username,
        u.uscf_id,
        u.uscf_verified,
        f.created_at as friended_at
      FROM friendships f
      JOIN users u ON u.id = f.friend_id
      WHERE f.user_id = ${user.id}
      ORDER BY f.created_at DESC
    `

    return NextResponse.json({ friends })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching friends:', error)
    return NextResponse.json(
      { error: 'Failed to fetch friends' },
      { status: 500 }
    )
  }
}
