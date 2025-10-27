'use client'

import { useState, useEffect } from 'react'

interface AITool {
  id: string
  name: string
  description: string
  url: string
  source: string
  foundAt: string
}

export default function Home() {
  const [email, setEmail] = useState('')
  const [frequency, setFrequency] = useState('daily')
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [tools, setTools] = useState<AITool[]>([])
  const [stats, setStats] = useState({ total: 0, today: 0, thisWeek: 0 })

  useEffect(() => {
    fetchLatestTools()
    fetchStats()
  }, [])

  const fetchLatestTools = async () => {
    try {
      const res = await fetch('/api/tools')
      if (res.ok) {
        const data = await res.json()
        setTools(data.tools || [])
      }
    } catch (error) {
      console.error('Error fetching tools:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, frequency })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: data.message })
        setEmail('')
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to subscribe' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleManualScan = async () => {
    setLoading(true)
    setMessage({ type: 'info', text: 'Starting manual scan...' })

    try {
      const res = await fetch('/api/scan', {
        method: 'POST'
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: `Scan complete! Found ${data.newTools} new tools.` })
        fetchLatestTools()
        fetchStats()
      } else {
        setMessage({ type: 'error', text: data.error || 'Scan failed' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred during scan.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🤖 AI Tools & Startups Tracker</h1>
        <p>Stay updated with the latest AI tools and startups launches</p>
      </div>

      <div className="stats">
        <div className="stat-card">
          <div className="number">{stats.total}</div>
          <div className="label">Total Tools</div>
        </div>
        <div className="stat-card">
          <div className="number">{stats.today}</div>
          <div className="label">Found Today</div>
        </div>
        <div className="stat-card">
          <div className="number">{stats.thisWeek}</div>
          <div className="label">This Week</div>
        </div>
      </div>

      <div className="form-section">
        <h2>📧 Subscribe for Updates</h2>
        <form onSubmit={handleSubscribe}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="frequency">Email Frequency</label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                fontSize: '1rem'
              }}
            >
              <option value="realtime">Realtime (as found)</option>
              <option value="daily">Daily Digest</option>
              <option value="weekly">Weekly Summary</option>
            </select>
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="form-section">
        <h2>🔍 Manual Scan</h2>
        <p style={{ marginBottom: '1rem', color: '#b0b0b0' }}>
          Trigger an immediate scan for new AI tools and startups
        </p>
        <button onClick={handleManualScan} className="btn" disabled={loading}>
          {loading ? 'Scanning...' : 'Start Scan Now'}
        </button>
      </div>

      <div className="form-section">
        <h2>🆕 Latest Discoveries</h2>
        {tools.length === 0 ? (
          <p style={{ color: '#808080', textAlign: 'center', padding: '2rem' }}>
            No tools found yet. Run a scan to discover AI tools!
          </p>
        ) : (
          <div className="tools-grid">
            {tools.map((tool) => (
              <div key={tool.id} className="tool-card">
                <h3>{tool.name}</h3>
                <p>{tool.description}</p>
                <p className="meta">
                  Source: {tool.source}<br />
                  Found: {new Date(tool.foundAt).toLocaleDateString()}
                </p>
                {tool.url && (
                  <p><a href={tool.url} target="_blank" rel="noopener noreferrer">Visit →</a></p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
