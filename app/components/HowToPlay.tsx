'use client'

import { Gamepad2, Share2, Trophy } from 'lucide-react'

export default function HowToPlay() {
  const steps = [
    {
      icon: <Gamepad2 size={28} />,
      title: 'أنشئ غرفة',
      description: 'اختر تصنيفاً وأنشئ غرفة جديدة',
    },
    {
      icon: <Share2 size={28} />,
      title: 'شارك الكود',
      description: 'أرسل كود الغرفة لصديقك',
    },
    {
      icon: <Trophy size={28} />,
      title: 'خمّن أولاً!',
      description: 'حاول تخمين شخصيتك قبل خصمك',
    },
  ]

  return (
    <section className="how-to-play">
      <h3 className="how-to-play__title">كيف تلعب؟</h3>
      <div className="how-to-play__steps">
        {steps.map((step, i) => (
          <div key={i} className="how-to-play__step">
            <div className="how-to-play__step-number">{i + 1}</div>
            <div className="how-to-play__step-icon">{step.icon}</div>
            <h4 className="how-to-play__step-title">{step.title}</h4>
            <p className="how-to-play__step-desc">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
