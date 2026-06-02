'use client'

import { type ReactNode, type InputHTMLAttributes } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  success?: boolean
  icon?: ReactNode
}

export default function Input({
  label,
  error,
  success = false,
  icon,
  disabled = false,
  className = '',
  id,
  ...rest
}: InputProps) {
  const inputId = id || (label ? label.replace(/\s+/g, '-') : undefined)

  const groupClasses = [
    'input-group',
    error ? 'input-group--error' : '',
    success ? 'input-group--success' : '',
    !icon ? 'input-group--no-icon' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={groupClasses}>
      {label && (
        <label className="input-group__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="input-group__wrapper">
        <input
          className="input-group__field"
          id={inputId}
          disabled={disabled}
          dir="rtl"
          {...rest}
        />
        {icon && (
          <span className="input-group__icon" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      {error && <span className="input-group__error">{error}</span>}
    </div>
  )
}
