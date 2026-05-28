import { getCat, getUser, T, USERS } from '../constants/index.js'
import PlanCard from '../components/plans/PlanCard.jsx'
import UserAvatar from '../components/shared/UserAvatar.jsx'
import Icon from '../components/shared/Icon.jsx'

export default function HomeView({ plans, currentUser, onNavigate }) {
  const partnerId = currentUser.id === 'janina' ? 'facu' : 'janina'
  const partner   = getUser(partnerId)

  const done       = plans.filter(p => p.status === 'done')
  const upcoming   = plans.filter(p => p.status === 'planned').slice(0, 2)
  const mySuggested= plans.filter(p => p.suggested_by === currentUser.id).length
  const toRank     = plans.filter(p => p.suggested_by === partnerId && p[`ranking_${currentUser.id}`] == null && !p.is_recurring && p.status !== 'done').length

  // Next up — highest mutual score not done yet
  const nextUp = [...plans]
    .filter(p => !p.is_recurring && p.status !== 'done' && p.ranking_janina != null && p.ranking_facu != null)
    .map(p => ({ ...p, mutualScore: (p.ranking_janina + p.ranking_facu) / 2 }))
    .sort((a, b) => b.mutualScore - a.mutualScore)[0]

  // Regulars
  const regulars = plans.filter(p => p.is_recurring).slice(0, 3)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }} className="fade-up">
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${currentUser.colorSoft} 0%, transparent 65%)`, borderRadius: T.radius.xl, padding: '22px 20px', border: `1px solid ${currentUser.colorBorder}` }}>
        <div style={{ fontSize: 11, color: currentUser.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Welcome back</div>
        <h1 className="display" style={{ fontSize: 34, fontWeight: 400, lineHeight: 1.1, marginBottom: 16 }}>
          {currentUser.emoji} {currentUser.name}
        </h1>
        <div style={{ display: 'flex', gap: 22 }}>
          {[
            { label: 'Plans saved', value: plans.length },
            { label: 'Completed',   value: done.length },
            { label: 'Your ideas',  value: mySuggested },
          ].map(s => (
            <div key={s.label}>
              <div className="mono" style={{ fontSize: 20, color: currentUser.color, fontWeight: 600 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: T.textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Partner nudge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: T.radius.lg, background: T.surface, border: `1px solid ${T.border}` }}>
        <UserAvatar userId={partnerId} size={36} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{partner.name}'s ideas</div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>
            {toRank > 0 ? `${toRank} idea${toRank > 1 ? 's' : ''} waiting for your ranking` : 'All ranked — add more!'}
          </div>
        </div>
        <button onClick={() => onNavigate('rank')} style={{ fontSize: 11, color: partner.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3, padding: '6px 10px', borderRadius: T.radius.sm, background: partner.colorSoft, border: `1px solid ${partner.colorBorder}` }}>
          Rank <Icon name="arrow" size={11} color={partner.color} />
        </button>
      </div>

      {/* Next up */}
      {nextUp && (
        <div style={{ background: T.surface, borderRadius: T.radius.xl, padding: '18px 20px', border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 11, color: T.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
            ⚡ Next up
          </div>
          <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }} className="display">{nextUp.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: T.textMuted }}>Mutual score</span>
            <span className="mono" style={{ fontSize: 16, color: T.accent, fontWeight: 700 }}>{nextUp.mutualScore.toFixed(1)}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ fontSize: 11, color: USERS.janina.color }}>{USERS.janina.emoji} {nextUp.ranking_janina}</span>
              <span style={{ fontSize: 11, color: USERS.facu.color }}>{USERS.facu.emoji} {nextUp.ranking_facu}</span>
            </div>
          </div>
          <button onClick={() => onNavigate('plans')} style={{ fontSize: 12, color: T.accent, display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', borderRadius: T.radius.sm, background: T.accentSoft, border: `1px solid ${T.borderAccent}` }}>
            Mark as planned <Icon name="arrow" size={11} color={T.accent} />
          </button>
        </div>
      )}

      {/* Upcoming planned */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="display" style={{ fontSize: 21, marginBottom: 10 }}>Coming up</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcoming.map((p, i) => <PlanCard key={p.id} plan={p} currentUser={currentUser} compact index={i} />)}
          </div>
        </div>
      )}

      {/* Regulars */}
      {regulars.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h2 className="display" style={{ fontSize: 21 }}>🔁 Regulars</h2>
            <button onClick={() => onNavigate('plans')} style={{ fontSize: 12, color: '#90CAF9' }}>See all</button>
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            {regulars.map(p => (
              <div key={p.id} style={{ flexShrink: 0, background: T.surface, borderRadius: T.radius.lg, padding: '12px 14px', border: '1px solid rgba(144,202,249,0.2)', minWidth: 120 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#90CAF9', marginBottom: 3 }}>{p.title}</div>
                {p.location && <div style={{ fontSize: 10, color: T.textMuted }}>{p.location}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {plans.length === 0 && (
        <div style={{ background: T.surface, borderRadius: T.radius.xl, padding: '28px 20px', border: `1px solid ${T.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🌱</div>
          <h2 className="display" style={{ fontSize: 22, marginBottom: 8 }}>Start your story</h2>
          <p style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.7, maxWidth: 260, margin: '0 auto 18px' }}>
            No plans yet. Add your first idea and {partner.name} can rank it.
          </p>
          <button onClick={() => onNavigate('plans')} style={{ padding: '12px 24px', borderRadius: T.radius.md, background: currentUser.gradient, color: '#fff', fontSize: 14, fontWeight: 600, boxShadow: `0 4px 18px ${currentUser.color}44` }}>
            Add first idea {currentUser.emoji}
          </button>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="display" style={{ fontSize: 21, marginBottom: 10 }}>Quick actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: 'swipe',  label: 'Rank ideas',   sub: `${toRank} to rank`,         nav: 'rank',     color: currentUser.color },
            { icon: 'chart',  label: 'Insights',      sub: 'Expectations & experiences', nav: 'insights', color: '#B39DDB' },
            { icon: 'list',   label: 'All plans',     sub: `${plans.length} saved`,      nav: 'plans',    color: T.success },
            { icon: 'refresh',label: 'Regulars',      sub: `${regulars.length} always on`, nav: 'plans', color: '#90CAF9' },
          ].map(qa => (
            <button key={qa.nav + qa.label} onClick={() => onNavigate(qa.nav)} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius.lg, padding: '14px 16px', textAlign: 'left', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = qa.color + '55'; e.currentTarget.style.background = T.surface2 }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.surface }}
            >
              <Icon name={qa.icon} size={20} color={qa.color} />
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8, color: T.text }}>{qa.label}</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{qa.sub}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
