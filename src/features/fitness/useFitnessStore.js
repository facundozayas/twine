import { create } from 'zustand'
import { supabase } from '../../lib/supabase.js'
import { subscribeTables, applyChange } from '../../lib/realtime.js'
import { optimistic, uuid, nowISO } from '../../lib/optimistic.js'
import { addDays, today, lastNDays } from '../../lib/dates.js'

// ─── Data model ──────────────────────────────────────────────────────────────
// habits:     what each person tracks (check / training / number)
// habit_logs: one row per habit per day. A missing row means "not done", so
//             toggling a check is insert ↔ delete and the table stays small.

const HISTORY_DAYS = 400 // enough for a year of streaks and stats

export const useFitnessStore = create((set, get) => {
  const mutate = optimistic(set, get, ['habits', 'logs'])

  const findLog = (habitId, date) =>
    get().logs.find(l => l.habit_id === habitId && l.date === date)

  const insertLog = (habit, date, fields = {}) => {
    const row = { id: uuid(), habit_id: habit.id, user_id: habit.user_id, date, value: null, type: null, note: null, created_at: nowISO(), ...fields }
    return mutate(
      state => ({ logs: [...state.logs, row] }),
      () => supabase.from('habit_logs').insert(row),
    )
  }

  const updateLog = (log, patch) =>
    mutate(
      state => ({ logs: state.logs.map(l => (l.id === log.id ? { ...l, ...patch } : l)) }),
      () => supabase.from('habit_logs').update(patch).eq('id', log.id),
    )

  const deleteLog = (log) =>
    mutate(
      state => ({ logs: state.logs.filter(l => l.id !== log.id) }),
      () => supabase.from('habit_logs').delete().eq('id', log.id),
    )

  return {
    habits: [],
    logs: [],
    loaded: false,
    error: null,

    // ── Load + sync ────────────────────────────────────────────────────────
    fetchAll: async () => {
      const since = addDays(today(), -HISTORY_DAYS)
      const [h, l] = await Promise.all([
        supabase.from('habits').select('*'),
        supabase.from('habit_logs').select('*').gte('date', since),
      ])
      const error = h.error || l.error
      if (error) { set({ error: error.message, loaded: true }); return }
      set({ habits: h.data, logs: l.data, loaded: true, error: null })
    },

    subscribe: () =>
      subscribeTables('twine-fitness', ['habits', 'habit_logs'], (table, payload) => {
        const key = table === 'habits' ? 'habits' : 'logs'
        set(state => ({ [key]: applyChange(state[key], payload) }))
      }),

    // ── Logging ────────────────────────────────────────────────────────────
    /** Check habits and Training: tap to mark done, tap again to undo. */
    toggle: (habit, date) => {
      const log = findLog(habit.id, date)
      return log ? deleteLog(log) : insertLog(habit, date)
    },

    /** Training detail: { type, value (km), note } */
    setTrainingDetail: (habit, date, patch) => {
      const log = findLog(habit.id, date)
      return log ? updateLog(log, patch) : insertLog(habit, date, patch)
    },

    /** Number habits (sleep). null clears the day. */
    setNumber: (habit, date, value) => {
      const log = findLog(habit.id, date)
      if (value == null) return log ? deleteLog(log) : Promise.resolve({})
      return log ? updateLog(log, { value }) : insertLog(habit, date, { value })
    },

    // ── Habit editing ──────────────────────────────────────────────────────
    addHabit: ({ userId, name, emoji, kind, unit }) => {
      const mine = get().habits.filter(h => h.user_id === userId)
      const row = {
        id: uuid(), user_id: userId, name: name.trim(), emoji, kind, unit: unit || null,
        sort_order: Math.max(0, ...mine.map(h => h.sort_order)) + 1, active: true, created_at: nowISO(),
      }
      return mutate(
        state => ({ habits: [...state.habits, row] }),
        () => supabase.from('habits').insert(row),
      )
    },

    updateHabit: (id, patch) =>
      mutate(
        state => ({ habits: state.habits.map(h => (h.id === id ? { ...h, ...patch } : h)) }),
        () => supabase.from('habits').update(patch).eq('id', id),
      ),
  }
})

// ─── Selectors (pure) ────────────────────────────────────────────────────────

const KIND_ORDER = { check: 0, training: 1, number: 2 }

export function habitsFor(habits, userId, { includeHidden = false } = {}) {
  return habits
    .filter(h => h.user_id === userId && (includeHidden || h.active))
    .sort((a, b) => (KIND_ORDER[a.kind] - KIND_ORDER[b.kind]) || (a.sort_order - b.sort_order) || a.created_at.localeCompare(b.created_at))
}

/** Map 'habitId|date' → log, for O(1) lookups while rendering. */
export function indexLogs(logs) {
  const m = new Map()
  logs.forEach(l => m.set(`${l.habit_id}|${l.date}`, l))
  return m
}

export const getLog = (index, habitId, date) => index.get(`${habitId}|${date}`)

/**
 * Consecutive days done, counting back from `date`. If `date` itself isn't
 * logged yet, the streak from the day before still counts (it isn't broken
 * until the day is over).
 */
export function streak(index, habitId, date = today()) {
  let d = getLog(index, habitId, date) ? date : addDays(date, -1)
  let n = 0
  while (getLog(index, habitId, d)) { n += 1; d = addDays(d, -1) }
  return n
}

/** Summary numbers for the History tab. */
export function stats(index, habits, days = 30, end = today()) {
  const range = lastNDays(days, end)
  const week = lastNDays(7, end)
  const byHabit = habits.map(h => {
    const logged = range.map(d => getLog(index, h.id, d)).filter(Boolean)
    const out = { habit: h, rate: logged.length / days, streak: streak(index, h.id, end) }
    if (h.kind === 'number') {
      const wk = week.map(d => getLog(index, h.id, d)).filter(Boolean)
      out.avg7 = wk.length ? wk.reduce((s, l) => s + Number(l.value), 0) / wk.length : null
    }
    if (h.kind === 'training') {
      out.sessions = logged.length
      out.km = logged.reduce((s, l) => s + (Number(l.value) || 0), 0)
      out.kmWeek = week.map(d => getLog(index, h.id, d)).filter(Boolean).reduce((s, l) => s + (Number(l.value) || 0), 0)
    }
    return out
  })
  return byHabit
}
