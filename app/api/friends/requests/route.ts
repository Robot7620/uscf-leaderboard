import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { sql } from '@/lib/db'
import { handleApiError } from '@/lib/api-error'

export async function GET() {
  try {
    const user = await requireAuth()

    // Get incoming pending requests
    const incoming = await sql`
      SELECT
        r.id,
        r.from_user_id,
        r.to_user_id,
        r.status,
        r.created_at,
        u.username as from_username,
        u.uscf_id as from_uscf_id
      FROM friend_requests r
      JOIN users u ON u.id = r.from_user_id
      WHERE r.to_user_id = ${user.id} AND r.status = 'pending'
      ORDER BY r.created_at DESC
    `

    // Get outgoing pending requests
    const outgoing = await sql`
      SELECT
        r.id,
        r.from_user_id,
        r.to_user_id,
        r.status,
        r.created_at,
        u.username as to_username,
        u.uscf_id as to_uscf_id
      FROM friend_requests r
      JOIN users u ON u.id = r.to_user_id
      WHERE r.from_user_id = ${user.id} AND r.status = 'pending'
      ORDER BY r.created_at DESC
    `

    return NextResponse.json({ incoming, outgoing })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch friend requests', 'Error fetching friend requests:')
  }
}
