import { useState, useRef, useCallback } from 'react'
import { getCat, getUser, T } from '../../constants/index.js'
import UserAvatar from '../shared/UserAvatar.jsx'
import Icon from '../shared/Icon.jsx'

export default function SwipeView({ plans, currentUser, onUpdateRanking }) {
  const partnerId = currentUser.id === 'janina' ? 'facu' : 'janina'
  const partner   = getUser(partnerId)

  // Show plans suggested by the OTHER user that I haven't ranked yet
  // (excluding recurring plans — those don't need ranking)
  const queue = plans.filter(p =>
    p.suggested_by === partnerId &&
    p[`ranking_${currentUser.id}`] == null &&
    p.status !== 'done' &&
    !p.is_recurring
  )

  const [idx, setIdx]           = useState(0)
  const [phase, setPhase]       = useState('swipe')   // 'swipe' | 'score'
  const [decision, setDecision] = useState(null)
  const [pendingScore, setPendingScore] = useState(7)
  const [done, setDone]         = useState([])
  const [drag, setDrag]         = useState({ active: false, x: 0, y: 0, sx: 0, sy: 0 })

  const plan      = queue[idx]
  const cat       = plan ? getCat(plan.category_id) : null
  const partnerScore = plan ? plan[`ranking_${partnerId}`] : null

  // After swipe → show score slider
  const handleSwipe = useCallback((dir) => {
    setDecision(dir)
    setPendingScore(dir === 'yes' ? 8 : dir === 'maybe' ? 5 : 2)
    setTimeout(() => {
      setDecision(null)
      setPhase('score')
    }, 350)
  }, [])

  const handleConfirmScore = useCallback(async () => {
    await onUpdateRanking(plan.id, currentUser.id, pendingScore)
    setDone(d => [...d, { id: plan.id, score: pendingScore }])
    setPhase('swipe')
    setIdx(i => i + 1)
  }, [plan, currentUser, pendingScore, onUpdateRanking])

  const onMouseDown = e => setDrag({ active: true, x: 0, y: 0, sx: e.clientX, sy: e.clientY })
  const onMouseMove = e => { if (!drag.active) return; setDrag(d => ({ ...d, x: e.clientX - d.sx, y: e.clientY - d.sy })) }
  const onMouseUp   = () => {
    if (Math.abs(drag.x) > 80) handleSwipe(drag.x > 0 ? 'yes' : 'no')
    setDrag(d => ({ ...d, active: false, x: 0, y: 0 }))
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (queue.length === 0) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16, padding: '0 16px' }}>
        <div style={{ fontSize: 52 }}>{done.length > 0 ? '🎉' : '💤'}</div>
        <h2 className="display" style={{ fontSize: 28, textAlign: 'center' }}>
          {done.length > 0 ? `All ranked, ${currentUser.name}!` : 'Nothing to rank yet'}
        </h2>
        <p style={{ fontSize: 14, color: T.textMuted, textAlign: 'center', maxWidth: 260, lineHeight: 1.6 }}>
          {done.length > 0
            ? `You ranked ${done.length} of ${partner.name}'s ideas.`
            : `When ${partner.name} adds a new plan, it'll appear here for you to rank.`}
        </p>
      </div>
    )
  }

  if (!plan) return null

  // ── Score phase ────────────────────────────────────────────────────────────
  if (phase === 'score') {
    return (
      <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '0 4px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{cat.emoji}</div>
          <h2 className="display" style={{ fontSize: 24 }}>{plan.title}</h2>
          <p style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>How excited are you about this?</p>
        </div>

        <div style={{ width: '100%', maxWidth: 340, background: T.surface, borderRadius: T.radius.xl, padding: '24px 22px', border: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: T.textMuted }}>Your excitement</span>
            <span className="mono" style={{ fontSize: 28, fontWeight: 700, color: currentUser.color }}>{pendingScore}<span style={{ fontSize: 14 }}>/10</span></span>
          </div>

          {/* Number buttons 1-10 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 20 }}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <button key={n} onClick={() => setPendingScore(n)} style={{
                padding: '10px 0', borderRadius: T.radius.md, fontSize: 15, fontWeight: 600,
                background: pendingScore === n ? currentUser.colorSoft : T.surface2,
                color: pendingScore === n ? currentUser.color : T.textMuted,
                border: `2px solid ${pendingScore === n ? currentUser.color : 'transparent'}`,
                transition: 'all 0.15s ease',
              }}>{n}</button>
            ))}
          </div>

          {/* Slider */}
          <input type="range" min={1} max={10} value={pendingScore}
            onChange={e => setPendingScore(Number(e.target.value))}
            style={{ width: '100%', accentColor: currentUser.color, marginBottom: 20 }} />

          {partnerScore != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: '8px 12px', borderRadius: T.radius.md, background: partner.colorSoft, border: `1px solid ${partner.colorBorder}` }}>
              <UserAvatar userId={partnerId} size={16} />
              <span style={{ fontSize: 12, color: partner.color }}>{partner.name} gave it <strong>{partnerScore}/10</strong></span>
            </div>
          )}

          <button onClick={handleConfirmScore} style={{
            width: '100%', padding: '13px', borderRadius: T.radius.md,
            background: currentUser.gradient, color: '#fff',
            fontSize: 14, fontWeight: 600,
            boxShadow: `0 4px 16px ${currentUser.color}44`,
          }}>
            Confirm score ✓
          </button>
        </div>
      </div>
    )
  }

  // ── Swipe phase ───────────────────────────────────────────────────────────
  const rot        = drag.x * 0.07
  const yesOpacity = Math.min(1, Math.max(0, drag.x / 80))
  const noOpacity  = Math.min(1, Math.max(0, -drag.x / 80))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
      {/* Header */}
      <div style={{ width: '100%', maxWidth: 370, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserAvatar userId={currentUser.id} size={30} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: currentUser.color }}>Ranking {partner.name}'s ideas</div>
            <div style={{ fontSize: 10, color: T.textMuted }}>Swipe to decide, then score</div>
          </div>
        </div>
        <span className="mono" style={{ fontSize: 12, color: T.textMuted }}>{idx + 1}/{queue.length}</span>
      </div>

      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 370, height: 3, background: T.surface2, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: currentUser.color, width: `${(idx / queue.length) * 100}%`, transition: 'width 0.3s ease', borderRadius: 2 }} />
      </div>

      {/* Card stack */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 360, height: 430 }}>
        {[2, 1].map(o => (
          <div key={o} style={{ position: 'absolute', inset: 0, background: T.surface, borderRadius: T.radius.xxl, transform: `scale(${1 - o * 0.04}) translateY(${o * 11}px)`, border: `1px solid ${T.border}`, zIndex: o }} />
        ))}

        <div
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          style={{
            position: 'absolute', inset: 0, background: T.surface,
            border: `1px solid ${T.border}`, borderRadius: T.radius.xxl, zIndex: 3,
            cursor: drag.active ? 'grabbing' : 'grab', userSelect: 'none', overflow: 'hidden',
            transform: drag.active
              ? `translateX(${drag.x}px) translateY(${drag.y * 0.28}px) rotate(${rot}deg)`
              : decision === 'yes' ? 'translateX(120%) rotate(18deg)' : decision === 'no' ? 'translateX(-120%) rotate(-18deg)' : 'none',
            transition: drag.active ? 'none' : 'transform 0.35s ease',
            animation: decision ? undefined : 'cardIn 0.4s ease',
          }}
        >
          <div style={{ height: 160, background: `linear-gradient(135deg, ${cat.color}25 0%, ${T.surface2} 100%)`, padding: '20px 22px 0', position: 'relative' }}>
            <div style={{ fontSize: 40, marginBottom: 5 }}>{cat.emoji}</div>
            <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{cat.label}</div>
            <div style={{ position: 'absolute', top: 16, right: 16 }}>
              <UserAvatar userId={plan.suggested_by} size={26} showName />
            </div>
            <div style={{ position: 'absolute', top: 18, right: 90, opacity: yesOpacity, transform: `scale(${0.5 + yesOpacity * 0.5})`, transition: 'none', pointerEvents: 'none' }}>
              <div style={{ padding: '5px 12px', border: `2.5px solid ${T.success}`, borderRadius: 8, color: T.success, fontSize: 13, fontWeight: 700 }}>YES ✓</div>
            </div>
            <div style={{ position: 'absolute', top: 18, left: 16, opacity: noOpacity, transform: `scale(${0.5 + noOpacity * 0.5})`, transition: 'none', pointerEvents: 'none' }}>
              <div style={{ padding: '5px 12px', border: '2.5px solid #FF6B6B', borderRadius: 8, color: '#FF6B6B', fontSize: 13, fontWeight: 700 }}>SKIP ✕</div>
            </div>
          </div>
          <div style={{ padding: '16px 22px' }}>
            <h2 className="display" style={{ fontSize: 23, fontWeight: 500, lineHeight: 1.2, marginBottom: 8 }}>{plan.title}</h2>
            <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{plan.description}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {plan.location && <span style={{ fontSize: 12, color: T.textMuted }}>{plan.location}</span>}
              {plan.cost > 0 && <span style={{ fontSize: 12, color: T.accent2 }}>${plan.cost}</span>}
              {plan.duration_mins > 0 && <span style={{ fontSize: 12, color: T.textMuted }}>{plan.duration_mins < 60 ? `${plan.duration_mins}m` : `${plan.duration_mins / 60}h`}</span>}
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: 0.3 }}>
            <span style={{ fontSize: 10, color: T.textMuted }}>← skip · drag · yes →</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 14 }}>
        {[
          { dir: 'no',    label: 'Skip',  icon: 'x',     color: '#FF6B6B', bg: 'rgba(255,107,107,0.1)' },
          { dir: 'maybe', label: 'Maybe', icon: 'clock', color: T.accent2, bg: 'rgba(255,179,71,0.1)' },
          { dir: 'yes',   label: 'Yes!',  icon: 'heart', color: T.success, bg: T.successSoft },
        ].map(({ dir, label, icon, color, bg }) => (
          <button key={dir} onClick={() => handleSwipe(dir)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
            padding: '12px 18px', borderRadius: T.radius.lg,
            background: bg, color, border: `1px solid ${color}33`,
            fontSize: 12, fontWeight: 500, transition: 'all 0.2s ease',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.07)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Icon name={icon} size={20} color={color} />{label}
          </button>
        ))}
      </div>
    </div>
  )
}
