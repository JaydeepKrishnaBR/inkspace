// src/lib/idb.js
// Stores PDF binary data locally in IndexedDB — no size limits, no Firebase Storage needed.

const DB_NAME    = 'inkspace-pdfs'
const STORE_NAME = 'pdfs'
const DB_VERSION = 1

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess  = (e) => resolve(e.target.result)
    req.onerror    = (e) => reject(e.target.error)
  })
}

export async function savePDFLocally(docId, arrayBuffer) {
  const db    = await openDB()
  const tx    = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  store.put(arrayBuffer, docId)
  return new Promise((res, rej) => {
    tx.oncomplete = res
    tx.onerror    = (e) => rej(e.target.error)
  })
}

export async function loadPDFLocally(docId) {
  const db    = await openDB()
  const tx    = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  const req   = store.get(docId)
  return new Promise((res, rej) => {
    req.onsuccess = (e) => res(e.target.result ?? null)   // ArrayBuffer or null
    req.onerror   = (e) => rej(e.target.error)
  })
}

export async function deletePDFLocally(docId) {
  const db    = await openDB()
  const tx    = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  store.delete(docId)
  return new Promise((res, rej) => {
    tx.oncomplete = res
    tx.onerror    = (e) => rej(e.target.error)
  })
}
