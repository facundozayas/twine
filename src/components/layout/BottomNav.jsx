import Icon from '../shared/Icon.jsx'
import { T } from '../../constants/index.js'

const TABS = [
  { id: 'home',  icon: 'home',  label: 'Home' },
  { id: 'plans', icon: 'heart', label: 'Plans' },
  { id: 'lists', icon: 'cart',  label: 'Lists' },
]

export default function BottomNav({ active, onChange, currentUser }) {
  return (
    <nav className="glass" style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, zIndex: 50, padding: '8px 12px 22px', display: 'flex', justifyContent: 'space-around', borderTop: `1px solid ${T.border}` }}>
      {TABS.map(tab => {
        const isActive = active === tab.id
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '7px 22px', borderRadius: T.radius.md, color: isActive ? currentUser.color : T.textDim, background: isActive ? currentUser.colorSoft : 'transparent', border: `1px solid ${isActive ? currentUser.colorBorder : 'transparent'}`, transition: 'all 0.2s ease' }}>
            <Icon name={tab.icon} size={20} color={isActive ? currentUser.color : T.textDim} />
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
