import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore'
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
  
  try {
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

    try {
      await setDoc(doc(db, 'users', user.uid), userData)
    } catch (firestoreError) {
      console.error('Error creating user document in Firestore:', firestoreError)
      // Don't throw - user is created in Auth, document can be created later
      // This allows user to log in even if Firestore write fails
    }

    return userCredential
  } catch (error: any) {
    // Re-throw with more helpful error message
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please log in instead.')
    }
    if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use at least 6 characters.')
    }
    if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.')
    }
    throw error
  }
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

export const createUserDocumentIfMissing = async (firebaseUser: any): Promise<User> => {
  if (!db) throw new Error('Firestore is not initialized')
  if (!firebaseUser) throw new Error('No user provided')

  const userDocRef = doc(db, 'users', firebaseUser.uid)
  const userDoc = await getDoc(userDocRef)

  if (!userDoc.exists()) {
    // Create user document with default customer role
    const userData: Omit<User, 'uid'> = {
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      role: 'customer', // Default role
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    await setDoc(userDocRef, userData)
    return { uid: firebaseUser.uid, ...userData }
  }

  return { uid: firebaseUser.uid, ...userDoc.data() } as User
}

export type { User as FirebaseUser } from 'firebase/auth'

