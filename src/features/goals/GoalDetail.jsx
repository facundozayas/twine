import { useMemo, useState, useCallback } from 'react'
import { T, USERS } from '../../constants/index.js'
import Icon from '../../components/shared/Icon.jsx'
import BottomSheet, { SheetAction } from '../../components/shared/BottomSheet.jsx'
import ItemRow from '../../components/checklist/ItemRow.jsx'
import NewItemInput from '../../components/checklist/NewItemInput.jsx'
import ItemActionsSheet from '../../components/checklist/ItemActionsSheet.jsx'
import { shortDate } from '../../lib/dates.js'
import { useGoalsStore, countdownLabel, daysLeft, involves } from './useGoalsStore.js'
import { ownerInfo, OwnerAvatars, ProgressBar } from './owners.jsx'
import GoalFormSheet from './components/GoalFormSheet.jsx'
import Confetti from './components/Confetti.jsx'

export default function GoalDetail({ goal, currentUser, onBack }) {
  const store = useGoalsStore()
  const owner = ownerInfo(goal.owner)
  const uid = currentUser.id

  // Milestones in the shape ItemRow expects
  const rows = useMemo(() => store.milestones
    .filter(m => m.goal_id === goal.id)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map(m => ({ ...m, checked: m.done, added_by: m.created_by })), [store.milestones, goal.id])
  const done = rows.filter(r => r.checked).length

  const cheers = store.cheers.filter(c => c.goal_id === goal.id)
  const cheerFrom = Object.keys(USERS).map(id => ({ id, n: cheers.filter(c => c.from_user === id).length })).filter(x => x.n)
  // You can cheer anything that isn't only yours
  const canCheer = goal.owner !== uid

  const [menu, setMenu] = useState(null) // 'menu' | 'edit' | 'confirmDelete'
  const [actionRow, setActionRow] = useState(null)
  const [party, setParty] = useState(false)
  const [cheered, setCheered] = useState(false)
  const endParty = useCallback(() => setParty(false), [])

  const d = daysLeft(goal)
  const late = !goal.done_at && d != null && d < 0

  const sendCheer = () => {
    store.cheer(goal.id, uid)
    setCheered(true)
    setTimeout(() => setCheered(false), 1600)
  }

  const achieve = () => {
    store.updateGoal(goal.id, { done_at: new Date().toISOString() })
    setParty(true)
  }

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} aria-label="Back to goals" style={{ width: 34, height: 34, borderRadius: T.radius.md, background: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="arrowL" size={16} color={T.textMuted} />
        </button>
        <button onClick={() => setMenu('menu')} aria-label="Goal options" style={{ width: 34, height: 34, borderRadius: T.radius.md, background: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="more" size={18} color={T.textMuted} />
        </button>
      </div>

      {/* Hero */}
      <div style={{ borderRadius: T.radius.xl, padding: '22px 20px', background: owner.colorSoft, border: `1px solid ${owner.colorBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <OwnerAvatars owner={goal.owner} size={24} />
          <span style={{ fontSize: 12, fontWeight: 600, color: owner.color }}>{goal.owner === 'both' ? 'Both of you' : owner.name}</span>
        </div>
        <h2 className="display" style={{ fontSize: 30, lineHeight: 1.1, marginBottom: 6 }}>{goal.emoji} {goal.title}</h2>
        {goal.why && <p style={{ fontSize: 14, color: T.textMuted, fontStyle: 'italic', lineHeight: 1.5 }}>“{goal.why}”</p>}

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 16 }}>
          <span className="mono" style={{ fontSize: 26, fontWeight: 600, color: goal.done_at ? T.success : late ? '#E57373' : owner.color }}>
            {goal.done_at ? '🎉' : d == null ? '—' : Math.abs(d)}
          </span>
          <span style={{ fontSize: 13, color: T.textMuted }}>
            {goal.done_at
              ? `Achieved ${shortDate(goal.done_at.slice(0, 10))}`
              : d == null ? 'No target date' : `${countdownLabel(goal).replace(/^\d+ /, '')} · ${shortDate(goal.due_date)}`}
          </span>
        </div>

        {rows.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <ProgressBar done={done} total={rows.length} color={goal.done_at ? T.success : owner.color} />
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 5 }}>{done} of {rows.length} milestones</div>
          </div>
        )}
      </div>

      {/* Cheers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {canCheer && !goal.done_at && (
          <button onClick={sendCheer} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: T.radius.full, fontSize: 14, fontWeight: 600,
            background: currentUser.gradient, color: '#fff', transform: cheered ? 'scale(1.08)' : 'scale(1)', transition: 'transform 0.2s ease',
          }}>
            {cheered ? 'Sent 👏' : `👏 Cheer ${goal.owner === 'both' ? 'on' : owner.name}`}
          </button>
        )}
        {cheerFrom.length > 0 && (
          <span style={{ fontSize: 12, color: T.textMuted }}>
            {cheerFrom.map(c => `${USERS[c.id].name} 👏×${c.n}`).join(' · ')}
          </span>
        )}
      </div>

      {/* Milestones */}
      <div>
        <h3 className="display" style={{ fontSize: 20, marginBottom: 4 }}>Milestones</h3>
        <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Small steps on the way. Tap to tick, hold to edit.</p>
        {rows.map(r => (
          <ItemRow key={r.id} item={r} currentUser={currentUser}
            onToggle={() => store.toggleMilestone(r, uid)}
            onLongPress={() => setActionRow(r)} />
        ))}
        <NewItemInput placeholder="Add milestone" accent={currentUser}
          onAdd={texts => store.addMilestones(goal.id, texts, uid)} />
      </div>

      {/* Achieve */}
      {!goal.done_at && involves(goal, uid) && (
        <button onClick={achieve} style={{ marginTop: 6, padding: 14, borderRadius: T.radius.lg, fontSize: 15, fontWeight: 600, background: T.successSoft, color: T.success, border: `1px solid ${T.successBorder}` }}>
          Mark as achieved 🎉
        </button>
      )}

      {party && <Confetti onDone={endParty} />}

      {actionRow && (
        <ItemActionsSheet item={actionRow} otherLists={[]}
          onRename={text => store.renameMilestone(actionRow.id, text)}
          onMove={() => {}}
          onDelete={() => store.deleteMilestone(actionRow.id)}
          onClose={() => setActionRow(null)} />
      )}

      {menu === 'menu' && (
        <BottomSheet title={`${goal.emoji} ${goal.title}`} onClose={() => setMenu(null)}>
          <SheetAction icon="✏️" label="Edit goal" onClick={() => setMenu('edit')} />
          {goal.done_at && <SheetAction icon="↩️" label="Not achieved yet" onClick={() => { store.updateGoal(goal.id, { done_at: null }); setMenu(null) }} />}
          <SheetAction icon="🗑️" label="Delete goal" danger onClick={() => setMenu('confirmDelete')} />
        </BottomSheet>
      )}
      {menu === 'edit' && (
        <GoalFormSheet initial={goal} currentUser={currentUser}
          onSave={patch => store.updateGoal(goal.id, patch)} onClose={() => setMenu(null)} />
      )}
      {menu === 'confirmDelete' && (
        <BottomSheet title="Delete this goal?" subtitle="Its milestones and cheers go too." onClose={() => setMenu(null)}>
          <SheetAction icon="🗑️" label="Delete forever" danger onClick={() => { store.deleteGoal(goal.id); setMenu(null); onBack() }} />
          <SheetAction label="Keep it" onClick={() => setMenu(null)} />
        </BottomSheet>
      )}
    </div>
  )
}
