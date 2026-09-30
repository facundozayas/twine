import { T } from '../../constants/index.js'

/**
 * Pill-style segmented control.
 * options: [{ id, label, accent? }] — `accent` is a user object ({ color, colorSoft,
 * colorBorder }) and overrides the default accent for that option (used by the
 * Facu / Janina switch so each name lights up in its own color).
 */
export default function Segmented({ options, value, onChange, accent, size = 'md', style }) {
  const pad = size === 'sm' ? '6px 6px' : '8px 6px'
  const font = size === 'sm' ? 12 : 13
  return (
    <div role="tablist" style={{ display: 'flex', gap: 4, background: T.surface2, borderRadius: T.radius.lg, padding: 4, ...style }}>
      {options.map(o => {
        const active = value === o.id
        const a = o.accent || accent
        return (
          <button
            key={o.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.id)}
            style={{
              flex: 1, padding: pad, borderRadius: T.radius.md, fontSize: font, fontWeight: active ? 600 : 500,
              color: active ? a.color : T.textMuted,
              background: active ? a.colorSoft : 'transparent',
              border: `1px solid ${active ? a.colorBorder : 'transparent'}`,
              transition: 'all 0.2s ease',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
