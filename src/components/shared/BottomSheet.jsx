import { createPortal } from 'react-dom'
import { T } from '../../constants/index.js'

/**
 * Renders overlays at the end of <body>. Views use entrance animations
 * (transform), which would otherwise trap position:fixed children inside them.
 */
export function Overlay({ children }) {
  return createPortal(children, document.body)
}

/**
 * Slide-up panel used for small actions (list menu, item actions, new list).
 * Tapping the dimmed background closes it.
 */
export default function BottomSheet({ title, subtitle, onClose, children }) {
  return (
    <Overlay>
    <div
      className="fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}
    >
      <div className="slide-up" style={{ background: T.surface, borderRadius: '24px 24px 0 0', padding: '14px 20px 36px', width: '100%', maxWidth: 480, maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: T.surface3, margin: '0 auto 18px' }} />
        {title && <h3 className="display" style={{ fontSize: 22, marginBottom: subtitle ? 2 : 14, wordBreak: 'break-word' }}>{title}</h3>}
        {subtitle && <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 14 }}>{subtitle}</p>}
        {children}
      </div>
    </div>
    </Overlay>
  )
}

/** A full-width row button for sheets. */
export function SheetAction({ icon, label, onClick, danger, color }) {
  const tint = danger ? '#E57373' : (color || T.text)
  return (
    <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: T.radius.md, background: T.surface2, border: `1px solid ${T.border}`, marginBottom: 8, color: tint, fontSize: 14, fontWeight: 500, textAlign: 'left' }}>
      {icon && <span style={{ fontSize: 17, width: 22, textAlign: 'center' }}>{icon}</span>}
      {label}
    </button>
  )
}
