import { USERS, T } from '../constants/index.js'
import Icon from '../components/shared/Icon.jsx'

export default function UserSwitcher({ currentUser, onSwitch, onClose }) {
  return (
    <div
      className="fade-in"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="fade-up"
        style={{ background: T.surface, borderRadius: 26, padding: '30px 24px', width: '100%', maxWidth: 340 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{ fontSize: 30, marginBottom: 8 }}>🔗</div>
          <h2 className="display" style={{ fontSize: 26 }}>Switch profile</h2>
          <p style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Each person has their own perspective</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.values(USERS).map(user => {
            const isActive = currentUser.id === user.id
            return (
              <button
                key={user.id}
                onClick={() => { onSwitch(user.id); onClose() }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 18px', borderRadius: 18,
                  background: isActive ? user.colorSoft : T.surface2,
                  border: `2px solid ${isActive ? user.color : T.border}`,
                  transition: 'all 0.2s ease', textAlign: 'left',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = user.color + '66' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = T.border }}
              >
                <div style={{
                  width: 50, height: 50, borderRadius: '50%',
                  background: user.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0,
                  boxShadow: isActive ? `0 0 18px ${user.color}55` : 'none',
                }}>
                  {user.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 600, color: T.text }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>
                    {isActive ? '✓ Currently active' : 'Switch to this profile'}
                  </div>
                </div>
                {isActive && <Icon name="check" size={17} color={user.color} />}
              </button>
            )
          })}
        </div>

        <button
          onClick={onClose}
          style={{ width: '100%', marginTop: 14, padding: '12px', borderRadius: 12, background: T.surface3, color: T.textMuted, fontSize: 13 }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
