import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get('playerId')

    if (!code || !playerId) {
      return NextResponse.json(
        { error: 'Room code and playerId are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Fetch room by code
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', code.toUpperCase())
      .single()

    if (roomError || !room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Determine which player is requesting
    const isPlayer1 = room.player_1_id === playerId
    const isPlayer2 = room.player_2_id === playerId

    if (!isPlayer1 && !isPlayer2) {
      return NextResponse.json(
        { error: 'You are not a participant in this room' },
        { status: 403 }
      )
    }

    // WAITING: no image data needed yet
    if (room.status === 'waiting') {
      return NextResponse.json({
        status: 'waiting',
        roomCode: room.room_code,
        timerSeconds: room.timer_seconds,
      })
    }

    // ANTI-CHEAT: Only fetch the OPPONENT's image, never the player's own
    const opponentImageId = isPlayer1
      ? room.player_2_image_id
      : room.player_1_image_id

    const { data: opponentImage, error: opponentImageError } = await supabase
      .from('images')
      .select('image_url, character_name')
      .eq('id', opponentImageId)
      .single()

    if (opponentImageError || !opponentImage) {
      return NextResponse.json(
        { error: 'Failed to fetch image data' },
        { status: 500 }
      )
    }

    // Fetch hints for the player's own image (they need hints about themselves)
    const myImageId = isPlayer1
      ? room.player_1_image_id
      : room.player_2_image_id

    const { data: myImageHints } = await supabase
      .from('images')
      .select('hints')
      .eq('id', myImageId)
      .single()

    const myGuesses = isPlayer1 ? room.player_1_guesses : room.player_2_guesses
    const myHintsUsed = isPlayer1 ? room.player_1_hints_used : room.player_2_hints_used
    const hints: string[] = myImageHints?.hints || []

    // PLAYING: return opponent's image only
    if (room.status === 'playing') {
      return NextResponse.json({
        status: 'playing',
        roomCode: room.room_code,
        opponentImage: {
          url: opponentImage.image_url,
          name: opponentImage.character_name,
        },
        timerSeconds: room.timer_seconds,
        startedAt: room.started_at,
        guessCount: myGuesses || 0,
        hintsUsed: myHintsUsed || 0,
        hints: hints.slice(0, myHintsUsed || 0),
        totalHints: hints.length,
      })
    }

    // FINISHED: reveal both images
    if (room.status === 'finished') {
      const { data: myImage, error: myImageError } = await supabase
        .from('images')
        .select('image_url, character_name')
        .eq('id', myImageId)
        .single()

      if (myImageError || !myImage) {
        return NextResponse.json(
          { error: 'Failed to fetch image data' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        status: 'finished',
        roomCode: room.room_code,
        opponentImage: {
          url: opponentImage.image_url,
          name: opponentImage.character_name,
        },
        myImage: {
          url: myImage.image_url,
          name: myImage.character_name,
        },
        winnerId: room.winner_id,
        guessCount: myGuesses || 0,
      })
    }

    return NextResponse.json(
      { error: 'Unknown room status' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Room state error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
