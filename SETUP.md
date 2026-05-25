# Inkspace — Setup Guide

> PDF annotation workspace. PDFs stored locally (IndexedDB). Annotations synced via Firestore.

---

## How storage works

| Data | Where |
|------|-------|
| PDF files | Browser IndexedDB (local, up to ~500MB+) |
| Document metadata | Firestore |
| Annotations, notes, bookmarks | Firestore (real-time sync) |

**No Firebase Storage needed.** PDFs live in your browser. Annotations and notes sync across sessions via Firestore.

> Note: PDFs are per-browser. If you open Inkspace on a different device/browser, you'll see your document list and all annotations, but will need to re-upload the PDF file there.

---

## Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- A **Google account** for Firebase

---

## Step 1 — Install

```bash
cd inkspace
npm install
```

---

## Step 2 — Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → name it (e.g. `inkspace-app`) → Create
3. Click the **web icon** (`</>`) → register app → copy the config object

---

## Step 3 — Enable Firebase services

### Authentication
Firebase Console → **Authentication** → Get started → **Google** → Enable → Save

### Firestore
Firebase Console → **Firestore Database** → Create database → **Start in test mode** → choose a region → Enable

> You do NOT need to enable Firebase Storage.

---

## Step 4 — Set up environment variables

```bash
cp .env.example .env
```

Fill in `.env` with your Firebase config values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=inkspace-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=inkspace-app
VITE_FIREBASE_STORAGE_BUCKET=inkspace-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
```

> `VITE_FIREBASE_STORAGE_BUCKET` is included in the Firebase config object but Storage is not enabled or used.

---

## Step 5 — Apply Firestore security rules

Firebase Console → **Firestore Database** → **Rules** tab → replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /documents/{docId} {
      allow read, write, delete: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }
    match /annotations/{annId} {
      allow read, write, delete: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }
    match /notes/{noteId} {
      allow read, write, delete: if request.auth != null;
    }
    match /bookmarks/{bmId} {
      allow read, write, delete: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

Click **Publish**.

---

## Step 6 — Run locally

```bash
npm run dev
# http://localhost:5173
```

---

## Step 7 — Deploy to Netlify (optional)

```bash
npm run build
```

Drag the `dist/` folder to [netlify.com](https://netlify.com) → Add new site → Deploy manually.

Then in Netlify → Site configuration → Environment variables, add all 6 `VITE_*` variables.

Finally, add your Netlify domain to Firebase Console → Authentication → Settings → Authorized domains.

---

## Troubleshooting

**"PDF not on this device"** — PDFs are stored in your browser's IndexedDB. Click "Re-upload PDF" and select the same file. Your annotations are intact in Firestore.

**"Firebase: Error (auth/popup-blocked)"** — Allow popups for localhost in browser settings.

**Annotations don't persist** — Check Firestore rules are published. Check browser console for errors.

**Build fails** — Ensure all 6 `.env` variables are set and `npm install` has been run.
