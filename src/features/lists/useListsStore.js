import { create } from 'zustand'
import { supabase } from '../../lib/supabase.js'
import { subscribeTables, applyChange } from '../../lib/realtime.js'
import { optimistic, uuid, nowISO as now } from '../../lib/optimistic.js'
import { COMMON_ITEMS } from './constants.js'

// ─── Design notes ────────────────────────────────────────────────────────────
// • IDs are generated on the device (crypto.randomUUID). The optimistic row and
//   the saved row share the same id, so realtime echoes of our own writes merge
//   cleanly instead of creating duplicates or flickering.
// • Every action updates local state first (instant UI), then writes to
//   Supabase. If the write fails we roll back and show an error toast.
// • `items` keeps cleared rows too (cleared_at set). They're hidden in the UI
//   but feed autocomplete, so the app learns what you usually buy.

const HISTORY_LIMIT = 3000

export const useListsStore = create((set, get) => {
  // Apply a local change right away, then persist it; roll back on failure.
  const mutate = optimistic(set, get, ['lists', 'items'])

  const patchItem = (id, patch) => state => ({
    items: state.items.map(i => (i.id === id ? { ...i, ...patch } : i)),
  })
  const patchList = (id, patch) => state => ({
    lists: state.lists.map(l => (l.id === id ? { ...l, ...patch } : l)),
  })

  return {
    lists: [],
    items: [],
    loaded: false,
    error: null,

    // ── Load + sync ────────────────────────────────────────────────────────
    fetchAll: async () => {
      const [listsRes, itemsRes] = await Promise.all([
        supabase.from('shopping_lists').select('*'),
        supabase.from('shopping_items').select('*').order('created_at', { ascending: false }).limit(HISTORY_LIMIT),
      ])
      const error = listsRes.error || itemsRes.error
      if (error) { set({ error: error.message, loaded: true }); return }
      set({ lists: listsRes.data, items: itemsRes.data, loaded: true, error: null })
    },

    subscribe: () =>
      subscribeTables('twine-lists', ['shopping_lists', 'shopping_items'], (table, payload) => {
        const key = table === 'shopping_lists' ? 'lists' : 'items'
        set(state => ({ [key]: applyChange(state[key], payload) }))
      }),

    // ── Lists ──────────────────────────────────────────────────────────────
    createList: async ({ name, emoji }, userId) => {
      const row = {
        id: uuid(), name: name.trim(), emoji, is_default: false,
        sort_order: 100, archived_at: null, created_by: userId, created_at: now(),
      }
      await mutate(
        state => ({ lists: [...state.lists, row] }),
        () => supabase.from('shopping_lists').insert(row),
      )
      return row
    },

    updateList: (id, patch) =>
      mutate(patchList(id, patch), () => supabase.from('shopping_lists').update(patch).eq('id', id)),

    archiveList:   (id) => get().updateList(id, { archived_at: now() }),
    unarchiveList: (id) => get().updateList(id, { archived_at: null }),

    deleteList: (id) =>
      mutate(
        state => ({
          lists: state.lists.filter(l => l.id !== id),
          items: state.items.filter(i => i.list_id !== id),
        }),
        () => supabase.from('shopping_lists').delete().eq('id', id),
      ),

    // ── Items ──────────────────────────────────────────────────────────────
    addItems: (listId, texts, userId) => {
      const rows = texts
        .map(t => t.trim())
        .filter(Boolean)
        .map((text, n) => ({
          id: uuid(), list_id: listId, text, checked: false,
          added_by: userId, checked_by: null, checked_at: null, cleared_at: null,
          // stagger by 1ms so pasted lines keep their order
          created_at: new Date(Date.now() + n).toISOString(),
        }))
      if (rows.length === 0) return Promise.resolve({})
      return mutate(
        state => ({ items: [...state.items, ...rows] }),
        () => supabase.from('shopping_items').insert(rows),
      )
    },

    toggleItem: (item, userId) => {
      const patch = item.checked
        ? { checked: false, checked_by: null, checked_at: null }
        : { checked: true, checked_by: userId, checked_at: now() }
      return mutate(patchItem(item.id, patch), () =>
        supabase.from('shopping_items').update(patch).eq('id', item.id))
    },

    renameItem: (id, text) => {
      const patch = { text: text.trim() }
      if (!patch.text) return Promise.resolve({})
      return mutate(patchItem(id, patch), () =>
        supabase.from('shopping_items').update(patch).eq('id', id))
    },

    moveItem: (id, listId) => {
      const patch = { list_id: listId }
      return mutate(patchItem(id, patch), () =>
        supabase.from('shopping_items').update(patch).eq('id', id))
    },

    deleteItem: (id) =>
      mutate(
        state => ({ items: state.items.filter(i => i.id !== id) }),
        () => supabase.from('shopping_items').delete().eq('id', id),
      ),

    // Hides every checked item in a list. Returns the ids so the UI can offer Undo.
    clearChecked: async (listId) => {
      const ids = get().items
        .filter(i => i.list_id === listId && i.checked && !i.cleared_at)
        .map(i => i.id)
      if (ids.length === 0) return []
      const stamp = now()
      await mutate(
        state => ({ items: state.items.map(i => (ids.includes(i.id) ? { ...i, cleared_at: stamp } : i)) }),
        () => supabase.from('shopping_items').update({ cleared_at: stamp }).in('id', ids),
      )
      return ids
    },

    restoreItems: (ids) =>
      mutate(
        state => ({ items: state.items.map(i => (ids.includes(i.id) ? { ...i, cleared_at: null } : i)) }),
        () => supabase.from('shopping_items').update({ cleared_at: null }).in('id', ids),
      ),
  }
})

// ─── Selectors (pure, easy to test and reuse) ─────────────────────────────────

const byCreated = (a, b) => a.created_at.localeCompare(b.created_at)

export function sortLists(lists) {
  return [...lists].sort((a, b) => (a.sort_order - b.sort_order) || byCreated(a, b))
}

export function listItems(items, listId) {
  const visible = items.filter(i => i.list_id === listId && !i.cleared_at)
  return {
    open: visible.filter(i => !i.checked).sort(byCreated),
    done: visible.filter(i => i.checked).sort((a, b) => (b.checked_at || '').localeCompare(a.checked_at || '')),
  }
}

/**
 * Autocomplete: your own history first (most often bought), then the common
 * English seed list. Prefix matches rank above matches inside a word.
 * Items already open in the current list are skipped.
 */
export function suggestItems(items, query, openTexts, max = 4) {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const freq = new Map() // lowercased text → { text, count }
  items.forEach(i => {
    const key = i.text.trim().toLowerCase()
    const entry = freq.get(key)
    if (entry) entry.count += 1
    else freq.set(key, { text: i.text.trim(), count: 1 })
  })
  COMMON_ITEMS.forEach(text => {
    const key = text.toLowerCase()
    if (!freq.has(key)) freq.set(key, { text, count: 0 })
  })

  const skip = new Set(openTexts.map(t => t.trim().toLowerCase()))
  skip.add(q) // no point suggesting exactly what's typed

  const scored = []
  freq.forEach(({ text, count }, key) => {
    if (skip.has(key)) return
    let rank
    if (key.startsWith(q)) rank = 0
    else if (key.split(/\s+/).some(w => w.startsWith(q))) rank = 1
    else return
    scored.push({ text, count, rank })
  })
  scored.sort((a, b) => (a.rank - b.rank) || (b.count - a.count) || a.text.localeCompare(b.text))
  return scored.slice(0, max).map(s => s.text)
}
