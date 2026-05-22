import { USERS, T } from '../constants/index.js'

export default function UserSelect({ onSelect }) {
  return (
    <div
      className="fade-in"
      style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px', background: T.bg,
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'linear-gradient(135deg, #FF6B35 0%, #FFB347 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, margin: '0 auto 16px',
          boxShadow: '0 8px 32px rgba(255,107,53,0.35)',
        }}>🔗</div>
        <h1 className="display" style={{ fontSize: 40, fontWeight: 400, color: T.text, letterSpacing: '-0.02em' }}>twine</h1>
        <p style={{ fontSize: 14, color: T.textMuted, marginTop: 6 }}>Your shared world</p>
      </div>

      {/* Who are you? */}
      <div style={{ width: '100%', maxWidth: 320 }}>
        <p style={{ fontSize: 13, color: T.textMuted, textAlign: 'center', marginBottom: 20, fontWeight: 500 }}>
          Who are you?
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.values(USERS).map(user => (
            <button
              key={user.id}
              onClick={() => onSelect(user.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 18,
                padding: '20px 22px', borderRadius: 20,
                background: T.surface,
                border: `1.5px solid ${T.border}`,
                transition: 'all 0.25s ease', textAlign: 'left',
                width: '100%',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = user.color
                e.currentTarget.style.background = user.colorSoft
                e.currentTarget.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = T.border
                e.currentTarget.style.background = T.surface
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <div style={{
                width: 58, height: 58, borderRadius: '50%',
                background: user.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, flexShrink: 0,
                boxShadow: `0 4px 18px ${user.color}44`,
              }}>
                {user.emoji}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 600, color: T.text }}>{user.name}</div>
                <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>Tap to enter as {user.name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <p style={{ fontSize: 11, color: T.textDim, marginTop: 32, textAlign: 'center', maxWidth: 240, lineHeight: 1.6 }}>
        Both of you use this app — your plans and rankings sync in real time.
      </p>
    </div>
  )
}
