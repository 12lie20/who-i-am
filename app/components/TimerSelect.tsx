'use client'

import { Timer, TimerOff } from 'lucide-react'

interface TimerSelectProps {
  value: number | null
  onChange: (value: number | null) => void
}

const options = [
  { value: null, label: 'بدون حد', icon: TimerOff },
  { value: 120, label: '2 دقيقة' },
  { value: 300, label: '5 دقائق' },
  { value: 600, label: '10 دقائق' },
]

export default function TimerSelect({ value, onChange }: TimerSelectProps) {
  return (
    <div className="timer-select">
      <div className="timer-select__header">
        <Timer size={16} />
        <span>المؤقت</span>
      </div>
      <div className="timer-select__options">
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            className={`timer-select__option ${
              value === opt.value ? 'timer-select__option--selected' : ''
            }`}
            onClick={() => onChange(opt.value)}
            type="button"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
