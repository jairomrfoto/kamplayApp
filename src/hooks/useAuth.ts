import { useState, useEffect } from 'react';
import {
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  type User
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    await signInWithRedirect(auth, googleProvider);
    // Page redirects to Google — execution stops here
  };

  const getGoogleRedirectResult = async () => {
    return await getRedirectResult(auth);
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    getGoogleRedirectResult,
    signOut
  };
}