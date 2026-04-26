import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../config/firebase';

const fns = getFunctions(app, 'europe-west1');

// ── Coordinator subscription ──────────────────────────────────────────────────
export async function startSubscriptionCheckout(): Promise<{ url: string; sessionId: string }> {
  const fn = httpsCallable<void, { url: string; sessionId: string }>(fns, 'createSubscriptionCheckout');
  const result = await fn();
  return result.data;
}

export async function openBillingPortal(): Promise<{ url: string }> {
  const fn = httpsCallable<void, { url: string }>(fns, 'createBillingPortal');
  const result = await fn();
  return result.data;
}

// ── Stripe Connect onboarding ─────────────────────────────────────────────────
export async function startConnectOnboarding(): Promise<{ url: string; connectId: string }> {
  const fn = httpsCallable<void, { url: string; connectId: string }>(fns, 'createConnectAccountLink');
  const result = await fn();
  return result.data;
}

// ── Parent inscription payment ────────────────────────────────────────────────
export async function createCampPaymentIntent(campId: string): Promise<{ clientSecret: string }> {
  const fn = httpsCallable<{ campId: string }, { clientSecret: string }>(fns, 'createCampPaymentIntent');
  const result = await fn({ campId });
  return result.data;
}
