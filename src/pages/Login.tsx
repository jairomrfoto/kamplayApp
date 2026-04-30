import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Tent, Loader, Eye, EyeOff, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// ── Disposable email blocklist ───────────────────────────────────────────────
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', 'guerrillamail.biz',
  'guerrillamail.de', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamailblock.com',
  'grr.la', 'sharklasers.com', 'spam4.me', 'yopmail.com', 'yopmail.fr',
  'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'throwam.com', 'trashmail.com',
  'trashmail.at', 'trashmail.io', 'trashmail.me', 'trashmail.net', 'trashmail.org',
  '10minutemail.com', '10minutemail.net', 'fakeinbox.com', 'maildrop.cc',
  'dispostable.com', 'mailnull.com', 'spamgourmet.com', 'spamgourmet.net',
  'spamgourmet.org', 'spamherelots.com', 'spamhereplease.com', 'spam.la',
  'binkmail.com', 'bob.email', 'clrmail.com', 'discard.email', 'discardmail.com',
  'discardmail.de', 'einrot.com', 'filzmail.com', 'gettempmail.com', 'hatespam.org',
  'humaility.com', 'jetable.fr.nf', 'kasmail.com', 'klzlk.com', 'lol.ovpn.to',
  'lookugly.com', 'lortemail.dk', 'mailme.lv', 'mailnew.com', 'mailscrap.com',
  'mailsiphon.com', 'mailslite.com', 'mailzilla.org', 'mega.zik.dj', 'meltmail.com',
  'mierdamail.com', 'mt2009.com', 'mt2014.com', 'noclickemail.com', 'nogmailspam.info',
  'nospamfor.us', 'nowmymail.com', 'objectmail.com', 'obobbo.com', 'odnorazovoe.ru',
  'oneoffemail.com', 'onewaymail.com', 'pookmail.com', 'proxymail.eu', 'rcpt.at',
  'recode.me', 's0ny.net', 'smellfear.com', 'sofimail.com', 'sogetthis.com',
  'spamavert.com', 'spamboost.com', 'spamcon.org', 'spamex.com', 'spamfree24.org',
  'spamgob.com', 'spamhole.com', 'spamify.com', 'spaminmotion.com', 'spamkill.info',
  'spaml.com', 'spammotel.com', 'spamobox.com', 'spamslicer.com', 'spamspot.com',
  'spamstack.net', 'spamthis.co.uk', 'spamtroll.net', 'supergreatmail.com',
  'suremail.info', 'tafmail.com', 'tagyourself.com', 'teleworm.us', 'tempe-mail.com',
  'tempinbox.co.uk', 'tempinbox.com', 'temporaryemail.net', 'temporaryforwarding.com',
  'temporaryinbox.com', 'thankyou2010.com', 'thelimestones.com', 'throwam.com',
  'throwaway.email', 'tmail.com', 'toiea.com', 'tradermail.info', 'trash-mail.at',
  'trash-mail.com', 'trash-mail.de', 'trash-mail.ga', 'trash-mail.io', 'trash2009.com',
  'trashdevil.com', 'trashdevil.de', 'trashemail.de', 'trashimail.com', 'trashmail.at',
  'trbvm.com', 'turual.com', 'twinmail.de', 'tyldd.com', 'uggsrock.com',
  'uroid.com', 'veryrealemail.com', 'vidchart.com', 'viditag.com', 'viewcastmedia.com',
  'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org', 'wh4f.org', 'whyspam.me',
  'willselfdestruct.com', 'wuzupmail.net', 'xagloo.com', 'xemaps.com', 'xents.com',
  'xmaily.com', 'xoxy.net', 'yyy.com', 'zehnminutenmail.de', 'zoemail.net',
  'zomg.info', 'zxcv.com', 'zippymail.info',
]);

