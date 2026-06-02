interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

export default function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const sizeClass = size !== 'md' ? `spinner--${size}` : ''

  return (
    <div className={`spinner ${sizeClass}`} role="status" aria-label="جارٍ التحميل">
      <div className="spinner__ring spinner__ring--outer" />
      <div className="spinner__ring spinner__ring--inner" />
      <span className="sr-only">جارٍ التحميل...</span>
    </div>
  )
}
