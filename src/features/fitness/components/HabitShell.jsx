import { T } from '../../../constants/index.js'
import Icon from '../../../components/shared/Icon.jsx'

/**
 * The shared shell of every habit row: emoji, name, right-side slot.
 * `done` lights it up in the person's color. Tapping the row calls onTap.
 */
export default function HabitShell({ habit, person, done, onTap, right, children }) {
  const clickable = Boolean(onTap)
  return (
    <div style={{
      borderRadius: T.radius.lg,
      background: done ? person.colorSoft : T.surface,
      border: `1px solid ${done ? person.colorBorder : T.border}`,
      transition: 'background 0.2s ease, border-color 0.2s ease',
      overflow: 'hidden',
    }}>
      <div
        role={clickable ? 'checkbox' : undefined}
        aria-checked={clickable ? done : undefined}
        aria-label={habit.name}
        onClick={onTap}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', cursor: clickable ? 'pointer' : 'default', userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        <span style={{
          width: 34, height: 34, borderRadius: T.radius.md, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          background: done ? person.color : T.surface2,
          transition: 'background 0.2s ease',
        }}>
          {done && habit.kind !== 'number' ? <Icon name="check" size={18} color="#0F0E0D" /> : habit.emoji}
        </span>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: done ? person.color : T.text }}>{habit.name}</span>
        {right}
      </div>
      {children}
    </div>
  )
}

export function StreakBadge({ n, person, done }) {
  if (n < 2) return null
  return (
    <span className="mono" title={`${n} days in a row`} style={{ fontSize: 12, fontWeight: 600, color: done ? person.color : T.textMuted }}>
      🔥 {n}
    </span>
  )
}
