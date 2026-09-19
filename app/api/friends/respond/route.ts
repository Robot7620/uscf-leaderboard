import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { sql } from '@/lib/db'
import { handleApiError } from '@/lib/api-error'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { requestId, action } = body

    if (!requestId || !action) {
      return NextResponse.json(
        { error: 'Request ID and action are required' },
        { status: 400 }
      )
    }

    if (action !== 'accept' && action !== 'decline') {
      return NextResponse.json(
        { error: 'Action must be "accept" or "decline"' },
        { status: 400 }
      )
    }

    // Find the request and verify it's for this user
    const requests = await sql`
      SELECT id, from_user_id, to_user_id, status
      FROM friend_requests
      WHERE id = ${requestId} AND to_user_id = ${user.id}
      LIMIT 1
    `

    if (requests.length === 0) {
      return NextResponse.json(
        { error: 'Friend request not found' },
        { status: 404 }
      )
    }

    const friendRequest = requests[0]

    if (friendRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Friend request already responded to' },
        { status: 409 }
      )
    }

    if (action === 'accept') {
      // Update request status
      await sql`
        UPDATE friend_requests
        SET status = 'accepted'
        WHERE id = ${requestId}
      `

      // Create mutual friendship (both directions)
      await sql`
        INSERT INTO friendships (user_id, friend_id)
        VALUES
          (${friendRequest.from_user_id}, ${friendRequest.to_user_id}),
          (${friendRequest.to_user_id}, ${friendRequest.from_user_id})
        ON CONFLICT DO NOTHING
      `

      return NextResponse.json({ success: true, action: 'accepted' })
    } else {
      // Decline
      await sql`
        UPDATE friend_requests
        SET status = 'declined'
        WHERE id = ${requestId}
      `

      return NextResponse.json({ success: true, action: 'declined' })
    }
  } catch (error) {
    return handleApiError(error, 'Failed to respond to friend request', 'Error responding to friend request:')
  }
}
