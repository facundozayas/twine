import { getCat, getUser, T, USERS } from '../constants/index.js'
import PlanCard from '../components/plans/PlanCard.jsx'
import UserAvatar from '../components/shared/UserAvatar.jsx'
import Icon from '../components/shared/Icon.jsx'

export default function HomeView({ plans, currentUser, onNavigate }) {
  const partnerId = currentUser.id === 'janina' ? 'facu' : 'janina'
  const partner   = getUser(partnerId)

  const upcoming   = plans.filter(p => p.status === 'planned').slice(0, 2)
  const myUnranked = plans.filter(p => p[`ranking_${currentUser.id}`] == null && p.status !== 'done').length
  const done       = plans.filter(p => p.status === 'done')
  const mySuggested= plans.filter(p => p.suggested_by === currentUser.id).length

  // My top 3 ranked
  const myTop = [...plans]
    .filter(p => p[`ranking_${currentUser.id}`] != null)
    .sort((a, b) => b[`ranking_${currentUser.id}`] - a[`ranking_${currentUser.id}`])
    .slice(0, 3)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }} className="fade-up">
      {/* Hero greeting */}
      <div style={{
        background: `linear-gradient(135deg, ${currentUser.colorSoft} 0%, transparent 65%)`,
        borderRadius: T.radius.xl, padding: '22px 20px',
        border: `1px solid ${currentUser.colorBorder}`,
      }}>
        <div style={{ fontSize: 11, color: currentUser.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
          Welcome back
        </div>
        <h1 className="display" style={{ fontSize: 34, fontWeight: 400, lineHeight: 1.1, marginBottom: 16 }}>
          {currentUser.emoji} {currentUser.name}
        </h1>
        <div style={{ display: 'flex', gap: 22 }}>
          {[
            { label: 'Plans saved',  value: plans.length },
            { label: 'Completed',    value: done.length },
            { label: 'Your ideas',   value: mySuggested },
          ].map(s => (
            <div key={s.label}>
              <div className="mono" style={{ fontSize: 20, color: currentUser.color, fontWeight: 600 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: T.textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Partner nudge */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
          borderRadius: T.radius.lg, background: T.surface, border: `1px solid ${T.border}`,
        }}
      >
        <UserAvatar userId={partnerId} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>
            {partner.name} is on Twine too
          </div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>
            {myUnranked > 0
              ? `${myUnranked} idea${myUnranked > 1 ? 's' : ''} waiting for your ranking`
              : 'All ideas ranked — add more!'}
          </div>
        </div>
        <button
          onClick={() => onNavigate('rank')}
          style={{
            fontSize: 11, color: partner.color, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0,
            padding: '6px 10px', borderRadius: T.radius.sm,
            background: partner.colorSoft, border: `1px solid ${partner.colorBorder}`,
          }}
        >
          Rank <Icon name="arrow" size={11} color={partner.color} />
        </button>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="display" style={{ fontSize: 21, marginBottom: 10 }}>Coming up</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcoming.map((p, i) => (
              <PlanCard key={p.id} plan={p} currentUser={currentUser} compact index={i} />
            ))}
          </div>
        </div>
      )}

      {/* AI teaser */}
      <div
        onClick={() => onNavigate('ai')}
        style={{
          background: `linear-gradient(135deg, ${currentUser.colorSoft} 0%, ${T.surface} 100%)`,
          borderRadius: T.radius.xl, padding: '18px 20px',
          border: `1px solid ${currentUser.colorBorder}`,
          cursor: 'pointer', transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
          <Icon name="spark" size={13} color={currentUser.color} />
          <span style={{ fontSize: 10, color: currentUser.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Twine AI
          </span>
        </div>
        <p className="display" style={{ fontSize: 17, lineHeight: 1.45, color: T.text }}>
          {plans.length === 0
            ? '"Add your first idea and I\'ll start learning what you both love."'
            : `"Ask me for a perfect plan based on what ${currentUser.name} and ${partner.name} love."`}
        </p>
        <div style={{ fontSize: 12, color: currentUser.color, marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
          Ask Twine AI <Icon name="arrow" size={12} color={currentUser.color} />
        </div>
      </div>

      {/* My top ranked */}
      {myTop.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h2 className="display" style={{ fontSize: 21 }}>Your top picks</h2>
            <button
              onClick={() => onNavigate('plans')}
              style={{ fontSize: 12, color: currentUser.color, display: 'flex', alignItems: 'center', gap: 3 }}
            >
              All plans <Icon name="arrow" size={12} color={currentUser.color} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myTop.map((p, i) => (
              <PlanCard key={p.id} plan={p} currentUser={currentUser} compact index={i} />
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
            No plans yet. Add your first idea and invite {partner.name} to rank it.
          </p>
          <button
            onClick={() => onNavigate('plans')}
            style={{
              padding: '12px 24px', borderRadius: T.radius.md,
              background: currentUser.gradient, color: '#fff',
              fontSize: 14, fontWeight: 600,
              boxShadow: `0 4px 18px ${currentUser.color}44`,
            }}
          >
            Add first idea {currentUser.emoji}
          </button>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="display" style={{ fontSize: 21, marginBottom: 10 }}>Quick actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: 'swipe', label: 'Rank ideas',   sub: `${myUnranked} unranked`,   nav: 'rank',     color: currentUser.color },
            { icon: 'chart', label: 'Insights',      sub: 'Your patterns',            nav: 'insights', color: '#B39DDB' },
            { icon: 'spark', label: 'Ask AI',        sub: 'Get inspired',             nav: 'ai',       color: T.accent2 },
            { icon: 'list',  label: 'All plans',     sub: `${plans.length} saved`,    nav: 'plans',    color: T.success },
          ].map(qa => (
            <button
              key={qa.nav}
              onClick={() => onNavigate(qa.nav)}
              style={{
                background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: T.radius.lg, padding: '14px 16px',
                textAlign: 'left', transition: 'all 0.2s ease',
              }}
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
