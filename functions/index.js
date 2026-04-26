/**
 * Kamplay — Cloud Functions
 *
 * Configuración de secretos (ejecutar UNA VEZ antes de deployar):
 *   firebase functions:config:set \
 *     stripe.secret_key="sk_live_..." \
 *     stripe.webhook_secret="whsec_..." \
 *     app.url="https://kamplay-7a007.web.app"
 *
 * Para test:
 *   firebase functions:config:set stripe.secret_key="sk_test_..."
 */

const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const Stripe    = require('stripe');

admin.initializeApp();
const db = admin.firestore();

// ─── Stripe init ─────────────────────────────────────────────────────────────
const stripe = Stripe(functions.config().stripe.secret_key, {
  apiVersion: '2023-10-16',
});

const APP_URL          = functions.config().app?.url || 'https://kamplay-7a007.web.app';
const WEBHOOK_SECRET   = functions.config().stripe?.webhook_secret;
const SUBSCRIPTION_PRICE_EUR_CENTS = 3000; // 30 €
const PLATFORM_FEE_PERCENT         = 0.01; // 1 %

// ─── Helpers ─────────────────────────────────────────────────────────────────
function assertAuth(context) {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Debes iniciar sesión.');
  }
}

async function getOrCreateStripeCustomer(uid, email) {
  const userRef  = db.doc(`usuarios/${uid}`);
  const userSnap = await userRef.get();
  const userData = userSnap.data() || {};

  if (userData.stripeCustomerId) return userData.stripeCustomerId;

  const customer = await stripe.customers.create({
    email,
    metadata: { firebaseUID: uid },
  });
  await userRef.set({ stripeCustomerId: customer.id }, { merge: true });
  return customer.id;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SUSCRIPCIÓN — Coordinador paga 30 €/mes para usar Kamplay
// ─────────────────────────────────────────────────────────────────────────────
exports.createSubscriptionCheckout = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    assertAuth(context);
    const { uid, token: { email } } = context.auth;

    const customerId = await getOrCreateStripeCustomer(uid, email);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Kamplay Pro — Coordinador',
            description: 'Acceso completo: campamentos ilimitados, acampados ilimitados y todas las funcionalidades.',
          },
          unit_amount: SUBSCRIPTION_PRICE_EUR_CENTS,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      success_url: `${APP_URL}/coordinator-dashboard?subscription=success`,
      cancel_url:  `${APP_URL}/coordinator-dashboard?subscription=cancelled`,
      metadata: { firebaseUID: uid },
      subscription_data: {
        metadata: { firebaseUID: uid },
      },
      allow_promotion_codes: true,
    });

    return { url: session.url, sessionId: session.id };
  });

