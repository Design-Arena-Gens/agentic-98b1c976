import { NextRequest, NextResponse } from 'next/server'
import { scanForAITools } from '@/lib/scanner'
import { getTools, addTool } from '@/lib/db'
import { sendEmailToSubscribers } from '@/lib/email'

export const dynamic = 'force-dynamic'

// This endpoint is called by Vercel Cron or external cron service
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret if set
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Running scheduled scan...')

    const newTools = await scanForAITools()
    const existingTools = await getTools()
    const existingUrls = new Set(existingTools.map((t: any) => t.url))

    const addedTools: any[] = []

    for (const tool of newTools) {
      if (!existingUrls.has(tool.url)) {
        const addedTool = { ...tool, id: '', foundAt: new Date().toISOString() }
        await addTool(tool)
        addedTools.push(addedTool)
      }
    }

    console.log(`Scheduled scan complete. Found ${addedTools.length} new tools.`)

    // Send emails based on frequency
    if (addedTools.length > 0) {
      const hour = new Date().getUTCHours()

      // Send realtime emails immediately
      await sendEmailToSubscribers(addedTools, 'realtime')

      // Daily digest at 9 AM UTC
      if (hour === 9) {
        await sendEmailToSubscribers(addedTools, 'daily')
      }

      // Weekly digest on Mondays at 9 AM UTC
      const dayOfWeek = new Date().getUTCDay()
      if (dayOfWeek === 1 && hour === 9) {
        await sendEmailToSubscribers(addedTools, 'weekly')
      }
    }

    return NextResponse.json({
      success: true,
      newTools: addedTools.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json(
      { error: 'Cron job failed: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
