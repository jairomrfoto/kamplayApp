import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../config/firebase';

const fns = getFunctions(app, 'europe-west1');

// ── Embedded checkout — suscripción o evento ──────────────────────────────────
export async function startEmbeddedCheckout(params: {
  type: 'subscription';
  interval: 'month' | 'year';
} | {
  type: 'event';
  planType: 'standard' | 'express';
  campId: string;
}): Promise<{ clientSecret: string; sessionId: string }> {
  const fn = httpsCallable<object, { clientSecret: string; sessionId: string }>(
    fns, 'createEmbeddedCheckout'
  );
  const result = await fn(params);
  return result.data;
}

// ── Funciones originales (redirect) — se mantienen por compatibilidad ─────────
export async function startSubscriptionCheckout(
  interval: 'month' | 'year' = 'month'
): Promise<{ url: string; sessionId: string }> {
  const fn = httpsCallable<{ interval: string }, { url: string; sessionId: string }>(
    fns, 'createSubscriptionCheckout'
  );
  const result = await fn({ interval });
  return result.data;
}

export async function openBillingPortal(): Promise<{ url: string }> {
  const fn = httpsCallable<void, { url: string }>(fns, 'createBillingPortal');
  const result = await fn();
  return result.data;
}

export async function startEventCheckout(
  planType: 'standard' | 'express',
  campId: string
): Promise<{ url: string; sessionId: string }> {
  const fn = httpsCallable<{ planType: string; campId: string }, { url: string; sessionId: string }>(
    fns, 'createEventCheckout'
  );
  const result = await fn({ planType, campId });
  return result.data;
}

export async function createCampPaymentIntent(campId: string): Promise<{ clientSecret: string }> {
  const fn = httpsCallable<{ campId: string }, { clientSecret: string }>(fns, 'createCampPaymentIntent');
  const result = await fn({ campId });
  return result.data;
}
