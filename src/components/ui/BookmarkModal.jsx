// src/components/ui/BookmarkModal.jsx
import React, { useState, useEffect } from 'react'
import { Bookmark, X } from 'lucide-react'

export default function BookmarkModal({ page, onSave, onClose }) {
  const [label, setLabel] = useState(`Page ${page}`)

  useEffect(() => {
    const input = document.getElementById('bm-input')
    if (input) { input.focus(); input.select() }
  }, [])

  function handleKeyDown(e) {
    if (e.key === 'Enter') onSave(label)
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
         style={{ background: 'rgba(0,0,0,0.4)' }}
         onClick={onClose}>
      <div
        className="rounded-2xl p-6 border w-80 animate-slide-up"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-md)' }}
        onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bookmark size={16} style={{ color: '#f5c842' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Bookmark page {page}
            </span>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={14} />
          </button>
        </div>

        <input
          id="bm-input"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Label for this bookmark…"
          className="w-full px-3 py-2 rounded-xl text-sm outline-none border mb-4"
          style={{
            background: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }} />

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
            Cancel
          </button>
          <button
            onClick={() => onSave(label)}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)' }}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
