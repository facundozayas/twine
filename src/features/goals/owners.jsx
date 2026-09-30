import { T, USERS } from '../../constants/index.js'

/** The three possible owners. "Both" uses the theme accent. */
export function ownerInfo(owner) {
  if (owner === 'both') {
    return {
      id: 'both', name: 'Both', emoji: '💞',
      color: T.accent, colorSoft: T.accentSoft, colorBorder: T.borderAccent,
      gradient: `linear-gradient(135deg, ${T.accent} 0%, ${T.accent2} 100%)`,
    }
  }
  return USERS[owner]
}

export const OWNER_OPTIONS = () => [
  ...Object.values(USERS).sort((a, b) => a.name.localeCompare(b.name)).map(u => ({ id: u.id, label: `${u.emoji} ${u.name}`, accent: u })),
  { id: 'both', label: '💞 Both', accent: ownerInfo('both') },
]

export const GOAL_EMOJIS = ['🎯', '🏃', '🇩🇪', '📚', '✈️', '💰', '🏡', '🧘', '🎨', '🎸', '🍳', '💪']

/** Small avatar(s) for a goal's owner — two overlapping for "Both". */
export function OwnerAvatars({ owner, size = 22 }) {
  const ids = owner === 'both' ? Object.keys(USERS) : [owner]
  return (
    <span style={{ display: 'inline-flex' }}>
      {ids.map((id, i) => (
        <span key={id} style={{
          width: size, height: size, borderRadius: '50%', background: USERS[id].gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.5,
          marginLeft: i ? -size * 0.3 : 0, boxShadow: `0 0 0 2px ${T.surface}`,
        }}>{USERS[id].emoji}</span>
      ))}
    </span>
  )
}

/** Thin progress bar. */
export function ProgressBar({ done, total, color }) {
  const pct = total ? Math.round((done / total) * 100) : 0
  return (
    <div style={{ height: 6, borderRadius: 3, background: T.surface3, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: color, transition: 'width 0.4s ease' }} />
    </div>
  )
}
