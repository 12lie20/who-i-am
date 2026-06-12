'use client'

import { useEffect, useRef, useState } from 'react'

interface GameTimerProps {
  totalSeconds: number
  startedAt: string | null
  onTimeUp?: () => void
}

export default function GameTimer({ totalSeconds, startedAt, onTimeUp }: GameTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds)
  const onTimeUpRef = useRef(onTimeUp)
  onTimeUpRef.current = onTimeUp

  useEffect(() => {
    if (!startedAt || totalSeconds <= 0) return

    const startTime = new Date(startedAt).getTime()

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const left = Math.max(0, totalSeconds - elapsed)
      setRemaining(left)

      if (left <= 0) {
        onTimeUpRef.current?.()
      }
    }

    tick()
    const interval = setInterval(tick, 1000)

    return () => clearInterval(interval)
  }, [totalSeconds, startedAt])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const percentage = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 100
  const isLow = remaining <= 30

  return (
    <div className={`game-timer ${isLow ? 'game-timer--low' : ''}`}>
      <svg className="game-timer__circle" viewBox="0 0 100 100">
        <circle
          className="game-timer__track"
          cx="50"
          cy="50"
          r="42"
          fill="none"
          strokeWidth="6"
        />
        <circle
          className="game-timer__progress"
          cx="50"
          cy="50"
          r="42"
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 42}`}
          strokeDashoffset={`${2 * Math.PI * 42 * (1 - percentage / 100)}`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="game-timer__text">
        <span className="game-timer__value">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}
