import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../config/firebase';

const fns = getFunctions(app, 'europe-west1');

// ── Plan Profesional — suscripción mensual o anual ────────────────────────────
export async function startSubscriptionCheckout(
  interval: 'month' | 'year' = 'month'
): Promise<{ clientSecret: string; sessionId: string }> {
  const fn = httpsCallable<
    { interval: string },
    { clientSecret: string; sessionId: string }
  >(fns, 'createSubscriptionCheckout');
  const result = await fn({ interval });
  return result.data;
}

export async function openBillingPortal(): Promise<{ url: string }> {
  const fn = httpsCallable<void, { url: string }>(fns, 'createBillingPortal');
  const result = await fn();
  return result.data;
}

// ── Plan por evento — Estándar (15 €) o Express (9 €) ─────────────────────────
export async function startEventCheckout(
  planType: 'standard' | 'express',
  campId: string
): Promise<{ clientSecret: string; sessionId: string }> {
  const fn = httpsCallable<
    { planType: string; campId: string },
    { clientSecret: string; sessionId: string }
  >(fns, 'createEventCheckout');
  const result = await fn({ planType, campId });
  return result.data;
}

export async function createCampPaymentIntent(campId: string): Promise<{ clientSecret: string }> {
  const fn = httpsCallable<{ campId: string }, { clientSecret: string }>(fns, 'createCampPaymentIntent');
  const result = await fn({ campId });
  return result.data;
}
