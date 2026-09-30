import { useMemo } from 'react'
import { useFitnessStore, habitsFor, indexLogs, getLog, streak } from '../useFitnessStore.js'
import { CheckHabit, TrainingHabit, NumberHabit } from './HabitRows.jsx'

/**
 * Renders one person's habits for one day. Used by the Fitness tab and by
 * the Today card on Home, so both always behave the same.
 */
export function useDayHabits(personId, date) {
  const { habits, logs } = useFitnessStore()
  const index = useMemo(() => indexLogs(logs), [logs])
  const list = useMemo(() => habitsFor(habits, personId), [habits, personId])
  const doneCount = list.filter(h => getLog(index, h.id, date)).length
  return { list, index, doneCount }
}

export default function HabitList({ person, date, kinds }) {
  const store = useFitnessStore()
  const { list, index } = useDayHabits(person.id, date)
  const shown = kinds ? list.filter(h => kinds.includes(h.kind)) : list

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {shown.map(h => {
        const log = getLog(index, h.id, date)
        const common = { habit: h, person, log }
        if (h.kind === 'number') {
          // Sleep (hours) starts at 7.5; any other number starts at 1
          const cfg = h.unit === 'h' ? { start: 7.5, step: 0.5, max: 14 } : { start: 1, step: 0.5, max: 50 }
          return <NumberHabit key={h.id} {...common} {...cfg} onSet={v => store.setNumber(h, date, v)} />
        }
        const s = streak(index, h.id, date)
        if (h.kind === 'training') {
          return <TrainingHabit key={h.id} {...common} streak={s}
            onToggle={() => store.toggle(h, date)}
            onDetail={patch => store.setTrainingDetail(h, date, patch)} />
        }
        return <CheckHabit key={h.id} {...common} streak={s} onToggle={() => store.toggle(h, date)} />
      })}
    </div>
  )
}
