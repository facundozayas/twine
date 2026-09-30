import { useState, useEffect, useMemo, useRef } from 'react'
import { T } from '../../constants/index.js'
import Icon from '../../components/shared/Icon.jsx'
import BottomSheet, { SheetAction, Overlay } from '../../components/shared/BottomSheet.jsx'
import { useListsStore, listItems, sortLists } from './useListsStore.js'
import ItemRow from './components/ItemRow.jsx'
import NewItemInput from './components/NewItemInput.jsx'
import ItemActionsSheet from './components/ItemActionsSheet.jsx'
import ListFormSheet from './components/ListFormSheet.jsx'

export default function ListDetail({ list, currentUser, onBack }) {
  const store = useListsStore()
  const { open, done } = useMemo(() => listItems(store.items, list.id), [store.items, list.id])
  const openTexts = useMemo(() => open.map(i => i.text), [open])
  const otherLists = useMemo(
    () => sortLists(store.lists.filter(l => l.id !== list.id && !l.archived_at)),
    [store.lists, list.id],
  )

  const [actionItem, setActionItem] = useState(null)
  const [menu, setMenu] = useState(null)         // null | 'menu' | 'edit' | 'confirmDelete'
  const [undo, setUndo] = useState(null)         // { ids, count }
  const undoTimer = useRef(null)
  useEffect(() => () => clearTimeout(undoTimer.current), [])

  const uid = currentUser.id

  const handleClear = async () => {
    const ids = await store.clearChecked(list.id)
    if (!ids.length) return
    clearTimeout(undoTimer.current)
    setUndo({ ids, count: ids.length })
    undoTimer.current = setTimeout(() => setUndo(null), 5000)
  }

  const handleUndo = () => {
    store.restoreItems(undo.ids)
    clearTimeout(undoTimer.current)
    setUndo(null)
  }

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <button onClick={onBack} aria-label="Back to lists" style={{ width: 34, height: 34, borderRadius: T.radius.md, background: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="arrowL" size={16} color={T.textMuted} />
        </button>
        <h2 className="display" style={{ fontSize: 26, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {list.emoji} {list.name}
        </h2>
        <button onClick={() => setMenu('menu')} aria-label="List options" style={{ width: 34, height: 34, borderRadius: T.radius.md, background: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="more" size={18} color={T.textMuted} />
        </button>
      </div>

      <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 10, paddingLeft: 44 }}>
        {open.length === 0 && done.length === 0
          ? 'Empty — start typing below'
          : `${open.length} to get${done.length ? ` · ${done.length} done` : ''}`}
      </p>

      {/* Open items + the input line */}
      <div>
        {open.map(item => (
          <ItemRow key={item.id} item={item} currentUser={currentUser}
            onToggle={() => store.toggleItem(item, uid)}
            onLongPress={() => setActionItem(item)} />
        ))}
        <NewItemInput
          allItems={store.items}
          openTexts={openTexts}
          accent={currentUser}
          autoFocus={open.length === 0}
          onAdd={texts => store.addItems(list.id, texts, uid)}
        />
      </div>

      {/* Checked items */}
      {done.length > 0 && (
        <div style={{ marginTop: 26 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Checked · {done.length}
            </span>
            <button onClick={handleClear} style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, padding: '6px 10px', borderRadius: T.radius.sm, background: T.surface2 }}>
              Clear checked
            </button>
          </div>
          {done.map(item => (
            <ItemRow key={item.id} item={item} currentUser={currentUser}
              onToggle={() => store.toggleItem(item, uid)}
              onLongPress={() => setActionItem(item)} />
          ))}
        </div>
      )}

      {open.length === 0 && done.length > 0 && (
        <p style={{ textAlign: 'center', fontSize: 13, color: T.success, marginTop: 22 }}>All done 🎉</p>
      )}

      {/* Undo bar */}
      {undo && (
        <Overlay>
          <div style={{ position: 'fixed', bottom: 92, left: 0, right: 0, zIndex: 60, display: 'flex', justifyContent: 'center', padding: '0 20px', pointerEvents: 'none' }}>
            <div className="fade-up" style={{ pointerEvents: 'auto', width: '100%', maxWidth: 440, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px', borderRadius: T.radius.lg, background: T.surface3, border: `1px solid ${T.border}`, boxShadow: '0 6px 24px rgba(0,0,0,0.4)' }}>
              <span style={{ fontSize: 13 }}>Cleared {undo.count} item{undo.count > 1 ? 's' : ''}</span>
              <button onClick={handleUndo} style={{ fontSize: 13, fontWeight: 700, color: currentUser.color }}>Undo</button>
            </div>
          </div>
        </Overlay>
      )}

      {/* Sheets */}
      {actionItem && (
        <ItemActionsSheet
          item={actionItem}
          otherLists={otherLists}
          onRename={text => store.renameItem(actionItem.id, text)}
          onMove={listId => store.moveItem(actionItem.id, listId)}
          onDelete={() => store.deleteItem(actionItem.id)}
          onClose={() => setActionItem(null)}
        />
      )}

      {menu === 'menu' && (
        <BottomSheet title={`${list.emoji} ${list.name}`} onClose={() => setMenu(null)}>
          <SheetAction icon="✏️" label="Rename" onClick={() => setMenu('edit')} />
          {!list.is_default && (
            <>
              <SheetAction icon="📦" label="Archive list" onClick={() => { store.archiveList(list.id); setMenu(null); onBack() }} />
              <SheetAction icon="🗑️" label="Delete list" danger onClick={() => setMenu('confirmDelete')} />
            </>
          )}
          {list.is_default && (
            <p style={{ fontSize: 12, color: T.textMuted, marginTop: 4, lineHeight: 1.5 }}>Home lists are always here — they can be renamed but not archived or deleted.</p>
          )}
        </BottomSheet>
      )}

      {menu === 'edit' && (
        <ListFormSheet initial={list} currentUser={currentUser}
          onSave={patch => store.updateList(list.id, patch)}
          onClose={() => setMenu(null)} />
      )}

      {menu === 'confirmDelete' && (
        <BottomSheet title="Delete this list?" subtitle="All its items go too. If you might want it again, archive it instead." onClose={() => setMenu(null)}>
          <SheetAction icon="📦" label="Archive instead" onClick={() => { store.archiveList(list.id); setMenu(null); onBack() }} />
          <SheetAction icon="🗑️" label="Delete forever" danger onClick={() => { store.deleteList(list.id); setMenu(null); onBack() }} />
        </BottomSheet>
      )}
    </div>
  )
}
