import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { arabicFuzzyMatch } from '@/lib/arabic-normalize'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomCode, playerId, guess } = body

    if (!roomCode || !playerId || !guess) {
      return NextResponse.json(
        { error: 'roomCode, playerId, and guess are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Fetch room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', roomCode.toUpperCase())
      .single()

    if (roomError || !room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Validate game is in progress
    if (room.status !== 'playing') {
      return NextResponse.json(
        { error: 'Game is not in progress' },
        { status: 400 }
      )
    }

    // Determine which image belongs to the guessing player
    // Player 1's image is what Player 1 must guess (it's on their forehead)
    let myImageId: string | null = null
    let guessField: string | null = null

    if (playerId === room.player_1_id) {
      myImageId = room.player_1_image_id
      guessField = 'player_1_guesses'
    } else if (playerId === room.player_2_id) {
      myImageId = room.player_2_image_id
      guessField = 'player_2_guesses'
    } else {
      return NextResponse.json(
        { error: 'You are not a participant in this room' },
        { status: 403 }
      )
    }

    if (!myImageId) {
      return NextResponse.json(
        { error: 'No image assigned to player' },
        { status: 500 }
      )
    }

    // Increment guess counter
    const currentGuesses: number = room[guessField] || 0
    await supabase
      .from('rooms')
      .update({
        [guessField]: currentGuesses + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', room.id)

    // Fetch the character name for the player's image
    const { data: image, error: imageError } = await supabase
      .from('images')
      .select('character_name')
      .eq('id', myImageId)
      .single()

    if (imageError || !image) {
      return NextResponse.json(
        { error: 'Failed to fetch image data' },
        { status: 500 }
      )
    }

    // Compare using Arabic fuzzy matching
    const isCorrect = arabicFuzzyMatch(guess, image.character_name)

    if (isCorrect) {
      // Update room: game over, this player wins
      const { error: updateError } = await supabase
        .from('rooms')
        .update({
          status: 'finished',
          winner_id: playerId,
          [guessField]: currentGuesses + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', room.id)

      if (updateError) {
        console.error('Room update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update game state' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        correct: true,
        message: 'أحسنت! لقد فزت! 🎉',
      })
    }

    return NextResponse.json({
      correct: false,
      message: 'إجابة خاطئة، حاول مرة أخرى',
      guessCount: currentGuesses + 1,
    })
  } catch (error) {
    console.error('Guess error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
