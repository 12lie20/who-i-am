import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { categoryId, playerId, timerSeconds } = body

    if (!categoryId || !playerId) {
      return NextResponse.json(
        { error: 'categoryId and playerId are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Validate category exists
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .single()

    if (categoryError || !category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Fetch all images for this category
    const { data: images, error: imagesError } = await supabase
      .from('images')
      .select('id')
      .eq('category_id', categoryId)

    if (imagesError || !images || images.length < 2) {
      return NextResponse.json(
        { error: 'Not enough images in this category (minimum 2 required)' },
        { status: 400 }
      )
    }

    // Pick 2 distinct random images
    const shuffled = [...images].sort(() => Math.random() - 0.5)
    const player1ImageId = shuffled[0].id
    const player2ImageId = shuffled[1].id

    // Generate a unique room code (retry on collision)
    let roomCode = generateRoomCode()
    let attempts = 0
    const maxAttempts = 5

    while (attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from('rooms')
        .select('id')
        .eq('room_code', roomCode)
        .single()

      if (!existing) break

      roomCode = generateRoomCode()
      attempts++
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Failed to generate unique room code, please try again' },
        { status: 500 }
      )
    }

    // Create the room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({
        room_code: roomCode,
        category_id: categoryId,
        status: 'waiting',
        player_1_id: playerId,
        player_1_image_id: player1ImageId,
        player_2_image_id: player2ImageId,
        timer_seconds: timerSeconds || null,
      })
      .select('id, room_code')
      .single()

    if (roomError || !room) {
      console.error('Room creation error:', roomError)
      return NextResponse.json(
        { error: 'Failed to create room' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      roomCode: room.room_code,
      roomId: room.id,
    })
  } catch (error) {
    console.error('Create room error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
