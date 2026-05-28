// ─── USERS ───────────────────────────────────────────────────────────────────
export const USERS = {
  janina: {
    id: 'janina',
    name: 'Janina',
    emoji: '🌸',
    color: '#E8A5C4',
    colorSoft: 'rgba(232,165,196,0.12)',
    colorBorder: 'rgba(232,165,196,0.28)',
    gradient: 'linear-gradient(135deg, #E8A5C4 0%, #C97AB5 100%)',
  },
  facu: {
    id: 'facu',
    name: 'Facu',
    emoji: '⚡',
    color: '#7BB8FF',
    colorSoft: 'rgba(123,184,255,0.12)',
    colorBorder: 'rgba(123,184,255,0.28)',
    gradient: 'linear-gradient(135deg, #7BB8FF 0%, #4A90D9 100%)',
  },
}

export const getUser = (id) => USERS[id] || USERS.janina
export const getPartner = (id) => id === 'janina' ? USERS.facu : USERS.janina

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
export const CATEGORIES = [
  { id: 'all',         label: 'All',           emoji: '✨', color: '#FF6B35' },
  { id: 'regulars',    label: 'Regulars',       emoji: '🔁', color: '#90CAF9' },
  { id: 'food',        label: 'Food & Drinks',  emoji: '🍜', color: '#FFB347' },
  { id: 'travel',      label: 'Travel',         emoji: '✈️', color: '#7CB8FF' },
  { id: 'romantic',    label: 'Romantic',       emoji: '🌹', color: '#FF8FAB' },
  { id: 'outdoor',     label: 'Outdoor',        emoji: '🌿', color: '#7CB87C' },
  { id: 'adventure',   label: 'Adventure',      emoji: '🧗', color: '#C9A96E' },
  { id: 'creative',    label: 'Creative',       emoji: '🎨', color: '#80DEEA' },
  { id: 'nightlife',   label: 'Nightlife',      emoji: '🎉', color: '#CE93D8' },
  { id: 'stayin',      label: 'Stay In',        emoji: '🏠', color: '#90CAF9' },
  { id: 'learning',    label: 'Learning',       emoji: '📚', color: '#B39DDB' },
  { id: 'bucket',      label: 'Bucket List',    emoji: '🌟', color: '#FFF176' },
  { id: 'spontaneous', label: 'Spontaneous',    emoji: '⚡', color: '#FF6B6B' },
]

export const PLAN_CATEGORIES = CATEGORIES.filter(c => c.id !== 'all' && c.id !== 'regulars')
export const getCat = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[2]

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
export const T = {
  bg:           '#0F0E0D',
  surface:      '#1A1916',
  surface2:     '#252320',
  surface3:     '#2F2C27',
  accent:       '#FF6B35',
  accent2:      '#FFB347',
  accentSoft:   'rgba(255,107,53,0.12)',
  text:         '#F5F0E8',
  textMuted:    '#8A8070',
  textDim:      '#5A5248',
  success:      '#7CB87C',
  successSoft:  'rgba(124,184,124,0.15)',
  border:       'rgba(245,240,232,0.06)',
  borderAccent: 'rgba(255,107,53,0.25)',
  radius: { sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 9999 },
}

export const STATUSES = [
  { id: 'idea',    label: 'Idea',    color: T.textMuted },
  { id: 'planned', label: 'Planned', color: T.accent2 },
  { id: 'done',    label: 'Done',    color: T.success },
]
export const getStatus = (id) => STATUSES.find(s => s.id === id) || STATUSES[0]

export const BADGES = [
  { id: 'starters',   emoji: '🌱', label: 'Just Started',   desc: 'Added first plan',       threshold: (p) => p.length >= 1 },
  { id: 'foodies',    emoji: '🍜', label: 'Foodies',        desc: '3+ food plans done',     threshold: (p) => p.filter(x => x.category_id === 'food'     && x.status === 'done').length >= 3 },
  { id: 'homebodies', emoji: '🏠', label: 'Homebodies',     desc: '3+ stay-in plans done',  threshold: (p) => p.filter(x => x.category_id === 'stayin'   && x.status === 'done').length >= 3 },
  { id: 'adventurers',emoji: '🧗', label: 'Adventurers',    desc: '3+ outdoor plans done',  threshold: (p) => p.filter(x => x.category_id === 'outdoor'  && x.status === 'done').length >= 3 },
  { id: 'travelers',  emoji: '✈️', label: 'Globetrotters',  desc: '2+ travel plans done',   threshold: (p) => p.filter(x => x.category_id === 'travel'   && x.status === 'done').length >= 2 },
  { id: 'dreamers',   emoji: '🌟', label: 'Dreamers',       desc: '3+ bucket list items',   threshold: (p) => p.filter(x => x.category_id === 'bucket').length >= 3 },
  { id: 'regulars',   emoji: '🔁', label: 'Creatures of Habit', desc: '3+ recurring plans', threshold: (p) => p.filter(x => x.is_recurring).length >= 3 },
  { id: 'night',      emoji: '🦉', label: 'Night Owls',     desc: '3+ nightlife plans done',threshold: (p) => p.filter(x => x.category_id === 'nightlife' && x.status === 'done').length >= 3 },
]
