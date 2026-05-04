/**
 * Kamplay — Cloud Functions  (redeploy: 2026-05-01b)
 *
 * ── Secretos (Google Secret Manager) — ejecutar UNA VEZ en tu terminal: ──────
 *   firebase functions:secrets:set STRIPE_SECRET_KEY
 *   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
 *   firebase functions:secrets:set SMTP_PASS
 *   firebase functions:secrets:set ANTHROPIC_KEY
 *
 *   Cada comando te pedirá el valor de forma interactiva (no queda en el historial).
 *
 * ── Configuración no sensible — crea el archivo functions/.env: ───────────────
 *   APP_URL=https://kamplay.es
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=587
 *   SMTP_USER=tu@gmail.com
 *   SMTP_FROM=Kamplay <noreply@kamplay.es>
 *
 * ── SMTP_PASS debe ser una Contraseña de Aplicación de Google: ────────────────
 *   Google Account → Seguridad → Verificación en 2 pasos → Contraseñas de app
 */

const functions  = require('firebase-functions');
const { defineSecret } = require('firebase-functions/params');
const admin      = require('firebase-admin');
const nodemailer = require('nodemailer');
const Stripe     = require('stripe');

admin.initializeApp();
const db = admin.firestore();

// ── Secrets (Google Secret Manager) ──────────────────────────────────────────
const STRIPE_SECRET_KEY     = defineSecret('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET');
const SMTP_PASS             = defineSecret('SMTP_PASS');
const ANTHROPIC_KEY         = defineSecret('ANTHROPIC_KEY');

// ── Non-sensitive config via process.env (functions/.env) ─────────────────────
const appUrl   = () => process.env.APP_URL   || 'https://kamplay.es';
const smtpHost = () => process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = () => Number(process.env.SMTP_PORT || 587);
const smtpUser = () => process.env.SMTP_USER || '';
const smtpFrom = () => process.env.SMTP_FROM || `Kamplay <${smtpUser()}>`;

const SUBSCRIPTION_MONTHLY_CENTS = 3000;  // 30 €/mes
const SUBSCRIPTION_ANNUAL_CENTS  = 25000; // 250 €/año
const STANDARD_EVENT_CENTS       = 1500;  // 15 € — hasta 7 días
const EXPRESS_EVENT_CENTS        = 900;   // 9 €  — hasta 3 días
const PLATFORM_FEE_PERCENT       = 0.01;  // 1 %

// ── Stripe (lazy — secret only available at runtime) ─────────────────────────
let _stripe = null;
function getStripe() {
  if (!_stripe) _stripe = Stripe(STRIPE_SECRET_KEY.value(), { apiVersion: '2023-10-16' });
  return _stripe;
}

// ── SMTP transporter (lazy) ───────────────────────────────────────────────────
let _transporter = null;
function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host:   smtpHost(),
      port:   smtpPort(),
      secure: false,
      auth: { user: smtpUser(), pass: SMTP_PASS.value() },
    });
  }
  return _transporter;
}

