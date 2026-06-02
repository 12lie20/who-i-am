'use client'

import { Sparkles } from 'lucide-react'

export default function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <Sparkles size={22} className="header__icon" />
        <h1 className="header__title">من أنا؟</h1>
      </div>
      <div className="header__accent" />
    </header>
  )
}
