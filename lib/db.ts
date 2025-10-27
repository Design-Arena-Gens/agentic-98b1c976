// Simple in-memory database (for demo purposes)
// In production, replace with actual database

interface Subscriber {
  email: string
  frequency: string
  subscribedAt: string
}

interface AITool {
  id: string
  name: string
  description: string
  url: string
  source: string
  foundAt: string
}

// In-memory storage
let subscribers: Subscriber[] = []
let tools: AITool[] = []

export async function getSubscribers(): Promise<Subscriber[]> {
  return subscribers
}

export async function addSubscriber(email: string, frequency: string): Promise<void> {
  subscribers.push({
    email,
    frequency,
    subscribedAt: new Date().toISOString()
  })
}

export async function getTools(): Promise<AITool[]> {
  return tools
}

export async function addTool(tool: Omit<AITool, 'id' | 'foundAt'>): Promise<void> {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
  tools.push({
    id,
    ...tool,
    foundAt: new Date().toISOString()
  })
}

export async function getToolsByDateRange(startDate: Date, endDate: Date): Promise<AITool[]> {
  return tools.filter(t => {
    const date = new Date(t.foundAt)
    return date >= startDate && date <= endDate
  })
}
