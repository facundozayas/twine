import { useEffect, useState } from 'react'
import { Overlay } from '../../../components/shared/BottomSheet.jsx'

const BITS = ['🎉', '✨', '🧡', '🎊', '⭐', '💞']

/** A short emoji burst for achieved goals. Unmounts itself. */
export default function Confetti({ onDone }) {
  const [pieces] = useState(() => Array.from({ length: 28 }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    dur: 1.6 + Math.random() * 1.2,
    size: 18 + Math.random() * 14,
    ch: BITS[i % BITS.length],
  })))
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t) }, [onDone])

  return (
    <Overlay>
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 400, overflow: 'hidden' }}>
        {pieces.map((p, i) => (
          <span key={i} style={{
            position: 'absolute', top: 0, left: `${p.left}%`, fontSize: p.size,
            animation: `confetti ${p.dur}s ease-in ${p.delay}s both`,
          }}>{p.ch}</span>
        ))}
      </div>
    </Overlay>
  )
}
