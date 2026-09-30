import { useState } from 'react'
import { T } from '../../../constants/index.js'
import BottomSheet from '../../../components/shared/BottomSheet.jsx'
import Segmented from '../../../components/shared/Segmented.jsx'
import { OWNER_OPTIONS, GOAL_EMOJIS, ownerInfo } from '../owners.jsx'

/** Create a goal, or edit title / emoji / owner / date / why of an existing one. */
export default function GoalFormSheet({ initial, currentUser, onSave, onClose }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [emoji, setEmoji] = useState(initial?.emoji || GOAL_EMOJIS[0])
  const [owner, setOwner] = useState(initial?.owner || currentUser.id)
  const [due, setDue] = useState(initial?.due_date || '')
  const [why, setWhy] = useState(initial?.why || '')
  const canSave = title.trim().length > 0
  const accent = ownerInfo(owner)

  const save = () => {
    if (!canSave) return
    onSave({ title: title.trim(), emoji, owner, due_date: due || null, why: why.trim() || null })
    onClose()
  }

  const field = { width: '100%', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: T.radius.md, padding: '12px 14px', fontSize: 15, outline: 'none', color: T.text }
  const label = { fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '14px 0 6px', display: 'block' }

  return (
    <BottomSheet title={initial ? 'Edit goal' : 'New goal'} onClose={onClose}>
      <input autoFocus={!initial} value={title} onChange={e => setTitle(e.target.value)} placeholder="Reach A2 in German" maxLength={60} style={field} aria-label="Goal" />

      <span style={label}>Icon</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
        {GOAL_EMOJIS.map(e => (
          <button key={e} onClick={() => setEmoji(e)} aria-label={`Emoji ${e}`} style={{
            height: 42, fontSize: 20, borderRadius: T.radius.md,
            background: emoji === e ? accent.colorSoft : T.surface2,
            border: `1.5px solid ${emoji === e ? accent.color : T.border}`,
          }}>{e}</button>
        ))}
      </div>

      <span style={label}>Whose goal</span>
      <Segmented size="sm" options={OWNER_OPTIONS()} value={owner} onChange={setOwner} />

      <span style={label}>Target date <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(optional)</span></span>
      <div style={{ display: 'flex', gap: 8 }}>
        <input type="date" value={due} onChange={e => setDue(e.target.value)} aria-label="Target date" style={{ ...field, flex: 1, colorScheme: 'inherit' }} />
        {due && <button onClick={() => setDue('')} style={{ padding: '0 14px', borderRadius: T.radius.md, background: T.surface2, color: T.textMuted, fontSize: 13 }}>Clear</button>}
      </div>

      <span style={label}>Why <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(optional)</span></span>
      <input value={why} onChange={e => setWhy(e.target.value)} placeholder="So I can chat with the neighbours" maxLength={120} style={field} aria-label="Why" />

      <button onClick={save} style={{
        width: '100%', marginTop: 20, padding: 13, borderRadius: T.radius.md, fontSize: 14, fontWeight: 600,
        background: canSave ? accent.gradient : T.surface2, color: canSave ? '#fff' : T.textDim,
      }}>{initial ? 'Save' : 'Create goal'}</button>
    </BottomSheet>
  )
}
