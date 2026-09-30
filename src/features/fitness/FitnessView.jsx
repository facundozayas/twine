import Segmented from '../../components/shared/Segmented.jsx'
import SetupNotice, { Spinner } from '../../components/shared/SetupNotice.jsx'
import { useFitnessStore } from './useFitnessStore.js'
import TodayView from './TodayView.jsx'
import HistoryView from './HistoryView.jsx'

/**
 * Fitness tab. The selected day, person and section live in App so they
 * survive switching tabs and so Home's Today card can deep-link here.
 */
export default function FitnessView({ currentUser, state, onChange }) {
  const { loaded, error } = useFitnessStore()
  if (!loaded) return <Spinner />
  if (error) return <SetupNotice emoji="🏃" title="Fitness isn't set up yet" file="supabase/003_fitness.sql" error={error} />

  const set = patch => onChange({ ...state, ...patch })

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Segmented accent={currentUser} value={state.section} onChange={section => set({ section })}
        options={[{ id: 'today', label: 'Day' }, { id: 'history', label: 'History' }]} />

      {state.section === 'today'
        ? <TodayView date={state.date} onDateChange={date => set({ date })}
            personId={state.personId} onPersonChange={personId => set({ personId })} />
        : <HistoryView personId={state.personId} onPersonChange={personId => set({ personId })}
            onOpenDay={date => set({ date, section: 'today' })} />}
    </div>
  )
}
