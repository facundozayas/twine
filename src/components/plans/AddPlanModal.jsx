import { useState } from 'react'
import { PLAN_CATEGORIES, T } from '../../constants/index.js'
import Icon from '../shared/Icon.jsx'
import UserAvatar from '../shared/UserAvatar.jsx'

const field = (label, input) => (
  <div key={label}>
    <label style={{ fontSize: 12, color: T.textMuted, display: 'block', marginBottom: 5, fontWeight: 500 }}>
      {label}
    </label>
    {input}
  </div>
)

const inputStyle = {
  width: '100%', background: T.surface2,
  border: `1px solid ${T.border}`, borderRadius: T.radius.md,
  padding: '10px 13px', color: T.text, fontSize: 14, outline: 'none',
}

export default function AddPlanModal({ currentUser, onClose, onAdd, loading }) {
  const [form, setForm] = useState({
    title: '', description: '', category_id: 'food',
    location: '', cost: 0, duration_mins: 90, tags: '', notes: '', excitement: 7,
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.title.trim()) { setErr('Title is required'); return }
    setSaving(true)
    const result = await onAdd({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    })
    setSaving(false)
    if (result?.error) { setErr(result.error.message); return }
    onClose()
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}
      className="fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="slide-up"
        style={{
          background: T.surface, borderRadius: '24px 24px 0 0',
          padding: '26px 22px 44px', width: '100%', maxWidth: 480,
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: T.surface3, margin: '0 auto 22px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 className="display" style={{ fontSize: 24, color: T.text }}>New idea</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: T.textMuted }}>Added by</span>
              <UserAvatar userId={currentUser.id} size={18} showName />
            </div>
          </div>
          <button onClick={onClose} style={{ color: T.textMuted, padding: 4 }}>
            <Icon name="x" size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {field('Title *',
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="What's the plan?" style={inputStyle} />
          )}
          {field('Description',
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Tell us more..." rows={3}
              style={{ ...inputStyle, resize: 'vertical' }} />
          )}
          {field('Location',
            <input value={form.location} onChange={e => set('location', e.target.value)}
              placeholder="Where?" style={inputStyle} />
          )}

          {/* Category */}
          <div>
            <label style={{ fontSize: 12, color: T.textMuted, display: 'block', marginBottom: 7, fontWeight: 500 }}>
              Category
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PLAN_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => set('category_id', cat.id)}
                  style={{
                    padding: '5px 11px', borderRadius: T.radius.full, fontSize: 11, fontWeight: 500,
                    background: form.category_id === cat.id ? cat.color : T.surface2,
                    color: form.category_id === cat.id ? '#fff' : T.textMuted,
                    border: `1px solid ${form.category_id === cat.id ? cat.color : T.border}`,
                    transition: 'all 0.15s ease',
                  }}
                >{cat.emoji} {cat.label}</button>
              ))}
            </div>
          </div>

          {/* Cost + Duration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {field('Estimated cost ($)',
              <input type="number" min={0} value={form.cost} onChange={e => set('cost', Number(e.target.value))} style={inputStyle} />
            )}
            {field('Duration (minutes)',
              <input type="number" min={0} value={form.duration_mins} onChange={e => set('duration_mins', Number(e.target.value))} style={inputStyle} />
            )}
          </div>

          {field('Tags (comma separated)',
            <input value={form.tags} onChange={e => set('tags', e.target.value)}
              placeholder="e.g. romantic, outdoor, cheap" style={inputStyle} />
          )}

          {field('Notes',
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Anything to remember..." rows={2}
              style={{ ...inputStyle, resize: 'vertical' }} />
          )}

          {/* Excitement slider */}
          <div>
            <label style={{ fontSize: 12, color: T.textMuted, display: 'block', marginBottom: 5, fontWeight: 500 }}>
              Your excitement — <span style={{ color: currentUser.color, fontWeight: 700 }}>{form.excitement}/10</span>
            </label>
            <input type="range" min={1} max={10} value={form.excitement}
              onChange={e => set('excitement', Number(e.target.value))}
              style={{ width: '100%', accentColor: currentUser.color }} />
          </div>

          {err && <p style={{ fontSize: 13, color: '#FF6B6B', textAlign: 'center' }}>{err}</p>}

          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              background: currentUser.gradient, color: '#fff',
              padding: '14px 24px', borderRadius: T.radius.md,
              fontSize: 15, fontWeight: 600, marginTop: 6,
              boxShadow: `0 4px 20px ${currentUser.color}44`,
              transition: 'all 0.2s ease',
              opacity: saving ? 0.7 : 1,
            }}
            onMouseEnter={e => !saving && (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {saving ? 'Saving...' : `Add to Twine ${currentUser.emoji}`}
          </button>
        </div>
      </div>
    </div>
  )
}
