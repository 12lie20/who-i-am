import type { Metadata } from 'next'
import { IBM_Plex_Sans_Arabic } from 'next/font/google'
import './globals.css'

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'من أنا؟ - لعبة تخمين الصور',
  description:
    'لعبة تخمين الصور التفاعلية الجماعية — خمّن الشخصية المخفية قبل خصمك! العب مع أصدقائك الآن.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={ibmPlexArabic.className}>
      <body>
        <div className="page-wrapper">
          {children}
        </div>
      </body>
    </html>
  )
}