// ─────────────────────────────────────────────────────────────────────────────
// 2. PORTAL DE FACTURACIÓN — Gestionar / cancelar suscripción
// ─────────────────────────────────────────────────────────────────────────────
exports.createBillingPortal = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    assertAuth(context);
    const { uid } = context.auth;

    const userSnap = await db.doc(`usuarios/${uid}`).get();
    const customerId = userSnap.data()?.stripeCustomerId;
    if (!customerId) {
      throw new functions.https.HttpsError('failed-precondition', 'No tienes una suscripción activa.');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${APP_URL}/coordinator-dashboard`,
    });

    return { url: session.url };
  });

// ─────────────────────────────────────────────────────────────────────────────
// 3. STRIPE CONNECT — Onboarding del coordinador como vendedor
// ─────────────────────────────────────────────────────────────────────────────
exports.createConnectAccountLink = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    assertAuth(context);
    const { uid, token: { email } } = context.auth;

    const userRef  = db.doc(`usuarios/${uid}`);
    const userSnap = await userRef.get();
    let connectId  = userSnap.data()?.stripeConnectId;

    if (!connectId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'ES',
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers:     { requested: true },
        },
        metadata: { firebaseUID: uid },
      });
      connectId = account.id;
      await userRef.set({ stripeConnectId: connectId, connectOnboarded: false }, { merge: true });
    }

    const accountLink = await stripe.accountLinks.create({
      account:     connectId,
      refresh_url: `${APP_URL}/coordinator-dashboard?connect=refresh`,
      return_url:  `${APP_URL}/coordinator-dashboard?connect=success`,
      type:        'account_onboarding',
    });

    return { url: accountLink.url, connectId };
  });

// ─────────────────────────────────────────────────────────────────────────────
// 4. PAGO DE INSCRIPCIÓN — El padre paga al coordinador (1% para Kamplay)
// ─────────────────────────────────────────────────────────────────────────────
exports.createCampPaymentIntent = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    assertAuth(context);
    const { uid } = context.auth;
    const { campId } = data;

    if (!campId) throw new functions.https.HttpsError('invalid-argument', 'campId es obligatorio.');

    // Obtener datos del campamento
    const campSnap = await db.doc(`campamentos/${campId}`).get();
    if (!campSnap.exists) throw new functions.https.HttpsError('not-found', 'Campamento no encontrado.');
    const camp = campSnap.data();

    const amount = camp.inscriptionFee; // en céntimos
    if (!amount || amount < 100) {
      throw new functions.https.HttpsError('failed-precondition', 'Este campamento no tiene configurada una cuota de inscripción.');
    }

    // Obtener cuenta Connect del coordinador
    const coordSnap = await db.doc(`usuarios/${camp.mainCoordinator}`).get();
    const connectId = coordSnap.data()?.stripeConnectId;
    if (!connectId) {
      throw new functions.https.HttpsError('failed-precondition', 'El coordinador no ha configurado los pagos todavía.');
    }

    const applicationFee = Math.round(amount * PLATFORM_FEE_PERCENT);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      application_fee_amount: applicationFee,
      transfer_data: { destination: connectId },
      metadata: { campId, parentUid: uid, campName: camp.name || '' },
    });

    // Registrar pago pendiente en Firestore
    await db.collection('pagos').add({
      campId,
      parentUid:      uid,
      campName:       camp.name || '',
      amount,
      applicationFee,
      connectId,
      status:          'pending',
      paymentIntentId: paymentIntent.id,
      createdAt:       admin.firestore.FieldValue.serverTimestamp(),
    });

    return { clientSecret: paymentIntent.client_secret };
  });

// ─────────────────────────────────────────────────────────────────────────────
// 5. WEBHOOK — Stripe → Firestore (suscripciones + pagos)
// ─────────────────────────────────────────────────────────────────────────────
exports.stripeWebhook = functions
  .region('europe-west1')
  .https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, WEBHOOK_SECRET);
    } catch (err) {
      console.error('⚠️  Webhook signature failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {

        // ── Suscripción activada por primera vez (checkout completado) ────────
        case 'checkout.session.completed': {
          const session = event.data.object;
          if (session.mode !== 'subscription') break;
          const uid = session.metadata?.firebaseUID;
          if (!uid) break;
          await db.doc(`usuarios/${uid}`).set({
            subscriptionStatus:    'active',
            stripeSubscriptionId:  session.subscription,
            subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
          console.log(`✅ Subscription activated for ${uid}`);
          break;
        }

        // ── Suscripción actualizada (renovación, cambio de estado) ────────────
        case 'customer.subscription.updated': {
          const sub      = event.data.object;
          const uid      = sub.metadata?.firebaseUID;
          const customer = uid ? null : await stripe.customers.retrieve(sub.customer);
          const resolvedUid = uid || customer?.metadata?.firebaseUID;
          if (!resolvedUid) break;
          await db.doc(`usuarios/${resolvedUid}`).set({
            subscriptionStatus:    sub.status, // active, past_due, canceled, trialing…
            subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
          console.log(`🔄 Subscription updated to "${sub.status}" for ${resolvedUid}`);
          break;
        }

        // ── Suscripción cancelada definitivamente ─────────────────────────────
        case 'customer.subscription.deleted': {
          const sub      = event.data.object;
          const uid      = sub.metadata?.firebaseUID;
          const customer = uid ? null : await stripe.customers.retrieve(sub.customer);
          const resolvedUid = uid || customer?.metadata?.firebaseUID;
          if (!resolvedUid) break;
          await db.doc(`usuarios/${resolvedUid}`).set({
            subscriptionStatus:    'canceled',
            subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
          console.log(`❌ Subscription canceled for ${resolvedUid}`);
          break;
        }

        // ── Pago de factura fallido ───────────────────────────────────────────
        case 'invoice.payment_failed': {
          const invoice  = event.data.object;
          const customer = await stripe.customers.retrieve(invoice.customer);
          const resolvedUid = customer?.metadata?.firebaseUID;
          if (!resolvedUid) break;
          await db.doc(`usuarios/${resolvedUid}`).set({
            subscriptionStatus:    'past_due',
            subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
          console.log(`⚠️ Invoice payment failed for ${resolvedUid}`);
          break;
        }

        // ── Connect: coordinador completó el onboarding ───────────────────────
        case 'account.updated': {
          const account = event.data.object;
          const uid = account.metadata?.firebaseUID;
          if (!uid) break;
          if (account.details_submitted && account.charges_enabled) {
            await db.doc(`usuarios/${uid}`).set({
              connectOnboarded: true,
            }, { merge: true });
            console.log(`✅ Connect onboarding complete for ${uid}`);
          }
          break;
        }

        // ── Pago de inscripción completado ────────────────────────────────────
        case 'payment_intent.succeeded': {
          const pi = event.data.object;
          if (!pi.metadata?.campId) break;
          const snap = await db.collection('pagos')
            .where('paymentIntentId', '==', pi.id)
            .limit(1)
            .get();
          if (!snap.empty) {
            await snap.docs[0].ref.update({
              status:    'paid',
              paidAt:    admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`💰 Payment succeeded for camp ${pi.metadata.campId}`);
          }
          break;
        }

        default:
          console.log(`Unhandled event: ${event.type}`);
      }
    } catch (err) {
      console.error('Error processing webhook event:', err);
      return res.status(500).send('Internal error');
    }

    res.json({ received: true });
  });
