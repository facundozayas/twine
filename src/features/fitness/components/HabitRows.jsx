import { useState, useEffect } from 'react'
import { T } from '../../../constants/index.js'
import HabitShell, { StreakBadge } from './HabitShell.jsx'

export const TRAINING_TYPES = ['Run', 'Gym', 'Padel', 'Bike', 'Other']

/** Plain yes/no habit: tap to mark done. */
export function CheckHabit({ habit, person, log, streak, onToggle }) {
  const done = Boolean(log)
  return (
    <HabitShell habit={habit} person={person} done={done} onTap={onToggle}
      right={<StreakBadge n={streak} person={person} done={done} />} />
  )
}

/** Training: tap to mark done, then type / km / note appear underneath. */
export function TrainingHabit({ habit, person, log, streak, onToggle, onDetail }) {
  const done = Boolean(log)
  const [km, setKm] = useState('')
  const [note, setNote] = useState('')
  const [armed, setArmed] = useState(false) // "tap again to remove" when details were entered

  const hasDetail = Boolean(log && (log.type || log.value != null || log.note))
  const handleTap = () => {
    if (!hasDetail || armed) { setArmed(false); onToggle(); return }
    setArmed(true)
    setTimeout(() => setArmed(false), 2500)
  }

  // Keep inputs in sync when the log changes (other device, or another day)
  useEffect(() => {
    setKm(log?.value != null ? String(log.value) : '')
    setNote(log?.note || '')
  }, [log?.id, log?.value, log?.note])

  const saveKm = () => {
    const n = parseFloat(km.replace(',', '.'))
    const value = Number.isFinite(n) && n > 0 ? Math.round(n * 10) / 10 : null
    if (value !== (log?.value != null ? Number(log.value) : null)) onDetail({ value })
  }
  const saveNote = () => { if (note.trim() !== (log?.note || '')) onDetail({ note: note.trim() || null }) }

  const input = { background: T.surface2, border: `1px solid ${T.border}`, borderRadius: T.radius.md, padding: '9px 11px', fontSize: 14, outline: 'none', color: T.text }

  return (
    <HabitShell habit={habit} person={person} done={done} onTap={handleTap}
      right={armed
        ? <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted }}>Tap again to remove</span>
        : <StreakBadge n={streak} person={person} done={done} />}>
      {done && (
        <div className="fade-in" style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TRAINING_TYPES.map(t => {
              const on = log.type === t
              return (
                <button key={t} onClick={() => onDetail({ type: on ? null : t })} style={{
                  padding: '6px 12px', borderRadius: T.radius.full, fontSize: 13, fontWeight: 500,
                  background: on ? person.color : T.surface2, color: on ? T.onAccent : T.textMuted,
                  border: `1px solid ${on ? person.color : T.border}`,
                }}>{t}</button>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative', width: 86, flexShrink: 0 }}>
              <input value={km} onChange={e => setKm(e.target.value)} onBlur={saveKm}
                onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
                inputMode="decimal" placeholder="0" aria-label="Kilometers"
                style={{ ...input, width: '100%', paddingRight: 32 }} />
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: T.textDim }}>km</span>
            </div>
            <input value={note} onChange={e => setNote(e.target.value)} onBlur={saveNote}
              onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
              placeholder="Easy 8k along the canal" aria-label="Training note" maxLength={120}
              style={{ ...input, flex: 1, minWidth: 0 }} />
          </div>
        </div>
      )}
    </HabitShell>
  )
}

/** Number habit (sleep): − / + in half steps. First tap starts at the default. */
export function NumberHabit({ habit, person, log, onSet, step = 0.5, start = 7.5, max = 14 }) {
  const value = log?.value != null ? Number(log.value) : null
  const done = value != null

  const change = (dir) => {
    if (value == null) return onSet(start)
    const next = Math.round((value + dir * step) * 10) / 10
    onSet(next <= 0 ? null : Math.min(max, next)) // going below 0.5 clears the day
  }

  const btn = { width: 34, height: 34, borderRadius: T.radius.md, background: T.surface2, border: `1px solid ${T.border}`, fontSize: 18, color: T.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }

  return (
    <HabitShell habit={habit} person={person} done={done}
      right={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={btn} aria-label={`Less ${habit.name}`} onClick={() => change(-1)}>−</button>
          <span className="mono" style={{ minWidth: 48, textAlign: 'center', fontSize: 15, fontWeight: 600, color: done ? person.color : T.textDim }}>
            {done ? `${value}${habit.unit ? ` ${habit.unit}` : ''}` : '—'}
          </span>
          <button style={btn} aria-label={`More ${habit.name}`} onClick={() => change(1)}>+</button>
        </div>
      } />
  )
}
