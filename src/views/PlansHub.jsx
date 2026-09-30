import PlansView    from './PlansView.jsx'
import SwipeView    from '../components/swipe/SwipeView.jsx'
import InsightsView from '../components/insights/InsightsView.jsx'
import Segmented    from '../components/shared/Segmented.jsx'

const SECTIONS = [
  { id: 'ideas',    label: 'Ideas' },
  { id: 'rank',     label: 'Rank' },
  { id: 'insights', label: 'Insights' },
]

/**
 * Everything about dates lives under one tab, so the bottom nav stays at
 * 4 items with Lists and Fitness.
 */
export default function PlansHub({ section, onSectionChange, currentUser, plans, planActions }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Segmented options={SECTIONS} value={section} onChange={onSectionChange} accent={currentUser} />

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
