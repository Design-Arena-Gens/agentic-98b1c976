import { NextRequest, NextResponse } from 'next/server'
import { getTools } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const tools = await getTools()

    // Sort by foundAt date, newest first
    const sortedTools = tools.sort((a: any, b: any) =>
      new Date(b.foundAt).getTime() - new Date(a.foundAt).getTime()
    )

    return NextResponse.json({
      success: true,
      tools: sortedTools.slice(0, 50) // Return latest 50
    })
  } catch (error) {
    console.error('Get tools error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tools' },
      { status: 500 }
    )
  }
}
