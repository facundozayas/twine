import { useState } from 'react'
import { getCat, getStatus, USERS, T } from '../../constants/index.js'
import Icon from '../shared/Icon.jsx'
import UserAvatar from '../shared/UserAvatar.jsx'

const fmt = {
  cost: (n) => n === 0 ? 'Free' : `$${n}`,
  dur:  (m) => m < 60 ? `${m} min` : m < 1440 ? `${m / 60}h` : `${Math.round(m / 1440)} days`,
}

function ExperienceForm({ plan, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    overall_rating: 7, mood_before: 6, mood_after: 8,
    fun_level: 7, would_repeat: true, favorite_memory: '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const sliders = [
    { key: 'overall_rating', label: 'Overall rating' },
    { key: 'mood_before',    label: 'Mood before' },
    { key: 'mood_after',     label: 'Mood after' },
    { key: 'fun_level',      label: 'Fun level' },
  ]

  return (
    <div style={{ background: T.surface2, borderRadius: T.radius.lg, padding: 18, border: `1px solid ${T.border}` }}>
      <h3 className="display" style={{ fontSize: 20, marginBottom: 14, color: T.text }}>How was it? 🌟</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sliders.map(({ key, label }) => (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ fontSize: 12, color: T.textMuted, fontWeight: 500 }}>{label}</label>
              <span className="mono" style={{ fontSize: 14, color: T.success, fontWeight: 600 }}>{form[key]}/10</span>
            </div>
            <input type="range" min={1} max={10} value={form[key]}
              onChange={e => set(key, Number(e.target.value))}
              style={{ width: '100%', accentColor: T.success }} />
          </div>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
          <span style={{ fontSize: 13, color: T.text }}>Would do it again?</span>
          <button
            onClick={() => set('would_repeat', !form.would_repeat)}
            style={{
              padding: '6px 14px', borderRadius: T.radius.full, fontSize: 12, fontWeight: 600,
              background: form.would_repeat ? T.successSoft : T.surface3,
              color: form.would_repeat ? T.success : T.textMuted,
              border: `1px solid ${form.would_repeat ? T.success + '55' : T.border}`,
              transition: 'all 0.2s ease',
            }}
          >{form.would_repeat ? 'Yes! 👍' : 'Not again'}</button>
        </div>

        <div>
          <label style={{ fontSize: 12, color: T.textMuted, display: 'block', marginBottom: 5, fontWeight: 500 }}>
            Favorite memory
          </label>
          <textarea
            value={form.favorite_memory}
            onChange={e => set('favorite_memory', e.target.value)}
            placeholder="What was the best moment?"
            rows={2}
            style={{ width: '100%', background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius.md, padding: '10px 13px', color: T.text, fontSize: 13, outline: 'none', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '11px', borderRadius: T.radius.md, background: T.surface3, color: T.textMuted, fontSize: 13 }}>
            Cancel
          </button>
          <button
            onClick={() => onSubmit(form)}
            disabled={loading}
            style={{ flex: 2, padding: '11px', borderRadius: T.radius.md, background: T.success, color: '#fff', fontSize: 13, fontWeight: 600, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Saving...' : 'Save experience ✨'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PlanDetail({ plan, currentUser, onBack, onUpdateStatus, onUpdateNotes, onAddExperience, onDelete }) {
  const cat    = getCat(plan.category_id)
  const status = getStatus(plan.status)
  const [showExpForm, setShowExpForm] = useState(false)
  const [notes, setNotes] = useState(plan.notes || '')
  const [editingNotes, setEditingNotes] = useState(false)
  const [savingExp, setSavingExp] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const partnerId = currentUser.id === 'janina' ? 'facu' : 'janina'
  const myScore = plan[`ranking_${currentUser.id}`]
  const partnerScore = plan[`ranking_${partnerId}`]
  const mutualScore = myScore != null && partnerScore != null
    ? ((myScore + partnerScore) / 2).toFixed(1)
    : null

  const handleSaveExp = async (expData) => {
    setSavingExp(true)
    await onAddExperience(plan.id, expData)
    setSavingExp(false)
    setShowExpForm(false)
  }

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    await onUpdateNotes(plan.id, notes)
    setSavingNotes(false)
    setEditingNotes(false)
  }

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Back */}
      <button
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 5, color: T.textMuted, fontSize: 13, width: 'fit-content', marginBottom: 4 }}
      >
        <Icon name="arrowL" size={14} color={T.textMuted} /> Back to plans
      </button>

      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${cat.color}22 0%, ${T.surface} 100%)`,
        borderRadius: T.radius.xl, padding: '22px 20px',
        border: `1px solid ${T.border}`,
      }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>{cat.emoji}</div>
        <h2 className="display" style={{ fontSize: 27, lineHeight: 1.2, marginBottom: 6 }}>{plan.title}</h2>
        {plan.description && (
          <p style={{ color: T.textMuted, lineHeight: 1.7, fontSize: 14, marginBottom: 14 }}>{plan.description}</p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          {plan.location     && <span style={{ fontSize: 13, color: T.textMuted }}>{plan.location}</span>}
          {plan.cost > 0     && <span style={{ fontSize: 13, color: T.accent2 }}>{fmt.cost(plan.cost)}</span>}
          {plan.duration_mins> 0 && <span style={{ fontSize: 13, color: T.textMuted }}>{fmt.dur(plan.duration_mins)}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: T.textMuted }}>Idea by</span>
          <UserAvatar userId={plan.suggested_by} size={20} showName />
        </div>
      </div>

      {/* Status picker */}
      <div style={{ background: T.surface, borderRadius: T.radius.lg, padding: 16, border: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.05em' }}>
          Status
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['idea', 'planned', 'done'].map(s => {
            const st = { idea: { label: 'Idea', color: T.textMuted }, planned: { label: 'Planned', color: T.accent2 }, done: { label: 'Done', color: T.success } }[s]
            const isActive = plan.status === s
            return (
              <button
                key={s}
                onClick={() => onUpdateStatus(plan.id, s)}
                style={{
                  flex: 1, padding: '8px', borderRadius: T.radius.md, fontSize: 12, fontWeight: 600,
                  background: isActive ? st.color + '22' : T.surface2,
                  color: isActive ? st.color : T.textMuted,
                  border: `1px solid ${isActive ? st.color + '55' : T.border}`,
                  transition: 'all 0.2s ease',
                }}
              >{st.label}</button>
            )
          })}
        </div>
      </div>

      {/* Rankings */}
      <div style={{ background: T.surface, borderRadius: T.radius.lg, padding: 16, border: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>
          Rankings
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {Object.values(USERS).map(user => {
            const score = plan[`ranking_${user.id}`]
            return (
              <div key={user.id} style={{
                flex: 1, textAlign: 'center', padding: '13px 8px', borderRadius: T.radius.md,
                background: score != null ? user.colorSoft : T.surface2,
                border: `1px solid ${score != null ? user.colorBorder : T.border}`,
              }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{user.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: user.color, marginBottom: 2 }}>{user.name}</div>
                {score != null
                  ? <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: user.color }}>{score}<span style={{ fontSize: 11 }}>/10</span></div>
                  : <div style={{ fontSize: 11, color: T.textDim }}>Not ranked</div>
                }
              </div>
            )
          })}
        </div>
        {mutualScore && (
          <div style={{ marginTop: 12, textAlign: 'center', fontSize: 13, color: T.textMuted }}>
            Mutual score: <span className="mono" style={{ color: T.accent, fontSize: 17, fontWeight: 700 }}>{mutualScore}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {plan.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {plan.tags.map(t => (
            <span key={t} style={{ fontSize: 11, padding: '4px 10px', borderRadius: T.radius.full, background: T.surface2, color: T.textMuted }}>
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Notes */}
      <div style={{ background: T.surface, borderRadius: T.radius.lg, padding: 16, border: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</div>
          {!editingNotes
            ? <button onClick={() => setEditingNotes(true)} style={{ fontSize: 12, color: currentUser.color, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Icon name="edit" size={12} color={currentUser.color} /> Edit
              </button>
            : <button onClick={handleSaveNotes} style={{ fontSize: 12, color: T.success, fontWeight: 600 }}>
                {savingNotes ? 'Saving...' : 'Save'}
              </button>
          }
        </div>
        {editingNotes
          ? <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              style={{ width: '100%', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: T.radius.md, padding: '9px 12px', color: T.text, fontSize: 13, outline: 'none', resize: 'vertical' }} />
          : <p style={{ fontSize: 14, color: notes ? T.text : T.textDim, lineHeight: 1.6, fontStyle: notes ? 'normal' : 'italic' }}>
              {notes || 'No notes yet. Tap edit to add some.'}
            </p>
        }
      </div>

      {/* Experience section */}
      {plan.experience ? (
        <div style={{ background: T.surface, borderRadius: T.radius.lg, padding: 16, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 11, color: T.success, fontWeight: 600, textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>
            Experience report ✨
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            {[
              { label: 'Overall',    value: `${plan.experience.overall_rating}/10` },
              { label: 'Mood lift',  value: `${plan.experience.mood_before} → ${plan.experience.mood_after}` },
              { label: 'Fun',        value: `${plan.experience.fun_level}/10` },
              { label: 'Repeat?',    value: plan.experience.would_repeat ? 'Yes! 🎉' : 'Not again' },
            ].map(s => (
              <div key={s.label} style={{ background: T.surface2, borderRadius: T.radius.md, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 3 }}>{s.label}</div>
                <div className="mono" style={{ fontSize: 15, color: T.success }}>{s.value}</div>
              </div>
            ))}
          </div>
          {plan.experience.favorite_memory && (
            <p style={{ fontSize: 13, color: T.textMuted, fontStyle: 'italic', lineHeight: 1.5 }}>
              ✨ "{plan.experience.favorite_memory}"
            </p>
          )}
        </div>
      ) : plan.status === 'done' && !showExpForm ? (
        <button
          onClick={() => setShowExpForm(true)}
          style={{
            padding: '14px', borderRadius: T.radius.lg, width: '100%',
            background: T.successSoft, color: T.success, fontWeight: 600, fontSize: 14,
            border: `1px solid ${T.success}44`, transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          ✨ Add your experience
        </button>
      ) : showExpForm ? (
        <ExperienceForm plan={plan} onSubmit={handleSaveExp} onCancel={() => setShowExpForm(false)} loading={savingExp} />
      ) : null}

      {/* Delete */}
      <div style={{ marginTop: 8 }}>
        {!confirmDelete
          ? <button onClick={() => setConfirmDelete(true)} style={{ fontSize: 12, color: T.textDim, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="trash" size={13} color={T.textDim} /> Delete plan
            </button>
          : <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: '9px', borderRadius: T.radius.md, background: T.surface2, color: T.textMuted, fontSize: 12 }}>
                Cancel
              </button>
              <button onClick={() => onDelete(plan.id)} style={{ flex: 1, padding: '9px', borderRadius: T.radius.md, background: 'rgba(255,107,107,0.15)', color: '#FF6B6B', fontSize: 12, fontWeight: 600 }}>
                Yes, delete
              </button>
            </div>
        }
      </div>
    </div>
  )
}
