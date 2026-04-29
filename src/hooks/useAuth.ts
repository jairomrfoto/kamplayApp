import { useState, useEffect } from 'react';
import {
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

export function useAuth() {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Consume any pending Google redirect result first
    getRedirectResult(auth).catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Login only — never creates an account
  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  // Register — creates account; Cloud Function onUserCreated sends the branded email
  const signUp = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  // Resend: fall back to Firebase's built-in if SMTP not yet configured
  const resendVerification = async () => {
    const u = auth.currentUser;
    if (u && !u.emailVerified) await sendEmailVerification(u);
  };

  // Redirect flow — avoids popup COOP issues entirely
  const signInWithGoogle = async () => {
    await signInWithRedirect(auth, googleProvider);
    // Page will reload after Google redirects back; onAuthStateChanged picks up the user
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
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
