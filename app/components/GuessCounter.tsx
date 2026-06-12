'use client'

import { Hash } from 'lucide-react'

interface GuessCounterProps {
  count: number
}

export default function GuessCounter({ count }: GuessCounterProps) {
  return (
    <div className="guess-counter">
      <Hash size={14} />
      <span className="guess-counter__label">المحاولات:</span>
      <span className="guess-counter__value">{count}</span>
    </div>
  )
}
