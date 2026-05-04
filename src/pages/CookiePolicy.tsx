import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
    <div className="text-gray-600 space-y-3 text-sm leading-relaxed">{children}</div>
  </section>
);

export default function CookiePolicy() {
  const handleManage = () => {
    localStorage.removeItem('kamplay_cookie_consent');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm font-medium mb-8">
          <ArrowLeft size={16} /> Volver al inicio
        </Link>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Política de Cookies</h1>
        <p className="text-sm text-gray-400 mb-10">Última actualización: mayo de 2025</p>

        <Section title="¿Qué son las cookies?">
          <p>Las cookies son pequeños archivos de texto que los sitios web almacenan en su navegador. Permiten que el sitio recuerde sus preferencias y mejore su experiencia de uso.</p>
        </Section>

        <Section title="Cookies que utilizamos">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left">Nombre</th>
                  <th className="px-3 py-2 text-left">Tipo</th>
                  <th className="px-3 py-2 text-left">Finalidad</th>
                  <th className="px-3 py-2 text-left">Duración</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="bg-white">
                  <td className="px-3 py-2 font-mono">firebase:authUser</td>
                  <td className="px-3 py-2"><span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Esencial</span></td>
                  <td className="px-3 py-2">Mantener la sesión iniciada</td>
                  <td className="px-3 py-2">Sesión / 1 año</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-3 py-2 font-mono">kamplay_local_*</td>
                  <td className="px-3 py-2"><span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Esencial</span></td>
                  <td className="px-3 py-2">Preferencias y caché del programa activo</td>
                  <td className="px-3 py-2">Persistente</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-3 py-2 font-mono">kamplay_cookie_consent</td>
                  <td className="px-3 py-2"><span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Esencial</span></td>
                  <td className="px-3 py-2">Guardar su elección sobre cookies</td>
                  <td className="px-3 py-2">1 año</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-3 py-2 font-mono">__stripe_*</td>
                  <td className="px-3 py-2"><span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Funcional</span></td>
                  <td className="px-3 py-2">Procesamiento seguro de pagos (Stripe)</td>
                  <td className="px-3 py-2">Sesión</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">Actualmente Kamplay <strong>no utiliza cookies de seguimiento ni publicidad</strong>.</p>
        </Section>

        <Section title="Cómo gestionar sus preferencias">
          <p>Puede retirar o modificar su consentimiento en cualquier momento:</p>
          <button
            onClick={handleManage}
            className="mt-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Restablecer preferencias de cookies
          </button>
          <p className="mt-3">También puede configurar su navegador para bloquear o eliminar cookies. Tenga en cuenta que bloquear las cookies esenciales puede impedir el correcto funcionamiento de la plataforma.</p>
        </Section>

        <Section title="Más información">
          <p>Para cualquier consulta: <a href="mailto:privacidad@kamplay.es" className="text-orange-600 hover:underline">privacidad@kamplay.es</a></p>
        </Section>

        <div className="border-t border-gray-200 pt-6 mt-6 flex gap-4 text-sm">
          <Link to="/privacidad" className="text-orange-600 hover:underline">Política de Privacidad</Link>
          <Link to="/terminos" className="text-orange-600 hover:underline">Términos y Condiciones</Link>
        </div>
      </div>
    </div>
  );
}
