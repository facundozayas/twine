import { useMemo, useState } from 'react'
import { T, USERS } from '../../constants/index.js'
import Icon from '../../components/shared/Icon.jsx'
import Segmented from '../../components/shared/Segmented.jsx'
import { today, addDays, lastNDays, fromISODate, shortDate } from '../../lib/dates.js'
import { useFitnessStore, habitsFor, indexLogs, getLog, stats } from './useFitnessStore.js'
import { PERSON_OPTIONS } from './TodayView.jsx'

const DAYS = 14
const fmt1 = n => (Math.round(n * 10) / 10).toString()

/** Grid of the last two weeks + streaks and simple stats. Tap a day to edit it. */
export default function HistoryView({ personId, onPersonChange, onOpenDay }) {
  const person = USERS[personId]
  const { habits, logs } = useFitnessStore()
  const [page, setPage] = useState(0) // 0 = last 14 days, 1 = the 14 before, …

  const index = useMemo(() => indexLogs(logs), [logs])
  const list = useMemo(() => habitsFor(habits, personId), [habits, personId])
  const end = addDays(today(), -page * DAYS)
  const days = lastNDays(DAYS, end)
  const summary = useMemo(() => stats(index, list, 30), [index, list])

  const cellFill = (h, log) => {
    if (!log) return { background: T.surface2 }
    if (h.kind === 'number') {
      // brighter = more (sleep: 4 h dim → 8 h full)
      const v = Number(log.value)
      const o = h.unit === 'h' ? Math.min(1, Math.max(0.25, (v - 4) / 4)) : 1
      return { background: person.color, opacity: o }
    }
    return { background: person.color }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Segmented options={PERSON_OPTIONS} value={personId} onChange={onPersonChange} />

      {/* Grid */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius.lg, padding: '12px 10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <button aria-label="Earlier" onClick={() => setPage(p => p + 1)} style={{ padding: 6 }}>
            <Icon name="chevronL" size={16} color={T.textMuted} />
          </button>
          <span style={{ fontSize: 12, color: T.textMuted }}>{shortDate(days[0])} – {page === 0 ? 'today' : shortDate(days[DAYS - 1])}</span>
          <button aria-label="Later" disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{ padding: 6, opacity: page === 0 ? 0.3 : 1 }}>
            <Icon name="chevronR" size={16} color={T.textMuted} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `74px repeat(${DAYS}, minmax(0, 1fr))`, gap: 3, alignItems: 'center' }}>
          <span />
          {days.map(d => {
            const dt = fromISODate(d)
            const isToday = d === today()
            return (
              <button key={d} onClick={() => onOpenDay(d)} aria-label={`Open ${shortDate(d)}`} style={{ textAlign: 'center', padding: '2px 0', lineHeight: 1.15 }}>
                <div style={{ fontSize: 9, color: T.textDim }}>{dt.toLocaleDateString('en-GB', { weekday: 'narrow' })}</div>
                <div className="mono" style={{ fontSize: 10, fontWeight: isToday ? 700 : 400, color: isToday ? person.color : T.textMuted }}>{dt.getDate()}</div>
              </button>
            )
          })}

          {list.map(h => (
            <Row key={h.id} habit={h} days={days} index={index} cellFill={cellFill} onOpenDay={onOpenDay} />
          ))}
        </div>
        <p style={{ fontSize: 11, color: T.textDim, marginTop: 10, textAlign: 'center' }}>Tap a day to edit it</p>
      </div>

      {/* Stats — last 30 days */}
      <div>
        <h3 className="display" style={{ fontSize: 20, marginBottom: 10 }}>Last 30 days</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {summary.map(s => (
            <StatRow key={s.habit.id} s={s} person={person} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Row({ habit, days, index, cellFill, onOpenDay }) {
  return (
    <>
      <span style={{ fontSize: 12, color: T.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 4 }}>
        {habit.emoji} {habit.name}
      </span>
      {days.map(d => {
        const log = getLog(index, habit.id, d)
        const title = log
          ? habit.kind === 'number' ? `${log.value}${habit.unit || ''}`
            : habit.kind === 'training' ? [log.type, log.value != null && `${log.value} km`].filter(Boolean).join(' · ') || 'Trained'
            : 'Done'
          : 'Not logged'
        return (
          <button key={d} onClick={() => onOpenDay(d)} title={title} aria-label={`${habit.name} ${shortDate(d)}: ${title}`}
            style={{ aspectRatio: '1', borderRadius: 4, width: '100%', ...cellFill(habit, log) }} />
        )
      })}
    </>
  )
}

function StatRow({ s, person }) {
  const h = s.habit
  const pct = Math.round(s.rate * 100)
  let main, sub
  if (h.kind === 'number') {
    main = s.avg7 != null ? `${fmt1(s.avg7)}${h.unit ? ` ${h.unit}` : ''}` : '—'
    sub = 'average, last 7 days'
  } else if (h.kind === 'training') {
    main = `${s.sessions}×`
    sub = `${fmt1(s.kmWeek)} km this week · ${fmt1(s.km)} km in 30 days`
  } else {
    main = `${pct}%`
    sub = `${Math.round(s.rate * 30)} of 30 days`
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: T.radius.lg, background: T.surface, border: `1px solid ${T.border}` }}>
      <span style={{ fontSize: 18 }}>{h.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{h.name}</div>
        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>{sub}</div>
      </div>
      {h.kind !== 'number' && s.streak >= 2 && (
        <span className="mono" style={{ fontSize: 12, color: T.textMuted }}>🔥 {s.streak}</span>
      )}
      <span className="mono" style={{ fontSize: 17, fontWeight: 600, color: person.color, minWidth: 48, textAlign: 'right' }}>{main}</span>
    </div>
  )
}
