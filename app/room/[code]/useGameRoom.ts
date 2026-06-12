import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ImageData {
  url: string
  name: string
}

export interface GameState {
  status: 'loading' | 'waiting' | 'playing' | 'finished' | 'error'
  roomCode: string
  opponentImage: ImageData | null
  myImage: ImageData | null
  winnerId: string | null
  error: string | null
  timerSeconds: number | null
  startedAt: string | null
  guessCount: number
  hintsUsed: number
  hints: string[]
  totalHints: number
}

interface GuessResult {
  correct: boolean
  message: string
  guessCount?: number
}

export function useGameRoom(code: string, playerId: string) {
  const [gameState, setGameState] = useState<GameState>({
    status: 'loading',
    roomCode: code,
    opponentImage: null,
    myImage: null,
    winnerId: null,
    error: null,
    timerSeconds: null,
    startedAt: null,
    guessCount: 0,
    hintsUsed: 0,
    hints: [],
    totalHints: 3,
  })
  const [guessHistory, setGuessHistory] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const supabaseRef = useRef(createClient())

  // Fetch room state from API
  const fetchState = useCallback(async () => {
    if (!code || !playerId) return

    try {
      const res = await fetch(`/api/rooms/${code}/state?playerId=${playerId}`)
      const data = await res.json()

      if (!res.ok) {
        setGameState((prev) => ({
          ...prev,
          status: 'error',
          error: data.error || 'حدث خطأ',
        }))
        return
      }

      setGameState((prev) => ({
        ...prev,
        status: data.status,
        roomCode: data.roomCode || code,
        opponentImage: data.opponentImage || null,
        myImage: data.myImage || null,
        winnerId: data.winnerId || null,
        error: null,
        timerSeconds: data.timerSeconds ?? null,
        startedAt: data.startedAt ?? null,
        guessCount: data.guessCount ?? 0,
        hintsUsed: data.hintsUsed ?? 0,
        hints: data.hints ?? [],
        totalHints: data.totalHints ?? 3,
      }))
    } catch {
      setGameState((prev) => ({
        ...prev,
        status: 'error',
        error: 'فشل الاتصال بالخادم',
      }))
    }
  }, [code, playerId])

  // Submit a guess
  const submitGuess = useCallback(
    async (guess: string): Promise<GuessResult> => {
      setIsSubmitting(true)
      try {
        const res = await fetch('/api/rooms/guess', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomCode: code, playerId, guess }),
        })

        const data = await res.json()

        if (!res.ok) {
          return { correct: false, message: data.error || 'حدث خطأ' }
        }

        if (data.correct) {
          // Re-fetch to get finished state with both images
          await fetchState()
        } else {
          setGuessHistory((prev) => [guess, ...prev])
          setGameState((prev) => ({
            ...prev,
            guessCount: data.guessCount ?? prev.guessCount + 1,
          }))
        }

        return { correct: data.correct, message: data.message, guessCount: data.guessCount }
      } catch {
        return { correct: false, message: 'فشل الاتصال بالخادم' }
      } finally {
        setIsSubmitting(false)
      }
    },
    [code, playerId, fetchState]
  )

  // Request a hint
  const requestHint = useCallback(async (): Promise<{ hint: string } | null> => {
    try {
      const res = await fetch('/api/rooms/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: code, playerId }),
      })

      const data = await res.json()

      if (!res.ok) {
        return null
      }

      setGameState((prev) => ({
        ...prev,
        hintsUsed: data.hintsUsed,
        hints: [...prev.hints, data.hint],
      }))

      return { hint: data.hint }
    } catch {
      return null
    }
  }, [code, playerId])

  // Initial fetch
  useEffect(() => {
    if (code && playerId) {
      fetchState()
    }
  }, [code, playerId, fetchState])

  // Set up Supabase Realtime subscription
  useEffect(() => {
    if (!code || !playerId) return

    const supabase = supabaseRef.current

    const channel = supabase
      .channel(`room-${code}`)
      .on(
        'postgres_changes' as never,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `room_code=eq.${code.toUpperCase()}`,
        },
        () => {
          // Re-fetch state whenever the room row is updated
          fetchState()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [code, playerId, fetchState])

  // Polling fallback every 3 seconds
  useEffect(() => {
    if (!code || !playerId) return

    pollRef.current = setInterval(() => {
      // Only poll while waiting or playing
      setGameState((prev) => {
        if (prev.status === 'waiting' || prev.status === 'playing') {
          fetchState()
        }
        return prev
      })
    }, 3000)

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
      }
    }
  }, [code, playerId, fetchState])

  return { gameState, submitGuess, requestHint, guessHistory, isSubmitting }
}
