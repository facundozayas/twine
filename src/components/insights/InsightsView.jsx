import { useState } from 'react'
import { CATEGORIES, USERS, BADGES, T } from '../../constants/index.js'
import UserAvatar from '../shared/UserAvatar.jsx'
import Icon from '../shared/Icon.jsx'

export default function InsightsView({ plans, currentUser }) {
  const [rankView, setRankView] = useState('mutual')  // 'mutual' | 'janina' | 'facu'
  const partnerId = currentUser.id === 'janina' ? 'facu' : 'janina'
  const partner   = USERS[partnerId]

  const done = plans.filter(p => p.experience)
  const avgRating  = done.length ? (done.reduce((s, p) => s + Number(p.experience.overall_rating), 0) / done.length).toFixed(1) : '—'
  const moodLift   = done.length ? (done.reduce((s, p) => s + (p.experience.mood_after - p.experience.mood_before), 0) / done.length).toFixed(1) : '—'
  const repeatRate = done.length ? Math.round(done.filter(p => p.experience.would_repeat).length / done.length * 100) : '—'

  // Top 5 lists
  const mutualTop5 = [...plans]
    .filter(p => p.ranking_janina != null && p.ranking_facu != null)
    .map(p => ({ ...p, score: (p.ranking_janina + p.ranking_facu) / 2 }))
    .sort((a, b) => b.score - a.score).slice(0, 5)

  const userTop5 = (userId) => [...plans]
    .filter(p => p[`ranking_${userId}`] != null)
    .sort((a, b) => b[`ranking_${userId}`] - a[`ranking_${userId}`])
    .slice(0, 5)

  const jTop5 = userTop5('janina')
  const fTop5 = userTop5('facu')

  const topList = rankView === 'mutual' ? mutualTop5 : rankView === 'janina' ? jTop5 : fTop5
  const topUser = rankView === 'janina' ? USERS.janina : rankView === 'facu' ? USERS.facu : null

  // Biggest disagreement
  const disagreement = [...plans]
    .filter(p => p.ranking_janina != null && p.ranking_facu != null)
    .map(p => ({ ...p, diff: Math.abs(p.ranking_janina - p.ranking_facu) }))
    .sort((a, b) => b.diff - a.diff)[0]

  // Category counts
  const catData = CATEGORIES.filter(c => c.id !== 'all').map(cat => ({
    ...cat,
    count: plans.filter(p => p.category_id === cat.id).length,
  })).sort((a, b) => b.count - a.count).filter(c => c.count > 0)
  const maxCount = Math.max(...catData.map(c => c.count), 1)

  // Badges
  const earnedBadges = BADGES.map(b => ({ ...b, unlocked: b.threshold(plans) }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Stats */}
      {done.length === 0 ? (
        <div style={{ background: T.surface, borderRadius: T.radius.lg, padding: '24px 20px', border: `1px solid ${T.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📊</div>
          <p className="display" style={{ fontSize: 20, color: T.text, marginBottom: 6 }}>No data yet</p>
          <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6 }}>
            Complete a plan and add your experience rating to start seeing insights.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { label: 'Avg rating',   value: avgRating,   suffix: '/10', color: T.accent },
            { label: 'Mood lift',    value: moodLift > 0 ? `+${moodLift}` : moodLift, suffix: '', color: '#FF8FAB' },
            { label: 'Would repeat', value: repeatRate,  suffix: '%',  color: T.success },
          ].map(s => (
            <div key={s.label} style={{ background: T.surface, borderRadius: T.radius.lg, padding: '14px 12px', border: `1px solid ${T.border}`, textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 20, fontWeight: 600, color: s.color, animation: 'numRoll 0.5s ease' }}>
                {s.value}<span style={{ fontSize: 11 }}>{s.suffix}</span>
              </div>
              <div style={{ fontSize: 10, color: T.textMuted, marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Rankings */}
      <div style={{ background: T.surface, borderRadius: T.radius.lg, padding: 18, border: `1px solid ${T.border}` }}>
        <h3 className="display" style={{ fontSize: 20, marginBottom: 14 }}>Top 5 rankings</h3>

        {/* Toggle */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 14, background: T.surface2, borderRadius: T.radius.md, padding: 3 }}>
          {[
            { id: 'mutual',  label: '💑 Mutual' },
            { id: 'janina',  label: `${USERS.janina.emoji} Janina` },
            { id: 'facu',    label: `${USERS.facu.emoji} Facu` },
          ].map(v => {
            const user = v.id !== 'mutual' ? USERS[v.id] : null
            const isActive = rankView === v.id
            return (
              <button key={v.id} onClick={() => setRankView(v.id)} style={{
                flex: 1, padding: '7px 5px', borderRadius: T.radius.md - 2, fontSize: 11, fontWeight: 600,
                background: isActive ? (user ? user.colorSoft : 'rgba(255,107,53,0.12)') : 'transparent',
                color: isActive ? (user ? user.color : T.accent) : T.textMuted,
                border: `1px solid ${isActive ? (user ? user.colorBorder : T.borderAccent) : 'transparent'}`,
                transition: 'all 0.2s ease',
              }}>{v.label}</button>
            )
          })}
        </div>

        {topList.length === 0 ? (
          <p style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', padding: '12px 0' }}>
            No rankings yet. Go to Rank tab to start!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topList.map((p, i) => {
              const score = rankView === 'mutual' ? p.score
                : p[`ranking_${rankView}`]
              const col = topUser ? topUser.color : T.accent
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: T.radius.md, background: T.surface2 }}>
                  <span className="mono" style={{ fontSize: 12, color: T.textDim, width: 20 }}>#{i + 1}</span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                  <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: col, flexShrink: 0 }}>
                    {typeof score === 'number' ? score.toFixed(1) : '—'}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Disagreement */}
        {disagreement && disagreement.diff >= 2 && (
          <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: T.radius.md, background: T.surface3, border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Biggest disagreement 🤔
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{disagreement.title}</span>
              <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                <span style={{ fontSize: 12, color: USERS.janina.color }}>{USERS.janina.emoji} {disagreement.ranking_janina}</span>
                <span style={{ fontSize: 12, color: USERS.facu.color }}>{USERS.facu.emoji} {disagreement.ranking_facu}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Categories */}
      {catData.length > 0 && (
        <div style={{ background: T.surface, borderRadius: T.radius.lg, padding: 18, border: `1px solid ${T.border}` }}>
          <h3 className="display" style={{ fontSize: 20, marginBottom: 14 }}>Plans by category</h3>
          {catData.map(cat => (
            <div key={cat.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>{cat.emoji} {cat.label}</span>
                <span className="mono" style={{ fontSize: 11, color: T.textMuted }}>{cat.count}</span>
              </div>
              <div style={{ height: 5, background: T.surface2, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: cat.color, width: `${(cat.count / maxCount) * 100}%`, transition: 'width 0.8s ease', opacity: 0.85 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Badges */}
      <div style={{ background: T.surface, borderRadius: T.radius.lg, padding: 18, border: `1px solid ${T.border}` }}>
        <h3 className="display" style={{ fontSize: 20, marginBottom: 4 }}>Couple badges</h3>
        <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 14 }}>Earned through shared experiences</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {earnedBadges.map(badge => (
            <div
              key={badge.id}
              style={{
                textAlign: 'center', padding: '12px 6px', borderRadius: T.radius.md,
                background: badge.unlocked ? T.surface2 : T.surface3,
                border: `1px solid ${badge.unlocked ? T.borderAccent : T.border}`,
                opacity: badge.unlocked ? 1 : 0.4,
                animation: badge.unlocked ? 'badgePop 0.5s ease both' : undefined,
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>{badge.emoji}</div>
              <div style={{ fontSize: 9, fontWeight: 600, color: badge.unlocked ? T.text : T.textMuted, lineHeight: 1.3 }}>{badge.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pattern card */}
      {done.length >= 2 && (
        <div style={{ background: `linear-gradient(135deg, rgba(255,107,53,0.1) 0%, ${T.surface} 100%)`, borderRadius: T.radius.lg, padding: 18, border: `1px solid ${T.borderAccent}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
            <Icon name="spark" size={14} color={T.accent} />
            <span style={{ fontSize: 10, color: T.accent, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Pattern detected</span>
          </div>
          <p className="display" style={{ fontSize: 17, lineHeight: 1.5, color: T.text }}>
            "Your best experiences combine food with something unexpected — keep exploring."
          </p>
          <p style={{ fontSize: 12, color: T.textMuted, marginTop: 7 }}>
            Based on {done.length} completed experiences
          </p>
        </div>
      )}
    </div>
  )
}
