import { create } from 'zustand'
import { THEMES, cssVar } from './themes.js'
import { USERS } from '../constants/index.js'

const STORAGE_KEY = 'twine_theme'
const prefersDark = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true
const resolve = choice => (choice === 'auto' ? (prefersDark() ? 'night' : 'day') : choice)

const alpha = (hex, a) => `${hex}${Math.round(a * 255).toString(16).padStart(2, '0')}`

/**
 * Paints a theme: sets the CSS variables on <html>, updates the two personal
 * colors (USERS is shared by every screen, so we update it in place — its
 * values stay plain hex strings, which the existing `${color}44` code relies on)
 * and colors the phone's status bar.
 */
function paint(themeId) {
  const theme = THEMES[themeId] || THEMES.night
  const root = document.documentElement
  Object.entries(theme.tokens).forEach(([k, v]) => root.style.setProperty(cssVar(k), v))
  root.style.colorScheme = theme.dark ? 'dark' : 'light'

  Object.entries(theme.users).forEach(([id, [c1, c2]]) => {
    Object.assign(USERS[id], {
      color: c1,
      colorSoft: alpha(c1, 0.12),
      colorBorder: alpha(c1, 0.28),
      gradient: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
    })
  })

  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.tokens.bg)
}

/** The chosen theme is saved per phone, so each of you keeps your own. */
export const useTheme = create((set, get) => ({
  choice: 'night',   // what was picked: 'auto' | theme id
  active: 'night',   // what is painted right now

  init: () => {
    let choice = 'night'
    try { choice = localStorage.getItem(STORAGE_KEY) || 'night' } catch { /* private mode */ }
    if (choice !== 'auto' && !THEMES[choice]) choice = 'night'
    const active = resolve(choice)
    paint(active)
    set({ choice, active })

    // Follow the phone's light/dark switch while on Auto
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (get().choice !== 'auto') return
      const next = resolve('auto')
      paint(next)
      set({ active: next })
    }
    mq?.addEventListener?.('change', onChange)
    return () => mq?.removeEventListener?.('change', onChange)
  },

  setChoice: (choice) => {
    try { localStorage.setItem(STORAGE_KEY, choice) } catch { /* ignore */ }
    const active = resolve(choice)
    paint(active)
    set({ choice, active })
  },
}))

// Paint before React's first render so there's no flash of the wrong theme
try {
  const saved = localStorage.getItem(STORAGE_KEY) || 'night'
  paint(resolve(saved === 'auto' || THEMES[saved] ? saved : 'night'))
} catch { paint('night') }
