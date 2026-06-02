import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'glass'
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
}

export default function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  hover = false,
}: CardProps) {
  const classes = [
    'card',
    variant === 'glass' ? 'card--glass' : '',
    padding === 'sm' ? 'card--padding-sm' : '',
    padding === 'lg' ? 'card--padding-lg' : '',
    hover ? 'card--hover' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <div className={classes}>{children}</div>
}
