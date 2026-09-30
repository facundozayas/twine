import { USERS, T } from '../constants/index.js'
import Icon from '../components/shared/Icon.jsx'
import { THEMES, THEME_CHOICES } from '../theme/themes.js'
import { useTheme } from '../theme/useTheme.js'

/** Profile + theme sheet (tap your name in the header). */
export default function UserSwitcher({ currentUser, onSwitch, onClose }) {
  const { choice, setChoice } = useTheme()

  return (
    <div
      className="fade-in"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="fade-up" style={{ background: T.surface, borderRadius: 26, padding: '26px 20px 20px', width: '100%', maxWidth: 360, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <img src="/favicon.svg" alt="" width={44} height={44} style={{ borderRadius: 12, display: 'block', margin: '0 auto 8px' }} />
          <h2 className="display" style={{ fontSize: 24 }}>Profile</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.values(USERS).map(user => {
            const isActive = currentUser.id === user.id
            return (
              <button
                key={user.id}
                onClick={() => { if (!isActive) onSwitch(user.id); onClose() }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 16,
                  background: isActive ? user.colorSoft : T.surface2,
                  border: `2px solid ${isActive ? user.color : T.border}`,
                  textAlign: 'left', transition: 'all 0.2s ease',
                }}
              >
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: user.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>
                  {user.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: T.text }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>{isActive ? 'Using Twine as ' + user.name : 'Switch to this profile'}</div>
                </div>
                {isActive && <Icon name="check" size={17} color={user.color} />}
              </button>
            )
          })}
        </div>

        {/* Theme */}
        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Theme</div>
          <div style={{ fontSize: 12, color: T.textDim, marginBottom: 10 }}>Only changes this phone</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {THEME_CHOICES.map(c => {
              const active = choice === c.id
              return (
                <button key={c.id} onClick={() => setChoice(c.id)} aria-pressed={active} aria-label={`${c.label} theme`}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '8px 2px', borderRadius: T.radius.md,
                    background: active ? T.accentSoft : 'transparent', border: `1.5px solid ${active ? T.accent : 'transparent'}` }}>
                  <Swatch id={c.id} />
                  <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? T.accent : T.textMuted }}>{c.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <button onClick={onClose} style={{ width: '100%', marginTop: 18, padding: '12px', borderRadius: 12, background: T.surface3, color: T.textMuted, fontSize: 13, fontWeight: 600 }}>
          Done
        </button>
      </div>
    </div>
  )
}

/** A tiny round preview of a theme: background, accent and the two personal colors. */
function Swatch({ id }) {
  if (id === 'auto') {
    const n = THEMES.night, d = THEMES.day
    return (
      <span style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', display: 'flex', border: `1px solid ${T.border}`, transform: 'rotate(45deg)' }}>
        <span style={{ flex: 1, background: d.tokens.bg }} />
        <span style={{ flex: 1, background: n.tokens.bg }} />
      </span>
    )
  }
  const t = THEMES[id]
  return (
    <span style={{ width: 38, height: 38, borderRadius: '50%', background: t.tokens.bg, border: `1px solid ${T.border}`, position: 'relative', display: 'block' }}>
      <span style={{ position: 'absolute', left: 7, top: 8, width: 11, height: 11, borderRadius: '50%', background: t.users.facu[0] }} />
      <span style={{ position: 'absolute', right: 7, top: 8, width: 11, height: 11, borderRadius: '50%', background: t.users.janina[0] }} />
      <span style={{ position: 'absolute', left: 11, right: 11, bottom: 8, height: 5, borderRadius: 3, background: t.tokens.accent }} />
    </span>
  )
}
