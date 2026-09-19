import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { sql } from '@/lib/db'
import { handleApiError } from '@/lib/api-error'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: friendId } = await params

    // Delete both directions of the friendship
    await sql`
      DELETE FROM friendships
      WHERE
        (user_id = ${user.id} AND friend_id = ${friendId})
        OR (user_id = ${friendId} AND friend_id = ${user.id})
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'Failed to remove friend', 'Error removing friend:')
  }
}
