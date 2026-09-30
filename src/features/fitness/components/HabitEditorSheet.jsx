import { useState } from 'react'
import { T } from '../../../constants/index.js'
import BottomSheet from '../../../components/shared/BottomSheet.jsx'
import Segmented from '../../../components/shared/Segmented.jsx'
import { useFitnessStore, habitsFor } from '../useFitnessStore.js'

const EMOJIS = ['✅', '💊', '🥤', '💧', '🧘', '🚶', '📖', '🥗', '🦷', '☀️', '🧴', '🍎']

/**
 * Show / hide habits and add new ones for one person.
 * Hiding keeps the history (nothing is deleted), so a habit can come back later.
 */
export default function HabitEditorSheet({ person, onClose }) {
  const { habits, addHabit, updateHabit } = useFitnessStore()
  const list = habitsFor(habits, person.id, { includeHidden: true })

  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(EMOJIS[0])
  const [kind, setKind] = useState('check')
  const [unit, setUnit] = useState('')

  const canAdd = name.trim().length > 0
  const add = () => {
    if (!canAdd) return
    addHabit({ userId: person.id, name, emoji, kind, unit: kind === 'number' ? unit.trim() : null })
    setName(''); setUnit(''); setKind('check'); setEmoji(EMOJIS[0]); setAdding(false)
  }

  const field = { width: '100%', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: T.radius.md, padding: '11px 13px', fontSize: 15, outline: 'none' }

  return (
    <BottomSheet title={`${person.name}'s habits`} subtitle="Hidden habits keep their history." onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {list.map(h => (
          <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: T.radius.md, background: T.surface2, border: `1px solid ${T.border}`, opacity: h.active ? 1 : 0.5 }}>
            <span style={{ fontSize: 18 }}>{h.emoji}</span>
            <span style={{ flex: 1, fontSize: 14 }}>{h.name}</span>
            <button onClick={() => updateHabit(h.id, { active: !h.active })} style={{
              fontSize: 12, fontWeight: 600, padding: '6px 10px', borderRadius: T.radius.sm,
              color: h.active ? T.textMuted : person.color,
              background: h.active ? T.surface3 : person.colorSoft,
              border: `1px solid ${h.active ? T.border : person.colorBorder}`,
            }}>
              {h.active ? 'Hide' : 'Show'}
            </button>
          </div>
        ))}
      </div>

      {!adding ? (
        <button onClick={() => setAdding(true)} style={{ width: '100%', padding: 13, borderRadius: T.radius.md, fontSize: 14, fontWeight: 600, color: person.color, background: person.colorSoft, border: `1px dashed ${person.colorBorder}` }}>
          + Add habit
        </button>
      ) : (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()}
            placeholder="Water" maxLength={30} style={field} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setEmoji(e)} aria-label={`Emoji ${e}`} style={{
                height: 42, fontSize: 20, borderRadius: T.radius.md,
                background: emoji === e ? person.colorSoft : T.surface2,
                border: `1.5px solid ${emoji === e ? person.color : T.border}`,
              }}>{e}</button>
            ))}
          </div>
          <Segmented size="sm" accent={person} value={kind} onChange={setKind}
            options={[{ id: 'check', label: 'Yes / no' }, { id: 'number', label: 'Number' }]} />
          {kind === 'number' && (
            <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="Unit, e.g. l or h" maxLength={6} style={field} />
          )}
          <button onClick={add} style={{
            width: '100%', padding: 13, borderRadius: T.radius.md, fontSize: 14, fontWeight: 600,
            background: canAdd ? person.gradient : T.surface2, color: canAdd ? '#fff' : T.textDim,
          }}>Add habit</button>
        </div>
      )}
    </BottomSheet>
  )
}
