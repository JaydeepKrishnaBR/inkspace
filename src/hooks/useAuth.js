// src/hooks/useAuth.js
import { useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { useStore } from '../store/useStore'

export function useAuth() {
  const { user, setUser } = useStore()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return unsub
  }, [setUser])

  const login  = () => signInWithPopup(auth, googleProvider)
  const logout = () => signOut(auth)

  return { user, login, logout }
}