// ── Email HTML template ───────────────────────────────────────────────────────
function buildVerificationEmail(verificationLink) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Activa tu cuenta de Kamplay</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);">
        <tr>
          <td style="background:#f97316;padding:32px 40px;text-align:center;">
            <p style="margin:0;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">⛺ Kamplay</p>
            <p style="margin:6px 0 0;font-size:13px;color:#fed7aa;font-weight:500;">Tu pasión, su felicidad</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111827;">Activa tu cuenta</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
              Gracias por registrarte en Kamplay. Para empezar a gestionar tu campamento o campus de verano, confirma tu dirección de correo haciendo clic en el botón:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center" style="padding:8px 0 32px;">
                <a href="${verificationLink}"
                   style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:12px;">
                  Verificar mi correo
                </a>
              </td></tr>
            </table>
            <p style="margin:0 0 8px;font-size:13px;color:#6b7280;line-height:1.5;">
              Si el botón no funciona, copia y pega este enlace en tu navegador:
            </p>
            <p style="margin:0 0 32px;font-size:12px;color:#9ca3af;word-break:break-all;">${verificationLink}</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px 20px;">
                <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
                  ⏱ Este enlace es válido durante <strong>24 horas</strong>. Si no has creado esta cuenta, puedes ignorar este correo.
                </p>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:24px 40px;border-top:1px solid #f3f4f6;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              © ${year} Kamplay · <a href="https://kamplay.es" style="color:#f97316;text-decoration:none;">kamplay.es</a>
            </p>
            <p style="margin:6px 0 0;font-size:11px;color:#d1d5db;">
              Recibes este correo porque alguien solicitó crear una cuenta con esta dirección.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
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
  const customer = await getStripe().customers.create({
    email,
    metadata: { firebaseUID: uid },
  });
  await userRef.set({ stripeCustomerId: customer.id }, { merge: true });
  return customer.id;
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — list all users (Auth + Firestore merge, bypasses security rules)
// ─────────────────────────────────────────────────────────────────────────────
exports.adminListUsers = functions
  .region('europe-west1')
  .https.onCall(async (_data, context) => {
    assertAuth(context);

    // Verify caller is admin
    const adminDoc = await db.doc(`admins/${context.auth.uid}`).get();
    if (!adminDoc.exists) {
      throw new functions.https.HttpsError('permission-denied', 'Solo el administrador puede usar esta función.');
    }

    // Collect all Auth users (paginated, max 1000 per page)
    const authUsers = [];
    let pageToken;
    do {
      const result = await admin.auth().listUsers(1000, pageToken);
      authUsers.push(...result.users);
      pageToken = result.pageToken;
    } while (pageToken);

    // Bulk-fetch Firestore profiles
    const uids = authUsers.map(u => u.uid);
    const profileSnaps = await Promise.all(
      uids.map(uid => db.doc(`usuarios/${uid}`).get())
    );
    const profileMap = {};
    profileSnaps.forEach(snap => {
      if (snap.exists) profileMap[snap.id] = snap.data();
    });

    return authUsers.map(authUser => {
      const profile = profileMap[authUser.uid] || {};
      return {
        uid:                authUser.uid,
        email:              authUser.email || profile.email || '',
        nombre:             profile.nombre || authUser.displayName || '',
        role:               profile.role || '',
        subscriptionStatus: profile.subscriptionStatus || '',
        campId:             profile.campId || '',
        emailVerified:      authUser.emailVerified,
        createdAt:          authUser.metadata.creationTime || null,
        lastSeen:           authUser.metadata.lastSignInTime || null,
        hasProfile:         !!profileMap[authUser.uid],
      };
    });
  });

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — update a user's profile fields (bypasses security rules)
// ─────────────────────────────────────────────────────────────────────────────
exports.adminUpdateUser = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    assertAuth(context);

    const adminDoc = await db.doc(`admins/${context.auth.uid}`).get();
    if (!adminDoc.exists) {
      throw new functions.https.HttpsError('permission-denied', 'Solo el administrador puede usar esta función.');
    }

    const { uid, fields } = data;
    if (!uid || typeof fields !== 'object') {
      throw new functions.https.HttpsError('invalid-argument', 'Faltan uid o fields.');
    }

    await db.doc(`usuarios/${uid}`).set(fields, { merge: true });
    return { ok: true };
  });


exports.onUserCreated = functions
  .runWith({ secrets: ['SMTP_PASS'] })
  .auth.user().onCreate(async (user) => {
    if (user.emailVerified || !user.email) return null;

    const smtpUserVal = smtpUser();
    const smtpPassVal = SMTP_PASS.value();

    if (!smtpUserVal || !smtpPassVal) {
      console.warn('SMTP no configurado (SMTP_USER / SMTP_PASS). Firebase enviará su propio correo.');
      return null;
    }

    try {
      const verificationLink = await admin.auth().generateEmailVerificationLink(
        user.email,
        { url: appUrl() + '/login', handleCodeInApp: false }
      );
      await getTransporter().sendMail({
        from:    smtpFrom(),
        to:      user.email,
        subject: 'Activa tu cuenta de Kamplay',
        html:    buildVerificationEmail(verificationLink),
      });
      console.log(`✅ Verification email sent to ${user.email}`);
    } catch (err) {
      console.error('Error sending verification email:', err);
    }

    return null;
  });

