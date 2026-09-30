// ─── Themes ──────────────────────────────────────────────────────────────────
// Each theme is a set of CSS variables (the app reads them through `T` in
// constants/index.js) plus the two personal colors, tuned so Facu's blue and
// Janina's pink stay readable on that background.
// To add a theme: copy one block, change the colors, done.

export const THEMES = {
  night: {
    label: 'Night',
    dark: true,
    tokens: {
      bg: '#0F0E0D', surface: '#1A1916', surface2: '#252320', surface3: '#2F2C27',
      accent: '#FF6B35', accent2: '#FFB347', accentSoft: 'rgba(255,107,53,0.12)', borderAccent: 'rgba(255,107,53,0.25)',
      text: '#F5F0E8', textMuted: '#8A8070', textDim: '#5A5248',
      success: '#7CB87C', successSoft: 'rgba(124,184,124,0.15)', successBorder: 'rgba(124,184,124,0.35)',
      border: 'rgba(245,240,232,0.06)', glass: 'rgba(26,25,22,0.88)', onAccent: '#0F0E0D',
    },
    users: { facu: ['#7BB8FF', '#4A90D9'], janina: ['#E8A5C4', '#C97AB5'] },
  },
  day: {
    label: 'Day',
    dark: false,
    tokens: {
      bg: '#F7F3EC', surface: '#FFFFFF', surface2: '#F1ECE3', surface3: '#E4DDD1',
      accent: '#E8551F', accent2: '#C9800F', accentSoft: 'rgba(232,85,31,0.10)', borderAccent: 'rgba(232,85,31,0.28)',
      text: '#2A2622', textMuted: '#786E62', textDim: '#A89E90',
      success: '#3F8F4A', successSoft: 'rgba(63,143,74,0.12)', successBorder: 'rgba(63,143,74,0.35)',
      border: 'rgba(42,38,34,0.09)', glass: 'rgba(255,255,255,0.9)', onAccent: '#FFFFFF',
    },
    users: { facu: ['#2F6DB5', '#1F4F8A'], janina: ['#C24E86', '#9C3668'] },
  },
  blossom: {
    label: 'Blossom',
    dark: false,
    tokens: {
      bg: '#FFF1F4', surface: '#FFFFFF', surface2: '#FDE7EE', surface3: '#F6D3DC',
      accent: '#D6457A', accent2: '#D9774A', accentSoft: 'rgba(214,69,122,0.10)', borderAccent: 'rgba(214,69,122,0.30)',
      text: '#4A2230', textMuted: '#946371', textDim: '#C49AA7',
      success: '#3F8F6A', successSoft: 'rgba(63,143,106,0.12)', successBorder: 'rgba(63,143,106,0.35)',
      border: 'rgba(74,34,48,0.09)', glass: 'rgba(255,250,251,0.9)', onAccent: '#FFFFFF',
    },
    users: { facu: ['#3F6FC4', '#2C5299'], janina: ['#C2366C', '#9A2553'] },
  },
  lavender: {
    label: 'Lavender',
    dark: true,
    tokens: {
      bg: '#1C1830', surface: '#262040', surface2: '#312A52', surface3: '#3A3260',
      accent: '#B79CFF', accent2: '#FFB38A', accentSoft: 'rgba(183,156,255,0.14)', borderAccent: 'rgba(183,156,255,0.30)',
      text: '#EEE9FF', textMuted: '#A39BC4', textDim: '#6E6694',
      success: '#7FD1A8', successSoft: 'rgba(127,209,168,0.15)', successBorder: 'rgba(127,209,168,0.35)',
      border: 'rgba(238,233,255,0.08)', glass: 'rgba(38,32,64,0.9)', onAccent: '#1C1830',
    },
    users: { facu: ['#7FC4FF', '#4F97DB'], janina: ['#FF9CCB', '#D96FA6'] },
  },
}

export const THEME_CHOICES = [
  { id: 'auto', label: 'Auto', hint: 'Day / Night with your phone' },
  ...Object.entries(THEMES).map(([id, t]) => ({ id, label: t.label })),
]

// camelCase token → CSS variable name (textMuted → --text-muted, surface2 → --surface2)
export const cssVar = key => `--${key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}`
