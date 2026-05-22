import { useState } from 'react'
import { CATEGORIES, PLAN_CATEGORIES, T } from '../constants/index.js'
import PlanCard from '../components/plans/PlanCard.jsx'
import PlanDetail from '../components/plans/PlanDetail.jsx'
import Icon from '../components/shared/Icon.jsx'

export default function PlansView({
  plans, currentUser,
  onAddClick, onUpdateStatus, onUpdateNotes, onAddExperience, onDelete,
}) {
  const [activeCat, setActiveCat] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedId, setSelectedId]     = useState(null)

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
    .filter(p => activeCat === 'all' || p.category_id === activeCat)
    .filter(p => statusFilter === 'all' || p.status === statusFilter)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Title + add */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 className="display" style={{ fontSize: 26, color: T.text }}>Plans</h2>
        <button
          onClick={onAddClick}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: currentUser.gradient, color: '#fff',
            padding: '8px 14px', borderRadius: T.radius.md,
            fontSize: 13, fontWeight: 600,
            boxShadow: `0 2px 14px ${currentUser.color}44`,
          }}
        >
          <Icon name="plus" size={14} color="#fff" /> Add idea
        </button>
      </div>

      {/* ── Category tabs (horizontal scroll) ── */}
      <div style={{
        display: 'flex', gap: 0,
        overflowX: 'auto', marginBottom: 0,
        borderBottom: `1px solid ${T.border}`,
        paddingBottom: 0,
        // hide scrollbar
        scrollbarWidth: 'none', msOverflowStyle: 'none',
      }}>
        {CATEGORIES.map(cat => {
          const isActive = activeCat === cat.id
          const count = cat.id === 'all'
            ? plans.length
            : plans.filter(p => p.category_id === cat.id).length
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              style={{
                flexShrink: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '10px 14px 12px',
                borderBottom: isActive ? `2px solid ${cat.color}` : '2px solid transparent',
                background: 'transparent',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: 18 }}>{cat.emoji}</span>
              <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400, color: isActive ? cat.color : T.textMuted, whiteSpace: 'nowrap' }}>
                {cat.label}
              </span>
              {count > 0 && (
                <span style={{
                  position: 'absolute', top: 6, right: 8,
                  minWidth: 16, height: 16, borderRadius: T.radius.full,
                  background: isActive ? cat.color : T.surface3,
                  color: isActive ? '#fff' : T.textMuted,
                  fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px',
                }}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Status filter pills */}
      <div style={{ display: 'flex', gap: 6, padding: '12px 0 10px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[
          { id: 'all',     label: 'All' },
          { id: 'idea',    label: 'Ideas' },
          { id: 'planned', label: 'Planned' },
          { id: 'done',    label: 'Done' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            style={{
              flexShrink: 0,
              padding: '5px 13px', borderRadius: T.radius.full,
              fontSize: 11, fontWeight: 500,
              background: statusFilter === f.id ? currentUser.colorSoft : T.surface2,
              color: statusFilter === f.id ? currentUser.color : T.textMuted,
              border: `1px solid ${statusFilter === f.id ? currentUser.colorBorder : T.border}`,
              transition: 'all 0.15s ease',
            }}
          >{f.label}</button>
        ))}
      </div>

      {/* Plans list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: T.textMuted }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🌱</div>
          <p className="display" style={{ fontSize: 20, color: T.text, marginBottom: 6 }}>Nothing here yet</p>
          <p style={{ fontSize: 13, lineHeight: 1.6 }}>
            {activeCat === 'all'
              ? 'Add your first idea using the button above.'
              : `No plans in ${CATEGORIES.find(c => c.id === activeCat)?.label} yet.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((p, i) => (
            <PlanCard
              key={p.id}
              plan={p}
              currentUser={currentUser}
              index={i}
              onClick={() => setSelectedId(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
