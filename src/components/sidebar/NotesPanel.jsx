// src/components/sidebar/NotesPanel.jsx
import React, { useEffect, useRef } from 'react'
import { X, MessageSquare } from 'lucide-react'
import { useStore } from '../../store/useStore'

const COLOR_MAP = {
  yellow: '#f5c842',
  green:  '#6abf7b',
  blue:   '#5b9bd5',
  pink:   '#e07db3',
}

export default function NotesPanel({ onSaveNote }) {
  const { selectedAnnotation, notes, setNotesPanelOpen, setSelectedAnnotation } = useStore()
  const textareaRef = useRef(null)

  const note = selectedAnnotation ? (notes[selectedAnnotation.id] || '') : ''
  const color = COLOR_MAP[selectedAnnotation?.color] || COLOR_MAP.yellow

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus()
  }, [selectedAnnotation?.id])

  function close() {
    setNotesPanelOpen(false)
    setSelectedAnnotation(null)
  }

  return (
    <div className="flex flex-col h-full border-l animate-slide-in-right"
         style={{ width: 280, background: 'var(--sidebar-bg)', borderColor: 'var(--border-color)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0"
           style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2">
          <MessageSquare size={14} style={{ color: 'var(--text-secondary)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Note</span>
        </div>
        <button onClick={close} className="p-1 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}>
          <X size={14} />
        </button>
      </div>

      {selectedAnnotation ? (
        <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
          {/* Selected text preview */}
          <div className="rounded-xl p-3 border-l-3"
               style={{
                 background: 'var(--bg-secondary)',
                 borderLeft: `3px solid ${color}`,
               }}>
            <p className="text-xs mb-1 uppercase tracking-wide font-medium" style={{ color: 'var(--text-muted)' }}>
              {selectedAnnotation.type} · Page {selectedAnnotation.page}
            </p>
            <p className="text-sm leading-relaxed" style={{
              color: 'var(--text-primary)',
              fontFamily: 'Lora, serif',
            }}>
              "{selectedAnnotation.text}"
            </p>
          </div>

          {/* Note textarea */}
          <div className="flex-1 flex flex-col">
            <label className="text-xs uppercase tracking-wide font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
              Your note
            </label>
            <textarea
              ref={textareaRef}
              value={note}
              onChange={(e) => onSaveNote(selectedAnnotation.id, e.target.value)}
              placeholder="Add a note to this annotation…"
              className="flex-1 resize-none rounded-xl p-3 text-sm leading-relaxed outline-none border transition-colors min-h-[120px]"
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-color)',
                fontFamily: 'DM Sans, sans-serif',
              }}
            />
            <p className="text-xs mt-2 text-right" style={{ color: 'var(--text-muted)' }}>
              Auto-saved
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-3 opacity-20" style={{ color: 'var(--text-secondary)' }}>
            <MessageSquare size={24} />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No annotation selected</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Click any annotation to add or view its note
          </p>
        </div>
      )}
    </div>
  )
}
