import { useState, useEffect, useCallback } from 'react'
import './index.css'
import { useTwineStore } from './store/useTwineStore.js'
import { USERS, T } from './constants/index.js'

// Layout
import Header   from './components/layout/Header.jsx'
import BottomNav from './components/layout/BottomNav.jsx'

// Views
import UserSelect   from './views/UserSelect.jsx'
import UserSwitcher from './views/UserSwitcher.jsx'
import HomeView     from './views/HomeView.jsx'
import PlansView    from './views/PlansView.jsx'

// Feature components
import SwipeView    from './components/swipe/SwipeView.jsx'
import InsightsView from './components/insights/InsightsView.jsx'
import AIPanel      from './components/ai/AIPanel.jsx'
import AddPlanModal from './components/plans/AddPlanModal.jsx'

export default function App() {
  const [tab, setTab]               = useState('home')
  const [showAdd, setShowAdd]       = useState(false)
  const [showSwitcher, setShowSwitcher] = useState(false)

  const {
    currentUserId, plans, loading, error,
    setUser, restoreUser,
    fetchPlans, subscribeRealtime,
    addPlan, updateRanking, updateStatus, updateNotes, addExperience, deletePlan,
  } = useTwineStore()

  // Restore saved user on mount + fetch + subscribe
  useEffect(() => {
    restoreUser()
    fetchPlans()
    const unsub = subscribeRealtime()
    return unsub
  }, [])

  const currentUser = currentUserId ? USERS[currentUserId] : null

  const handleSelectUser = (userId) => {
    setUser(userId)
    setTab('home')
  }

  const handleSwitchUser = (userId) => {
    setUser(userId)
    setTab('home')
  }

  // ── User selection screen ────────────────────────────────────────────────
  if (!currentUser) {
    return <UserSelect onSelect={handleSelectUser} />
  }

  // ── Main app ─────────────────────────────────────────────────────────────
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
          <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 16, lineHeight: 1.6 }}>
            Could not connect to Supabase.<br />
            Check your <code style={{ background: T.surface2, padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>.env</code> keys.
          </p>
          <p style={{ fontSize: 11, color: T.textDim, fontFamily: 'monospace', wordBreak: 'break-all' }}>{error}</p>
        </div>
      )
    }

    switch (tab) {
      case 'home':
        return <HomeView plans={plans} currentUser={currentUser} onNavigate={setTab} />

      case 'plans':
        return (
          <PlansView
            plans={plans}
            currentUser={currentUser}
            onAddClick={() => setShowAdd(true)}
            onUpdateStatus={updateStatus}
            onUpdateNotes={updateNotes}
            onAddExperience={addExperience}
            onDelete={deletePlan}
          />
        )

      case 'rank':
        return (
          <SwipeView
            plans={plans}
            currentUser={currentUser}
            onUpdateRanking={updateRanking}
          />
        )

      case 'insights':
        return <InsightsView plans={plans} currentUser={currentUser} />

      case 'ai':
        return <AIPanel plans={plans} currentUser={currentUser} />

      default:
        return null
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', background: T.bg, position: 'relative' }}>
      <Header
        currentUser={currentUser}
        onSwitchUser={() => setShowSwitcher(true)}
        onAddPlan={() => setShowAdd(true)}
      />

      <main style={{ padding: '4px 20px 100px' }} key={tab + currentUserId}>
        {renderView()}
      </main>

      <BottomNav active={tab} onChange={setTab} currentUser={currentUser} />

      {showAdd && (
        <AddPlanModal
          currentUser={currentUser}
          onClose={() => setShowAdd(false)}
          onAdd={addPlan}
        />
      )}

      {showSwitcher && (
        <UserSwitcher
          currentUser={currentUser}
          onSwitch={handleSwitchUser}
          onClose={() => setShowSwitcher(false)}
        />
      )}
    </div>
  )
}