// ── Password strength ────────────────────────────────────────────────────────
function getStrength(pwd: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const levels = [
    { label: 'Muy débil',  color: 'bg-red-500' },
    { label: 'Débil',      color: 'bg-orange-400' },
    { label: 'Regular',    color: 'bg-yellow-400' },
    { label: 'Buena',      color: 'bg-lime-500' },
    { label: 'Fuerte',     color: 'bg-green-500' },
    { label: 'Muy fuerte', color: 'bg-emerald-600' },
  ];
  return { score, ...levels[Math.min(score, 5)] };
}

// ── Rate limiter (localStorage-backed) ──────────────────────────────────────
const RL_KEY = 'kp_auth_rl';
const MAX_FAILS = 5;
const LOCKOUT_MS = 60_000; // 1 min after 5 fails

interface RLState { count: number; until: number }

function getRl(): RLState {
  try {
    return JSON.parse(localStorage.getItem(RL_KEY) ?? '{}');
  } catch { return { count: 0, until: 0 }; }
}
function setRl(s: RLState) { localStorage.setItem(RL_KEY, JSON.stringify(s)); }
function resetRl()          { localStorage.removeItem(RL_KEY); }
function recordFail() {
  const s = getRl();
  const count = (s.count ?? 0) + 1;
  const until = count >= MAX_FAILS ? Date.now() + LOCKOUT_MS : (s.until ?? 0);
  setRl({ count, until });
  return { count, until };
}
function isLocked(): number {
  const { until } = getRl();
  return until > Date.now() ? Math.ceil((until - Date.now()) / 1000) : 0;
}

// ── Google icon ──────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
  </svg>
);

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;

// ── Component ────────────────────────────────────────────────────────────────
type Mode = 'login' | 'register';
type Screen = 'form' | 'verify-pending' | 'reset';

