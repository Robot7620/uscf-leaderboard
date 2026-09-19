import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { sql } from '@/lib/db'
import { fetchUscfPlayer } from '@/lib/uscf'
import { handleApiError } from '@/lib/api-error'

// GET - List all watchlist entries
export async function GET() {
  try {
    const user = await requireAuth()

    const entries = await sql`
      SELECT uscf_id, created_at
      FROM watchlist
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ watchlist: entries })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch watchlist', 'Error fetching watchlist:')
  }
}

// POST - Add to watchlist
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

    // Verify USCF ID resolves to a real player
    const player = await fetchUscfPlayer(uscfId)
    if (!player) {
      return NextResponse.json(
        { error: 'Invalid USCF ID - player not found' },
        { status: 400 }
      )
    }

    // Add to watchlist
    await sql`
      INSERT INTO watchlist (user_id, uscf_id)
      VALUES (${user.id}, ${uscfId})
      ON CONFLICT (user_id, uscf_id) DO NOTHING
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'Failed to add to watchlist', 'Error adding to watchlist:')
  }
}

// DELETE - Remove from watchlist
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const uscfId = searchParams.get('uscfId')

    if (!uscfId) {
      return NextResponse.json(
        { error: 'USCF ID is required' },
        { status: 400 }
      )
    }

    await sql`
      DELETE FROM watchlist
      WHERE user_id = ${user.id} AND uscf_id = ${uscfId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, 'Failed to remove from watchlist', 'Error removing from watchlist:')
  }
}