// ─────────────────────────────────────────────────────────────────────────────
// 1. SUSCRIPCIÓN — Plan Profesional 30 €/mes o 250 €/año
// ─────────────────────────────────────────────────────────────────────────────
exports.createSubscriptionCheckout = functions
  .region('europe-west1')
  .runWith({ secrets: ['STRIPE_SECRET_KEY'] })
  .https.onCall(async (data, context) => {
    assertAuth(context);
    const { uid, token: { email } } = context.auth;
    const interval = data && data.interval === 'year' ? 'year' : 'month';
    const amount   = interval === 'year' ? SUBSCRIPTION_ANNUAL_CENTS : SUBSCRIPTION_MONTHLY_CENTS;
    const customerId = await getOrCreateStripeCustomer(uid, email);
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Kamplay Profesional — ${interval === 'year' ? 'Anual' : 'Mensual'}`,
            description: 'Uso ilimitado de todas las funciones: campamentos, campus, escáner de documentos y gestión completa.',
          },
          unit_amount: amount,
          recurring: { interval },
        },
        quantity: 1,
      }],
      success_url: `${appUrl()}/coordinator-dashboard?subscription=success`,
      cancel_url:  `${appUrl()}/coordinator-dashboard?subscription=cancelled`,
      metadata: { firebaseUID: uid },
      subscription_data: { metadata: { firebaseUID: uid } },
      allow_promotion_codes: true,
    });
    return { url: session.url, sessionId: session.id };
  });

// ─────────────────────────────────────────────────────────────────────────────
// 2. PAGO POR EVENTO — Estándar 15 € (7 días) o Express 9 € (3 días)
// ─────────────────────────────────────────────────────────────────────────────
exports.createEventCheckout = functions
  .region('europe-west1')
  .runWith({ secrets: ['STRIPE_SECRET_KEY'] })
  .https.onCall(async (data, context) => {
    assertAuth(context);
    const { uid, token: { email } } = context.auth;
    const { planType, campId } = data || {};
    if (!planType || !campId) {
      throw new functions.https.HttpsError('invalid-argument', 'Faltan planType o campId.');
    }
    if (!['standard', 'express'].includes(planType)) {
      throw new functions.https.HttpsError('invalid-argument', 'planType debe ser standard o express.');
    }

    const amount      = planType === 'standard' ? STANDARD_EVENT_CENTS : EXPRESS_EVENT_CENTS;
    const label       = planType === 'standard' ? 'Estándar (hasta 7 días)' : 'Express (hasta 3 días)';
    const customerId  = await getOrCreateStripeCustomer(uid, email);

    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Kamplay ${label}`,
            description: `Licencia de evento para un campamento o campus. ${planType === 'standard' ? 'Editable hasta 7 días después del evento.' : 'Editable hasta 2 días después del evento.'}`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      allow_promotion_codes: true,
      success_url: `${appUrl()}/coordinator-dashboard?event=success&campId=${campId}`,
      cancel_url:  `${appUrl()}/create-camp?event=cancelled`,
      metadata: { firebaseUID: uid, campId, planType },
    });
    return { url: session.url, sessionId: session.id };
  });

// ─────────────────────────────────────────────────────────────────────────────
// 2. PORTAL DE FACTURACIÓN
// ─────────────────────────────────────────────────────────────────────────────
exports.createBillingPortal = functions
  .region('europe-west1')
  .runWith({ secrets: ['STRIPE_SECRET_KEY'] })
  .https.onCall(async (data, context) => {
    assertAuth(context);
    const { uid } = context.auth;
    const userSnap = await db.doc(`usuarios/${uid}`).get();
    const customerId = userSnap.data()?.stripeCustomerId;
    if (!customerId) {
      throw new functions.https.HttpsError('failed-precondition', 'No tienes una suscripción activa.');
    }
    const session = await getStripe().billingPortal.sessions.create({
      customer:   customerId,
      return_url: `${appUrl()}/coordinator-dashboard`,
    });
    return { url: session.url };
  });

