// src/components/layout/TopToolbar.jsx
import React from 'react'
import {
  ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight,
  Highlighter, Underline, MessageSquare, Bookmark, Sun, Moon,
  Coffee, LogOut, FileText, PanelLeft,
} from 'lucide-react'
import { useStore } from '../../store/useStore'

const COLORS = [
  { id: 'yellow', bg: '#f5c842', label: 'Yellow' },
  { id: 'green',  bg: '#6abf7b', label: 'Green' },
  { id: 'blue',   bg: '#5b9bd5', label: 'Blue' },
  { id: 'pink',   bg: '#e07db3', label: 'Pink' },
]

export default function TopToolbar({ onLogout, onUpload, onBookmark }) {
  const {
    activeDocument, currentPage, totalPages, scale,
    setCurrentPage, setScale, theme, setTheme,
    activeTool, setActiveTool, highlightColor, setHighlightColor,
  } = useStore()

  const tools = [
    { id: 'highlight', icon: Highlighter, label: 'Highlight' },
    { id: 'underline', icon: Underline,   label: 'Underline' },
    { id: 'note',      icon: MessageSquare, label: 'Note' },
  ]

  const themes = [
    { id: 'light', icon: Sun,    label: 'Light' },
    { id: 'dark',  icon: Moon,   label: 'Dark' },
    { id: 'sepia', icon: Coffee, label: 'Sepia' },
  ]

  return (
    <div className="flex items-center justify-between px-4 h-12 border-b shrink-0"
         style={{ background: 'var(--toolbar-bg)', borderColor: 'var(--border-color)' }}>

      {/* Left: brand + doc title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded flex items-center justify-center"
               style={{ background: 'var(--text-primary)' }}>
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
              <path d="M4 3h8l4 4v10H4V3z" stroke="var(--bg-primary)" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M12 3v4h4" stroke="var(--bg-primary)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-semibold text-sm" style={{ fontFamily: 'Lora, serif', color: 'var(--text-primary)' }}>
            Inkspace
          </span>
        </div>

        {activeDocument && (
          <>
            <span style={{ color: 'var(--border-color)' }}>/</span>
            <span className="text-sm truncate max-w-[200px]" style={{ color: 'var(--text-secondary)' }}>
              {activeDocument.title}
            </span>
          </>
        )}
      </div>

      {/* Center: annotation tools + colors (only when doc open) */}
      {activeDocument && (
        <div className="flex items-center gap-1">
          {/* Annotation tools */}
          <div className="flex items-center gap-0.5 p-1 rounded-lg mr-2"
               style={{ background: 'var(--bg-secondary)' }}>
            {tools.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                title={label}
                onClick={() => setActiveTool(activeTool === id ? null : id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
                style={{
                  background: activeTool === id ? 'var(--card-bg)' : 'transparent',
                  color: activeTool === id ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: activeTool === id ? 'var(--shadow)' : 'none',
                }}>
                <Icon size={13} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Colors */}
          <div className="flex items-center gap-1 mr-3">
            {COLORS.map((c) => (
              <button
                key={c.id}
                title={c.label}
                onClick={() => setHighlightColor(c.id)}
                className="w-5 h-5 rounded-full transition-all duration-150"
                style={{
                  background: c.bg,
                  boxShadow: highlightColor === c.id ? `0 0 0 2px var(--bg-primary), 0 0 0 3.5px ${c.bg}` : 'none',
                  transform: highlightColor === c.id ? 'scale(1.2)' : 'scale(1)',
                }} />
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-5 mx-1" style={{ background: 'var(--border-color)' }} />

          {/* Page nav */}
          <div className="flex items-center gap-1">
            <ToolBtn icon={ChevronLeft} title="Prev page"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} />
            <span className="text-xs tabular-nums px-1" style={{ color: 'var(--text-secondary)' }}>
              {currentPage} / {totalPages || '—'}
            </span>
            <ToolBtn icon={ChevronRight} title="Next page"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} />
          </div>

          {/* Divider */}
          <div className="w-px h-5 mx-1" style={{ background: 'var(--border-color)' }} />

          {/* Zoom */}
          <div className="flex items-center gap-1">
            <ToolBtn icon={ZoomOut}    title="Zoom out" onClick={() => setScale(scale - 0.15)} />
            <button
              onClick={() => setScale(1.2)}
              className="text-xs tabular-nums px-1 rounded transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              title="Reset zoom">
              {Math.round(scale * 100)}%
            </button>
            <ToolBtn icon={ZoomIn}     title="Zoom in" onClick={() => setScale(scale + 0.15)} />
            <ToolBtn icon={Maximize2}  title="Fit width" onClick={() => setScale(1.0)} />
          </div>

          {/* Bookmark */}
          <div className="w-px h-5 mx-1" style={{ background: 'var(--border-color)' }} />
          <ToolBtn icon={Bookmark} title="Bookmark this page" onClick={onBookmark} />
        </div>
      )}

      {/* Right: theme + upload + logout */}
      <div className="flex items-center gap-1">
        {/* Theme switcher */}
        <div className="flex items-center gap-0.5 p-1 rounded-lg mr-1"
             style={{ background: 'var(--bg-secondary)' }}>
          {themes.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              title={label}
              onClick={() => setTheme(id)}
              className="p-1.5 rounded-md transition-all duration-150"
              style={{
                background: theme === id ? 'var(--card-bg)' : 'transparent',
                color: theme === id ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: theme === id ? 'var(--shadow)' : 'none',
              }}>
              <Icon size={13} />
            </button>
          ))}
        </div>

        <button
          onClick={onUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 hover:opacity-90"
          style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)' }}>
          <FileText size={13} />
          <span>Open PDF</span>
        </button>

        <ToolBtn icon={LogOut} title="Sign out" onClick={onLogout} />
      </div>
    </div>
  )
}

function ToolBtn({ icon: Icon, title, onClick }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="p-1.5 rounded-lg transition-all duration-150 hover:opacity-80"
      style={{ color: 'var(--text-muted)' }}>
      <Icon size={14} />
    </button>
  )
}
