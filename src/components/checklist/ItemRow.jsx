import { T, getUser } from '../../constants/index.js'
import { useLongPress } from '../../hooks/useLongPress.js'
import Icon from '../shared/Icon.jsx'

/**
 * One checklist line (shopping items, goal milestones): checkbox + text + who added it.
 * Tap anywhere on the row to check/uncheck. Long-press for Edit / Move / Delete.
 * item: { text, checked, added_by }
 */
export default function ItemRow({ item, currentUser, onToggle, onLongPress }) {
  const press = useLongPress({ onTap: onToggle, onLongPress })
  const adder = item.added_by ? getUser(item.added_by) : null
  const checked = item.checked

  return (
    <div
      {...press}
      role="checkbox"
      aria-checked={checked}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '11px 4px',
        borderBottom: `1px solid ${T.border}`, cursor: 'pointer',
        userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none', touchAction: 'pan-y',
      }}
    >
      <span style={{
        width: 22, height: 22, borderRadius: 7, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1.5px solid ${checked ? T.success : T.textDim}`,
        background: checked ? T.success : 'transparent',
        transition: 'all 0.15s ease',
      }}>
        {checked && <Icon name="check" size={14} color={T.onAccent} />}
      </span>

      <span style={{
        flex: 1, fontSize: 15, lineHeight: 1.35, wordBreak: 'break-word',
        color: checked ? T.textDim : T.text,
        textDecoration: checked ? 'line-through' : 'none',
        transition: 'color 0.15s ease',
      }}>
        {item.text}
      </span>

      {adder && (
        <span
          title={`Added by ${adder.name}`}
          style={{
            width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
            fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: adder.color, background: adder.colorSoft, border: `1px solid ${adder.colorBorder}`,
            opacity: checked ? 0.4 : (adder.id === currentUser.id ? 0.55 : 1),
          }}
        >
          {adder.name[0]}
        </span>
      )}
    </div>
  )
}
