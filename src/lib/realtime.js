import { supabase } from './supabase.js'

/**
 * Subscribe to row-level changes on one or more tables.
 * onChange(table, payload) receives Supabase's postgres_changes payload
 * ({ eventType, new, old }), so stores can patch state instead of refetching.
 * Returns an unsubscribe function.
 */
export function subscribeTables(channelName, tables, onChange) {
  let channel = supabase.channel(channelName)
  tables.forEach(table => {
    channel = channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      payload => onChange(table, payload),
    )
  })
  channel.subscribe()
  return () => supabase.removeChannel(channel)
}

/**
 * Phones pause websockets when the screen locks, so changes made meanwhile
 * are missed. Call `refetch` whenever the app comes back to the foreground.
 */
export function onAppResume(refetch) {
  const handler = () => { if (document.visibilityState === 'visible') refetch() }
  document.addEventListener('visibilitychange', handler)
  return () => document.removeEventListener('visibilitychange', handler)
}

/** Insert or replace a row (by id) in an array — used to apply realtime events. */
export function upsertById(rows, row) {
  const i = rows.findIndex(r => r.id === row.id)
  if (i === -1) return [...rows, row]
  const next = rows.slice()
  next[i] = { ...rows[i], ...row }
  return next
}

/** Apply one postgres_changes payload to an array of rows. */
export function applyChange(rows, payload) {
  return payload.eventType === 'DELETE'
    ? rows.filter(r => r.id !== payload.old.id)
    : upsertById(rows, payload.new)
}
