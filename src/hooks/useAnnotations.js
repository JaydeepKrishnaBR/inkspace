// src/hooks/useAnnotations.js
import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import {
  saveAnnotation, deleteAnnotation as fsDeleteAnnotation,
  subscribeAnnotations, subscribeNotes, subscribeBookmarks,
  saveNote, saveBookmark as fsSaveBookmark, deleteBookmark as fsDeleteBookmark,
} from '../lib/firestore'

export function useAnnotations() {
  const {
    activeDocument, user,
    annotations, setAnnotations,
    notes, updateAnnotationNote,
    bookmarks, setBookmarks, addBookmark, removeBookmark,
    addAnnotation, removeAnnotation,
  } = useStore()

  const savingRef = useRef({})

  // Subscribe to annotations
  useEffect(() => {
    if (!activeDocument?.id) return
    const unsub1 = subscribeAnnotations(activeDocument.id, setAnnotations)
    const unsub2 = subscribeNotes(activeDocument.id, (n) => {
      Object.entries(n).forEach(([id, content]) => updateAnnotationNote(id, content))
    })
    const unsub3 = subscribeBookmarks(activeDocument.id, setBookmarks)
    return () => { unsub1(); unsub2(); unsub3() }
  }, [activeDocument?.id])

  async function createAnnotation(data) {
    if (!activeDocument?.id || !user?.uid) return
    const ann = {
      ...data,
      documentId: activeDocument.id,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    }
    const id = await saveAnnotation(ann)
    return { ...ann, id }
  }

  async function deleteAnn(id) {
    removeAnnotation(id)
    await fsDeleteAnnotation(id)
  }

  async function saveAnnotationNote(annotationId, content) {
    updateAnnotationNote(annotationId, content)
    if (savingRef.current[annotationId]) clearTimeout(savingRef.current[annotationId])
    savingRef.current[annotationId] = setTimeout(() => {
      saveNote(annotationId, activeDocument.id, content)
    }, 500)
  }

  async function createBookmark(page, label) {
    if (!activeDocument?.id || !user?.uid) return
    addBookmark(page, label)
    await fsSaveBookmark(user.uid, activeDocument.id, page, label)
  }

  async function deleteBookmark(id) {
    removeBookmark(id)
    await fsDeleteBookmark(id)
  }

  return {
    annotations,
    notes,
    bookmarks,
    createAnnotation,
    deleteAnn,
    saveAnnotationNote,
    createBookmark,
    deleteBookmark,
  }
}
