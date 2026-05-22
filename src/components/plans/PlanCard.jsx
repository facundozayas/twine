import { getCat, getUser, getStatus, T, USERS } from '../../constants/index.js'
import UserAvatar from '../shared/UserAvatar.jsx'

const fmt = {
  cost: (n) => n === 0 ? 'Free' : n < 40 ? '$' : n < 120 ? '$$' : n < 400 ? '$$$' : '$$$$',
  dur:  (m) => m < 60 ? `${m}m` : m < 1440 ? `${m / 60}h` : `${Math.round(m / 1440)}d`,
}

export default function PlanCard({ plan, currentUser, onClick, compact = false, index = 0 }) {
  const cat    = getCat(plan.category_id)
  const status = getStatus(plan.status)
  const isMine = plan.suggested_by === currentUser.id

  const myScore  = plan[`ranking_${currentUser.id}`]
  const partnerId = currentUser.id === 'janina' ? 'facu' : 'janina'
  const partnerScore = plan[`ranking_${partnerId}`]
  const partner = getUser(partnerId)

  return (
    <div
      onClick={onClick}
      className="fade-up"
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: T.radius.lg,
        padding: compact ? '13px 16px' : '17px 19px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        animationDelay: `${index * 0.04}s`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = T.surface2
        e.currentTarget.style.borderColor = cat.color + '44'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = T.surface
        e.currentTarget.style.borderColor = T.border
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Category color bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: cat.color, borderRadius: `${T.radius.lg}px 0 0 ${T.radius.lg}px`,
      }} />

      <div style={{ paddingLeft: 9 }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Category + "my idea" badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 13 }}>{cat.emoji}</span>
              <span style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
                {cat.label}
              </span>
              {isMine && (
                <span style={{
                  fontSize: 9, padding: '1px 6px', borderRadius: T.radius.full,
                  background: currentUser.colorSoft, color: currentUser.color, fontWeight: 600,
                }}>my idea</span>
              )}
            </div>
            <h3 className="display" style={{ fontSize: compact ? 17 : 19, fontWeight: 500, lineHeight: 1.2, marginBottom: compact ? 0 : 4 }}>
              {plan.title}
            </h3>
            {!compact && plan.description && (
              <p style={{
                fontSize: 13, color: T.textMuted, lineHeight: 1.5, marginBottom: 9,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>{plan.description}</p>
            )}
          </div>

          {/* Dual ranking */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0, alignItems: 'flex-end' }}>
            {myScore != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <UserAvatar userId={currentUser.id} size={14} />
                <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: currentUser.color }}>{myScore}</span>
              </div>
            )}
            {partnerScore != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <UserAvatar userId={partnerId} size={14} />
                <span className="mono" style={{ fontSize: 13, color: T.textMuted }}>{partnerScore}</span>
              </div>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: T.radius.sm, background: T.surface2, color: status.color, fontWeight: 500 }}>
            {status.label}
          </span>
          {plan.location && (
            <span style={{ fontSize: 11, color: T.textMuted }}>{plan.location}</span>
          )}
          {plan.cost > 0 && (
            <span style={{ fontSize: 11, color: T.textMuted }}>{fmt.cost(plan.cost)}</span>
          )}
          {plan.duration_mins > 0 && (
            <span style={{ fontSize: 11, color: T.textMuted }}>{fmt.dur(plan.duration_mins)}</span>
          )}
          <UserAvatar userId={plan.suggested_by} size={14} showName />
        </div>

        {/* Tags */}
        {!compact && plan.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
            {plan.tags.slice(0, 4).map(t => (
              <span key={t} style={{
                fontSize: 10, padding: '2px 8px', borderRadius: T.radius.full,
                background: T.surface3, color: T.textMuted,
              }}>{t}</span>
            ))}
          </div>
        )}

        {/* Experience badge */}
        {plan.experience && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 11, color: T.success }}>★ {plan.experience.overall_rating}/10</span>
            {plan.experience.would_repeat && (
              <span style={{ fontSize: 10, color: T.textMuted }}>· would repeat</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
