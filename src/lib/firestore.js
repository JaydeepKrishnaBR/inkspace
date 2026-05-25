// src/lib/firestore.js  — Firestore only, no Firebase Storage
import {
  collection, doc, addDoc, getDocs, deleteDoc,
  query, where, serverTimestamp, onSnapshot, setDoc, updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import { savePDFLocally, deletePDFLocally } from './idb'
import { auth } from './firebase'

// ── Documents ─────────────────────────────────────────────────────────────

/**
 * Save a PDF file:
 *  1. Store the raw bytes in IndexedDB (local, unlimited size)
 *  2. Store metadata (title, size, page count hint) in Firestore
 */
export async function uploadPDF(file, userId, onProgress) {
  // Read file into ArrayBuffer
  const arrayBuffer = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 70))
    }
    reader.onload  = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })

  onProgress && onProgress(75)

  // Save metadata to Firestore first to get an ID
  const docRef = await addDoc(collection(db, 'documents'), {
    userId,
    title:     file.name.replace(/\.pdf$/i, ''),
    fileSize:  file.size,
    createdAt: serverTimestamp(),
  })

  onProgress && onProgress(90)

  // Save binary to IndexedDB keyed by Firestore doc ID
  await savePDFLocally(docRef.id, arrayBuffer)

  onProgress && onProgress(100)

  return {
    id:        docRef.id,
    title:     file.name.replace(/\.pdf$/i, ''),
    fileSize:  file.size,
    createdAt: new Date(),
  }
}

export function subscribeDocuments(userId, callback) {
  const q = query(collection(db, 'documents'), where('userId', '==', userId))
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  )
}

export async function deleteDocument(docId) {
  await deleteDoc(doc(db, 'documents', docId))
  await deletePDFLocally(docId)

  // Also clean up annotations, notes, bookmarks for this doc
  const collections = ['annotations', 'notes', 'bookmarks']
  for (const col of collections) {
    const q    = query(collection(db, col), where('documentId', '==', docId))
    const snap = await getDocs(q)
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
  }
}

// ── Annotations ────────────────────────────────────────────────────────────

export async function saveAnnotation(annotation) {
  const ref_ = annotation.id
    ? doc(db, 'annotations', annotation.id)
    : doc(collection(db, 'annotations'))
  await setDoc(ref_, { ...annotation, updatedAt: serverTimestamp() }, { merge: true })
  return ref_.id
}

export function subscribeAnnotations(documentId, callback) {
  const q = query(collection(db, 'annotations'), where('documentId', '==', documentId))
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  )
}

export async function deleteAnnotation(annotationId) {
  await deleteDoc(doc(db, 'annotations', annotationId))
  const q    = query(collection(db, 'notes'), where('annotationId', '==', annotationId))
  const snap = await getDocs(q)
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
}

// ── Notes ──────────────────────────────────────────────────────────────────

export async function saveNote(annotationId, documentId, content) {
  const user = auth.currentUser

  if (!user) {
    throw new Error('User not authenticated')
  }

  const q = query(
    collection(db, 'notes'),
    where('annotationId', '==', annotationId),
    where('userId', '==', user.uid)
  )

  const snap = await getDocs(q)

  if (snap.empty) {
    await addDoc(collection(db, 'notes'), {
      annotationId,
      documentId,
      content,
      userId: user.uid,
      createdAt: serverTimestamp(),
    })
  } else {
    await updateDoc(snap.docs[0].ref, {
      content,
      updatedAt: serverTimestamp(),
    })
  }
}

export function subscribeNotes(documentId, callback) {
  const q = query(collection(db, 'notes'), where('documentId', '==', documentId))
  return onSnapshot(q, (snap) => {
    const notes = {}
    snap.docs.forEach((d) => { notes[d.data().annotationId] = d.data().content })
    callback(notes)
  })
}

// ── Bookmarks ──────────────────────────────────────────────────────────────

export async function saveBookmark(userId, documentId, page, label) {
  await addDoc(collection(db, 'bookmarks'), {
    userId, documentId, page, label, createdAt: serverTimestamp(),
  })
}

export function subscribeBookmarks(documentId, callback) {
  const q = query(collection(db, 'bookmarks'), where('documentId', '==', documentId))
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.page - b.page))
  )
}

export async function deleteBookmark(bookmarkId) {
  await deleteDoc(doc(db, 'bookmarks', bookmarkId))
}
