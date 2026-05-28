import { useState } from 'react'
import { CATEGORIES, T } from '../constants/index.js'
import PlanCard from '../components/plans/PlanCard.jsx'
import PlanDetail from '../components/plans/PlanDetail.jsx'
import Icon from '../components/shared/Icon.jsx'

export default function PlansView({ plans, currentUser, onAddClick, onUpdateStatus, onUpdateNotes, onAddExperience, onDelete }) {
  const [activeCat, setActiveCat]   = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(null)

  const selectedPlan = selectedId ? plans.find(p => p.id === selectedId) : null

  if (selectedPlan) {
    return (
      <PlanDetail
        plan={selectedPlan}
        currentUser={currentUser}
        onBack={() => setSelectedId(null)}
        onUpdateStatus={onUpdateStatus}
        onUpdateNotes={onUpdateNotes}
        onAddExperience={onAddExperience}
        onDelete={async (id) => { await onDelete(id); setSelectedId(null) }}
      />
    )
  }

  const filtered = plans
    .filter(p => {
      if (activeCat === 'all') return true
      if (activeCat === 'regulars') return p.is_recurring
      return p.category_id === activeCat && !p.is_recurring
    })
    .filter(p => statusFilter === 'all' || p.status === statusFilter)

  // Sort by mutual score desc (non-recurring), recurring always at top of their tab
  const sorted = [...filtered].sort((a, b) => {
    const aScore = (a.ranking_janina ?? 0) + (a.ranking_facu ?? 0)
    const bScore = (b.ranking_janina ?? 0) + (b.ranking_facu ?? 0)
    return bScore - aScore
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Title + add */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 className="display" style={{ fontSize: 26 }}>Plans</h2>
        <button onClick={onAddClick} style={{ display: 'flex', alignItems: 'center', gap: 5, background: currentUser.gradient, color: '#fff', padding: '8px 14px', borderRadius: T.radius.md, fontSize: 13, fontWeight: 600, boxShadow: `0 2px 14px ${currentUser.color}44` }}>
          <Icon name="plus" size={14} color="#fff" /> Add idea
        </button>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 0, overflowX: 'auto', borderBottom: `1px solid ${T.border}`, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {CATEGORIES.map(cat => {
          const isActive = activeCat === cat.id
          const count = cat.id === 'all'
            ? plans.length
            : cat.id === 'regulars'
            ? plans.filter(p => p.is_recurring).length
            : plans.filter(p => p.category_id === cat.id && !p.is_recurring).length
          return (
            <button key={cat.id} onClick={() => setActiveCat(cat.id)} style={{
              flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '10px 13px 11px',
              borderBottom: isActive ? `2px solid ${cat.color}` : '2px solid transparent',
              background: 'transparent', transition: 'all 0.15s ease', position: 'relative',
            }}>
              <span style={{ fontSize: 17 }}>{cat.emoji}</span>
              <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 400, color: isActive ? cat.color : T.textMuted, whiteSpace: 'nowrap' }}>{cat.label}</span>
              {count > 0 && (
                <span style={{ position: 'absolute', top: 5, right: 6, minWidth: 15, height: 15, borderRadius: T.radius.full, background: isActive ? cat.color : T.surface3, color: isActive ? '#fff' : T.textMuted, fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Status filter — hidden for regulars tab */}
      {activeCat !== 'regulars' && (
        <div style={{ display: 'flex', gap: 6, padding: '12px 0 10px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[{ id: 'all', label: 'All' }, { id: 'idea', label: 'Ideas' }, { id: 'planned', label: 'Planned' }, { id: 'done', label: 'Done' }].map(f => (
            <button key={f.id} onClick={() => setStatusFilter(f.id)} style={{
              flexShrink: 0, padding: '5px 13px', borderRadius: T.radius.full, fontSize: 11, fontWeight: 500,
              background: statusFilter === f.id ? currentUser.colorSoft : T.surface2,
              color: statusFilter === f.id ? currentUser.color : T.textMuted,
              border: `1px solid ${statusFilter === f.id ? currentUser.colorBorder : T.border}`,
              transition: 'all 0.15s ease',
            }}>{f.label}</button>
          ))}
        </div>
      )}

      {/* Plans list */}
      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: T.textMuted }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🌱</div>
          <p className="display" style={{ fontSize: 20, color: T.text, marginBottom: 6 }}>Nothing here yet</p>
          <p style={{ fontSize: 13, lineHeight: 1.6 }}>
            {activeCat === 'regulars' ? 'Add a recurring plan using the + button.' : 'Add your first idea!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: activeCat === 'regulars' ? 12 : 0 }}>
          {sorted.map((p, i) => (
            <PlanCard key={p.id} plan={p} currentUser={currentUser} index={i} onClick={() => setSelectedId(p.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
