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

    // Find room by code
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

    // Validate room is in waiting status
    if (room.status !== 'waiting') {
      return NextResponse.json(
        { error: 'Room is no longer accepting players' },
        { status: 400 }
      )
    }

    // Prevent joining your own room
    if (room.player_1_id === playerId) {
      return NextResponse.json(
        { error: 'You cannot join your own room' },
        { status: 400 }
      )
    }

    // Update room: assign player 2 and start the game
    const { data: updatedRoom, error: updateError } = await supabase
      .from('rooms')
      .update({
        player_2_id: playerId,
        status: 'playing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', room.id)
      .select('id, status')
      .single()

    if (updateError || !updatedRoom) {
      console.error('Room update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to join room' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      roomId: updatedRoom.id,
      status: updatedRoom.status,
    })
  } catch (error) {
    console.error('Join room error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
