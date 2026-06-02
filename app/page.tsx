'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Gamepad2, LogIn, Headphones } from 'lucide-react'
import Header from './components/Header'
import Card from './components/Card'
import Button from './components/Button'
import Input from './components/Input'

interface Category {
  id: string
  name: string
  icon: string | null
}

function getPlayerId(): string {
  if (typeof window === 'undefined') return ''
  let id = sessionStorage.getItem('playerId')
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem('playerId', id)
  }
  return id
}

export default function HomePage() {
  const router = useRouter()
  const [playerId, setPlayerId] = useState('')

  // Create room state
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  // Join room state
  const [roomCode, setRoomCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [joinError, setJoinError] = useState('')

  // Loading categories
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  useEffect(() => {
    setPlayerId(getPlayerId())
  }, [])

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories')
        if (!res.ok) throw new Error('Failed to fetch')
        const data: Category[] = await res.json()
        setCategories(data)
      } catch {
        setCreateError('فشل في تحميل التصنيفات')
      } finally {
        setCategoriesLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // Create room
  const handleCreate = useCallback(async () => {
    if (!selectedCategory || !playerId) return
    setIsCreating(true)
    setCreateError('')

    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: selectedCategory, playerId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setCreateError(data.error || 'فشل في إنشاء الغرفة')
        return
      }

      router.push(`/room/${data.roomCode}`)
    } catch {
      setCreateError('حدث خطأ، حاول مرة أخرى')
    } finally {
      setIsCreating(false)
    }
  }, [selectedCategory, playerId, router])

  // Join room
  const handleJoin = useCallback(async () => {
    const code = roomCode.trim().toUpperCase()
    if (!code || !playerId) return
    if (code.length < 4) {
      setJoinError('الكود يجب أن يكون 6 أحرف على الأقل')
      return
    }

    setIsJoining(true)
    setJoinError('')

    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: code, playerId }),
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMessages: Record<string, string> = {
          'Room not found': 'لم يتم العثور على الغرفة',
          'Room is no longer accepting players': 'الغرفة ممتلئة أو انتهت',
          'You cannot join your own room': 'لا يمكنك الانضمام لغرفتك',
        }
        setJoinError(errorMessages[data.error] || data.error || 'فشل في الانضمام')
        return
      }

      router.push(`/room/${code}`)
    } catch {
      setJoinError('حدث خطأ، حاول مرة أخرى')
    } finally {
      setIsJoining(false)
    }
  }, [roomCode, playerId, router])

  return (
    <>
      <div className="page-main">
        <div className="container">
          <Header />

          {/* Hero */}
          <section className="hero">
            <h2 className="hero__title">من أنا؟</h2>
            <p className="hero__subtitle">
              لعبة تخمين الصور التفاعلية مع أصدقائك
            </p>
            <p className="hero__description">
              اختر تصنيفاً وأنشئ غرفة، ثم شارك الكود مع صديقك.
              كل لاعب يرى صورة الآخر ويحاول تخمين شخصيته المخفية أولاً!
            </p>
          </section>

          {/* Two-column grid */}
          <div className="home-grid">
            {/* Create Room */}
            <Card variant="glass" padding="lg" className="home-grid__card">
              <div className="home-grid__card-header">
                <div className="home-grid__card-icon">
                  <Gamepad2 size={22} />
                </div>
                <h3 className="home-grid__card-title">إنشاء غرفة جديدة</h3>
              </div>

              {categoriesLoading ? (
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.88rem' }}>
                  جارٍ تحميل التصنيفات...
                </p>
              ) : categories.length === 0 ? (
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.88rem' }}>
                  لا توجد تصنيفات متاحة
                </p>
              ) : (
                <div className="category-grid">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      className={`category-grid__item ${
                        selectedCategory === cat.id ? 'category-grid__item--selected' : ''
                      }`}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}

              {createError && (
                <p style={{ color: 'var(--color-error)', fontSize: '0.85rem' }}>{createError}</p>
              )}

              <Button
                variant="primary"
                fullWidth
                loading={isCreating}
                disabled={!selectedCategory}
                onClick={handleCreate}
              >
                إنشاء
              </Button>
            </Card>

            {/* Join Room */}
            <Card variant="glass" padding="lg" className="home-grid__card">
              <div className="home-grid__card-header">
                <div className="home-grid__card-icon">
                  <LogIn size={22} />
                </div>
                <h3 className="home-grid__card-title">انضم لغرفة</h3>
              </div>

              <Input
                placeholder="أدخل كود الغرفة"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase())
                  setJoinError('')
                }}
                error={joinError}
                maxLength={8}
                style={{ textTransform: 'uppercase', letterSpacing: '0.15em' }}
              />

              <Button
                variant="primary"
                fullWidth
                loading={isJoining}
                disabled={roomCode.trim().length === 0}
                onClick={handleJoin}
              >
                انضم
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer__content">
          <Headphones size={16} className="footer__icon" />
          <span>استخدم Discord للتواصل الصوتي مع خصمك</span>
        </div>
      </footer>
    </>
  )
}
