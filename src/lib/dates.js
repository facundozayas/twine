// Calendar-day helpers. Everything uses the phone's LOCAL date as 'YYYY-MM-DD'.
// (toISOString() would use UTC, so logging at 00:30 in Berlin would land on
// the previous day.)

const pad = n => String(n).padStart(2, '0')

export const toISODate = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const today = () => toISODate(new Date())

export const fromISODate = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const addDays = (iso, n) => {
  const d = fromISODate(iso)
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

/** The last `n` days ending at `end` (inclusive), oldest first. */
export const lastNDays = (n, end = today()) =>
  Array.from({ length: n }, (_, i) => addDays(end, i - n + 1))

/** 'Today', 'Yesterday', or 'Monday' / 'Mon, 21 Sep' for older days. */
export function dayLabel(iso) {
  const t = today()
  if (iso === t) return 'Today'
  if (iso === addDays(t, -1)) return 'Yesterday'
  const d = fromISODate(iso)
  const diff = (fromISODate(t) - d) / 86400000
  return diff < 7
    ? d.toLocaleDateString('en-GB', { weekday: 'long' })
    : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export const shortDate = (iso) =>
  fromISODate(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
