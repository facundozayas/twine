import { T } from '../../constants/index.js'
import Icon from '../shared/Icon.jsx'

export default function Header({ currentUser, onSwitchUser, onAddPlan, onHelp }) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 40, padding: '14px 20px 10px', background: `linear-gradient(${T.bg} 82%, transparent)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: currentUser.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, transition: 'background 0.4s ease' }}>🔗</div>
        <span className="display" style={{ fontSize: 21, letterSpacing: '-0.02em', color: T.text }}>twine</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        {/* Help */}
        <button onClick={onHelp} style={{ width: 32, height: 32, borderRadius: T.radius.md, background: T.surface2, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textMuted, fontSize: 14, fontWeight: 700 }}>
          ?
        </button>

        {/* User switcher */}
        <button onClick={onSwitchUser} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: T.radius.full, background: currentUser.colorSoft, border: `1px solid ${currentUser.colorBorder}`, transition: 'all 0.2s ease' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: currentUser.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{currentUser.emoji}</div>
          <span style={{ fontSize: 12, fontWeight: 600, color: currentUser.color }}>{currentUser.name}</span>
          <Icon name="switch" size={12} color={currentUser.color} />
        </button>

        {/* Add */}
        <button onClick={onAddPlan} style={{ width: 34, height: 34, borderRadius: T.radius.md, background: currentUser.colorSoft, border: `1px solid ${currentUser.colorBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Icon name="plus" size={17} color={currentUser.color} />
        </button>
      </div>
    </header>
  )
}
