import { useMemo, useState } from 'react'
import { T, USERS } from '../../constants/index.js'
import Icon from '../../components/shared/Icon.jsx'
import Segmented from '../../components/shared/Segmented.jsx'
import SetupNotice, { Spinner } from '../../components/shared/SetupNotice.jsx'
import { useGoalsStore, sortGoals, countdownLabel, daysLeft, progress, involves } from './useGoalsStore.js'
import { ownerInfo, OwnerAvatars, ProgressBar } from './owners.jsx'
import GoalDetail from './GoalDetail.jsx'
import GoalFormSheet from './components/GoalFormSheet.jsx'

export default function GoalsView({ currentUser }) {
  const { goals, milestones, cheers, loaded, error, createGoal } = useGoalsStore()
  const [openId, setOpenId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [creating, setCreating] = useState(false)
  const [showAchieved, setShowAchieved] = useState(false)

  const filtered = useMemo(() => filter === 'all' ? goals : goals.filter(g => involves(g, filter)), [goals, filter])
  const { open, achieved } = useMemo(() => sortGoals(filtered), [filtered])

  const openGoal = openId && goals.find(g => g.id === openId)
  if (openGoal) return <GoalDetail goal={openGoal} currentUser={currentUser} onBack={() => setOpenId(null)} />
  if (!loaded) return <Spinner />
  if (error) return <SetupNotice emoji="🎯" title="Goals aren't set up yet" file="supabase/004_goals.sql" error={error} />

  const filterOptions = [
    { id: 'all', label: 'All', accent: currentUser },
    ...Object.values(USERS).sort((a, b) => a.name.localeCompare(b.name)).map(u => ({ id: u.id, label: `${u.emoji} ${u.name}`, accent: u })),
  ]

  const handleCreate = async (data) => {
    const row = await createGoal(data, currentUser.id)
    setOpenId(row.id) // straight in, to add milestones
  }

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="display" style={{ fontSize: 26 }}>Goals</h2>
        <button onClick={() => setCreating(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: currentUser.gradient, color: '#fff', padding: '8px 14px', borderRadius: T.radius.md, fontSize: 13, fontWeight: 600 }}>
          <Icon name="plus" size={14} color="#fff" /> New goal
        </button>
      </div>

      {goals.length > 0 && <Segmented size="sm" options={filterOptions} value={filter} onChange={setFilter} />}

      {goals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '44px 10px' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🎯</div>
          <p className="display" style={{ fontSize: 22, marginBottom: 6 }}>Set your first goal</p>
          <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6, maxWidth: 280, margin: '0 auto 18px' }}>
            A half marathon, A2 in German, a trip together — give it a date, break it into milestones, and cheer each other on.
          </p>
          <button onClick={() => setCreating(true)} style={{ padding: '12px 22px', borderRadius: T.radius.md, background: currentUser.gradient, color: '#fff', fontSize: 14, fontWeight: 600 }}>
            Create a goal
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {open.map((g, i) => <GoalCard key={g.id} goal={g} milestones={milestones} cheers={cheers} index={i} onClick={() => setOpenId(g.id)} />)}
          {open.length === 0 && <p style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', padding: '18px 0' }}>No open goals here.</p>}
        </div>
      )}

      {achieved.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <button onClick={() => setShowAchieved(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: T.textMuted, padding: '6px 0' }}>
            🏆 Achieved · {achieved.length}
            <Icon name="chevronD" size={14} color={T.textMuted} style={{ transform: showAchieved ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
          </button>
          {showAchieved && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {achieved.map((g, i) => <GoalCard key={g.id} goal={g} milestones={milestones} cheers={cheers} index={i} onClick={() => setOpenId(g.id)} />)}
            </div>
          )}
        </div>
      )}

      {creating && <GoalFormSheet currentUser={currentUser} onSave={handleCreate} onClose={() => setCreating(false)} />}
    </div>
  )
}

function GoalCard({ goal, milestones, cheers, index, onClick }) {
  const owner = ownerInfo(goal.owner)
  const { done, total } = progress(milestones, goal.id)
  const d = daysLeft(goal)
  const late = !goal.done_at && d != null && d < 0
  const soon = !goal.done_at && d != null && d >= 0 && d <= 14
  const cheerCount = cheers.filter(c => c.goal_id === goal.id).length

  return (
    <button onClick={onClick} className="fade-up" style={{
      animationDelay: `${index * 0.04}s`, width: '100%', textAlign: 'left',
      padding: '14px 16px', borderRadius: T.radius.lg, background: T.surface,
      border: `1px solid ${soon || late ? owner.colorBorder : T.border}`, opacity: goal.done_at ? 0.8 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: T.radius.md, background: owner.colorSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
          {goal.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{goal.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <OwnerAvatars owner={goal.owner} size={18} />
            <span style={{ fontSize: 12, fontWeight: 600, color: goal.done_at ? T.success : late ? '#E57373' : soon ? owner.color : T.textMuted }}>
              {countdownLabel(goal)}
            </span>
            {cheerCount > 0 && <span style={{ fontSize: 12, color: T.textMuted }}>· 👏 {cheerCount}</span>}
          </div>
        </div>
      </div>
      {total > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
          <div style={{ flex: 1 }}><ProgressBar done={done} total={total} color={goal.done_at ? T.success : owner.color} /></div>
          <span className="mono" style={{ fontSize: 11, color: T.textMuted }}>{done}/{total}</span>
        </div>
      )}
    </button>
  )
}
