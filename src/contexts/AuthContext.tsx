'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types/firestore';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const createUserDocument = useCallback(async (firebaseUser: FirebaseUser, displayName?: string) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUserData(userDoc.data() as User);
        return;
      }
    } catch {
      // Continue to create default profile
    }
    
    const newUser: User = {
      uid: firebaseUser.uid,
      displayName: displayName || firebaseUser.displayName || 'User',
      email: firebaseUser.email || '',
      photoURL: firebaseUser.photoURL || undefined,
      engineeringField: '',
      experienceLevel: 'Beginner',
      learningGoals: [],
      preferredLearningStyle: 'Mixed',
      dailyGoal: 30,
      xp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      onboardingCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    try {
      await setDoc(userRef, newUser, { merge: true });
    } catch (e) {
      console.warn('Set user document fallback:', e);
    }
    setUserData(newUser);
  }, []);

  const loadUserData = useCallback(async (uid: string, firebaseUser?: FirebaseUser) => {
    try {
      if (auth.currentUser) {
        try {
          await auth.currentUser.getIdToken();
        } catch {
          // Token refresh failed (e.g. offline), continue with local cached session
        }
      }
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as User;
        setUserData(data);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`bloom_user_${uid}`, JSON.stringify(data));
          } catch {
            // localStorage full or unavailable
          }
        }
      } else if (firebaseUser) {
        await createUserDocument(firebaseUser);
      }
    } catch (error) {
      console.warn('Notice: Firestore user document query (offline or initial state):', error);

      // Attempt to load cached user data from localStorage
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(`bloom_user_${uid}`);
        if (cached) {
          try {
            setUserData(JSON.parse(cached));
            return;
          } catch {
            // cache parse error
          }
        }
      }

      // If no cache, build default local user profile so app functions seamlessly offline
      if (firebaseUser) {
        const fallbackUser: User = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Learner',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || undefined,
          engineeringField: 'Computer Science',
          experienceLevel: 'Beginner',
          learningGoals: [],
          preferredLearningStyle: 'Mixed',
          dailyGoal: 30,
          xp: 100,
          level: 1,
          currentStreak: 1,
          longestStreak: 1,
          onboardingCompleted: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUserData(fallbackUser);
      }
    }
  }, [createUserDocument]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        await loadUserData(firebaseUser.uid, firebaseUser);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [loadUserData]);

  const refreshUserData = async () => {
    if (user) {
      await loadUserData(user.uid, user);
    }
  };

  const signIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await createUserDocument(userCredential.user);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserDocument(userCredential.user, displayName);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const userCredential = await signInWithPopup(auth, provider);
      await createUserDocument(userCredential.user);
    } catch (err: unknown) {
      if (err instanceof Error && (err.message.includes('popup') || err.message.includes('closed') || err.message.includes('Cross-Origin-Opener-Policy'))) {
        const { signInWithRedirect } = await import('firebase/auth');
        await signInWithRedirect(auth, provider);
        return;
      }
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserData(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      resetPassword,
      signOut,
      refreshUserData,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}