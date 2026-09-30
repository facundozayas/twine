import { useState } from 'react'
import { T } from '../../constants/index.js'
import BottomSheet, { SheetAction } from '../shared/BottomSheet.jsx'

/** Long-press menu for an item: edit text, move to another list, delete. */
export default function ItemActionsSheet({ item, otherLists, onRename, onMove, onDelete, onClose }) {
  const [mode, setMode] = useState('menu') // 'menu' | 'edit' | 'move'
  const [text, setText] = useState(item.text)

  const done = (fn) => () => { fn(); onClose() }

  if (mode === 'edit') {
    const save = () => { if (text.trim()) { onRename(text); onClose() } }
    return (
      <BottomSheet title="Edit item" onClose={onClose}>
        <input
          autoFocus
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && save()}
          style={{ width: '100%', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: T.radius.md, padding: '12px 14px', fontSize: 15, outline: 'none', marginBottom: 14 }}
        />
        <SheetAction label="Save" onClick={save} />
      </BottomSheet>
    )
  }

  if (mode === 'move') {
    return (
      <BottomSheet title="Move to…" subtitle={item.text} onClose={onClose}>
        {otherLists.map(l => (
          <SheetAction key={l.id} icon={l.emoji} label={l.name} onClick={done(() => onMove(l.id))} />
        ))}
      </BottomSheet>
    )
  }

  return (
    <BottomSheet title={item.text} onClose={onClose}>
      <SheetAction icon="✏️" label="Edit" onClick={() => setMode('edit')} />
      {otherLists.length > 0 && (
        otherLists.length === 1
          ? <SheetAction icon={otherLists[0].emoji} label={`Move to ${otherLists[0].name}`} onClick={done(() => onMove(otherLists[0].id))} />
          : <SheetAction icon="↪️" label="Move to…" onClick={() => setMode('move')} />
      )}
      <SheetAction icon="🗑️" label="Delete" danger onClick={done(onDelete)} />
    </BottomSheet>
  )
}
