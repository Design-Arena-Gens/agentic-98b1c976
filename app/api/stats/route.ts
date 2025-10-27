import { NextRequest, NextResponse } from 'next/server'
import { getTools } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const tools = await getTools()

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const today = tools.filter((t: any) => new Date(t.foundAt) >= todayStart).length
    const thisWeek = tools.filter((t: any) => new Date(t.foundAt) >= weekStart).length

    return NextResponse.json({
      total: tools.length,
      today,
      thisWeek
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
