// src/App.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useAuth }        from './hooks/useAuth'
import { useAnnotations } from './hooks/useAnnotations'
import { useStore }       from './store/useStore'
import { subscribeDocuments, uploadPDF, deleteDocument } from './lib/firestore'
import { loadPDFLocally } from './lib/idb'

import LoginPage       from './components/LoginPage'
import TopToolbar      from './components/layout/TopToolbar'
import LeftSidebar     from './components/sidebar/LeftSidebar'
import NotesPanel      from './components/sidebar/NotesPanel'
import PDFViewer       from './components/pdf/PDFViewer'
import DocumentLibrary from './components/DocumentLibrary'
import BookmarkModal   from './components/ui/BookmarkModal'

// Init theme from localStorage
const savedTheme = localStorage.getItem('inkspace-theme') || 'light'
if (savedTheme !== 'light') document.documentElement.classList.add(savedTheme)

export default function App() {
  const { user, login, logout } = useAuth()
  const {
    activeDocument, setActiveDocument,
    documents, setDocuments,
    notesPanelOpen, setNotesPanelOpen,
    currentPage,
  } = useStore()
  const { createAnnotation, deleteAnn, saveAnnotationNote, createBookmark, deleteBookmark } = useAnnotations()

  const [uploading,       setUploading]       = useState(false)
  const [uploadProgress,  setUploadProgress]  = useState(0)
  const [bookmarkModal,   setBookmarkModal]   = useState(false)
  const [pdfObjectUrl,    setPdfObjectUrl]    = useState(null)   // blob URL for the viewer
  const [pdfLoading,      setPdfLoading]      = useState(false)
  const [missingLocally,  setMissingLocally]  = useState(false)  // PDF not in this browser
  const fileInputRef = useRef(null)

  // Subscribe to documents once user is set
  useEffect(() => {
    if (!user) return
    const unsub = subscribeDocuments(user.uid, setDocuments)
    return unsub
  }, [user?.uid])

  // When active document changes, load PDF from IndexedDB
  useEffect(() => {
    if (!activeDocument) { setPdfObjectUrl(null); setMissingLocally(false); return }

    let objectUrl = null
    setPdfLoading(true)
    setMissingLocally(false)

    loadPDFLocally(activeDocument.id).then((buffer) => {
      if (!buffer) {
        // PDF was uploaded on another device/browser — not available locally
        setMissingLocally(true)
        setPdfLoading(false)
        return
      }
      const blob = new Blob([buffer], { type: 'application/pdf' })
      objectUrl  = URL.createObjectURL(blob)
      setPdfObjectUrl(objectUrl)
      setPdfLoading(false)
    }).catch(() => {
      setMissingLocally(true)
      setPdfLoading(false)
    })

    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [activeDocument?.id])

  async function handleUpload(file) {
    if (!file || file.type !== 'application/pdf') return alert('Please select a PDF file.')
    if (file.size > 100 * 1024 * 1024) return alert('File must be under 100MB.')
    setUploading(true)
    setUploadProgress(0)
    try {
      const doc = await uploadPDF(file, user.uid, setUploadProgress)
      setActiveDocument(doc)
    } catch (e) {
      console.error(e)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  function triggerUpload() { fileInputRef.current?.click() }

  function handleFileInput(e) {
    const file = e.target.files[0]
    if (file) handleUpload(file)
    e.target.value = ''
  }

  // Re-upload a PDF that's missing locally (opened on another device)
  async function handleReUploadForDoc(file) {
    if (!file || !activeDocument) return
    const { savePDFLocally } = await import('./lib/idb')
    const arrayBuffer = await file.arrayBuffer()
    await savePDFLocally(activeDocument.id, arrayBuffer)
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
    const url  = URL.createObjectURL(blob)
    setPdfObjectUrl(url)
    setMissingLocally(false)
  }

  async function handleDeleteDoc(docId) {
    if (!confirm('Delete this document and all its annotations?')) return
    await deleteDocument(docId)
    if (activeDocument?.id === docId) setActiveDocument(null)
  }

  async function handleSaveBookmark(label) {
    await createBookmark(currentPage, label)
    setBookmarkModal(false)
  }

  if (!user) return <LoginPage onLogin={login} />

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg-primary)' }}>
      <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileInput} />

      <TopToolbar
        onLogout={logout}
        onUpload={triggerUpload}
        onBookmark={() => setBookmarkModal(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {activeDocument && (
          <LeftSidebar
            onDeleteAnnotation={deleteAnn}
            onDeleteBookmark={deleteBookmark}
          />
        )}

        {activeDocument ? (
          pdfLoading ? (
            <Loader />
          ) : missingLocally ? (
            <MissingPDFScreen
              doc={activeDocument}
              onReUpload={handleReUploadForDoc}
              onBack={() => setActiveDocument(null)}
            />
          ) : (
            <PDFViewer
              pdfUrl={pdfObjectUrl}
              onCreateAnnotation={createAnnotation}
            />
          )
        ) : (
          <DocumentLibrary
            documents={documents}
            onOpen={setActiveDocument}
            onDelete={handleDeleteDoc}
            onUpload={handleUpload}
            uploading={uploading}
            uploadProgress={uploadProgress}
          />
        )}

        {activeDocument && notesPanelOpen && (
          <NotesPanel onSaveNote={saveAnnotationNote} />
        )}
      </div>

      {bookmarkModal && (
        <BookmarkModal
          page={currentPage}
          onSave={handleSaveBookmark}
          onClose={() => setBookmarkModal(false)}
        />
      )}
    </div>
  )
}

function Loader() {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
             style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--text-secondary)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading PDF…</p>
      </div>
    </div>
  )
}

function MissingPDFScreen({ doc, onReUpload, onBack }) {
  const inputRef = useRef(null)
  return (
    <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
      <div className="rounded-2xl border p-8 text-center max-w-sm"
           style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
        <div className="text-3xl mb-3">📄</div>
        <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Lora, serif' }}>
          PDF not on this device
        </h2>
        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-secondary)' }}>{doc.title}</strong> was uploaded on another browser or device. 
          Re-upload the same PDF file to view it here — your annotations are safe.
        </p>
        <input ref={inputRef} type="file" accept=".pdf" className="hidden"
               onChange={(e) => e.target.files[0] && onReUpload(e.target.files[0])} />
        <div className="flex gap-2">
          <button onClick={onBack}
                  className="flex-1 py-2 rounded-xl text-sm font-medium"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
            Back
          </button>
          <button onClick={() => inputRef.current?.click()}
                  className="flex-1 py-2 rounded-xl text-sm font-medium"
                  style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)' }}>
            Re-upload PDF
          </button>
        </div>
      </div>
    </div>
  )
}
