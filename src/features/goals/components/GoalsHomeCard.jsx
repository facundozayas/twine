import { useMemo } from 'react'
import { T, USERS } from '../../../constants/index.js'
import Icon from '../../../components/shared/Icon.jsx'
import { useGoalsStore, sortGoals, involves, unseenCheersFor, countdownLabel } from '../useGoalsStore.js'
import { ownerInfo } from '../owners.jsx'

/**
 * Home card: cheers you haven't seen yet (with a "Thanks" to dismiss),
 * otherwise your next goal with a date.
 */
export default function GoalsHomeCard({ currentUser, onOpen }) {
  const { goals, cheers, loaded, error, markCheersSeen } = useGoalsStore()
  const uid = currentUser.id

  const unseen = useMemo(() => unseenCheersFor(cheers, goals, uid), [cheers, goals, uid])
  const next = useMemo(() => sortGoals(goals.filter(g => involves(g, uid))).open.find(g => g.due_date), [goals, uid])
  if (!loaded || error) return null

  if (unseen.length > 0) {
    const byGoal = new Map(goals.map(g => [g.id, g]))
    const senders = [...new Set(unseen.map(c => c.from_user))].map(id => USERS[id])
    const goalNames = [...new Set(unseen.map(c => byGoal.get(c.goal_id)?.title))].filter(Boolean)
    const from = senders[0]
    return (
      <div className="fade-up" style={{ padding: 16, borderRadius: T.radius.xl, background: from.colorSoft, border: `1px solid ${from.colorBorder}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 30 }}>👏</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: from.color }}>{senders.map(s => s.name).join(' & ')} cheered you on{unseen.length > 1 ? ` ×${unseen.length}` : ''}</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{goalNames.join(' · ')}</div>
        </div>
        <button onClick={() => markCheersSeen(unseen.map(c => c.id))} style={{ fontSize: 12, fontWeight: 700, padding: '8px 12px', borderRadius: T.radius.sm, background: from.gradient, color: '#fff' }}>
          Thanks 💛
        </button>
      </div>
    )
  }

  if (!next) return null
  const owner = ownerInfo(next.owner)
  return (
    <button onClick={onOpen} style={{ width: '100%', textAlign: 'left', padding: '14px 16px', borderRadius: T.radius.xl, background: T.surface, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ width: 40, height: 40, borderRadius: T.radius.md, background: owner.colorSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{next.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: owner.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Next goal</div>
        <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{next.title}</div>
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, whiteSpace: 'nowrap' }}>{countdownLabel(next)}</span>
      <Icon name="chevronR" size={16} color={T.textDim} />
    </button>
  )
}
