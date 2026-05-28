import { useState } from 'react'
import { CATEGORIES, USERS, BADGES, T } from '../../constants/index.js'
import Icon from '../shared/Icon.jsx'
import UserAvatar from '../shared/UserAvatar.jsx'

function exportToExcel(plans) {
  const rows = [
    ['Plan', 'Category', 'Added by', 'Status', 'Recurring',
     'Excitement Janina', 'Excitement Facu', 'Mutual Excitement',
     'Overall Janina', 'Overall Facu',
     'Fun Janina', 'Fun Facu',
     'Repeat Janina', 'Repeat Facu',
     'Location', 'Cost', 'Duration (min)', 'Tags', 'Notes', 'Date Added']
  ]

  plans.forEach(p => {
    const exp = p.experience
    const mutual = p.ranking_janina != null && p.ranking_facu != null
      ? ((p.ranking_janina + p.ranking_facu) / 2).toFixed(1) : ''
    rows.push([
      p.title,
      p.category_id,
      p.suggested_by,
      p.status,
      p.is_recurring ? 'Yes' : 'No',
      p.ranking_janina ?? '',
      p.ranking_facu ?? '',
      mutual,
      exp?.overall_janina ?? '',
      exp?.overall_facu ?? '',
      exp?.fun_janina ?? '',
      exp?.fun_facu ?? '',
      exp?.repeat_janina != null ? (exp.repeat_janina ? 'Yes' : 'No') : '',
      exp?.repeat_facu   != null ? (exp.repeat_facu   ? 'Yes' : 'No') : '',
      p.location,
      p.cost,
      p.duration_mins,
      (p.tags || []).join(', '),
      p.notes,
      p.created_at?.split('T')[0] || '',
    ])
  })

  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `twine-plans-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function InsightsView({ plans, currentUser }) {
  const [tab, setTab] = useState('expectations')  // 'expectations' | 'experiences'
  const [rankView, setRankView] = useState('mutual')

  const partnerId = currentUser.id === 'janina' ? 'facu' : 'janina'
  const partner   = USERS[partnerId]

  // ── Expectations data (plans with rankings, not done yet) ─────────────────
  const rankedPlans = plans.filter(p =>
    !p.is_recurring &&
    (p.ranking_janina != null || p.ranking_facu != null)
  )

  const mutualTop5 = [...rankedPlans]
    .filter(p => p.ranking_janina != null && p.ranking_facu != null)
    .map(p => ({ ...p, score: (p.ranking_janina + p.ranking_facu) / 2 }))
    .sort((a, b) => b.score - a.score).slice(0, 5)

  const userTop5 = (uid) => [...rankedPlans]
    .filter(p => p[`ranking_${uid}`] != null)
    .sort((a, b) => b[`ranking_${uid}`] - a[`ranking_${uid}`])
    .slice(0, 5)

  const jTop5 = userTop5('janina')
  const fTop5 = userTop5('facu')
  const topList = rankView === 'mutual' ? mutualTop5 : rankView === 'janina' ? jTop5 : fTop5
  const topUser = rankView !== 'mutual' ? USERS[rankView] : null

  const disagreement = [...rankedPlans]
    .filter(p => p.ranking_janina != null && p.ranking_facu != null)
    .map(p => ({ ...p, diff: Math.abs(p.ranking_janina - p.ranking_facu) }))
    .sort((a, b) => b.diff - a.diff)[0]

  // ── Experiences data ──────────────────────────────────────────────────────
  const done = plans.filter(p => p.experience)
  const jRated = done.filter(p => p.experience.overall_janina != null)
  const fRated = done.filter(p => p.experience.overall_facu != null)

  const avg = (arr, key) => arr.length ? (arr.reduce((s, p) => s + (p.experience[key] || 0), 0) / arr.length).toFixed(1) : '—'
  const repeatPct = (arr, key) => {
    const rated = arr.filter(p => p.experience[key] != null)
    return rated.length ? Math.round(rated.filter(p => p.experience[key]).length / rated.length * 100) + '%' : '—'
  }

  // ── Categories ────────────────────────────────────────────────────────────
  const catData = CATEGORIES.filter(c => c.id !== 'all' && c.id !== 'regulars').map(cat => ({
    ...cat, count: plans.filter(p => p.category_id === cat.id).length,
  })).sort((a, b) => b.count - a.count).filter(c => c.count > 0)
  const maxCount = Math.max(...catData.map(c => c.count), 1)

  const earnedBadges = BADGES.map(b => ({ ...b, unlocked: b.threshold(plans) }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Tab toggle */}
      <div style={{ display: 'flex', gap: 0, background: T.surface2, borderRadius: T.radius.lg, padding: 4 }}>
        {[
          { id: 'expectations', label: '📊 Expectations' },
          { id: 'experiences',  label: '✅ Experiences' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '10px', borderRadius: T.radius.md, fontSize: 13, fontWeight: 600,
            background: tab === t.id ? T.surface : 'transparent',
            color: tab === t.id ? T.text : T.textMuted,
            border: `1px solid ${tab === t.id ? T.border : 'transparent'}`,
            transition: 'all 0.2s ease',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── EXPECTATIONS TAB ── */}
      {tab === 'expectations' && (
        <>
          {rankedPlans.length === 0 ? (
            <div style={{ background: T.surface, borderRadius: T.radius.lg, padding: '28px 20px', border: `1px solid ${T.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📊</div>
              <p className="display" style={{ fontSize: 20, marginBottom: 6 }}>No rankings yet</p>
              <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6 }}>Add plans and rank them in the Rank tab.</p>
            </div>
          ) : (
            <>
              {/* Top 5 */}
              <div style={{ background: T.surface, borderRadius: T.radius.lg, padding: 18, border: `1px solid ${T.border}` }}>
                <h3 className="display" style={{ fontSize: 20, marginBottom: 14 }}>Top 5 by excitement</h3>
                <div style={{ display: 'flex', gap: 5, marginBottom: 14, background: T.surface2, borderRadius: T.radius.md, padding: 3 }}>
                  {[{ id: 'mutual', label: '💑 Mutual' }, { id: 'janina', label: `${USERS.janina.emoji} Janina` }, { id: 'facu', label: `${USERS.facu.emoji} Facu` }].map(v => {
                    const u = v.id !== 'mutual' ? USERS[v.id] : null
                    const isA = rankView === v.id
                    return (
                      <button key={v.id} onClick={() => setRankView(v.id)} style={{
                        flex: 1, padding: '7px 5px', borderRadius: T.radius.md - 2, fontSize: 11, fontWeight: 600,
                        background: isA ? (u ? u.colorSoft : 'rgba(255,107,53,0.12)') : 'transparent',
                        color: isA ? (u ? u.color : T.accent) : T.textMuted,
                        border: `1px solid ${isA ? (u ? u.colorBorder : T.borderAccent) : 'transparent'}`,
                        transition: 'all 0.2s ease',
                      }}>{v.label}</button>
                    )
                  })}
                </div>
                {topList.length === 0 ? (
                  <p style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', padding: '10px 0' }}>No data for this view yet.</p>
                ) : topList.map((p, i) => {
                  const score = rankView === 'mutual' ? p.score : p[`ranking_${rankView}`]
                  return (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: T.radius.md, background: T.surface2, marginBottom: 6 }}>
                      <span className="mono" style={{ fontSize: 12, color: T.textDim, width: 20 }}>#{i + 1}</span>
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                      <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: topUser ? topUser.color : T.accent }}>
                        {typeof score === 'number' ? score.toFixed(1) : '—'}
                      </span>
                    </div>
                  )
                })}

                {/* Disagreement */}
                {disagreement && disagreement.diff >= 2 && (
                  <div style={{ marginTop: 10, padding: '12px 14px', borderRadius: T.radius.md, background: T.surface3, border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>Biggest disagreement 🤔</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{disagreement.title}</span>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <span style={{ fontSize: 12, color: USERS.janina.color }}>{USERS.janina.emoji} {disagreement.ranking_janina}</span>
                        <span style={{ fontSize: 12, color: USERS.facu.color }}>{USERS.facu.emoji} {disagreement.ranking_facu}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Category breakdown */}
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
            </>
          )}
        </>
      )}

      {/* ── EXPERIENCES TAB ── */}
      {tab === 'experiences' && (
        <>
          {done.length === 0 ? (
            <div style={{ background: T.surface, borderRadius: T.radius.lg, padding: '28px 20px', border: `1px solid ${T.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
              <p className="display" style={{ fontSize: 20, marginBottom: 6 }}>No experiences yet</p>
              <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6 }}>Mark a plan as Done and rate it to see data here.</p>
            </div>
          ) : (
            <>
              {/* Stats per user */}
              <div style={{ background: T.surface, borderRadius: T.radius.lg, padding: 18, border: `1px solid ${T.border}` }}>
                <h3 className="display" style={{ fontSize: 20, marginBottom: 14 }}>Ratings comparison</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {Object.values(USERS).map(user => {
                    const uid    = user.id
                    const rated  = done.filter(p => p.experience[`overall_${uid}`] != null)
                    const avgO   = avg(rated, `overall_${uid}`)
                    const avgF   = avg(rated, `fun_${uid}`)
                    const repPct = repeatPct(done, `repeat_${uid}`)
                    return (
                      <div key={uid} style={{ background: user.colorSoft, borderRadius: T.radius.lg, padding: 14, border: `1px solid ${user.colorBorder}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                          <div style={{ fontSize: 20 }}>{user.emoji}</div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: user.color }}>{user.name}</span>
                        </div>
                        {[
                          { label: 'Overall', value: avgO, suffix: '/5' },
                          { label: 'Fun',     value: avgF, suffix: '/5' },
                          { label: 'Repeat',  value: repPct, suffix: '' },
                        ].map(s => (
                          <div key={s.label} style={{ marginBottom: 6 }}>
                            <div style={{ fontSize: 10, color: T.textMuted }}>{s.label}</div>
                            <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: user.color }}>{s.value}<span style={{ fontSize: 11 }}>{s.suffix}</span></div>
                          </div>
                        ))}
                        <div style={{ fontSize: 10, color: T.textMuted, marginTop: 4 }}>{rated.length} rated</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Done plans list */}
              <div style={{ background: T.surface, borderRadius: T.radius.lg, padding: 18, border: `1px solid ${T.border}` }}>
                <h3 className="display" style={{ fontSize: 20, marginBottom: 14 }}>Completed plans</h3>
                {done.map(p => {
                  const exp = p.experience
                  return (
                    <div key={p.id} style={{ padding: '12px 0', borderBottom: `1px solid ${T.border}` }}>
                      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{p.title}</div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        {Object.values(USERS).map(user => {
                          const col = `overall_${user.id}`
                          const score = exp?.[col]
                          return (
                            <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <UserAvatar userId={user.id} size={14} />
                              {score != null
                                ? <span className="mono" style={{ fontSize: 13, color: user.color }}>{score}/5</span>
                                : <span style={{ fontSize: 11, color: T.textDim }}>—</span>
                              }
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* Badges */}
      <div style={{ background: T.surface, borderRadius: T.radius.lg, padding: 18, border: `1px solid ${T.border}` }}>
        <h3 className="display" style={{ fontSize: 20, marginBottom: 4 }}>Couple badges</h3>
        <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 14 }}>Earned through shared experiences</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {earnedBadges.map(badge => (
            <div key={badge.id} style={{
              textAlign: 'center', padding: '12px 6px', borderRadius: T.radius.md,
              background: badge.unlocked ? T.surface2 : T.surface3,
              border: `1px solid ${badge.unlocked ? T.borderAccent : T.border}`,
              opacity: badge.unlocked ? 1 : 0.4,
              animation: badge.unlocked ? 'badgePop 0.5s ease both' : undefined,
            }}>
              <div style={{ fontSize: 22, marginBottom: 3 }}>{badge.emoji}</div>
              <div style={{ fontSize: 9, fontWeight: 600, color: badge.unlocked ? T.text : T.textMuted, lineHeight: 1.3 }}>{badge.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Export */}
      <button onClick={() => exportToExcel(plans)} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '14px', borderRadius: T.radius.lg, width: '100%',
        background: T.surface, color: T.success, fontWeight: 600, fontSize: 14,
        border: `1px solid ${T.success}44`, transition: 'all 0.2s ease',
      }}
        onMouseEnter={e => e.currentTarget.style.background = T.successSoft}
        onMouseLeave={e => e.currentTarget.style.background = T.surface}
      >
        <Icon name="star" size={16} color={T.success} />
        Export to Excel (.csv)
      </button>
      <p style={{ fontSize: 11, color: T.textMuted, textAlign: 'center', marginTop: -10 }}>
        Download your data → upload it to Claude for personalized recommendations
      </p>
    </div>
  )
}
