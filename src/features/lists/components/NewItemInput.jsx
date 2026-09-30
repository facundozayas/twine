import { useState, useRef, useMemo } from 'react'
import { T } from '../../../constants/index.js'
import { suggestItems } from '../useListsStore.js'

/**
 * The always-empty line at the end of a list. Type + Enter adds the item and
 * keeps the keyboard open for the next one. Pasting several lines adds them all.
 */
export default function NewItemInput({ allItems, openTexts, onAdd, autoFocus, accent }) {
  const [text, setText] = useState('')
  const inputRef = useRef(null)

  const suggestions = useMemo(
    () => suggestItems(allItems, text, openTexts),
    [allItems, text, openTexts],
  )

  const commit = (value) => {
    const clean = value.trim()
    if (!clean) return
    onAdd([clean])
    setText('')
    inputRef.current?.focus()
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text')
    if (!pasted.includes('\n')) return
    e.preventDefault()
    const lines = pasted.split(/\r?\n/).map(l => l.replace(/^\s*([-*•]|\d+[.)])\s*/, '').trim()).filter(Boolean)
    onAdd(lines)
    setText('')
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 4px', borderBottom: `1px solid ${T.border}` }}>
        <span style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, border: `1.5px dashed ${T.textDim}` }} />
        <input
          ref={inputRef}
          value={text}
          autoFocus={autoFocus}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commit(text) } }}
          onPaste={handlePaste}
          placeholder="Add item"
          enterKeyHint="enter"
          autoCapitalize="sentences"
          aria-label="Add item"
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 15, padding: '2px 0', color: T.text }}
        />
      </div>

      {suggestions.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '10px 0 2px 34px' }}>
          {suggestions.map(s => (
            <button
              key={s}
              // keep focus in the input so the keyboard doesn't close
              onPointerDown={e => e.preventDefault()}
              onClick={() => commit(s)}
              style={{
                padding: '6px 12px', borderRadius: T.radius.full, fontSize: 13,
                background: accent.colorSoft, color: accent.color, border: `1px solid ${accent.colorBorder}`,
              }}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
