// src/components/pdf/PDFViewer.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf' // <-- ensure pdfjs is imported here
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { useStore } from '../../store/useStore'
import FloatingToolbar from './FloatingToolbar'
import AnnotationLayer from './AnnotationLayer'

// Set the worker source exactly ONCE using unpkg (officially recommended by react-pdf)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function PDFViewer({ pdfUrl, onCreateAnnotation }) {
  const {
    currentPage, setCurrentPage, totalPages, setTotalPages,
    scale, annotations, selectedAnnotation, setSelectedAnnotation,
    activeTool, highlightColor, setNotesPanelOpen,
  } = useStore()

  const [pageWidth, setPageWidth] = useState(0)
  const [selection, setSelection] = useState(null)   // { text, rects, page }
  const [toolbarPos, setToolbarPos] = useState(null) // { x, y }
  const containerRef = useRef(null)
  const pageRefs = useRef({})

  // Observe container width
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(([entry]) => {
      setPageWidth(entry.contentRect.width - 64)
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Scroll to current page when it changes
  useEffect(() => {
    const el = pageRefs.current[currentPage]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [currentPage])

  // Intersection observer to track current page
  useEffect(() => {
    const refs = pageRefs.current
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.5) {
            setCurrentPage(Number(e.target.dataset.page))
          }
        })
      },
      { threshold: 0.5, root: containerRef.current }
    )
    Object.values(refs).forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [totalPages])

  function onDocumentLoad({ numPages }) {
    setTotalPages(numPages)
  }

  function handleMouseUp(pageNum) {
    if (!activeTool) return
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) { setSelection(null); setToolbarPos(null); return }
    const text = sel.toString().trim()
    if (!text) return

    const range = sel.getRangeAt(0)
    const rects = Array.from(range.getClientRects())
    if (rects.length === 0) return

    // Get page element bounding box for normalizing coords
    const pageEl = pageRefs.current[pageNum]
    if (!pageEl) return
    const pageBB = pageEl.getBoundingClientRect()

    const normalized = rects.map((r) => ({
      xPercent:      (r.left   - pageBB.left)   / pageBB.width,
      yPercent:      (r.top    - pageBB.top)    / pageBB.height,
      widthPercent:  r.width   / pageBB.width,
      heightPercent: r.height  / pageBB.height,
    }))

    // Toolbar position — above the first rect
    const firstRect = rects[0]
    setToolbarPos({ x: firstRect.left + firstRect.width / 2, y: firstRect.top - 8 })
    setSelection({ text, rects: normalized, page: pageNum })
  }

  async function applyAnnotation(type, color) {
    if (!selection) return
    const ann = {
      type,
      color: color || highlightColor,
      text: selection.text,
      page: selection.page,
      rects: selection.rects,
    }
    await onCreateAnnotation(ann)
    window.getSelection()?.removeAllRanges()
    setSelection(null)
    setToolbarPos(null)
  }

  function handleAnnotationClick(ann) {
    setSelectedAnnotation(ann)
    setNotesPanelOpen(true)
  }

  const pageAnnotations = useCallback(
    (pageNum) => annotations.filter((a) => a.page === pageNum),
    [annotations]
  )

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-8 py-6"
      style={{ background: 'var(--bg-secondary)' }}
      onMouseUp={(e) => {
        // find which page we're on
        const pageEl = e.target.closest('[data-page]')
        if (pageEl) handleMouseUp(Number(pageEl.dataset.page))
      }}>

      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoad}
        loading={<Loader />}
        error={<Error />}
        className="flex flex-col items-center gap-4">

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <div
            key={pageNum}
            data-page={pageNum}
            ref={(el) => (pageRefs.current[pageNum] = el)}
            className="relative"
            style={{ maxWidth: '100%' }}>

            <Page
              pageNumber={pageNum}
              width={pageWidth || 800}
              scale={scale}
              renderTextLayer
              renderAnnotationLayer={false}
              loading={<PagePlaceholder width={pageWidth} scale={scale} />}
            />

            {/* Annotation overlay */}
            <AnnotationLayer
              annotations={pageAnnotations(pageNum)}
              selectedAnnotation={selectedAnnotation}
              onAnnotationClick={handleAnnotationClick}
              pageRef={pageRefs.current[pageNum]}
            />
          </div>
        ))}
      </Document>

      {/* Floating toolbar */}
      {toolbarPos && selection && (
        <FloatingToolbar
          position={toolbarPos}
          activeTool={activeTool}
          highlightColor={highlightColor}
          onApply={applyAnnotation}
          onClose={() => { setSelection(null); setToolbarPos(null) }}
        />
      )}
    </div>
  )
}

function Loader() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mb-4"
           style={{ borderColor: 'var(--border-color)', borderTopColor: 'transparent' }} />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading PDF…</p>
    </div>
  )
}

function Error() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Failed to load PDF.</p>
    </div>
  )
}

function PagePlaceholder({ width, scale }) {
  const w = (width || 600) * (scale || 1)
  const h = w * 1.414
  return (
    <div style={{ width: w, height: h, background: 'var(--card-bg)', borderRadius: 4 }}
         className="animate-pulse" />
  )
}
