import { useState } from 'react'
import { T, USERS } from '../../constants/index.js'
import Icon from '../../components/shared/Icon.jsx'
import Segmented from '../../components/shared/Segmented.jsx'
import { today, addDays, dayLabel, shortDate } from '../../lib/dates.js'
import HabitList, { useDayHabits } from './components/HabitList.jsx'
import HabitEditorSheet from './components/HabitEditorSheet.jsx'

export const PERSON_OPTIONS = Object.values(USERS)
  .sort((a, b) => a.name.localeCompare(b.name))
  .map(u => ({ id: u.id, label: `${u.emoji} ${u.name}`, accent: u }))

/** One day, one person: tap habits to log them. Arrows move through past days. */
export default function TodayView({ date, onDateChange, personId, onPersonChange }) {
  const person = USERS[personId]
  const { list, doneCount } = useDayHabits(personId, date)
  const [editing, setEditing] = useState(false)
  const isToday = date === today()

  const arrow = (disabled) => ({
    width: 38, height: 38, borderRadius: T.radius.md, background: T.surface2,
    display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.3 : 1,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Day navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button aria-label="Previous day" onClick={() => onDateChange(addDays(date, -1))} style={arrow(false)}>
          <Icon name="chevronL" size={18} color={T.textMuted} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <div className="display" style={{ fontSize: 26, lineHeight: 1.1 }}>{dayLabel(date)}</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
            {shortDate(date)} · {doneCount}/{list.length} logged
          </div>
        </div>
        <button aria-label="Next day" disabled={isToday} onClick={() => onDateChange(addDays(date, 1))} style={arrow(isToday)}>
          <Icon name="chevronR" size={18} color={T.textMuted} />
        </button>
      </div>

      <Segmented options={PERSON_OPTIONS} value={personId} onChange={onPersonChange} />

      {list.length === 0
        ? <p style={{ textAlign: 'center', fontSize: 13, color: T.textMuted, padding: '24px 0' }}>No habits yet — add one below.</p>
        : <HabitList key={personId + date} person={person} date={date} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        {!isToday
          ? <button onClick={() => onDateChange(today())} style={{ fontSize: 12, fontWeight: 600, color: person.color, padding: '6px 10px', borderRadius: T.radius.sm, background: person.colorSoft }}>Back to today</button>
          : <span />}
        <button onClick={() => setEditing(true)} style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, padding: '6px 10px', borderRadius: T.radius.sm, background: T.surface2 }}>
          Edit habits
        </button>
      </div>

      {editing && <HabitEditorSheet person={person} onClose={() => setEditing(false)} />}
    </div>
  )
}
