// src/components/pdf/AnnotationLayer.jsx
import React, { useEffect, useState } from 'react'

const COLOR_MAP = {
  yellow: 'rgba(245, 200, 66, 0.35)',
  green:  'rgba(106, 191, 123, 0.35)',
  blue:   'rgba(91, 155, 213, 0.35)',
  pink:   'rgba(224, 125, 179, 0.35)',
}

const UNDERLINE_MAP = {
  yellow: '#d4a800',
  green:  '#3a9950',
  blue:   '#2a6fb5',
  pink:   '#c04090',
}

export default function AnnotationLayer({ annotations, selectedAnnotation, onAnnotationClick, pageRef }) {
  const [pageDims, setPageDims] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!pageRef) return
    const canvas = pageRef.querySelector('canvas')
    if (!canvas) return
    const update = () => setPageDims({ width: canvas.offsetWidth, height: canvas.offsetHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [pageRef])

  if (!pageDims.width || !pageDims.height) return null

  return (
    <div className="annotation-layer" style={{ pointerEvents: 'none' }}>
      {annotations.map((ann) =>
        (ann.rects || []).map((rect, i) => {
          const isSelected = selectedAnnotation?.id === ann.id
          const left   = rect.xPercent      * pageDims.width
          const top    = rect.yPercent       * pageDims.height
          const width  = rect.widthPercent   * pageDims.width
          const height = rect.heightPercent  * pageDims.height

          if (ann.type === 'underline') {
            return (
              <div
                key={`${ann.id}-${i}`}
                className={`underline-mark ${isSelected ? 'selected' : ''}`}
                style={{
                  left, top, width, height,
                  borderBottomColor: UNDERLINE_MAP[ann.color] || UNDERLINE_MAP.yellow,
                  pointerEvents: 'all',
                  cursor: 'pointer',
                }}
                onClick={() => onAnnotationClick(ann)}
              />
            )
          }

          return (
            <div
              key={`${ann.id}-${i}`}
              className={`highlight-mark ${isSelected ? 'selected' : ''}`}
              style={{
                left, top, width, height,
                background: COLOR_MAP[ann.color] || COLOR_MAP.yellow,
                pointerEvents: 'all',
              }}
              onClick={() => onAnnotationClick(ann)}
            />
          )
        })
      )}
    </div>
  )
}
