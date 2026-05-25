// src/components/sidebar/LeftSidebar.jsx
import React, { useState } from 'react'
import { Search, Highlighter, Bookmark, MessageSquare, Trash2, ChevronRight, X } from 'lucide-react'
import { useStore } from '../../store/useStore'

const COLOR_MAP = {
  yellow: '#f5c842',
  green:  '#6abf7b',
  blue:   '#5b9bd5',
  pink:   '#e07db3',
}

export default function LeftSidebar({ onDeleteAnnotation, onDeleteBookmark }) {
  const {
    sidebarTab, setSidebarTab,
    annotations, notes, bookmarks,
    setCurrentPage, setSelectedAnnotation, selectedAnnotation,
    searchQuery, setSearchQuery,
  } = useStore()

  const tabs = [
    { id: 'annotations', icon: Highlighter, label: 'Annotations' },
    { id: 'bookmarks',   icon: Bookmark,    label: 'Bookmarks' },
    { id: 'search',      icon: Search,      label: 'Search' },
  ]

  // Filter
  const query = searchQuery.toLowerCase()

  const filteredAnnotations = annotations.filter((a) =>
    !query || a.text?.toLowerCase().includes(query) || notes[a.id]?.toLowerCase().includes(query)
  )

  const filteredBookmarks = bookmarks.filter((b) =>
    !query || b.label?.toLowerCase().includes(query) || String(b.page).includes(query)
  )

  return (
    <div className="flex flex-col h-full border-r animate-slide-in-left"
         style={{ width: 260, background: 'var(--sidebar-bg)', borderColor: 'var(--border-color)' }}>

      {/* Tabs */}
      <div className="flex border-b shrink-0" style={{ borderColor: 'var(--border-color)' }}>
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setSidebarTab(id)}
            title={label}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors border-b-2"
            style={{
              borderBottomColor: sidebarTab === id ? 'var(--text-primary)' : 'transparent',
              color: sidebarTab === id ? 'var(--text-primary)' : 'var(--text-muted)',
            }}>
            <Icon size={13} />
            <span className="hidden lg:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="px-3 py-2 border-b shrink-0" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
             style={{ background: 'var(--bg-tertiary)' }}>
          <Search size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search…"
            className="flex-1 text-xs bg-transparent outline-none min-w-0"
            style={{ color: 'var(--text-primary)' }} />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ color: 'var(--text-muted)' }}>
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">

        {sidebarTab === 'annotations' && (
          <div className="p-2 space-y-1">
            {filteredAnnotations.length === 0 && (
              <EmptyState
                icon={<Highlighter size={20} />}
                text={searchQuery ? 'No matches' : 'No annotations yet'}
                sub={searchQuery ? '' : 'Select text to highlight or underline'} />
            )}
            {filteredAnnotations.map((ann) => (
              <AnnotationCard
                key={ann.id}
                annotation={ann}
                note={notes[ann.id]}
                isSelected={selectedAnnotation?.id === ann.id}
                onClick={() => {
                  setSelectedAnnotation(ann)
                  setCurrentPage(ann.page)
                }}
                onDelete={() => onDeleteAnnotation(ann.id)} />
            ))}
          </div>
        )}

        {sidebarTab === 'bookmarks' && (
          <div className="p-2 space-y-1">
            {filteredBookmarks.length === 0 && (
              <EmptyState
                icon={<Bookmark size={20} />}
                text={searchQuery ? 'No matches' : 'No bookmarks yet'}
                sub={searchQuery ? '' : 'Click the bookmark icon to save a page'} />
            )}
            {filteredBookmarks.map((bm) => (
              <BookmarkCard
                key={bm.id}
                bookmark={bm}
                onClick={() => setCurrentPage(bm.page)}
                onDelete={() => onDeleteBookmark(bm.id)} />
            ))}
          </div>
        )}

        {sidebarTab === 'search' && (
          <div className="p-2 space-y-1">
            {!searchQuery && (
              <EmptyState icon={<Search size={20} />} text="Type to search" sub="Search across all annotations and bookmarks" />
            )}
            {searchQuery && filteredAnnotations.length === 0 && filteredBookmarks.length === 0 && (
              <EmptyState icon={<Search size={20} />} text="No results" sub={`No matches for "${searchQuery}"`} />
            )}
            {searchQuery && filteredAnnotations.map((ann) => (
              <AnnotationCard
                key={ann.id}
                annotation={ann}
                note={notes[ann.id]}
                isSelected={selectedAnnotation?.id === ann.id}
                onClick={() => { setSelectedAnnotation(ann); setCurrentPage(ann.page) }}
                onDelete={() => onDeleteAnnotation(ann.id)} />
            ))}
            {searchQuery && filteredBookmarks.map((bm) => (
              <BookmarkCard
                key={bm.id}
                bookmark={bm}
                onClick={() => setCurrentPage(bm.page)}
                onDelete={() => onDeleteBookmark(bm.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Footer count */}
      <div className="px-3 py-2 border-t shrink-0 text-xs" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
        {annotations.length} annotation{annotations.length !== 1 ? 's' : ''} · {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

function AnnotationCard({ annotation, note, isSelected, onClick, onDelete }) {
  const color = COLOR_MAP[annotation.color] || COLOR_MAP.yellow
  return (
    <div
      onClick={onClick}
      className="group flex gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all duration-150"
      style={{
        background: isSelected ? 'var(--bg-tertiary)' : 'transparent',
        border: `1px solid ${isSelected ? 'var(--border-color)' : 'transparent'}`,
      }}>
      <div className="shrink-0 mt-0.5 w-2.5 h-2.5 rounded-full mt-1" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs leading-relaxed line-clamp-2 mb-1"
           style={{ color: 'var(--text-primary)', fontFamily: annotation.type === 'highlight' ? 'inherit' : 'inherit' }}>
          {annotation.text || '(no text)'}
        </p>
        {note && (
          <p className="text-xs line-clamp-1 italic" style={{ color: 'var(--text-muted)' }}>
            {note}
          </p>
        )}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
            {annotation.type} · p.{annotation.page}
          </span>
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity shrink-0"
        style={{ color: 'var(--text-muted)' }}>
        <Trash2 size={11} />
      </button>
    </div>
  )
}

function BookmarkCard({ bookmark, onClick, onDelete }) {
  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[var(--bg-tertiary)]">
      <Bookmark size={13} style={{ color: '#f5c842', flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
          {bookmark.label || `Page ${bookmark.page}`}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Page {bookmark.page}</p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity shrink-0"
        style={{ color: 'var(--text-muted)' }}>
        <Trash2 size={11} />
      </button>
    </div>
  )
}

function EmptyState({ icon, text, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      <div className="mb-3 opacity-20" style={{ color: 'var(--text-secondary)' }}>{icon}</div>
      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{text}</p>
      {sub && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}
