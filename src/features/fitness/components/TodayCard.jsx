import { T } from '../../../constants/index.js'
import Icon from '../../../components/shared/Icon.jsx'
import { today } from '../../../lib/dates.js'
import { useFitnessStore, getLog } from '../useFitnessStore.js'
import { useDayHabits } from './HabitList.jsx'

/**
 * Compact "today" strip for the Home screen: one tap per habit, no detail.
 * Sleep and training details live in the Fitness tab.
 */
export default function TodayCard({ currentUser, onOpen }) {
  const { loaded, error, toggle } = useFitnessStore()
  const date = today()
  const { list, index, doneCount } = useDayHabits(currentUser.id, date)
  if (!loaded || error || list.length === 0) return null

  const quick = list.filter(h => h.kind !== 'number')
  const allDone = doneCount === list.length

  return (
    <div style={{ padding: '16px', borderRadius: T.radius.xl, background: T.surface, border: `1px solid ${T.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: currentUser.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Today</div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>
            {allDone ? 'All logged — nice 🎉' : `${doneCount} of ${list.length} logged`}
          </div>
        </div>
        <button onClick={onOpen} style={{ fontSize: 12, color: currentUser.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3, padding: '6px 10px', borderRadius: T.radius.sm, background: currentUser.colorSoft, border: `1px solid ${currentUser.colorBorder}` }}>
          Fitness <Icon name="arrow" size={11} color={currentUser.color} />
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {quick.map(h => {
          const done = Boolean(getLog(index, h.id, date))
          return (
            <button key={h.id} role="checkbox" aria-checked={done} onClick={() => toggle(h, date)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: T.radius.full, fontSize: 13, fontWeight: 500,
              background: done ? currentUser.colorSoft : T.surface2,
              color: done ? currentUser.color : T.text,
              border: `1px solid ${done ? currentUser.colorBorder : T.border}`,
              transition: 'all 0.15s ease',
            }}>
              <span>{done ? '✓' : h.emoji}</span>{h.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
