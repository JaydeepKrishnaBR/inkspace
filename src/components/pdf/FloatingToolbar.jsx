// src/components/pdf/FloatingToolbar.jsx
import React, { useEffect, useRef } from 'react'
import { Highlighter, Underline, X } from 'lucide-react'

const COLORS = [
  { id: 'yellow', bg: '#f5c842' },
  { id: 'green',  bg: '#6abf7b' },
  { id: 'blue',   bg: '#5b9bd5' },
  { id: 'pink',   bg: '#e07db3' },
]

export default function FloatingToolbar({ position, activeTool, highlightColor, onApply, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    function onMouseDown(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [onClose])

  const style = {
    left: position.x,
    top:  position.y,
    transform: 'translate(-50%, -100%) translateY(-6px)',
  }

  return (
    <div ref={ref} className="floating-toolbar" style={style}>
      {/* Highlight colors */}
      {COLORS.map((c) => (
        <button
          key={c.id}
          title={`Highlight ${c.id}`}
          onClick={() => onApply('highlight', c.id)}
          className="w-5 h-5 rounded-full transition-transform hover:scale-110"
          style={{ background: c.bg }} />
      ))}

      <div className="w-px h-4 mx-1" style={{ background: 'var(--border-color)' }} />

      {/* Underline */}
      <button
        title="Underline"
        onClick={() => onApply('underline', highlightColor)}
        className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-secondary)]"
        style={{ color: 'var(--text-secondary)' }}>
        <Underline size={13} />
      </button>

      {/* Close */}
      <button
        onClick={onClose}
        className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-secondary)] ml-1"
        style={{ color: 'var(--text-muted)' }}>
        <X size={13} />
      </button>
    </div>
  )
}
