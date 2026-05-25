// src/store/useStore.js
import { create } from 'zustand'

export const useStore = create((set, get) => ({
  // ── Auth ──────────────────────────────────────────────
  user: null,
  setUser: (user) => set({ user }),

  // ── Theme ─────────────────────────────────────────────
  theme: 'light', // 'light' | 'dark' | 'sepia'
  setTheme: (theme) => {
    set({ theme })
    const root = document.documentElement
    root.classList.remove('dark', 'sepia')
    if (theme === 'dark')  root.classList.add('dark')
    if (theme === 'sepia') root.classList.add('sepia')
    localStorage.setItem('inkspace-theme', theme)
  },

  // ── Documents ─────────────────────────────────────────
  documents: [],
  activeDocument: null,
  setDocuments: (docs) => set({ documents: docs }),
  setActiveDocument: (doc) => set({ activeDocument: doc, annotations: [], notes: {}, currentPage: 1 }),

  // ── PDF Viewer ─────────────────────────────────────────
  currentPage: 1,
  totalPages: 0,
  scale: 1.2,
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (n) => set({ totalPages: n }),
  setScale: (scale) => set({ scale: Math.min(Math.max(scale, 0.5), 3) }),

  // ── Annotations ───────────────────────────────────────
  annotations: [],           // array of annotation objects
  notes: {},                 // { annotationId: noteContent }
  selectedAnnotation: null,
  setAnnotations: (annotations) => set({ annotations }),
  addAnnotation: (ann) => set((s) => ({ annotations: [...s.annotations, ann] })),
  removeAnnotation: (id) => set((s) => ({
    annotations: s.annotations.filter((a) => a.id !== id),
    notes: Object.fromEntries(Object.entries(s.notes).filter(([k]) => k !== id)),
    selectedAnnotation: s.selectedAnnotation?.id === id ? null : s.selectedAnnotation,
  })),
  updateAnnotationNote: (id, content) => set((s) => ({ notes: { ...s.notes, [id]: content } })),
  setSelectedAnnotation: (ann) => set({ selectedAnnotation: ann }),

  // ── Bookmarks ─────────────────────────────────────────
  bookmarks: [],
  addBookmark: (page, label) => set((s) => {
    if (s.bookmarks.find((b) => b.page === page)) return s
    return { bookmarks: [...s.bookmarks, { id: crypto.randomUUID(), page, label }] }
  }),
  removeBookmark: (id) => set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) })),
  setBookmarks: (bookmarks) => set({ bookmarks }),

  // ── UI State ───────────────────────────────────────────
  sidebarTab: 'annotations',  // 'annotations' | 'bookmarks' | 'search'
  notesPanelOpen: false,
  searchQuery: '',
  highlightColor: 'yellow',
  activeTool: 'highlight',    // 'highlight' | 'underline' | 'note' | null
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  setNotesPanelOpen: (open) => set({ notesPanelOpen: open }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setHighlightColor: (color) => set({ highlightColor: color }),
  setActiveTool: (tool) => set({ activeTool: tool }),
}))
