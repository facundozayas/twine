import { useRef } from 'react'

/**
 * Long-press on touch (and right-click on desktop) without breaking normal taps.
 * Returns props to spread on an element. `onTap` fires only if it wasn't a long press
 * and the finger didn't move (so scrolling a list never toggles items).
 */
export function useLongPress({ onLongPress, onTap, ms = 450 }) {
  const timer = useRef(null)
  const fired = useRef(false)
  const start = useRef(null)

  const clear = () => { clearTimeout(timer.current); timer.current = null }

  return {
    onPointerDown: e => {
      fired.current = false
      start.current = { x: e.clientX, y: e.clientY }
      clear()
      timer.current = setTimeout(() => {
        fired.current = true
        navigator.vibrate?.(10)
        onLongPress()
      }, ms)
    },
    onPointerMove: e => {
      if (!start.current) return
      if (Math.abs(e.clientX - start.current.x) > 8 || Math.abs(e.clientY - start.current.y) > 8) {
        clear()
        start.current = null
      }
    },
    onPointerUp: () => {
      const wasTap = timer.current && !fired.current && start.current
      clear()
      start.current = null
      if (wasTap) onTap?.()
    },
    onPointerCancel: () => { clear(); start.current = null },
    onContextMenu: e => { e.preventDefault(); clear(); onLongPress() },
  }
}
