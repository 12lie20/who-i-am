'use client'

import { Share2, Check } from 'lucide-react'
import { useState, useCallback } from 'react'

interface ShareButtonProps {
  roomCode: string
}

export default function ShareButton({ roomCode }: ShareButtonProps) {
  const [shared, setShared] = useState(false)

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/room/${roomCode}`
    const shareData = {
      title: 'من أنا؟ — لعبة تخمين الصور',
      text: `انضم للعبة "من أنا؟" — كود الغرفة: ${roomCode}`,
      url,
    }

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData)
        setShared(true)
      } else {
        await navigator.clipboard.writeText(url)
        setShared(true)
      }
      setTimeout(() => setShared(false), 2500)
    } catch {
      // User cancelled share or error
      try {
        await navigator.clipboard.writeText(url)
        setShared(true)
        setTimeout(() => setShared(false), 2500)
      } catch {
        // Ignore
      }
    }
  }, [roomCode])

  return (
    <button
      className={`share-btn ${shared ? 'share-btn--shared' : ''}`}
      onClick={handleShare}
      aria-label="مشاركة الرابط"
    >
      {shared ? (
        <>
          <Check size={16} />
          <span>تم نسخ الرابط!</span>
        </>
      ) : (
        <>
          <Share2 size={16} />
          <span>مشاركة الرابط</span>
        </>
      )}
    </button>
  )
}
