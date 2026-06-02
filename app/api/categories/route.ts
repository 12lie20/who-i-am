import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, icon')
      .order('name')

    if (error) {
      console.error('Categories fetch error:', error)
      return NextResponse.json(
        { error: 'فشل في تحميل التصنيفات' },
        { status: 500 }
      )
    }

    return NextResponse.json(categories ?? [])
  } catch (error) {
    console.error('Categories error:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}
