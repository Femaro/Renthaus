import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from './config'
import { User, UserRole } from './types'

export const signIn = async (email: string, password: string) => {
  if (!auth) throw new Error('Firebase Auth is not initialized')
  return await signInWithEmailAndPassword(auth, email, password)
}

export const signUp = async (
  email: string,
  password: string,
  displayName: string,
  role: UserRole
) => {
  if (!auth) throw new Error('Firebase Auth is not initialized')
  if (!db) throw new Error('Firestore is not initialized')
  
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user

  // Create user document in Firestore
  const userData: Omit<User, 'uid'> = {
    email: user.email!,
    displayName,
    role,
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
  }

  await setDoc(doc(db, 'users', user.uid), userData)

  return userCredential
}

export const signInWithGoogle = async () => {
  if (!auth) throw new Error('Firebase Auth is not initialized')
  const provider = new GoogleAuthProvider()
  return await signInWithPopup(auth, provider)
}

export const logout = async () => {
  if (!auth) throw new Error('Firebase Auth is not initialized')
  return await signOut(auth)
}

export const getUserData = async (uid: string): Promise<User | null> => {
  if (!db) return null
  const userDoc = await getDoc(doc(db, 'users', uid))
  if (userDoc.exists()) {
    return { uid, ...userDoc.data() } as User
  }
  return null
}

export const updateUserData = async (uid: string, data: Partial<User>) => {
  if (!db) throw new Error('Firestore is not initialized')
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: new Date(),
  })
}

export type { User as FirebaseUser } from 'firebase/auth'

