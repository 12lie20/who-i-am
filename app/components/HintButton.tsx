'use client'

import { Lightbulb, Lock } from 'lucide-react'

interface HintButtonProps {
  hints: string[]
  hintsUsed: number
  maxHints: number
  onRequestHint: () => void
  loading?: boolean
}

export default function HintButton({
  hints,
  hintsUsed,
  maxHints,
  onRequestHint,
  loading = false,
}: HintButtonProps) {
  const remaining = maxHints - hintsUsed
  const canUseHint = remaining > 0 && hintsUsed < maxHints

  return (
    <div className="hint-section">
      <div className="hint-section__header">
        <button
          className={`hint-btn ${!canUseHint ? 'hint-btn--disabled' : ''}`}
          onClick={onRequestHint}
          disabled={!canUseHint || loading}
          aria-label="طلب تلميح"
        >
          {loading ? (
            <span className="btn__spinner" aria-hidden="true" />
          ) : canUseHint ? (
            <Lightbulb size={18} />
          ) : (
            <Lock size={18} />
          )}
          <span>تلميح ({remaining}/{maxHints})</span>
        </button>
      </div>

      {hintsUsed > 0 && (
        <div className="hint-section__list">
          {hints.slice(0, hintsUsed).map((hint, i) => (
            <div key={i} className="hint-section__item">
              <Lightbulb size={14} />
              <span>{hint}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
