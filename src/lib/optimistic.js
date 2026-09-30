import { useTwineStore } from '../store/useTwineStore.js'

/**
 * Optimistic write helper for Zustand stores.
 * `apply(state)` updates local state immediately; `persist()` writes to
 * Supabase. If the write fails, the listed keys are rolled back and an error
 * toast is shown.
 *
 *   const mutate = optimistic(set, get, ['items'])
 *   mutate(state => ({ items: [...] }), () => supabase.from('x').insert(row))
 */
export function optimistic(set, get, keys) {
  return async (apply, persist) => {
    const snapshot = Object.fromEntries(keys.map(k => [k, get()[k]]))
    set(state => apply(state))
    const { error } = await persist()
    if (error) {
      set(snapshot)
      useTwineStore.getState().showToast("Couldn't save — check your connection", 'error')
    }
    return { error }
  }
}

export const uuid = () => crypto.randomUUID()
export const nowISO = () => new Date().toISOString()
