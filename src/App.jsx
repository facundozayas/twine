import { useState, useEffect } from 'react'
import './index.css'
import { useTwineStore } from './store/useTwineStore.js'
import { useListsStore } from './features/lists/useListsStore.js'
import { useFitnessStore } from './features/fitness/useFitnessStore.js'
import { today } from './lib/dates.js'
import { onAppResume } from './lib/realtime.js'
import { USERS, T } from './constants/index.js'

import Header    from './components/layout/Header.jsx'
import BottomNav from './components/layout/BottomNav.jsx'

import UserSelect   from './views/UserSelect.jsx'
import UserSwitcher from './views/UserSwitcher.jsx'
import HelpPanel    from './views/HelpPanel.jsx'
import HomeView     from './views/HomeView.jsx'
import PlansHub     from './views/PlansHub.jsx'
import ListsView    from './features/lists/ListsView.jsx'
import FitnessView  from './features/fitness/FitnessView.jsx'
import AddPlanModal from './components/plans/AddPlanModal.jsx'

// ── Toast component ──────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null
  const bg = toast.tone === 'error' ? '#C0504D' : T.success
  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
      background: bg, color: '#fff', padding: '10px 20px', borderRadius: T.radius.full,
      fontSize: 13, fontWeight: 600, zIndex: 300, whiteSpace: 'nowrap',
      boxShadow: `0 4px 20px ${bg}66`,
      animation: 'fadeUp 0.3s ease',
    }}>
      {toast.message}
    </div>
  )
}

// Old tab ids (and Home's shortcuts) that now live inside the Plans tab
const PLAN_SECTIONS = { plans: 'ideas', rank: 'rank', insights: 'insights' }

export default function App() {
  const [tab, setTab]                   = useState('home')
  const [planSection, setPlanSection]   = useState('ideas')
  const [showAdd, setShowAdd]           = useState(false)
  const [showSwitcher, setShowSwitcher] = useState(false)
  const [showHelp, setShowHelp]         = useState(false)
  const [fitness, setFitness]           = useState({ section: 'today', date: today(), personId: null })

  const {
    currentUserId, plans, loading, error, toast,
    setUser, restoreUser,
    fetchPlans, subscribeRealtime,
    addPlan, updateRanking, updateStatus, updateNotes, addExperience, deletePlan,
  } = useTwineStore()

  const fetchLists     = useListsStore(s => s.fetchAll)
  const subscribeLists = useListsStore(s => s.subscribe)
  const fetchFitness     = useFitnessStore(s => s.fetchAll)
  const subscribeFitness = useFitnessStore(s => s.subscribe)

  useEffect(() => {
    restoreUser()
    fetchPlans()
    fetchLists()
    fetchFitness()
    const unsubPlans   = subscribeRealtime()
    const unsubLists   = subscribeLists()
    const unsubFitness = subscribeFitness()
    // Catch up on anything missed while the phone was locked
    const unsubResume = onAppResume(() => { fetchPlans(); fetchLists(); fetchFitness() })
    return () => { unsubPlans(); unsubLists(); unsubFitness(); unsubResume() }
  }, [])

  const currentUser = currentUserId ? USERS[currentUserId] : null

  // Accepts a tab id or an old plans sub-view id ('rank', 'insights', 'plans')
  const navigate = (target) => {
    if (PLAN_SECTIONS[target]) { setPlanSection(PLAN_SECTIONS[target]); setTab('plans') }
    else if (target === 'fitness') { setFitness(f => ({ ...f, section: 'today', date: today(), personId: currentUserId })); setTab('fitness') }
    else setTab(target)
  }

  const handleSelectUser = (userId) => { setUser(userId); setTab('home') }
  const handleSwitchUser = (userId) => { setUser(userId); setTab('home'); setFitness(f => ({ ...f, personId: null })) }

  if (!currentUser) return <UserSelect onSelect={handleSelectUser} />

  const planActions = {
    openAdd: () => setShowAdd(true),
    updateRanking, updateStatus, updateNotes, addExperience, deletePlan,
  }

  const renderView = () => {
    // Lists and Fitness load independently, so a plans hiccup never blocks them
    if (tab === 'lists') return <ListsView currentUser={currentUser} />
    if (tab === 'fitness') {
      // Default the person switch to whoever is using this phone
      const state = { ...fitness, personId: fitness.personId || currentUser.id }
      return <FitnessView currentUser={currentUser} state={state} onChange={setFitness} />
    }

    if (loading && plans.length === 0) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, color: T.textMuted }}>Loading your plans...</p>
          </div>
        </div>
      )
    }
    if (error) {
      return (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>⚠️</div>
          <p className="display" style={{ fontSize: 20, marginBottom: 8 }}>Connection error</p>
          <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 16, lineHeight: 1.6 }}>Could not connect to Supabase.<br />Check your environment variables in Vercel.</p>
          <p style={{ fontSize: 11, color: T.textDim, fontFamily: 'monospace', wordBreak: 'break-all' }}>{error}</p>
        </div>
      )
    }
    switch (tab) {
      case 'home':  return <HomeView plans={plans} currentUser={currentUser} onNavigate={navigate} />
      case 'plans': return <PlansHub section={planSection} onSectionChange={setPlanSection} currentUser={currentUser} plans={plans} planActions={planActions} />
      default: return null
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', background: T.bg, position: 'relative' }}>
      <Header
        currentUser={currentUser}
        onSwitchUser={() => setShowSwitcher(true)}
        onAddPlan={tab === 'home' || tab === 'plans' ? () => setShowAdd(true) : null}
        onHelp={() => setShowHelp(true)}
      />
      <main style={{ padding: '4px 20px 100px' }} key={tab + currentUserId}>
        {renderView()}
      </main>
      <BottomNav active={tab} onChange={setTab} currentUser={currentUser} />
      <Toast toast={toast} />
      {showAdd     && <AddPlanModal currentUser={currentUser} onClose={() => setShowAdd(false)} onAdd={addPlan} />}
      {showSwitcher && <UserSwitcher currentUser={currentUser} onSwitch={handleSwitchUser} onClose={() => setShowSwitcher(false)} />}
      {showHelp    && <HelpPanel onClose={() => setShowHelp(false)} />}
    </div>
  )
}
