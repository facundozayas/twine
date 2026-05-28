import { useState, useEffect } from 'react'
import './index.css'
import { useTwineStore } from './store/useTwineStore.js'
import { USERS, T } from './constants/index.js'

import Header    from './components/layout/Header.jsx'
import BottomNav from './components/layout/BottomNav.jsx'

import UserSelect   from './views/UserSelect.jsx'
import UserSwitcher from './views/UserSwitcher.jsx'
import HelpPanel    from './views/HelpPanel.jsx'
import HomeView     from './views/HomeView.jsx'
import PlansView    from './views/PlansView.jsx'
import SwipeView    from './components/swipe/SwipeView.jsx'
import InsightsView from './components/insights/InsightsView.jsx'
import AddPlanModal from './components/plans/AddPlanModal.jsx'

// ── Toast component ──────────────────────────────────────────────────────────
function Toast({ message }) {
  if (!message) return null
  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
      background: T.success, color: '#fff', padding: '10px 20px', borderRadius: T.radius.full,
      fontSize: 13, fontWeight: 600, zIndex: 300, whiteSpace: 'nowrap',
      boxShadow: `0 4px 20px rgba(124,184,124,0.4)`,
      animation: 'fadeUp 0.3s ease',
    }}>
      {message}
    </div>
  )
}

export default function App() {
  const [tab, setTab]                 = useState('home')
  const [showAdd, setShowAdd]         = useState(false)
  const [showSwitcher, setShowSwitcher] = useState(false)
  const [showHelp, setShowHelp]       = useState(false)

  const {
    currentUserId, plans, loading, error, toast,
    setUser, restoreUser,
    fetchPlans, subscribeRealtime,
    addPlan, updateRanking, updateStatus, updateNotes, addExperience, deletePlan,
  } = useTwineStore()

  useEffect(() => {
    restoreUser()
    fetchPlans()
    const unsub = subscribeRealtime()
    return unsub
  }, [])

  const currentUser = currentUserId ? USERS[currentUserId] : null

  const handleSelectUser = (userId) => { setUser(userId); setTab('home') }
  const handleSwitchUser = (userId) => { setUser(userId); setTab('home') }

  if (!currentUser) return <UserSelect onSelect={handleSelectUser} />

  const renderView = () => {
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
      case 'home':     return <HomeView plans={plans} currentUser={currentUser} onNavigate={setTab} />
      case 'plans':    return <PlansView plans={plans} currentUser={currentUser} onAddClick={() => setShowAdd(true)} onUpdateStatus={updateStatus} onUpdateNotes={updateNotes} onAddExperience={addExperience} onDelete={deletePlan} />
      case 'rank':     return <SwipeView plans={plans} currentUser={currentUser} onUpdateRanking={updateRanking} />
      case 'insights': return <InsightsView plans={plans} currentUser={currentUser} />
      default: return null
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', background: T.bg, position: 'relative' }}>
      <Header
        currentUser={currentUser}
        onSwitchUser={() => setShowSwitcher(true)}
        onAddPlan={() => setShowAdd(true)}
        onHelp={() => setShowHelp(true)}
      />
      <main style={{ padding: '4px 20px 100px' }} key={tab + currentUserId}>
        {renderView()}
      </main>
      <BottomNav active={tab} onChange={setTab} currentUser={currentUser} />
      <Toast message={toast} />
      {showAdd     && <AddPlanModal currentUser={currentUser} onClose={() => setShowAdd(false)} onAdd={addPlan} />}
      {showSwitcher && <UserSwitcher currentUser={currentUser} onSwitch={handleSwitchUser} onClose={() => setShowSwitcher(false)} />}
      {showHelp    && <HelpPanel onClose={() => setShowHelp(false)} />}
    </div>
  )
}
