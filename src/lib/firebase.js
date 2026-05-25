// src/lib/firebase.js
import { initializeApp }          from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore }           from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyC1wcJp1Xdn0Kh3yBsqH6zQobJqF3esH6E",
  authDomain: "inkspace-app.firebaseapp.com",
  projectId: "inkspace-app",
  storageBucket: "inkspace-app.firebasestorage.app",
  messagingSenderId: "904175661287",
  appId: "1:904175661287:web:b4553df03a83aff9ebb242"
};

const app = initializeApp(firebaseConfig)
export const auth           = getAuth(app)
export const db             = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
