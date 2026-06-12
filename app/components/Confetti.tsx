'use client'

import { useEffect, useRef } from 'react'

export default function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = [
      '#d4a843', '#e6bd5a', '#f0cd6e',
      '#3eb370', '#5dd39e',
      '#e05555', '#ff7b7b',
      '#6c63ff', '#a78bfa',
      '#f472b6', '#fbbf24',
    ]

    interface Particle {
      x: number
      y: number
      w: number
      h: number
      color: string
      vx: number
      vy: number
      rotation: number
      rotationSpeed: number
      opacity: number
    }

    const particles: Particle[] = []
    const count = 150

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * -1,
        w: Math.random() * 10 + 5,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
      })
    }

    let frame: number
    let elapsed = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      elapsed++

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotationSpeed
        p.vy += 0.03 // gravity

        if (elapsed > 120) {
          p.opacity -= 0.01
        }

        if (p.opacity <= 0) return

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = Math.max(0, p.opacity)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      })

      if (elapsed < 300 && particles.some((p) => p.opacity > 0)) {
        frame = requestAnimationFrame(animate)
      }
    }

    frame = requestAnimationFrame(animate)

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="confetti-canvas"
      aria-hidden="true"
    />
  )
}
