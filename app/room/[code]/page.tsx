'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Trophy, Home, AlertCircle } from 'lucide-react'
import Header from '@/app/components/Header'
import Card from '@/app/components/Card'
import Button from '@/app/components/Button'
import Input from '@/app/components/Input'
import Modal from '@/app/components/Modal'
import LoadingSpinner from '@/app/components/LoadingSpinner'
import CopyButton from '@/app/components/CopyButton'
import ShareButton from '@/app/components/ShareButton'
import GameTimer from '@/app/components/GameTimer'
import HintButton from '@/app/components/HintButton'
import GuessCounter from '@/app/components/GuessCounter'
import Confetti from '@/app/components/Confetti'
import { useGameRoom } from './useGameRoom'

function getPlayerId(): string {
  if (typeof window === 'undefined') return ''
  let id = sessionStorage.getItem('playerId')
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem('playerId', id)
  }
  return id
}

export default function GameRoomPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = use(params)
  const router = useRouter()
  const [playerId, setPlayerId] = useState('')
  const [guess, setGuess] = useState('')
  const [feedback, setFeedback] = useState<{
    type: 'error' | 'success'
    message: string
  } | null>(null)
  const [hintLoading, setHintLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    setPlayerId(getPlayerId())
  }, [])

  const { gameState, submitGuess, requestHint, guessHistory, isSubmitting } = useGameRoom(
    code,
    playerId
  )

  // Show confetti when game finishes and player wins
  useEffect(() => {
    if (gameState.status === 'finished' && gameState.winnerId === playerId) {
      setShowConfetti(true)
    }
  }, [gameState.status, gameState.winnerId, playerId])

  const handleGuess = useCallback(async () => {
    const trimmed = guess.trim()
    if (!trimmed) return

    setFeedback(null)
    const result = await submitGuess(trimmed)
    setGuess('')

    if (result.correct) {
      setFeedback({ type: 'success', message: result.message })
    } else {
      setFeedback({ type: 'error', message: result.message })
    }
  }, [guess, submitGuess])

  const handleHint = useCallback(async () => {
    setHintLoading(true)
    await requestHint()
    setHintLoading(false)
  }, [requestHint])

  // Loading state
  if (gameState.status === 'loading') {
    return (
      <div className="page-main">
        <div className="container">
          <Header />
          <div className="waiting-screen">
            <LoadingSpinner size="lg" />
            <p style={{ color: 'var(--color-text-secondary)' }}>
              جارٍ تحميل الغرفة...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (gameState.status === 'error') {
    return (
      <div className="page-main">
        <div className="container">
          <Header />
          <div className="error-screen">
            <AlertCircle size={48} className="error-screen__icon" />
            <p className="error-screen__message">
              {gameState.error || 'حدث خطأ غير متوقع'}
            </p>
            <Button variant="secondary" onClick={() => router.push('/')}>
              العودة للرئيسية
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Waiting state
  if (gameState.status === 'waiting') {
    return (
      <div className="page-main">
        <div className="container">
          <Header />
          <div className="waiting-screen">
            <h2 className="waiting-screen__title">
              في انتظار اللاعب الثاني...
            </h2>

            <div className="room-code">
              <p className="room-code__label">كود الغرفة</p>
              <p className="room-code__value">{code.toUpperCase()}</p>
            </div>

            <div className="waiting-screen__actions">
              <CopyButton text={code.toUpperCase()} />
              <ShareButton roomCode={code.toUpperCase()} />
            </div>

            {gameState.timerSeconds && (
              <p className="waiting-screen__timer-info">
                ⏱️ المؤقت: {Math.floor(gameState.timerSeconds / 60)} دقائق
              </p>
            )}

            <p className="waiting-screen__instruction">
              شارك هذا الكود مع صديقك
            </p>

            <div className="waiting-screen__dots">
              <span className="waiting-screen__dot" />
              <span className="waiting-screen__dot" />
              <span className="waiting-screen__dot" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Finished state — modal
  const isWinner = gameState.winnerId === playerId

  if (gameState.status === 'finished') {
    return (
      <div className="page-main">
        <div className="container">
          <Header />
          {showConfetti && <Confetti />}
          <Modal
            isOpen={true}
            onClose={() => router.push('/')}
            title="انتهت اللعبة"
          >
            <div className="result-modal">
              <div className="result-modal__icon">
                <Trophy size={48} />
              </div>

              {isWinner ? (
                <p className="result-modal__winner">🎉 مبروك! لقد فزت!</p>
              ) : (
                <p className="result-modal__loser">اللاعب الآخر فاز!</p>
              )}

              {gameState.guessCount > 0 && (
                <p className="result-modal__stats">
                  عدد محاولاتك: {gameState.guessCount}
                </p>
              )}

              <div className="result-modal__images">
                {gameState.opponentImage && (
                  <div className="result-modal__image-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={gameState.opponentImage.url}
                      alt={gameState.opponentImage.name}
                    />
                    <span className="result-modal__image-label">
                      صورة خصمك
                    </span>
                    <span className="result-modal__image-name">
                      {gameState.opponentImage.name}
                    </span>
                  </div>
                )}
                {gameState.myImage && (
                  <div className="result-modal__image-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={gameState.myImage.url}
                      alt={gameState.myImage.name}
                    />
                    <span className="result-modal__image-label">صورتك</span>
                    <span className="result-modal__image-name">
                      {gameState.myImage.name}
                    </span>
                  </div>
                )}
              </div>

              <Button
                variant="primary"
                fullWidth
                icon={<Home size={18} />}
                onClick={() => router.push('/')}
              >
                لعب مرة أخرى
              </Button>
            </div>
          </Modal>
        </div>
      </div>
    )
  }

  // Playing state
  return (
    <div className="page-main">
      <div className="container">
        <Header />

        {/* Game status bar */}
        <div className="game-status-bar">
          <GuessCounter count={gameState.guessCount} />
          {gameState.timerSeconds && gameState.startedAt && (
            <GameTimer
              totalSeconds={gameState.timerSeconds}
              startedAt={gameState.startedAt}
            />
          )}
        </div>

        <div className="game-layout">
          {/* Right panel — opponent's image */}
          <Card variant="glass" className="game-layout__opponent">
            <p className="game-layout__opponent-label">صورة خصمك</p>
            <div className="game-layout__opponent-frame">
              {gameState.opponentImage && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={gameState.opponentImage.url}
                  alt="صورة خصمك"
                />
              )}
            </div>
            {gameState.opponentImage && (
              <p className="game-layout__opponent-name">
                خصمك هو: <strong>{gameState.opponentImage.name}</strong>
              </p>
            )}
          </Card>

          {/* Left panel — mystery identity */}
          <Card variant="glass" className="game-layout__mystery">
            <div className="mystery-avatar">
              <span className="mystery-avatar__question">؟</span>
            </div>
            <p className="mystery-avatar__label">من أنت؟</p>

            {/* Hint section */}
            <HintButton
              hints={gameState.hints}
              hintsUsed={gameState.hintsUsed}
              maxHints={3}
              onRequestHint={handleHint}
              loading={hintLoading}
            />

            <div className="guess-form">
              <div className="guess-form__row">
                <Input
                  placeholder="اكتب تخمينك هنا..."
                  value={guess}
                  onChange={(e) => {
                    setGuess(e.target.value)
                    setFeedback(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isSubmitting) handleGuess()
                  }}
                />
                <Button
                  variant="primary"
                  onClick={handleGuess}
                  loading={isSubmitting}
                  disabled={guess.trim().length === 0}
                  icon={<Send size={16} />}
                >
                  تحقق
                </Button>
              </div>

              {feedback && (
                <div
                  className={`guess-form__feedback guess-form__feedback--${feedback.type}`}
                >
                  {feedback.message}
                </div>
              )}

              {guessHistory.length > 0 && (
                <div className="guess-form__history">
                  <p className="guess-form__history-title">
                    المحاولات السابقة
                  </p>
                  {guessHistory.map((g, i) => (
                    <span key={i} className="guess-form__history-item">
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
