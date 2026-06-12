import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomCode, playerId } = body

    if (!roomCode || !playerId) {
      return NextResponse.json(
        { error: 'roomCode and playerId are required' },
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

    if (room.status !== 'playing') {
      return NextResponse.json(
        { error: 'Game is not in progress' },
        { status: 400 }
      )
    }

    // Determine which player and their image
    const isPlayer1 = playerId === room.player_1_id
    const isPlayer2 = playerId === room.player_2_id

    if (!isPlayer1 && !isPlayer2) {
      return NextResponse.json(
        { error: 'You are not a participant in this room' },
        { status: 403 }
      )
    }

    const hintsUsedField = isPlayer1 ? 'player_1_hints_used' : 'player_2_hints_used'
    const currentHintsUsed: number = room[hintsUsedField] || 0

    if (currentHintsUsed >= 1) {
      return NextResponse.json(
        { error: 'لقد استخدمت التلميح الوحيد المتاح لك' },
        { status: 400 }
      )
    }

    // Get the player's own image to fetch its hints
    const myImageId = isPlayer1 ? room.player_1_image_id : room.player_2_image_id

    if (!myImageId) {
      return NextResponse.json(
        { error: 'No image assigned' },
        { status: 500 }
      )
    }

    const { data: image, error: imageError } = await supabase
      .from('images')
      .select('hints')
      .eq('id', myImageId)
      .single()

    if (imageError || !image) {
      console.error('Image hints fetch error:', imageError)
      return NextResponse.json(
        { error: `Failed to fetch image hints: ${imageError?.message || 'no data'}` },
        { status: 500 }
      )
    }

    const hints: string[] = image.hints || []
    const nextHintIndex = currentHintsUsed

    if (nextHintIndex >= hints.length) {
      return NextResponse.json(
        { error: `لا توجد تلميحات إضافية (متاح ${hints.length} تلميحات، استخدمت ${currentHintsUsed})` },
        { status: 400 }
      )
    }

    // Update hints used count
    const { error: updateError } = await supabase
      .from('rooms')
      .update({
        [hintsUsedField]: currentHintsUsed + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', room.id)

    if (updateError) {
      console.error('Hint update error:', updateError)
      return NextResponse.json(
        { error: `Failed to update hint count in database: ${updateError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      hint: hints[nextHintIndex],
      hintsUsed: currentHintsUsed + 1,
      hintsRemaining: 1 - (currentHintsUsed + 1),
    })
  } catch (error) {
    console.error('Hint error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'unknown'}` },
      { status: 500 }
    )
  }
}
