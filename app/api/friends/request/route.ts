import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { sql } from '@/lib/db'
import { handleApiError } from '@/lib/api-error'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { uscfId } = body

    if (!uscfId) {
      return NextResponse.json(
        { error: 'USCF ID is required' },
        { status: 400 }
      )
    }

    // Find user with this USCF ID
    const targetUsers = await sql`
      SELECT id, username, uscf_id
      FROM users
      WHERE uscf_id = ${uscfId}
      LIMIT 1
    `

    if (targetUsers.length === 0) {
      return NextResponse.json(
        { error: 'No user found with this USCF ID' },
        { status: 404 }
      )
    }

    const targetUser = targetUsers[0]

    // Can't send request to yourself
    if (targetUser.id === user.id) {
      return NextResponse.json(
        { error: 'Cannot send friend request to yourself' },
        { status: 400 }
      )
    }

    // Check if already friends
    const existingFriendship = await sql`
      SELECT 1 FROM friendships
      WHERE user_id = ${user.id} AND friend_id = ${targetUser.id}
      LIMIT 1
    `

    if (existingFriendship.length > 0) {
      return NextResponse.json(
        { error: 'Already friends with this user' },
        { status: 409 }
      )
    }

    // Check for existing pending request (either direction)
    const existingRequest = await sql`
      SELECT id, status FROM friend_requests
      WHERE
        (from_user_id = ${user.id} AND to_user_id = ${targetUser.id})
        OR (from_user_id = ${targetUser.id} AND to_user_id = ${user.id})
      LIMIT 1
    `

    if (existingRequest.length > 0) {
      const req = existingRequest[0]
      if (req.status === 'pending') {
        return NextResponse.json(
          { error: 'Friend request already pending' },
          { status: 409 }
        )
      }
    }

    // Create friend request
    const requests = await sql`
      INSERT INTO friend_requests (from_user_id, to_user_id, status)
      VALUES (${user.id}, ${targetUser.id}, 'pending')
      ON CONFLICT (from_user_id, to_user_id) DO UPDATE
      SET status = 'pending', created_at = now()
      RETURNING id, from_user_id, to_user_id, status, created_at
    `

    return NextResponse.json({ request: requests[0] })
  } catch (error) {
    return handleApiError(error, 'Failed to send friend request', 'Error creating friend request:')
  }
}