// ─────────────────────────────────────────────────────────────────────────────
// 3. STRIPE CONNECT — Onboarding del coordinador como vendedor
// ─────────────────────────────────────────────────────────────────────────────
exports.createConnectAccountLink = functions
  .region('europe-west1')
  .runWith({ secrets: ['STRIPE_SECRET_KEY'] })
  .https.onCall(async (data, context) => {
    assertAuth(context);
    const { uid, token: { email } } = context.auth;
    const userRef  = db.doc(`usuarios/${uid}`);
    const userSnap = await userRef.get();
    let connectId  = userSnap.data()?.stripeConnectId;

    if (!connectId) {
      const account = await getStripe().accounts.create({
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

    const accountLink = await getStripe().accountLinks.create({
      account:     connectId,
      refresh_url: `${appUrl()}/coordinator-dashboard?connect=refresh`,
      return_url:  `${appUrl()}/coordinator-dashboard?connect=success`,
      type:        'account_onboarding',
    });

    return { url: accountLink.url, connectId };
  });

// ─────────────────────────────────────────────────────────────────────────────
// 4. PAGO DE INSCRIPCIÓN — El padre paga al coordinador (1% para Kamplay)
// ─────────────────────────────────────────────────────────────────────────────
exports.createCampPaymentIntent = functions
  .region('europe-west1')
  .runWith({ secrets: ['STRIPE_SECRET_KEY'] })
  .https.onCall(async (data, context) => {
    assertAuth(context);
    const { uid } = context.auth;
    const { campId } = data;
    if (!campId) throw new functions.https.HttpsError('invalid-argument', 'campId es obligatorio.');

    const campSnap = await db.doc(`campamentos/${campId}`).get();
    if (!campSnap.exists) throw new functions.https.HttpsError('not-found', 'Campamento no encontrado.');
    const camp = campSnap.data();

    const amount = camp.inscriptionFee;
    if (!amount || amount < 100) {
      throw new functions.https.HttpsError('failed-precondition', 'Este campamento no tiene configurada una cuota de inscripción.');
    }

    const coordSnap = await db.doc(`usuarios/${camp.mainCoordinator}`).get();
    const connectId = coordSnap.data()?.stripeConnectId;
    if (!connectId) {
      throw new functions.https.HttpsError('failed-precondition', 'El coordinador no ha configurado los pagos todavía.');
    }

    const applicationFee = Math.round(amount * PLATFORM_FEE_PERCENT);
    const paymentIntent = await getStripe().paymentIntents.create({
      amount,
      currency: 'eur',
      application_fee_amount: applicationFee,
      transfer_data: { destination: connectId },
      metadata: { campId, parentUid: uid, campName: camp.name || '' },
    });

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
// 5. WEBHOOK — Stripe → Firestore
// ─────────────────────────────────────────────────────────────────────────────
exports.stripeWebhook = functions
  .region('europe-west1')
  .runWith({ secrets: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'] })
  .https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = getStripe().webhooks.constructEvent(req.rawBody, sig, STRIPE_WEBHOOK_SECRET.value());
    } catch (err) {
      console.error('⚠️  Webhook signature failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const uid = session.metadata?.firebaseUID;
          if (!uid) break;

          if (session.mode === 'subscription') {
            // Plan Profesional — activar suscripción y promover a coordinador
            await db.doc(`usuarios/${uid}`).set({
              subscriptionStatus:    'active',
              role:                  'coordinator',
              stripeSubscriptionId:  session.subscription,
              subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
            console.log(`✅ Subscription activated + role=coordinator for ${uid}`);
          } else if (session.mode === 'payment') {
            // Plan por evento — activar campamento con fecha de expiración
            const { campId, planType } = session.metadata || {};
            if (!campId || !planType) break;
            const campSnap = await db.doc(`campamentos/${campId}`).get();
            if (!campSnap.exists) break;
            const camp = campSnap.data();
            const endDate = camp.endDate ? new Date(camp.endDate) : new Date();
            const bufferDays = planType === 'standard' ? 7 : 2;
            const expiresAt = new Date(endDate);
            expiresAt.setDate(expiresAt.getDate() + bufferDays);
            await db.doc(`campamentos/${campId}`).set({
              status:    'active',
              planType,
              expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
              paidAt:    admin.firestore.FieldValue.serverTimestamp(),
              paymentSession: session.id,
            }, { merge: true });
            // Promover a coordinador y añadir campId al perfil del usuario
            await db.doc(`usuarios/${uid}`).set({
              role:    'coordinator',
              campIds: admin.firestore.FieldValue.arrayUnion(campId),
            }, { merge: true });
            console.log(`✅ Event camp ${campId} activated (${planType}) expires ${expiresAt.toISOString()}`);
          }
          break;
        }
        case 'customer.subscription.updated': {
          const sub = event.data.object;
          const uid = sub.metadata?.firebaseUID;
          const customer = uid ? null : await getStripe().customers.retrieve(sub.customer);
          const resolvedUid = uid || customer?.metadata?.firebaseUID;
          if (!resolvedUid) break;
          await db.doc(`usuarios/${resolvedUid}`).set({
            subscriptionStatus:    sub.status,
            subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
          console.log(`🔄 Subscription updated to "${sub.status}" for ${resolvedUid}`);
          break;
        }
        case 'customer.subscription.deleted': {
          const sub = event.data.object;
          const uid = sub.metadata?.firebaseUID;
          const customer = uid ? null : await getStripe().customers.retrieve(sub.customer);
          const resolvedUid = uid || customer?.metadata?.firebaseUID;
          if (!resolvedUid) break;
          await db.doc(`usuarios/${resolvedUid}`).set({
            subscriptionStatus:    'canceled',
            subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
            // Keep role as coordinator — they may have event-plan camps still active
          }, { merge: true });
          console.log(`❌ Subscription canceled for ${resolvedUid}`);
          break;
        }
        case 'invoice.payment_failed': {
          const invoice  = event.data.object;
          const customer = await getStripe().customers.retrieve(invoice.customer);
          const resolvedUid = customer?.metadata?.firebaseUID;
          if (!resolvedUid) break;
          await db.doc(`usuarios/${resolvedUid}`).set({
            subscriptionStatus:    'past_due',
            subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
          console.log(`⚠️ Invoice payment failed for ${resolvedUid}`);
          break;
        }
        case 'account.updated': {
          const account = event.data.object;
          const uid = account.metadata?.firebaseUID;
          if (!uid) break;
          if (account.details_submitted && account.charges_enabled) {
            await db.doc(`usuarios/${uid}`).set({ connectOnboarded: true }, { merge: true });
            console.log(`✅ Connect onboarding complete for ${uid}`);
          }
          break;
        }
        case 'payment_intent.succeeded': {
          const pi = event.data.object;
          if (!pi.metadata?.campId) break;
          const snap = await db.collection('pagos')
            .where('paymentIntentId', '==', pi.id)
            .limit(1)
            .get();
          if (!snap.empty) {
            await snap.docs[0].ref.update({
              status: 'paid',
              paidAt: admin.firestore.FieldValue.serverTimestamp(),
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

// ─────────────────────────────────────────────────────────────────────────────
// 6. DOCUMENT PARSER — Extracción inteligente de datos de campamento con IA
// ─────────────────────────────────────────────────────────────────────────────
exports.parseDocument = functions
  .region('europe-west1')
  .runWith({ timeoutSeconds: 180, memory: '512MB', secrets: ['ANTHROPIC_KEY'] })
  .https.onCall(async (data, context) => {
    assertAuth(context);

    const { fileBase64, fileName, mimeType } = data;
    if (!fileBase64 || !fileName || !mimeType) {
      throw new functions.https.HttpsError('invalid-argument', 'Faltan parámetros: fileBase64, fileName o mimeType.');
    }

    const estimatedBytes = Math.ceil((fileBase64.length * 3) / 4);
    if (estimatedBytes > 4 * 1024 * 1024) {
      throw new functions.https.HttpsError('invalid-argument', 'El archivo supera el límite de 4 MB.');
    }

    const buffer = Buffer.from(fileBase64, 'base64');
    let rawText = '';

    try {
      const lowerName = fileName.toLowerCase();
      if (mimeType === 'application/pdf' || lowerName.endsWith('.pdf')) {
        const pdfParse = require('pdf-parse');
        const result = await pdfParse(buffer, { max: 0 });
        rawText = result.text;
      } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        lowerName.endsWith('.docx')
      ) {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        rawText = result.value;
      } else if (mimeType === 'text/csv' || lowerName.endsWith('.csv')) {
        rawText = buffer.toString('utf-8');
      } else if (mimeType === 'text/plain' || lowerName.endsWith('.txt')) {
        rawText = buffer.toString('utf-8');
      } else {
        throw new functions.https.HttpsError('invalid-argument', `Formato no soportado (${mimeType}). Usa PDF, DOCX, CSV o TXT.`);
      }
    } catch (err) {
      if (err.httpErrorCode) throw err;
      throw new functions.https.HttpsError('internal', 'Error al leer el archivo: ' + (err.message || 'formato inválido'));
    }

    rawText = rawText.trim();
    if (!rawText) {
      throw new functions.https.HttpsError('invalid-argument', 'No se pudo extraer texto del documento. El archivo puede estar protegido, escaneado sin OCR, o vacío.');
    }

    const anthropicKeyVal = ANTHROPIC_KEY.value();
    if (!anthropicKeyVal) {
      throw new functions.https.HttpsError('failed-precondition', 'La API de IA no está configurada.');
    }

    const sdkModule = require('@anthropic-ai/sdk');
    const Anthropic = sdkModule.default || sdkModule.Anthropic || sdkModule;
    const client = new Anthropic({ apiKey: anthropicKeyVal });

    // Tool definition — forces the model to return valid structured JSON (no parse failures possible)
    const EXTRACT_TOOL = {
      name: 'extract_camp_data',
      description: 'Extrae y estructura todos los datos del documento de campamento o campus educativo.',
      input_schema: {
        type: 'object',
        properties: {
          acampados: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                nombre:      { type: 'string' },
                edad:        { type: ['number', 'null'] },
                grupo:       { type: ['string', 'null'] },
                cabana:      { type: ['string', 'null'] },
                alergias:    { type: 'array', items: { type: 'string' } },
                medicacion:  { type: 'array', items: { type: 'string' } },
                notasMedicas:{ type: ['string', 'null'] },
                contacto:    { type: ['string', 'null'] },
              },
              required: ['nombre', 'alergias', 'medicacion'],
            },
          },
          grupos: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                nombre:           { type: 'string' },
                edadMinima:       { type: ['number', 'null'] },
                edadMaxima:       { type: ['number', 'null'] },
                monitores:        { type: 'array', items: { type: 'string' } },
                acampadosNombres: { type: 'array', items: { type: 'string' } },
              },
              required: ['nombre', 'monitores', 'acampadosNombres'],
            },
          },
          actividades: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                titulo:          { type: 'string' },
                fechaStr:        { type: ['string', 'null'] },
                horaInicio:      { type: ['string', 'null'] },
                horaFin:         { type: ['string', 'null'] },
                grupo:           { type: ['string', 'null'] },
                categoria:       { type: 'string', enum: ['deportes', 'arte', 'naturaleza', 'juegos', 'talleres', 'otro'] },
                descripcion:     { type: ['string', 'null'] },
                ubicacion:       { type: ['string', 'null'] },
                duracionMinutos: { type: 'number' },
              },
              required: ['titulo', 'categoria', 'duracionMinutos'],
            },
          },
          infoGeneral: {
            type: 'object',
            properties: {
              nombre:      { type: ['string', 'null'] },
              fechaInicio: { type: ['string', 'null'] },
              fechaFin:    { type: ['string', 'null'] },
              ubicacion:   { type: ['string', 'null'] },
              descripcion: { type: ['string', 'null'] },
            },
          },
        },
        required: ['acampados', 'grupos', 'actividades', 'infoGeneral'],
      },
    };

    const USER_PROMPT = `Analiza este documento de campamento/campus y usa la herramienta extract_camp_data para extraer TODA la información disponible. Si un campo no está en el documento usa null o array vacío.

DOCUMENTO:
${rawText.slice(0, 55000)}`;

    let aiResponse;
    try {
      aiResponse = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8192,
        tools: [EXTRACT_TOOL],
        tool_choice: { type: 'tool', name: 'extract_camp_data' },
        messages: [{ role: 'user', content: USER_PROMPT }],
      });
    } catch (err) {
      console.error('Anthropic API error:', err);
      throw new functions.https.HttpsError('internal', 'Error al procesar con IA: ' + (err.message || ''));
    }

    // With tool_choice forced, the model MUST return a tool_use block with valid JSON
    const toolUse = aiResponse.content.find(c => c.type === 'tool_use' && c.name === 'extract_camp_data');
    if (!toolUse) {
      console.error('parseDocument: no tool_use block in response', JSON.stringify(aiResponse.content).slice(0, 300));
      throw new functions.https.HttpsError('internal', 'La IA no pudo generar datos estructurados válidos.');
    }
    const parsed = toolUse.input;

    console.log(`parseDocument: ${(parsed.acampados || []).length} acampados, ${(parsed.grupos || []).length} grupos, ${(parsed.actividades || []).length} actividades — "${fileName}" (${rawText.length} chars)`);

    return {
      acampados:   Array.isArray(parsed.acampados)   ? parsed.acampados   : [],
      grupos:      Array.isArray(parsed.grupos)       ? parsed.grupos      : [],
      actividades: Array.isArray(parsed.actividades)  ? parsed.actividades : [],
      infoGeneral: (parsed.infoGeneral && typeof parsed.infoGeneral === 'object') ? parsed.infoGeneral : {},
      fileName,
      charCount: rawText.length,
    };
  });
