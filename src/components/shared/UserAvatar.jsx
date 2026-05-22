import { getUser } from '../../constants/index.js'
import { T } from '../../constants/index.js'

export default function UserAvatar({ userId, size = 28, showName = false, style }) {
  const user = getUser(userId)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, ...style }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: user.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.44, flexShrink: 0,
        boxShadow: `0 0 0 2px ${T.bg}`,
      }}>
        {user.emoji}
      </div>
      {showName && (
        <span style={{ fontSize: Math.max(10, size * 0.44), color: user.color, fontWeight: 500 }}>
          {user.name}
        </span>
      )}
    </div>
  )
}
