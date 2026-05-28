import { create } from 'zustand'
import { supabase } from '../lib/supabase.js'

const toLocal = (row) => ({
  id:            row.id,
  title:         row.title,
  description:   row.description || '',
  category_id:   row.category_id,
  location:      row.location || '',
  cost:          row.cost || 0,
  duration_mins: row.duration_mins || 60,
  status:        row.status || 'idea',
  suggested_by:  row.suggested_by,
  tags:          row.tags || [],
  notes:         row.notes || '',
  image_urls:    row.image_urls || [],
  ranking_janina:  row.ranking_janina ?? null,
  ranking_facu:    row.ranking_facu ?? null,
  is_recurring:    row.is_recurring || false,
  created_at:    row.created_at,
  experience:    row.experiences?.[0] || null,
})

export const useTwineStore = create((set, get) => ({
  currentUserId: null,
  plans: [],
  loading: true,
  error: null,
  toast: null,

  // ── User ─────────────────────────────────────────────────────────────────
  setUser: (userId) => {
    localStorage.setItem('twine_user', userId)
    set({ currentUserId: userId })
  },
  restoreUser: () => {
    const saved = localStorage.getItem('twine_user')
    if (saved) set({ currentUserId: saved })
  },

  // ── Toast ─────────────────────────────────────────────────────────────────
  showToast: (msg) => {
    set({ toast: msg })
    setTimeout(() => set({ toast: null }), 2500)
  },

  // ── Fetch ─────────────────────────────────────────────────────────────────
  fetchPlans: async () => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('plans')
      .select('*, experiences(*)')
      .order('created_at', { ascending: false })
    if (error) { set({ error: error.message, loading: false }); return }
    set({ plans: data.map(toLocal), loading: false })
  },

  // ── Realtime ──────────────────────────────────────────────────────────────
  subscribeRealtime: () => {
    const channel = supabase
      .channel('twine-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plans' }, () => get().fetchPlans())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'experiences' }, () => get().fetchPlans())
      .subscribe()
    return () => supabase.removeChannel(channel)
  },

  // ── Add plan ──────────────────────────────────────────────────────────────
  addPlan: async (planData) => {
    const { currentUserId } = get()
    const { data, error } = await supabase
      .from('plans')
      .insert([{
        title:         planData.title,
        description:   planData.description || '',
        category_id:   planData.category_id,
        location:      planData.location || '',
        cost:          planData.cost || 0,
        duration_mins: planData.duration_mins || 60,
        status:        'idea',
        suggested_by:  currentUserId,
        tags:          planData.tags || [],
        notes:         planData.notes || '',
        is_recurring:  planData.is_recurring || false,
        // Only seed the suggesting user's ranking with their excitement
        ranking_janina: currentUserId === 'janina' ? (planData.excitement || null) : null,
        ranking_facu:   currentUserId === 'facu'   ? (planData.excitement || null) : null,
      }])
      .select()
    if (error) return { error }
    await get().fetchPlans()
    get().showToast('Plan saved! ✓')
    return { data }
  },

  // ── Update ranking ────────────────────────────────────────────────────────
  updateRanking: async (planId, userId, score) => {
    const col = userId === 'janina' ? 'ranking_janina' : 'ranking_facu'
    const { error } = await supabase.from('plans').update({ [col]: score }).eq('id', planId)
    if (!error) {
      set(state => ({ plans: state.plans.map(p => p.id === planId ? { ...p, [col]: score } : p) }))
    }
    return { error }
  },

  // ── Update status ─────────────────────────────────────────────────────────
  updateStatus: async (planId, status) => {
    const { error } = await supabase.from('plans').update({ status }).eq('id', planId)
    if (!error) {
      set(state => ({ plans: state.plans.map(p => p.id === planId ? { ...p, status } : p) }))
    }
    return { error }
  },

  // ── Update notes ──────────────────────────────────────────────────────────
  updateNotes: async (planId, notes) => {
    const { error } = await supabase.from('plans').update({ notes }).eq('id', planId)
    if (!error) {
      set(state => ({ plans: state.plans.map(p => p.id === planId ? { ...p, notes } : p) }))
    }
    return { error }
  },

  // ── Delete plan ───────────────────────────────────────────────────────────
  deletePlan: async (planId) => {
    const { error } = await supabase.from('plans').delete().eq('id', planId)
    if (!error) set(state => ({ plans: state.plans.filter(p => p.id !== planId) }))
    return { error }
  },

  // ── Add / update experience (per user) ───────────────────────────────────
  addExperience: async (planId, userId, expData) => {
    const col_overall = userId === 'janina' ? 'overall_janina' : 'overall_facu'
    const col_fun     = userId === 'janina' ? 'fun_janina'     : 'fun_facu'
    const col_repeat  = userId === 'janina' ? 'repeat_janina'  : 'repeat_facu'

    // Check if experience row exists
    const { data: existing } = await supabase
      .from('experiences')
      .select('id')
      .eq('plan_id', planId)
      .single()

    if (existing) {
      await supabase.from('experiences').update({
        [col_overall]: expData.overall,
        [col_fun]:     expData.fun,
        [col_repeat]:  expData.would_repeat,
      }).eq('plan_id', planId)
    } else {
      await supabase.from('experiences').insert([{
        plan_id:      planId,
        [col_overall]: expData.overall,
        [col_fun]:     expData.fun,
        [col_repeat]:  expData.would_repeat,
      }])
    }

    // Mark plan as done
    await supabase.from('plans').update({ status: 'done' }).eq('id', planId)
    await get().fetchPlans()
    get().showToast('Experience saved! ✓')
    return {}
  },
}))
