// src/components/DocumentLibrary.jsx
import React, { useCallback } from 'react'
import { FileText, Trash2, Clock, Upload } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function DocumentLibrary({ documents, onOpen, onDelete, onUpload, uploading, uploadProgress }) {
  const { user } = useStore()

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type === 'application/pdf') onUpload(file)
  }, [onUpload])

  const handleDragOver = (e) => e.preventDefault()

  function handleFileInput(e) {
    const file = e.target.files[0]
    if (file) onUpload(file)
  }

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'Lora, serif', color: 'var(--text-primary)' }}>
            Your library
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {documents.length} document{documents.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Drop zone */}
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="block mb-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 hover:border-[var(--text-muted)]"
          style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
          <input type="file" accept=".pdf" className="hidden" onChange={handleFileInput} />

          <div className="flex flex-col items-center justify-center py-10 gap-3">
            {uploading ? (
              <>
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                     style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--text-secondary)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Uploading… {uploadProgress}%
                </p>
                <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
                  <div className="h-full rounded-full transition-all duration-300"
                       style={{ width: `${uploadProgress}%`, background: 'var(--text-secondary)' }} />
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ background: 'var(--bg-tertiary)' }}>
                  <Upload size={18} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Drop a PDF here, or click to upload
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    PDF files up to 20MB
                  </p>
                </div>
              </>
            )}
          </div>
        </label>

        {/* Documents grid */}
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                 style={{ background: 'var(--bg-secondary)' }}>
              <FileText size={28} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              No documents yet
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Upload your first PDF to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <DocCard
                key={doc.id}
                doc={doc}
                onOpen={() => onOpen(doc)}
                onDelete={() => onDelete(doc.id, doc.storagePath)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DocCard({ doc, onOpen, onDelete }) {
  const createdAt = doc.createdAt?.toDate?.() || (doc.createdAt ? new Date(doc.createdAt) : null)
  const dateStr = createdAt ? createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

  return (
    <div
      className="group relative rounded-2xl border p-4 cursor-pointer transition-all duration-200 hover:shadow-md"
      style={{
        background: 'var(--card-bg)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--shadow)',
      }}
      onClick={onOpen}>

      {/* Icon */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
             style={{ background: 'var(--bg-secondary)' }}>
          <FileText size={18} style={{ color: 'var(--text-secondary)' }} />
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all"
          style={{ color: 'var(--text-muted)' }}>
          <Trash2 size={13} />
        </button>
      </div>

      {/* Title */}
      <p className="text-sm font-medium leading-snug mb-2 line-clamp-2"
         style={{ color: 'var(--text-primary)', fontFamily: 'Lora, serif' }}>
        {doc.title}
      </p>

      {/* Meta */}
      {dateStr && (
        <div className="flex items-center gap-1">
          <Clock size={10} style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{dateStr}</span>
        </div>
      )}
    </div>
  )
}
