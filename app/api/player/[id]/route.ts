import { NextRequest, NextResponse } from 'next/server'
import type { Player } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const response = await fetch(
      `https://www.uschess.org/msa/MbrDtlMain.php?${id}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        // Cache each player for 1 hour to avoid hammering USCF
        next: { revalidate: 3600 }
      }
    )

    const html = await response.text()

    const name = extractName(html)
    if (!name) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    const player: Player = {
      id,
      name,
      regular: extractRating(html, 'Regular Rating'),
      quick: extractRating(html, 'Quick Rating'),
      blitz: extractRating(html, 'Blitz Rating'),
      state: extractState(html),
      lastChange: extractLastRatedDate(html),
      lastEvent: extractLastEvent(html),
      overallRank: extractRank(html, 'Overall Ranking'),
    }

    return NextResponse.json(player)
  } catch (error) {
    console.error('Error fetching player:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player data' },
      { status: 500 }
    )
  }
}

// Name appears as: <font size=+1><b>12910923: PHIL HANNA</b>
function extractName(html: string): string | null {
  const match = html.match(/<font size=\+1><b>\d+:\s*([^<]+)<\/b>/i)
  return match ? match[1].trim() : null
}

// Rating layout: <td>Regular Rating</td> ... <td> <b> [<nobr>] 1268&nbsp;&nbsp; 2025-12 ...
// We must skip the "Online-" variants, which share the "Regular Rating" text.
function extractRating(html: string, label: string): number | undefined {
  // Match the label cell NOT preceded by "Online-", then the next <b>...number
  const regex = new RegExp(
    `(?<!Online-)${label}\\s*</td>\\s*<td>\\s*<b>\\s*(?:<nobr>)?\\s*(\\d{2,4})`,
    'i'
  )
  const match = html.match(regex)
  return match ? parseInt(match[1]) : undefined
}

// State appears as: State</td> ... <td> <b> NC </b>
function extractState(html: string): string | undefined {
  const match = html.match(/State\s*<\/td>\s*<td>\s*<b>\s*([A-Z]{2})/i)
  return match ? match[1] : undefined
}

// Last Rated Event: <a ...>ID</a> '25 EVENT NAME Rated on 2025-10-06
function extractLastRatedDate(html: string): string | undefined {
  const match = html.match(/Rated on\s*(\d{4}-\d{2}-\d{2})/i)
  return match ? match[1] : undefined
}

function extractLastEvent(html: string): string | undefined {
  const match = html.match(
    /Last Rated Event:\s*<a[^>]*>[^<]*<\/a>\s*(.+?)\s*Rated on/i
  )
  return match ? match[1].replace(/&nbsp;/g, ' ').trim() : undefined
}

// Overall Ranking</td><td><b>22470(Tied) out of 77045</b>
function extractRank(html: string, label: string): string | undefined {
  const regex = new RegExp(`${label}\\s*</td>\\s*<td>\\s*<b>\\s*([^<]+?)\\s*</b>`, 'i')
  const match = html.match(regex)
  return match ? match[1].replace(/&nbsp;/g, ' ').trim() : undefined
}
