export interface Category {
  id: string
  name: string
  icon: string | null
  created_at: string
}

export interface GameImage {
  id: string
  category_id: string
  character_name: string
  character_name_normalized: string
  image_url: string
  created_at: string
}

export interface Room {
  id: string
  room_code: string
  category_id: string
  status: 'waiting' | 'playing' | 'finished'
  player_1_id: string | null
  player_2_id: string | null
  player_1_image_id: string | null
  player_2_image_id: string | null
  winner_id: string | null
  created_at: string
  updated_at: string
}
