import { NextRequest, NextResponse } from 'next/server'
import { scanForAITools } from '@/lib/scanner'
import { getTools, addTool } from '@/lib/db'
import { sendEmailToSubscribers } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting AI tools scan...')

    const newTools = await scanForAITools()
    const existingTools = await getTools()
    const existingUrls = new Set(existingTools.map((t: any) => t.url))

    let addedCount = 0
    const addedTools: any[] = []

    for (const tool of newTools) {
      if (!existingUrls.has(tool.url)) {
        const addedTool = { ...tool, id: '', foundAt: new Date().toISOString() }
        await addTool(tool)
        addedTools.push(addedTool)
        addedCount++
      }
    }

    console.log(`Scan complete. Found ${addedCount} new tools.`)

    // Send emails for realtime subscribers
    if (addedTools.length > 0) {
      await sendEmailToSubscribers(addedTools, 'realtime')
    }

    return NextResponse.json({
      success: true,
      newTools: addedCount,
      total: newTools.length
    })
  } catch (error) {
    console.error('Scan error:', error)
    return NextResponse.json(
      { error: 'Scan failed: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
