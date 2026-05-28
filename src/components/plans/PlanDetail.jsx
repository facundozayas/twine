import { useState } from 'react'
import { getCat, getStatus, USERS, T } from '../../constants/index.js'
import Icon from '../shared/Icon.jsx'
import UserAvatar from '../shared/UserAvatar.jsx'

const fmt = {
  cost: (n) => n === 0 ? 'Free' : `$${n}`,
  dur:  (m) => m < 60 ? `${m} min` : m < 1440 ? `${m / 60}h` : `${Math.round(m / 1440)} days`,
}

function StarRating({ value, onChange, color }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => onChange(n)} style={{
          fontSize: 22, lineHeight: 1,
          opacity: n <= value ? 1 : 0.25,
          transition: 'all 0.15s ease',
          transform: n <= value ? 'scale(1.1)' : 'scale(1)',
        }}>⭐</button>
      ))}
    </div>
  )
}

function ExperienceForm({ userId, existingExp, onSubmit, onCancel, loading }) {
  const user = USERS[userId]
  const col_overall = userId === 'janina' ? 'overall_janina' : 'overall_facu'
  const col_fun     = userId === 'janina' ? 'fun_janina'     : 'fun_facu'
  const col_repeat  = userId === 'janina' ? 'repeat_janina'  : 'repeat_facu'

  const [form, setForm] = useState({
    overall:      existingExp?.[col_overall] || 3,
    fun:          existingExp?.[col_fun]     || 3,
    would_repeat: existingExp?.[col_repeat]  ?? true,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ background: T.surface2, borderRadius: T.radius.lg, padding: 18, border: `1px solid ${user.colorBorder}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <UserAvatar userId={userId} size={22} />
        <span style={{ fontSize: 14, fontWeight: 600, color: user.color }}>{user.name}'s rating</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 11, color: T.textMuted, display: 'block', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall</label>
          <StarRating value={form.overall} onChange={v => set('overall', v)} color={user.color} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: T.textMuted, display: 'block', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fun level</label>
          <StarRating value={form.fun} onChange={v => set('fun', v)} color={user.color} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: T.text }}>Would do it again?</span>
          <button onClick={() => set('would_repeat', !form.would_repeat)} style={{
            padding: '6px 14px', borderRadius: T.radius.full, fontSize: 12, fontWeight: 600,
            background: form.would_repeat ? T.successSoft : T.surface3,
            color: form.would_repeat ? T.success : T.textMuted,
            border: `1px solid ${form.would_repeat ? T.success + '55' : T.border}`,
            transition: 'all 0.2s ease',
          }}>{form.would_repeat ? 'Yes! 👍' : 'Not again'}</button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '10px', borderRadius: T.radius.md, background: T.surface3, color: T.textMuted, fontSize: 13 }}>Cancel</button>
          <button onClick={() => onSubmit(form)} disabled={loading} style={{
            flex: 2, padding: '10px', borderRadius: T.radius.md,
            background: user.gradient, color: '#fff', fontSize: 13, fontWeight: 600,
            opacity: loading ? 0.7 : 1,
          }}>{loading ? 'Saving...' : 'Save ✓'}</button>
        </div>
      </div>
    </div>
  )
}

export default function PlanDetail({ plan, currentUser, onBack, onUpdateStatus, onUpdateNotes, onAddExperience, onDelete }) {
  const cat    = getCat(plan.category_id)
  const status = getStatus(plan.status)
  const [editingForm, setEditingForm] = useState(null)  // null | 'janina' | 'facu'
  const [notes, setNotes]         = useState(plan.notes || '')
  const [editingNotes, setEditingNotes] = useState(false)
  const [savingExp, setSavingExp]   = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const myScore      = plan[`ranking_${currentUser.id}`]
  const partnerId    = currentUser.id === 'janina' ? 'facu' : 'janina'
  const partnerScore = plan[`ranking_${partnerId}`]
  const mutualScore  = myScore != null && partnerScore != null
    ? ((myScore + partnerScore) / 2).toFixed(1) : null

  const exp = plan.experience

  const handleSaveExp = async (userId, expData) => {
    setSavingExp(true)
    await onAddExperience(plan.id, userId, expData)
    setSavingExp(false)
    setEditingForm(null)
  }

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    await onUpdateNotes(plan.id, notes)
    setSavingNotes(false)
    setEditingNotes(false)
  }

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 5, color: T.textMuted, fontSize: 13, width: 'fit-content', marginBottom: 4 }}>
        <Icon name="arrowL" size={14} color={T.textMuted} /> Back to plans
      </button>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${cat.color}22 0%, ${T.surface} 100%)`, borderRadius: T.radius.xl, padding: '22px 20px', border: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 38, marginBottom: 10 }}>{plan.is_recurring ? '🔁' : cat.emoji}</div>
        {plan.is_recurring && <div style={{ fontSize: 11, color: '#90CAF9', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Recurring plan</div>}
        <h2 className="display" style={{ fontSize: 27, lineHeight: 1.2, marginBottom: 6 }}>{plan.title}</h2>
        {plan.description && <p style={{ color: T.textMuted, lineHeight: 1.7, fontSize: 14, marginBottom: 14 }}>{plan.description}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          {plan.location && <span style={{ fontSize: 13, color: T.textMuted }}>{plan.location}</span>}
          {plan.cost > 0 && <span style={{ fontSize: 13, color: T.accent2 }}>{fmt.cost(plan.cost)}</span>}
          {plan.duration_mins > 0 && <span style={{ fontSize: 13, color: T.textMuted }}>{fmt.dur(plan.duration_mins)}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: T.textMuted }}>Idea by</span>
          <UserAvatar userId={plan.suggested_by} size={20} showName />
        </div>
      </div>

      {/* Status */}
      {!plan.is_recurring && (
        <div style={{ background: T.surface, borderRadius: T.radius.lg, padding: 16, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.05em' }}>Status</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['idea', 'planned', 'done'].map(s => {
              const st = { idea: { label: 'Idea', color: T.textMuted }, planned: { label: 'Planned', color: T.accent2 }, done: { label: 'Done', color: T.success } }[s]
              return (
                <button key={s} onClick={() => onUpdateStatus(plan.id, s)} style={{
                  flex: 1, padding: '8px', borderRadius: T.radius.md, fontSize: 12, fontWeight: 600,
                  background: plan.status === s ? st.color + '22' : T.surface2,
                  color: plan.status === s ? st.color : T.textMuted,
                  border: `1px solid ${plan.status === s ? st.color + '55' : T.border}`,
                  transition: 'all 0.2s ease',
                }}>{st.label}</button>
              )
            })}
          </div>
        </div>
      )}

      {/* Rankings — only for non-recurring */}
      {!plan.is_recurring && (
        <div style={{ background: T.surface, borderRadius: T.radius.lg, padding: 16, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>Excitement rankings</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {Object.values(USERS).map(user => {
              const score = plan[`ranking_${user.id}`]
              return (
                <div key={user.id} style={{ flex: 1, textAlign: 'center', padding: '13px 8px', borderRadius: T.radius.md, background: score != null ? user.colorSoft : T.surface2, border: `1px solid ${score != null ? user.colorBorder : T.border}` }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{user.emoji}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: user.color, marginBottom: 2 }}>{user.name}</div>
                  {score != null
                    ? <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: user.color }}>{score}<span style={{ fontSize: 11 }}>/10</span></div>
                    : <div style={{ fontSize: 11, color: T.textDim }}>Not ranked</div>}
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
      )}

      {/* Experience ratings — both users */}
      <div style={{ background: T.surface, borderRadius: T.radius.lg, padding: 16, border: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>
          Experience ratings
        </div>

        {Object.values(USERS).map(user => {
          const col_overall = user.id === 'janina' ? 'overall_janina' : 'overall_facu'
          const col_fun     = user.id === 'janina' ? 'fun_janina'     : 'fun_facu'
          const col_repeat  = user.id === 'janina' ? 'repeat_janina'  : 'repeat_facu'
          const hasRated    = exp && exp[col_overall] != null
          const isMe        = user.id === currentUser.id

          return (
            <div key={user.id} style={{ marginBottom: 12 }}>
              {editingForm === user.id ? (
                <ExperienceForm
                  userId={user.id}
                  existingExp={exp}
                  onSubmit={(data) => handleSaveExp(user.id, data)}
                  onCancel={() => setEditingForm(null)}
                  loading={savingExp}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: T.radius.md, background: T.surface2, border: `1px solid ${T.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <UserAvatar userId={user.id} size={24} />
                    {hasRated ? (
                      <div>
                        <div style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                          {[1,2,3,4,5].map(n => <span key={n} style={{ fontSize: 13, opacity: n <= exp[col_overall] ? 1 : 0.2 }}>⭐</span>)}
                          <span style={{ fontSize: 11, color: T.textMuted, marginLeft: 4 }}>overall</span>
                        </div>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1,2,3,4,5].map(n => <span key={n} style={{ fontSize: 13, opacity: n <= exp[col_fun] ? 1 : 0.2 }}>😄</span>)}
                          <span style={{ fontSize: 11, color: T.textMuted, marginLeft: 4 }}>fun</span>
                        </div>
                        {exp[col_repeat] != null && (
                          <div style={{ fontSize: 11, color: exp[col_repeat] ? T.success : T.textMuted, marginTop: 2 }}>
                            {exp[col_repeat] ? '🔁 Would repeat' : '✗ Not again'}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: T.textMuted }}>{user.name} hasn't rated yet</span>
                    )}
                  </div>
                  {isMe && (
                    <button onClick={() => setEditingForm(user.id)} style={{
                      fontSize: 11, color: user.color, padding: '5px 10px',
                      borderRadius: T.radius.sm, background: user.colorSoft,
                      border: `1px solid ${user.colorBorder}`,
                    }}>
                      {hasRated ? 'Edit' : 'Rate'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

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
          ? <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ width: '100%', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: T.radius.md, padding: '9px 12px', color: T.text, fontSize: 13, outline: 'none', resize: 'vertical' }} />
          : <p style={{ fontSize: 14, color: notes ? T.text : T.textDim, lineHeight: 1.6, fontStyle: notes ? 'normal' : 'italic' }}>
              {notes || 'No notes yet.'}
            </p>
        }
      </div>

      {/* Tags */}
      {plan.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {plan.tags.map(t => <span key={t} style={{ fontSize: 11, padding: '4px 10px', borderRadius: T.radius.full, background: T.surface2, color: T.textMuted }}>{t}</span>)}
        </div>
      )}

      {/* Delete */}
      <div style={{ marginTop: 4 }}>
        {!confirmDelete
          ? <button onClick={() => setConfirmDelete(true)} style={{ fontSize: 12, color: T.textDim, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="trash" size={13} color={T.textDim} /> Delete plan
            </button>
          : <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: '9px', borderRadius: T.radius.md, background: T.surface2, color: T.textMuted, fontSize: 12 }}>Cancel</button>
              <button onClick={() => onDelete(plan.id)} style={{ flex: 1, padding: '9px', borderRadius: T.radius.md, background: 'rgba(255,107,107,0.15)', color: '#FF6B6B', fontSize: 12, fontWeight: 600 }}>Yes, delete</button>
            </div>
        }
      </div>
    </div>
  )
}
