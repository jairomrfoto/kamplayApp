import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
    <div className="text-gray-600 space-y-3 text-sm leading-relaxed">{children}</div>
  </section>
);

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm font-medium mb-8">
          <ArrowLeft size={16} /> Volver al inicio
        </Link>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Términos y Condiciones</h1>
        <p className="text-sm text-gray-400 mb-10">Última actualización: mayo de 2025</p>

        <Section title="1. Objeto y aceptación">
          <p>
            Los presentes Términos y Condiciones (en adelante, «Términos») regulan el acceso y uso de la plataforma <strong>Kamplay</strong> (kamplay.es),
            un software de gestión para campamentos de verano y campus diurnos.
          </p>
          <p>Al registrarse o utilizar Kamplay, el usuario acepta íntegramente estos Términos. Si no está de acuerdo, debe abstenerse de usar el servicio.</p>
        </Section>

        <Section title="2. Descripción del servicio">
          <p>Kamplay ofrece una plataforma SaaS que permite a coordinadores gestionar campamentos y campus diurnos: participantes, grupos, actividades, área médica, comunicación con familias e importación de documentos con IA.</p>
          <p>El servicio se presta bajo los siguientes planes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Plan Profesional:</strong> suscripción mensual (30 €/mes) o anual (250 €/año) con uso ilimitado.</li>
            <li><strong>Plan por Evento Express:</strong> pago único de 9 € por evento de hasta 3 días.</li>
            <li><strong>Plan por Evento Estándar:</strong> pago único de 15 € por evento de hasta 7 días.</li>
          </ul>
        </Section>

        <Section title="3. Registro y cuenta">
          <p>Para usar Kamplay es necesario crear una cuenta con un correo electrónico válido. El usuario es responsable de mantener la confidencialidad de sus credenciales y de todas las actividades realizadas desde su cuenta.</p>
          <p>Kamplay puede suspender o cancelar cuentas que incumplan estos Términos.</p>
        </Section>

        <Section title="4. Roles de usuario">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Coordinador:</strong> crea y gestiona programas. Requiere suscripción activa o pago por evento.</li>
            <li><strong>Monitor:</strong> accede al programa mediante código de invitación. Sin coste adicional.</li>
            <li><strong>Familia/tutor:</strong> accede a la información de su hijo/a mediante código. Sin coste.</li>
          </ul>
        </Section>

        <Section title="5. Pagos y facturación">
          <p>Los pagos se procesan a través de <strong>Stripe</strong>. Al suscribirse, el usuario autoriza los cobros recurrentes según el plan elegido.</p>
          <p>Las suscripciones se renuevan automáticamente. El usuario puede cancelar en cualquier momento desde la sección de facturación; la cancelación surte efecto al final del período abonado.</p>
          <p>Los pagos por evento son únicos y no reembolsables una vez activado el programa.</p>
          <p>Todos los precios incluyen IVA cuando corresponda.</p>
        </Section>

        <Section title="6. Política de reembolso">
          <p>Las suscripciones mensuales o anuales no son reembolsables una vez iniciado el período. No obstante, si Kamplay presenta un fallo grave que impida el uso del servicio durante más de 48 horas consecutivas, el usuario podrá solicitar un crédito proporcional escribiendo a <a href="mailto:soporte@kamplay.es" className="text-orange-600 hover:underline">soporte@kamplay.es</a>.</p>
        </Section>

        <Section title="7. Uso aceptable">
          <p>El usuario se compromete a:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Usar el servicio conforme a la ley y estos Términos.</li>
            <li>No introducir datos de terceros sin su consentimiento.</li>
            <li>No intentar acceder a cuentas o datos de otros usuarios.</li>
            <li>No realizar ingeniería inversa ni copiar el software.</li>
            <li>Tratar los datos de menores con especial diligencia y cumplir la normativa de protección de menores.</li>
          </ul>
        </Section>

        <Section title="8. Propiedad intelectual">
          <p>Kamplay y todos sus elementos (diseño, código, marca, contenidos propios) son propiedad de Kamplay y están protegidos por la legislación de propiedad intelectual. Los datos introducidos por el usuario son de su titularidad; Kamplay los trata exclusivamente para prestar el servicio.</p>
        </Section>

        <Section title="9. Disponibilidad y limitación de responsabilidad">
          <p>Kamplay se esfuerza por ofrecer una disponibilidad del 99,5% mensual. No obstante, no garantizamos un servicio ininterrumpido y no somos responsables de daños derivados de interrupciones del servicio, pérdidas de datos por causas ajenas a nuestra infraestructura, o uso indebido por parte del usuario.</p>
          <p>En ningún caso la responsabilidad de Kamplay superará el importe abonado por el usuario en los 3 meses anteriores al hecho causante del daño.</p>
        </Section>

        <Section title="10. Protección de datos">
          <p>El tratamiento de datos personales se rige por nuestra <Link to="/privacidad" className="text-orange-600 hover:underline">Política de Privacidad</Link>, que forma parte integrante de estos Términos.</p>
        </Section>

        <Section title="11. Modificaciones">
          <p>Kamplay puede modificar estos Términos notificando al usuario con al menos 15 días de antelación por correo electrónico. El uso continuado del servicio tras esa fecha implica la aceptación de los nuevos Términos.</p>
        </Section>

        <Section title="12. Legislación aplicable y jurisdicción">
          <p>Estos Términos se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de España, sin perjuicio de los fueros que correspondan a consumidores.</p>
        </Section>

        <Section title="13. Contacto">
          <p>Para cualquier consulta sobre estos Términos: <a href="mailto:soporte@kamplay.es" className="text-orange-600 hover:underline">soporte@kamplay.es</a></p>
        </Section>

        <div className="border-t border-gray-200 pt-6 mt-6 flex gap-4 text-sm">
          <Link to="/privacidad" className="text-orange-600 hover:underline">Política de Privacidad</Link>
          <Link to="/cookies" className="text-orange-600 hover:underline">Política de Cookies</Link>
        </div>
      </div>
    </div>
  );
}
