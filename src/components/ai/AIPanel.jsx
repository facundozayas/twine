import { useState, useRef, useEffect } from 'react'
import { T, USERS } from '../../constants/index.js'
import Icon from '../shared/Icon.jsx'
import UserAvatar from '../shared/UserAvatar.jsx'

const QUICK_PROMPTS = [
  'Perfect plan for this Saturday',
  'Something under $30',
  'Rainy day rescue 🌧️',
  'Surprise idea for us',
  'What should we do next?',
]

export default function AIPanel({ plans, currentUser }) {
  const partnerId = currentUser.id === 'janina' ? 'facu' : 'janina'
  const partner   = USERS[partnerId]

  const [messages, setMessages] = useState([{
    role: 'assistant',
    text: `Hey ${currentUser.name}! 💫 I'm your Twine AI. I know what you and ${partner.name} have been saving — ask me anything and I'll craft the perfect plan for the two of you.`,
  }])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  // Scroll to bottom on new message
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  // Build rich context from real data
  const donePlans = plans.filter(p => p.experience)
  const allPlansSummary = plans.map(p => `"${p.title}" (${p.category_id}, status: ${p.status})`).join('; ') || 'none yet'
  const doneSummary = donePlans.map(p => `"${p.title}" rated ${p.experience.overall_rating}/10, repeat: ${p.experience.would_repeat}`).join('; ') || 'none yet'
  const jTop = plans.filter(p => p.ranking_janina != null).sort((a, b) => b.ranking_janina - a.ranking_janina).slice(0, 3).map(p => p.title).join(', ') || 'not ranked yet'
  const fTop = plans.filter(p => p.ranking_facu != null).sort((a, b) => b.ranking_facu - a.ranking_facu).slice(0, 3).map(p => p.title).join(', ') || 'not ranked yet'

  const systemPrompt = `You are Twine AI, a warm and playful relationship companion helping a couple called Janina and Facu plan experiences together.
You are currently talking to ${currentUser.name}.

Their real data:
- All saved plans: ${allPlansSummary}
- Completed experiences: ${doneSummary}
- Janina's top picks: ${jTop}
- Facu's top picks: ${fTop}

Rules:
- Always respond in English
- Be warm, specific, and personal — reference their actual plans and data
- Keep responses concise (3–5 sentences) unless they ask for a detailed itinerary
- Use emojis sparingly (1–2 max per message)
- Never be generic — always tie to what you know about them
- If they have no data yet, encourage them to add ideas`

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', text: msg }])
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }))
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [...history, { role: 'user', content: msg }],
        }),
      })
      const data = await res.json()
      const reply = data.content?.find(b => b.type === 'text')?.text || "I couldn't think of something right now — try again!"
      setMessages(m => [...m, { role: 'assistant', text: reply }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', text: 'Connection issue — please try again in a moment.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 160px)', minHeight: 480 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, borderBottom: `1px solid ${T.border}`, marginBottom: 0 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: currentUser.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: `0 0 16px ${currentUser.color}44` }}>
          {currentUser.emoji}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: T.text }}>Twine AI · {currentUser.name}</div>
          <div style={{ fontSize: 11, color: T.success, display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: T.success, animation: 'pulse 2s infinite' }} />
            Knows your taste profile
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className="fade-up"
            style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <div style={{
              maxWidth: '82%', padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' ? currentUser.gradient : T.surface2,
              color: msg.role === 'user' ? '#fff' : T.text,
              fontSize: 13, lineHeight: 1.65,
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: T.surface2, borderRadius: '16px 16px 16px 4px', width: 'fit-content' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: T.textMuted, animation: `pulse 1.2s ease ${i * 0.2}s infinite` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {QUICK_PROMPTS.map(p => (
          <button
            key={p}
            onClick={() => send(p)}
            style={{
              fontSize: 11, padding: '5px 11px', borderRadius: T.radius.full,
              background: T.surface2, color: T.textMuted,
              border: `1px solid ${T.border}`, transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = currentUser.color; e.currentTarget.style.color = currentUser.color }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMuted }}
          >{p}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask for ideas, itineraries, inspiration..."
          style={{
            flex: 1, background: T.surface2, border: `1px solid ${T.border}`,
            borderRadius: T.radius.md, padding: '10px 14px',
            color: T.text, fontSize: 13, outline: 'none',
          }}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          style={{
            padding: '10px 14px', borderRadius: T.radius.md,
            background: currentUser.gradient, color: '#fff',
            opacity: loading || !input.trim() ? 0.45 : 1,
            transition: 'opacity 0.2s ease',
          }}
        >
          <Icon name="send" size={16} color="#fff" />
        </button>
      </div>
    </div>
  )
}
