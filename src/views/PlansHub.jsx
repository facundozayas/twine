import { T } from '../constants/index.js'
import PlansView    from './PlansView.jsx'
import SwipeView    from '../components/swipe/SwipeView.jsx'
import InsightsView from '../components/insights/InsightsView.jsx'

const SECTIONS = [
  { id: 'ideas',    label: 'Ideas' },
  { id: 'rank',     label: 'Rank' },
  { id: 'insights', label: 'Insights' },
]

/**
 * Everything about dates lives under one tab, so the bottom nav stays at
 * 3–4 items as Lists and Fitness are added.
 */
export default function PlansHub({ section, onSectionChange, currentUser, plans, planActions }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div role="tablist" style={{ display: 'flex', gap: 4, background: T.surface2, borderRadius: T.radius.lg, padding: 4 }}>
        {SECTIONS.map(s => {
          const active = section === s.id
          return (
            <button
              key={s.id}
              role="tab"
              aria-selected={active}
              onClick={() => onSectionChange(s.id)}
              style={{
                flex: 1, padding: '8px 6px', borderRadius: T.radius.md, fontSize: 13, fontWeight: active ? 600 : 500,
                color: active ? currentUser.color : T.textMuted,
                background: active ? currentUser.colorSoft : 'transparent',
                border: `1px solid ${active ? currentUser.colorBorder : 'transparent'}`,
                transition: 'all 0.2s ease',
              }}
            >
              {s.label}
            </button>
          )
        })}
      </div>

      {section === 'ideas' && (
        <PlansView
          plans={plans}
          currentUser={currentUser}
          onAddClick={planActions.openAdd}
          onUpdateStatus={planActions.updateStatus}
          onUpdateNotes={planActions.updateNotes}
          onAddExperience={planActions.addExperience}
          onDelete={planActions.deletePlan}
        />
      )}
      {section === 'rank'     && <SwipeView plans={plans} currentUser={currentUser} onUpdateRanking={planActions.updateRanking} />}
      {section === 'insights' && <InsightsView plans={plans} currentUser={currentUser} />}
    </div>
  )
}
