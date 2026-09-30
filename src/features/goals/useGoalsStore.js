import { create } from 'zustand'
import { supabase } from '../../lib/supabase.js'
import { subscribeTables, applyChange } from '../../lib/realtime.js'
import { optimistic, uuid, nowISO } from '../../lib/optimistic.js'
import { today, fromISODate } from '../../lib/dates.js'

const KEY = { goals: 'goals', goal_milestones: 'milestones', goal_cheers: 'cheers' }

export const useGoalsStore = create((set, get) => {
  const mutate = optimistic(set, get, ['goals', 'milestones', 'cheers'])
  const patchIn = (key, id, patch) => state => ({ [key]: state[key].map(r => (r.id === id ? { ...r, ...patch } : r)) })

  return {
    goals: [],
    milestones: [],
    cheers: [],
    loaded: false,
    error: null,

    fetchAll: async () => {
      const [g, m, c] = await Promise.all([
        supabase.from('goals').select('*'),
        supabase.from('goal_milestones').select('*'),
        supabase.from('goal_cheers').select('*'),
      ])
      const error = g.error || m.error || c.error
      if (error) { set({ error: error.message, loaded: true }); return }
      set({ goals: g.data, milestones: m.data, cheers: c.data, loaded: true, error: null })
    },

    subscribe: () =>
      subscribeTables('twine-goals', Object.keys(KEY), (table, payload) => {
        const key = KEY[table]
        set(state => ({ [key]: applyChange(state[key], payload) }))
      }),

    // ── Goals ──────────────────────────────────────────────────────────────
    createGoal: async ({ title, emoji, owner, due_date, why }, userId) => {
      const row = { id: uuid(), title: title.trim(), emoji, owner, due_date: due_date || null, why: why?.trim() || null, created_by: userId, done_at: null, created_at: nowISO() }
      await mutate(state => ({ goals: [...state.goals, row] }), () => supabase.from('goals').insert(row))
      return row
    },

    updateGoal: (id, patch) =>
      mutate(patchIn('goals', id, patch), () => supabase.from('goals').update(patch).eq('id', id)),

    deleteGoal: (id) =>
      mutate(
        state => ({
          goals: state.goals.filter(g => g.id !== id),
          milestones: state.milestones.filter(m => m.goal_id !== id),
          cheers: state.cheers.filter(c => c.goal_id !== id),
        }),
        () => supabase.from('goals').delete().eq('id', id),
      ),

    // ── Milestones ─────────────────────────────────────────────────────────
    addMilestones: (goalId, texts, userId) => {
      const rows = texts.map(t => t.trim()).filter(Boolean).map((text, n) => ({
        id: uuid(), goal_id: goalId, text, done: false, created_by: userId, done_by: null, done_at: null,
        created_at: new Date(Date.now() + n).toISOString(),
      }))
      if (!rows.length) return Promise.resolve({})
      return mutate(state => ({ milestones: [...state.milestones, ...rows] }), () => supabase.from('goal_milestones').insert(rows))
    },

    toggleMilestone: (m, userId) => {
      const patch = m.done ? { done: false, done_by: null, done_at: null } : { done: true, done_by: userId, done_at: nowISO() }
      return mutate(patchIn('milestones', m.id, patch), () => supabase.from('goal_milestones').update(patch).eq('id', m.id))
    },

    renameMilestone: (id, text) => {
      const patch = { text: text.trim() }
      if (!patch.text) return Promise.resolve({})
      return mutate(patchIn('milestones', id, patch), () => supabase.from('goal_milestones').update(patch).eq('id', id))
    },

    deleteMilestone: (id) =>
      mutate(state => ({ milestones: state.milestones.filter(m => m.id !== id) }), () => supabase.from('goal_milestones').delete().eq('id', id)),

    // ── Cheers ─────────────────────────────────────────────────────────────
    cheer: (goalId, fromUser) => {
      const row = { id: uuid(), goal_id: goalId, from_user: fromUser, seen_at: null, created_at: nowISO() }
      return mutate(state => ({ cheers: [...state.cheers, row] }), () => supabase.from('goal_cheers').insert(row))
    },

    markCheersSeen: (ids) => {
      if (!ids.length) return Promise.resolve({})
      const stamp = nowISO()
      return mutate(
        state => ({ cheers: state.cheers.map(c => (ids.includes(c.id) ? { ...c, seen_at: stamp } : c)) }),
        () => supabase.from('goal_cheers').update({ seen_at: stamp }).in('id', ids),
      )
    },
  }
})

// ─── Selectors ───────────────────────────────────────────────────────────────

export const involves = (goal, userId) => goal.owner === 'both' || goal.owner === userId

/** Whole days from today until the due date (negative = overdue), or null. */
export function daysLeft(goal) {
  if (!goal.due_date) return null
  return Math.round((fromISODate(goal.due_date) - fromISODate(today())) / 86400000)
}

export function countdownLabel(goal) {
  if (goal.done_at) return 'Achieved'
  const d = daysLeft(goal)
  if (d == null) return 'No date'
  if (d === 0) return 'Due today'
  if (d === 1) return '1 day to go'
  if (d > 1) return `${d} days to go`
  return d === -1 ? '1 day late' : `${-d} days late`
}

export function progress(milestones, goalId) {
  const mine = milestones.filter(m => m.goal_id === goalId)
  return { done: mine.filter(m => m.done).length, total: mine.length }
}

/** Open goals first by nearest date (undated last), then achieved by most recent. */
export function sortGoals(goals) {
  const open = goals.filter(g => !g.done_at).sort((a, b) => {
    if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date)
    if (a.due_date) return -1
    if (b.due_date) return 1
    return a.created_at.localeCompare(b.created_at)
  })
  const achieved = goals.filter(g => g.done_at).sort((a, b) => b.done_at.localeCompare(a.done_at))
  return { open, achieved }
}

/** Cheers someone sent to `userId` that they haven't seen yet. */
export function unseenCheersFor(cheers, goals, userId) {
  const byId = new Map(goals.map(g => [g.id, g]))
  return cheers.filter(c => {
    const g = byId.get(c.goal_id)
    return g && !c.seen_at && c.from_user !== userId && involves(g, userId)
  })
}
