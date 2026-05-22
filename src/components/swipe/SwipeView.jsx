import { useState, useRef, useCallback } from 'react'
import { getCat, getUser, T } from '../../constants/index.js'
import UserAvatar from '../shared/UserAvatar.jsx'
import Icon from '../shared/Icon.jsx'

export default function SwipeView({ plans, currentUser, onUpdateRanking }) {
  const partnerId = currentUser.id === 'janina' ? 'facu' : 'janina'
  const partner   = getUser(partnerId)

  // Only rank ideas not yet ranked by this user
  const queue = plans.filter(p => p[`ranking_${currentUser.id}`] == null && p.status !== 'done')
  const ranked = plans.filter(p => p[`ranking_${currentUser.id}`] != null)

  const [idx, setIdx]         = useState(0)
  const [decision, setDecision] = useState(null)  // 'yes' | 'no'
  const [done, setDone]         = useState([])
  const [drag, setDrag]         = useState({ active: false, x: 0, y: 0, sx: 0, sy: 0 })

  const plan    = queue[idx]
  const cat     = plan ? getCat(plan.category_id) : null
  const partnerScore = plan ? plan[`ranking_${partnerId}`] : null

  const decide = useCallback(async (dir, score) => {
    if (!plan) return
    setDecision(dir)
    setDone(d => [...d, { id: plan.id, dir, score }])
    await onUpdateRanking(plan.id, currentUser.id, score)
    setTimeout(() => { setDecision(null); setIdx(i => i + 1) }, 380)
  }, [plan, currentUser, onUpdateRanking])

  const onMouseDown = e => setDrag({ active: true, x: 0, y: 0, sx: e.clientX, sy: e.clientY })
  const onMouseMove = e => {
    if (!drag.active) return
    setDrag(d => ({ ...d, x: e.clientX - d.sx, y: e.clientY - d.sy }))
  }
  const onMouseUp = () => {
    if (Math.abs(drag.x) > 80) decide(drag.x > 0 ? 'yes' : 'no', drag.x > 0 ? 9 : 2)
    setDrag(d => ({ ...d, active: false, x: 0, y: 0 }))
  }

  // ── All ranked ──────────────────────────────────────────────────────────────
  if (queue.length === 0) {
    const yesCount = done.filter(d => d.dir === 'yes').length
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16, padding: '0 16px' }}>
        <div style={{ fontSize: 52 }}>🎉</div>
        <h2 className="display" style={{ fontSize: 28, textAlign: 'center' }}>All ranked, {currentUser.name}!</h2>
        <p style={{ fontSize: 14, color: T.textMuted, textAlign: 'center', maxWidth: 260, lineHeight: 1.6 }}>
          {ranked.length > 0
            ? `You've ranked all ${ranked.length} ideas. ${yesCount} marked as must-do this session.`
            : 'No unranked plans yet. Add some ideas first!'}
        </p>
        {done.length > 0 && (
          <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
            {[
              { label: 'Yes!',   filter: 'yes',   color: T.success },
              { label: 'No',     filter: 'no',    color: '#FF6B6B' },
            ].map(({ label, filter, color }) => (
              <div key={filter} style={{ textAlign: 'center' }}>
                <div className="mono" style={{ fontSize: 24, color, fontWeight: 700 }}>
                  {done.filter(d => d.dir === filter).length}
                </div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── No plan ─────────────────────────────────────────────────────────────────
  if (!plan) return null

  const rot = drag.x * 0.07
  const yesOpacity  = Math.min(1, Math.max(0, drag.x / 80))
  const noOpacity   = Math.min(1, Math.max(0, -drag.x / 80))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
      {/* Header row */}
      <div style={{ width: '100%', maxWidth: 370, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserAvatar userId={currentUser.id} size={30} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: currentUser.color }}>{currentUser.name}'s ranking</div>
            <div style={{ fontSize: 10, color: T.textMuted }}>Swipe to prioritize</div>
          </div>
        </div>
        <span className="mono" style={{ fontSize: 12, color: T.textMuted }}>{idx + 1}/{queue.length}</span>
      </div>

      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 370, height: 3, background: T.surface2, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: currentUser.color, width: `${(idx / queue.length) * 100}%`, transition: 'width 0.3s ease', borderRadius: 2 }} />
      </div>

      {/* Partner hint */}
      {partnerScore != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: T.radius.full, background: partner.colorSoft, border: `1px solid ${partner.colorBorder}` }}>
          <UserAvatar userId={partnerId} size={16} />
          <span style={{ fontSize: 12, color: partner.color }}>
            {partner.name} gave it <strong>{partnerScore}/10</strong>
          </span>
        </div>
      )}

      {/* Card stack */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 360, height: 450 }}>
        {[2, 1].map(o => (
          <div key={o} style={{
            position: 'absolute', inset: 0, background: T.surface, borderRadius: T.radius.xxl,
            transform: `scale(${1 - o * 0.04}) translateY(${o * 11}px)`,
            border: `1px solid ${T.border}`, zIndex: o,
          }} />
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
          {/* Card top */}
          <div style={{ height: 180, background: `linear-gradient(135deg, ${cat.color}25 0%, ${T.surface2} 100%)`, padding: '22px 22px 0', position: 'relative' }}>
            <div style={{ fontSize: 44, marginBottom: 6 }}>{cat.emoji}</div>
            <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{cat.label}</div>
            {/* Suggested by */}
            <div style={{ position: 'absolute', top: 18, right: 18 }}>
              <UserAvatar userId={plan.suggested_by} size={26} showName />
            </div>
            {/* Overlays */}
            <div style={{ position: 'absolute', top: 20, right: 100, opacity: yesOpacity, transform: `scale(${0.5 + yesOpacity * 0.5})`, transition: 'none', pointerEvents: 'none' }}>
              <div style={{ padding: '5px 12px', border: `2.5px solid ${T.success}`, borderRadius: 8, color: T.success, fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>YES ✓</div>
            </div>
            <div style={{ position: 'absolute', top: 20, left: 18, opacity: noOpacity, transform: `scale(${0.5 + noOpacity * 0.5})`, transition: 'none', pointerEvents: 'none' }}>
              <div style={{ padding: '5px 12px', border: '2.5px solid #FF6B6B', borderRadius: 8, color: '#FF6B6B', fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>SKIP ✕</div>
            </div>
          </div>

          {/* Card body */}
          <div style={{ padding: '18px 22px' }}>
            <h2 className="display" style={{ fontSize: 23, fontWeight: 500, lineHeight: 1.2, marginBottom: 8 }}>{plan.title}</h2>
            <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {plan.description}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {plan.location        && <span style={{ fontSize: 12, color: T.textMuted }}>{plan.location}</span>}
              {plan.cost > 0        && <span style={{ fontSize: 12, color: T.accent2 }}>${plan.cost}</span>}
              {plan.duration_mins   && <span style={{ fontSize: 12, color: T.textMuted }}>{plan.duration_mins < 60 ? `${plan.duration_mins}m` : `${plan.duration_mins / 60}h`}</span>}
            </div>
            {plan.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 5, marginTop: 10, flexWrap: 'wrap' }}>
                {plan.tags.slice(0, 3).map(t => (
                  <span key={t} style={{ fontSize: 10, padding: '3px 9px', borderRadius: T.radius.full, background: T.surface3, color: T.textMuted }}>{t}</span>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'absolute', bottom: 13, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: 0.3 }}>
            <span style={{ fontSize: 10, color: T.textMuted }}>← skip · drag to decide · yes →</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 14 }}>
        {[
          { dir: 'no',    score: 2, label: 'Skip',   icon: 'x',     color: '#FF6B6B', bg: 'rgba(255,107,107,0.1)' },
          { dir: 'maybe', score: 5, label: 'Maybe',  icon: 'clock', color: T.accent2, bg: 'rgba(255,179,71,0.1)' },
          { dir: 'yes',   score: 9, label: 'Yes!',   icon: 'heart', color: T.success, bg: T.successSoft },
        ].map(({ dir, score, label, icon, color, bg }) => (
          <button
            key={dir}
            onClick={() => decide(dir, score)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              padding: '12px 18px', borderRadius: T.radius.lg,
              background: bg, color, border: `1px solid ${color}33`,
              fontSize: 12, fontWeight: 500, transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.07)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Icon name={icon} size={20} color={color} />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
