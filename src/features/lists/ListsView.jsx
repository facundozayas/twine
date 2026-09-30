import { useState, useMemo } from 'react'
import { T } from '../../constants/index.js'
import Icon from '../../components/shared/Icon.jsx'
import { useListsStore, listItems, sortLists } from './useListsStore.js'
import ListDetail from './ListDetail.jsx'
import ListFormSheet from './components/ListFormSheet.jsx'

export default function ListsView({ currentUser }) {
  const { lists, items, loaded, error, createList, unarchiveList } = useListsStore()
  const [openId, setOpenId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  const active   = useMemo(() => sortLists(lists.filter(l => !l.archived_at)), [lists])
  const archived = useMemo(() => lists.filter(l => l.archived_at).sort((a, b) => b.archived_at.localeCompare(a.archived_at)), [lists])

  const openList = openId ? lists.find(l => l.id === openId) : null
  if (openList) return <ListDetail list={openList} currentUser={currentUser} onBack={() => setOpenId(null)} />

  if (!loaded) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
  }

  if (error) {
    return (
      <div style={{ padding: '40px 10px', textAlign: 'center' }}>
        <div style={{ fontSize: 34, marginBottom: 10 }}>🛒</div>
        <p className="display" style={{ fontSize: 20, marginBottom: 8 }}>Lists aren't set up yet</p>
        <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6 }}>
          Run <span className="mono" style={{ color: T.text }}>supabase/002_shopping_lists.sql</span> in the Supabase SQL Editor, then reload.
        </p>
        <p style={{ fontSize: 11, color: T.textDim, fontFamily: 'monospace', marginTop: 14, wordBreak: 'break-all' }}>{error}</p>
      </div>
    )
  }

  const handleCreate = async (data) => {
    const row = await createList(data, currentUser.id)
    setOpenId(row.id) // jump straight in so you can start typing items
  }

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 className="display" style={{ fontSize: 26 }}>Lists</h2>
        <button onClick={() => setCreating(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: currentUser.gradient, color: '#fff', padding: '8px 14px', borderRadius: T.radius.md, fontSize: 13, fontWeight: 600, boxShadow: `0 2px 14px ${currentUser.color}44` }}>
          <Icon name="plus" size={14} color="#fff" /> New list
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {active.map((list, i) => (
          <ListCard key={list.id} list={list} items={items} index={i} onClick={() => setOpenId(list.id)} />
        ))}
      </div>

      {archived.length > 0 && (
        <div style={{ marginTop: 26 }}>
          <button onClick={() => setShowArchived(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: T.textMuted, padding: '6px 0' }}>
            <Icon name="archive" size={14} color={T.textMuted} />
            Archived · {archived.length}
            <Icon name="chevronD" size={14} color={T.textMuted} style={{ transform: showArchived ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
          </button>
          {showArchived && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {archived.map(list => (
                <div key={list.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: T.radius.lg, background: T.surface, border: `1px solid ${T.border}`, opacity: 0.75 }}>
                  <span style={{ fontSize: 20 }}>{list.emoji}</span>
                  <button onClick={() => setOpenId(list.id)} style={{ flex: 1, textAlign: 'left', fontSize: 14 }}>{list.name}</button>
                  <button onClick={() => unarchiveList(list.id)} style={{ fontSize: 12, fontWeight: 600, color: currentUser.color, padding: '6px 10px', borderRadius: T.radius.sm, background: currentUser.colorSoft, border: `1px solid ${currentUser.colorBorder}` }}>
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {creating && (
        <ListFormSheet currentUser={currentUser} onSave={handleCreate} onClose={() => setCreating(false)} />
      )}
    </div>
  )
}

function ListCard({ list, items, index, onClick }) {
  const { open, done } = listItems(items, list.id)
  const preview = open.slice(0, 3).map(i => i.text).join(' · ')

  return (
    <button onClick={onClick} className="fade-up" style={{ animationDelay: `${index * 0.04}s`, display: 'flex', alignItems: 'center', gap: 14, padding: '15px 16px', borderRadius: T.radius.lg, background: T.surface, border: `1px solid ${T.border}`, textAlign: 'left', width: '100%' }}>
      <div style={{ width: 44, height: 44, borderRadius: T.radius.md, background: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
        {list.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>{list.name}</div>
        <div style={{ fontSize: 12, color: T.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {open.length > 0 ? preview : done.length > 0 ? 'All done 🎉' : 'Empty'}
        </div>
      </div>
      {open.length > 0 && (
        <span className="mono" style={{ minWidth: 26, height: 26, borderRadius: T.radius.full, padding: '0 8px', background: T.accentSoft, color: T.accent, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {open.length}
        </span>
      )}
    </button>
  )
}