const Login = () => {
  const navigate  = useNavigate();
  const { user, loading: authLoading, signIn, signUp, signInWithGoogle, sendPasswordReset, resendVerification } = useAuth();

  const [mode, setMode]       = useState<Mode>('login');
  const [screen, setScreen]   = useState<Screen>('form');

  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Honeypot — humans leave this blank
  const [honeypot, setHoneypot] = useState('');

  const [loading, setLoading]   = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError]       = useState('');
  const [lockSecs, setLockSecs] = useState(0);
  const [resentOk, setResentOk] = useState(false);

  const [resetEmail, setResetEmail]       = useState('');
  const [resetLoading, setResetLoading]   = useState(false);
  const [resetSent, setResetSent]         = useState(false);
  const [resetError, setResetError]       = useState('');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Redirect already-verified users — go directly to /admin for admin accounts
  useEffect(() => {
    if (authLoading) return;
    if (user?.emailVerified) {
      const dest = ADMIN_EMAIL && user.email === ADMIN_EMAIL ? '/admin' : '/onboarding';
      navigate(dest, { replace: true });
    }
  }, [user, authLoading]);

  // Lockout countdown
  useEffect(() => {
    const secs = isLocked();
    if (secs > 0) {
      setLockSecs(secs);
      timerRef.current = setInterval(() => {
        const rem = isLocked();
        setLockSecs(rem);
        if (rem <= 0 && timerRef.current) clearInterval(timerRef.current);
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const switchMode = (m: Mode) => {
    setMode(m); setError('');
    setPassword(''); setConfirm(''); setShowPwd(false); setShowConfirm(false);
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const isDomainDisposable = (em: string) => {
    const domain = em.split('@')[1]?.toLowerCase() ?? '';
    return DISPOSABLE_DOMAINS.has(domain);
  };

  const validateRegister = (): string => {
    if (honeypot) return ''; // silently reject bots (no error shown)
    if (isDomainDisposable(email))
      return 'Este tipo de correo no está permitido. Usa tu correo personal o de empresa.';
    if (password.length < 8)
      return 'La contraseña debe tener al menos 8 caracteres.';
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password))
      return 'La contraseña debe incluir letras y números.';
    if (password !== confirm)
      return 'Las contraseñas no coinciden.';
    return 'ok';
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (honeypot) return; // bot trap — silent

    const locked = isLocked();
    if (locked > 0) { setLockSecs(locked); return; }

    if (mode === 'register') {
      const check = validateRegister();
      if (!check) return;       // honeypot triggered — do nothing
      if (check !== 'ok') { setError(check); return; }

      setLoading(true);
      try {
        await signUp(email, password);
        setScreen('verify-pending');
      } catch (err: any) {
        const msg =
          err.code === 'auth/email-already-in-use'
            ? 'Ya existe una cuenta con ese correo. ¿Quieres iniciar sesión?'
            : err.code === 'auth/invalid-email'
            ? 'El formato del correo no es válido.'
            : 'No se pudo crear la cuenta. Inténtalo de nuevo.';
        setError(msg);
      } finally {
        setLoading(false);
      }
      return;
    }

    // LOGIN
    setLoading(true);
    // Artificial minimum delay to slow down automated attacks
    const minDelay = new Promise(r => setTimeout(r, 600));
    try {
      const u = await signIn(email, password);
      await minDelay;
      if (!u.emailVerified) {
        // Signed in but not verified — send to pending screen
        setScreen('verify-pending');
        return;
      }
      resetRl();
      navigate('/onboarding');
    } catch (err: any) {
      await minDelay;
      const { count } = recordFail();
      const secs = isLocked();
      if (secs > 0) {
        setLockSecs(secs);
        timerRef.current = setInterval(() => {
          const rem = isLocked();
          setLockSecs(rem);
          if (rem <= 0 && timerRef.current) clearInterval(timerRef.current);
        }, 1000);
      }
      // Generic message — never reveal if email exists
      const remaining = MAX_FAILS - count;
      setError(
        secs > 0
          ? `Demasiados intentos fallidos. Espera ${secs} segundos.`
          : remaining > 0
          ? `Correo o contraseña incorrectos. (${remaining} intento${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''})`
          : 'Correo o contraseña incorrectos.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGLoading(true); setError('');
    try {
      // signInWithRedirect never returns — page reloads after Google auth
      await signInWithGoogle();
    } catch (err: any) {
      setError('No se pudo iniciar sesión con Google. Inténtalo de nuevo.');
      setGLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true); setResetError('');
    try {
      await sendPasswordReset(resetEmail);
      setResetSent(true);
    } catch (err: any) {
      // Generic message — don't confirm if email exists
      setResetError('Si ese correo está registrado, recibirás un enlace en breve.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification();
      setResentOk(true);
    } catch { /* ignore */ }
  };

  const strength = mode === 'register' ? getStrength(password) : null;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  // ── Verify-pending screen ──────────────────────────────────────────────────
  if (screen === 'verify-pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/" className="flex items-center justify-center gap-3 mb-8">
            <Tent className="h-10 w-10 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900">Kamplay</h1>
          </Link>

          <div className="bg-white py-8 px-6 shadow rounded-2xl text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={32} className="text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verifica tu correo</h2>
            <p className="text-sm text-gray-500 mb-1">
              Hemos enviado un enlace de verificación a:
            </p>
            <p className="font-semibold text-gray-800 mb-5 break-all">{email || user?.email}</p>
            <p className="text-sm text-gray-400 mb-6">
              Haz clic en el enlace del correo para activar tu cuenta. Después podrás iniciar sesión normalmente.
            </p>

            {resentOk ? (
              <div className="flex items-center justify-center gap-2 text-green-600 text-sm mb-4">
                <CheckCircle size={16} /> Correo reenviado correctamente
              </div>
            ) : (
              <button
                onClick={handleResend}
                className="text-orange-600 text-sm hover:underline mb-4 block mx-auto"
              >
                ¿No lo has recibido? Reenviar correo
              </button>
            )}

            <button
              onClick={() => { setScreen('form'); setMode('login'); }}
              className="w-full py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Reset screen ───────────────────────────────────────────────────────────
  if (screen === 'reset') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/" className="flex items-center justify-center gap-3 mb-8">
            <Tent className="h-10 w-10 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900">Kamplay</h1>
          </Link>

          <div className="bg-white py-8 px-6 shadow rounded-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Recuperar contraseña</h2>
            <p className="text-sm text-gray-400 mb-5">
              Escribe tu correo y te enviaremos un enlace de recuperación.
            </p>

            {resetSent ? (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 text-sm text-center">
                Si ese correo está registrado, recibirás un enlace en breve. Revisa también la carpeta de spam.
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <input
                  type="email" required value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                {resetError && (
                  <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">{resetError}</p>
                )}
                <button type="submit" disabled={resetLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {resetLoading && <Loader size={15} className="animate-spin" />}
                  Enviar enlace
                </button>
              </form>
            )}

            <button onClick={() => { setScreen('form'); setResetSent(false); setResetError(''); }}
              className="mt-4 text-sm text-gray-400 hover:text-gray-600 underline block"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <Tent className="h-11 w-11 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kamplay</h1>
            <p className="text-orange-500 text-sm font-medium">Tu pasión, su felicidad</p>
          </div>
        </Link>

        {/* Mode toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Crear cuenta
          </button>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-2xl">

          {/* Google */}
          <button onClick={handleGoogle} disabled={gLoading || loading || lockSecs > 0}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors mb-5"
          >
            {gLoading ? <Loader size={17} className="animate-spin" /> : <GoogleIcon />}
            Continuar con Google
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400">o con correo electrónico</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ── Honeypot — hidden from humans, filled by bots ── */}
            <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                id="website" name="website" type="text" tabIndex={-1}
                autoComplete="off" value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Correo electrónico
              </label>
              <input
                id="login-email"
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                autoComplete="email"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-shadow"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  required minLength={mode === 'register' ? 8 : 1}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Mínimo 8 caracteres con números' : 'Tu contraseña'}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-shadow"
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength meter (register only) */}
              {mode === 'register' && password.length > 0 && strength && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0,1,2,3,4].map(i => (
                      <div key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i < strength.score ? strength.color : 'bg-gray-100'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">{strength.label}</p>
                </div>
              )}

              {/* Forgot password (login only) */}
              {mode === 'login' && (
                <button type="button"
                  onClick={() => { setScreen('reset'); setResetEmail(email); }}
                  className="mt-1 text-xs text-orange-500 hover:text-orange-700 float-right"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>

            {/* Confirm password (register only) */}
            {mode === 'register' && (
              <div>
                <label htmlFor="login-confirm" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    id="login-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    required value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repite la contraseña"
                    autoComplete="new-password"
                    className={`w-full border rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition-shadow ${
                      confirm && confirm !== password ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirm && password && confirm !== password && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> Las contraseñas no coinciden
                  </p>
                )}
                {confirm && password && confirm === password && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle size={12} /> Las contraseñas coinciden
                  </p>
                )}
              </div>
            )}

            {/* Register notice */}
            {mode === 'register' && (
              <p className="text-xs text-gray-400 leading-relaxed">
                Al crear una cuenta aceptas nuestros términos de uso. Recibirás un correo para verificar tu dirección antes de poder acceder.
              </p>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Lockout */}
            {lockSecs > 0 && (
              <div className="flex items-center gap-2 text-amber-700 text-sm bg-amber-50 p-3 rounded-xl">
                <AlertCircle size={16} className="flex-shrink-0" />
                Cuenta bloqueada temporalmente. Intenta de nuevo en {lockSecs}s.
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || gLoading || lockSecs > 0}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm mt-2"
            >
              {loading
                ? <><Loader size={16} className="animate-spin" /> {mode === 'register' ? 'Creando cuenta...' : 'Entrando...'}</>
                : mode === 'register' ? 'Crear cuenta' : 'Entrar'
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
