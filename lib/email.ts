import { getSubscribers } from './db'

interface AITool {
  name: string
  description: string
  url: string
  source: string
  foundAt: string
}

export async function sendEmailToSubscribers(
  tools: AITool[],
  frequency: string
): Promise<void> {
  const subscribers = await getSubscribers()
  const targetSubscribers = subscribers.filter(s => s.frequency === frequency)

  if (targetSubscribers.length === 0 || tools.length === 0) {
    console.log(`No ${frequency} subscribers or no tools to send`)
    return
  }

  console.log(`Sending emails to ${targetSubscribers.length} ${frequency} subscribers`)

  // In production, use a real email service like:
  // - SendGrid
  // - AWS SES
  // - Resend
  // - Postmark

  const emailContent = generateEmailContent(tools, frequency)

  for (const subscriber of targetSubscribers) {
    try {
      await sendEmail(subscriber.email, emailContent)
      console.log(`Email sent to ${subscriber.email}`)
    } catch (error) {
      console.error(`Failed to send email to ${subscriber.email}:`, error)
    }
  }
}

function generateEmailContent(tools: AITool[], frequency: string): string {
  const title = frequency === 'realtime'
    ? 'New AI Tools Discovered!'
    : frequency === 'daily'
    ? 'Daily AI Tools Digest'
    : 'Weekly AI Tools Summary'

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #00b8ff; }
    .tool { background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #00b8ff; }
    .tool h3 { margin-top: 0; color: #333; }
    .tool p { margin: 8px 0; }
    .meta { font-size: 12px; color: #666; }
    a { color: #00b8ff; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <h1>🤖 ${title}</h1>
  <p>Here are the latest AI tools and startups we've discovered:</p>
`

  tools.forEach(tool => {
    html += `
  <div class="tool">
    <h3>${tool.name}</h3>
    <p>${tool.description}</p>
    <p class="meta">Source: ${tool.source} | Found: ${new Date(tool.foundAt).toLocaleDateString()}</p>
    ${tool.url ? `<p><a href="${tool.url}">Visit Tool →</a></p>` : ''}
  </div>
`
  })

  html += `
  <div class="footer">
    <p>You're receiving this because you subscribed to AI Tools Tracker.</p>
    <p>Stay ahead with the latest AI innovations!</p>
  </div>
</body>
</html>
`

  return html
}

async function sendEmail(to: string, htmlContent: string): Promise<void> {
  // Mock email sending
  // In production, integrate with real email service

  const emailServiceUrl = process.env.EMAIL_SERVICE_URL
  const emailApiKey = process.env.EMAIL_API_KEY

  if (!emailServiceUrl || !emailApiKey) {
    console.log(`[MOCK] Email would be sent to ${to}`)
    console.log('Set EMAIL_SERVICE_URL and EMAIL_API_KEY environment variables for real email sending')
    return
  }

  try {
    // Example for SendGrid, Resend, or similar service
    const response = await fetch(emailServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${emailApiKey}`
      },
      body: JSON.stringify({
        to,
        from: process.env.EMAIL_FROM || 'noreply@aitracker.com',
        subject: 'New AI Tools Discovered!',
        html: htmlContent
      })
    })

    if (!response.ok) {
      throw new Error(`Email service returned ${response.status}`)
    }

    console.log(`Email successfully sent to ${to}`)
  } catch (error) {
    console.error(`Email sending failed for ${to}:`, error)
    throw error
  }
}

export async function sendTestEmail(to: string): Promise<boolean> {
  try {
    const testTool = {
      name: 'Test AI Tool',
      description: 'This is a test email from AI Tools Tracker',
      url: 'https://example.com',
      source: 'Test',
      foundAt: new Date().toISOString()
    }

    const content = generateEmailContent([testTool], 'realtime')
    await sendEmail(to, content)
    return true
  } catch (error) {
    console.error('Test email failed:', error)
    return false
  }
}
