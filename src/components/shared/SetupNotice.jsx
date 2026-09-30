import { T } from '../../constants/index.js'

/** Shown when a feature's Supabase tables don't exist yet. */
export default function SetupNotice({ emoji, title, file, error }) {
  return (
    <div style={{ padding: '40px 10px', textAlign: 'center' }}>
      <div style={{ fontSize: 34, marginBottom: 10 }}>{emoji}</div>
      <p className="display" style={{ fontSize: 20, marginBottom: 8 }}>{title}</p>
      <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6 }}>
        Run <span className="mono" style={{ color: T.text }}>{file}</span> in the Supabase SQL Editor, then reload.
      </p>
      {error && <p style={{ fontSize: 11, color: T.textDim, fontFamily: 'monospace', marginTop: 14, wordBreak: 'break-all' }}>{error}</p>}
    </div>
  )
}

export function Spinner() {
  return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
}
