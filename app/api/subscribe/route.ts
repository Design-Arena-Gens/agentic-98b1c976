import { NextRequest, NextResponse } from 'next/server'
import { getSubscribers, addSubscriber } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, frequency } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    const subscribers = await getSubscribers()
    const existing = subscribers.find((s: any) => s.email === email)

    if (existing) {
      return NextResponse.json(
        { error: 'Email already subscribed' },
        { status: 400 }
      )
    }

    await addSubscriber(email, frequency)

    return NextResponse.json({
      message: 'Successfully subscribed! You will receive updates about new AI tools.',
      success: true
    })
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}
