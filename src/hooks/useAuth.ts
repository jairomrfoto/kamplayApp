import { useState, useEffect } from 'react';
import {
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendEmailVerification,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
} from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth, googleProvider } from '../config/firebase';

export function useAuth() {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Consume any pending redirect result (fallback path)
    getRedirectResult(auth).catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const signUp = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const resendVerification = async () => {
    const u = auth.currentUser;
    if (u && !u.emailVerified) await sendEmailVerification(u);
  };

  // Popup is the primary method (no third-party cookie issues).
  // COOP header "same-origin-allow-popups" is set in firebase.json.
  // Falls back to redirect only if the browser blocks the popup.
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, googleProvider);
        return null;
      }
      throw err;
    }
  };

  const sendPasswordReset = async (email: string) => {
    const fn = httpsCallable(getFunctions(undefined, 'europe-west1'), 'requestPasswordReset');
    await fn({ email });
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const u = auth.currentUser;
    if (!u || !u.email) throw new Error('No hay usuario autenticado');
    const credential = EmailAuthProvider.credential(u.email, currentPassword);
    await reauthenticateWithCredential(u, credential);
    await updatePassword(u, newPassword);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return {
    user, loading,
    signIn, signUp, resendVerification,
    signInWithGoogle, sendPasswordReset,
    changePassword, signOut,
  };
}
