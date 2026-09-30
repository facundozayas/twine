import { useState } from 'react'
import { T } from '../../../constants/index.js'
import BottomSheet from '../../../components/shared/BottomSheet.jsx'
import { LIST_EMOJIS } from '../constants.js'

/** Create a new list, or rename / re-emoji an existing one. */
export default function ListFormSheet({ initial, currentUser, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '')
  const [emoji, setEmoji] = useState(initial?.emoji || LIST_EMOJIS[0])
  const isEdit = Boolean(initial)
  const canSave = name.trim().length > 0

  const save = () => { if (canSave) { onSave({ name: name.trim(), emoji }); onClose() } }

  return (
    <BottomSheet title={isEdit ? 'Edit list' : 'New list'} onClose={onClose}>
      <input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && save()}
        placeholder="Janina's birthday"
        maxLength={40}
        style={{ width: '100%', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: T.radius.md, padding: '12px 14px', fontSize: 15, outline: 'none', marginBottom: 14 }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 20 }}>
        {LIST_EMOJIS.map(e => (
          <button
            key={e}
            onClick={() => setEmoji(e)}
            aria-label={`Emoji ${e}`}
            style={{
              height: 44, fontSize: 21, borderRadius: T.radius.md,
              background: emoji === e ? currentUser.colorSoft : T.surface2,
              border: `1.5px solid ${emoji === e ? currentUser.color : T.border}`,
            }}
          >{e}</button>
        ))}
      </div>

      <button
        onClick={save}
        style={{
          width: '100%', padding: '13px', borderRadius: T.radius.md, fontSize: 14, fontWeight: 600,
          background: canSave ? currentUser.gradient : T.surface2, color: canSave ? '#fff' : T.textDim,
        }}
      >
        {isEdit ? 'Save' : 'Create list'}
      </button>
    </BottomSheet>
  )
}
