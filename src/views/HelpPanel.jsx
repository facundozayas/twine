import { useState } from 'react'
import { T } from '../constants/index.js'
import Icon from '../components/shared/Icon.jsx'

const SECTIONS = [
  {
    emoji: '➕', title: 'Adding plans',
    content: 'Tap the + button in the top right. Fill in the title, category, cost and duration. Set your excitement level (1–10). Toggle "Recurring plan" for things you do regularly like movie nights or cooking at home — these go in the Regulars tab and don\'t need ranking.',
  },
  {
    emoji: '↔️', title: 'Ranking',
    content: 'Go to the Rank tab. You\'ll see plans your partner added. Swipe right (Yes!) or left (Skip), then set your exact score 1–10. Your partner\'s score shows as a hint. The person who adds a plan sets their excitement score right away — the other person ranks it later.',
  },
  {
    emoji: '✅', title: 'Marking as done',
    content: 'Open any plan → tap the status buttons (Idea → Planned → Done). Once it\'s Done, both of you can rate the experience separately.',
  },
  {
    emoji: '⭐', title: 'Rating an experience',
    content: 'Open a Done plan. You\'ll see a rating section for each person. Tap "Rate" next to your name and give it stars for Overall and Fun, plus whether you\'d repeat it. Your partner does the same on their device.',
  },
  {
    emoji: '📊', title: 'Reading insights',
    content: 'Insights has two tabs: Expectations (your rankings before doing things) and Experiences (ratings after doing them). See your Top 5, biggest disagreements, and how you both rate things differently.',
  },
  {
    emoji: '📥', title: 'Exporting your data',
    content: 'In Insights, scroll down and tap "Export to Excel". It downloads a .csv file with all your plans and ratings. You can open it in Excel or Google Sheets — or upload it to Claude and ask for personalized recommendations based on your history.',
  },
  {
    emoji: '🔁', title: 'Regulars tab',
    content: 'Plans marked as Recurring always appear in the Regulars tab. They\'re your go-to activities — no ranking needed. You can still rate them after doing them to track which ones you enjoy most.',
  },
  {
    emoji: '🔄', title: 'Switching profiles',
    content: 'Tap your name/emoji in the top right to switch between Janina and Facu. Each device remembers who you are. All data syncs in real time — changes on one phone appear instantly on the other.',
  },
]

export default function HelpPanel({ onClose }) {
  const [open, setOpen] = useState(null)

  return (
    <div className="fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="slide-up" style={{ background: T.surface, borderRadius: '24px 24px 0 0', padding: '26px 22px 44px', width: '100%', maxWidth: 480, maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: T.surface3, margin: '0 auto 22px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 className="display" style={{ fontSize: 26 }}>How Twine works</h2>
          <button onClick={onClose} style={{ color: T.textMuted }}><Icon name="x" size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SECTIONS.map((s, i) => (
            <div key={i} style={{ background: T.surface2, borderRadius: T.radius.lg, overflow: 'hidden', border: `1px solid ${T.border}` }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', textAlign: 'left' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{s.emoji}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{s.title}</span>
                </div>
                <Icon name={open === i ? 'x' : 'plus'} size={16} color={T.textMuted} />
              </button>
              {open === i && (
                <div style={{ padding: '0 16px 14px', fontSize: 13, color: T.textMuted, lineHeight: 1.7 }}>
                  {s.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
