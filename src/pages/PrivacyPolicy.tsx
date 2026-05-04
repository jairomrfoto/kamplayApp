import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
    <div className="text-gray-600 space-y-3 text-sm leading-relaxed">{children}</div>
  </section>
);

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm font-medium mb-8">
          <ArrowLeft size={16} /> Volver al inicio
        </Link>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Política de Privacidad</h1>
        <p className="text-sm text-gray-400 mb-10">Última actualización: mayo de 2025</p>

        <Section title="1. Responsable del tratamiento">
          <p>
            El responsable del tratamiento de sus datos personales es <strong>Kamplay</strong> (en adelante, «Kamplay» o «nosotros»),
            titular de la plataforma accesible en <strong>kamplay.es</strong>.
          </p>
          <p>Puede contactarnos en: <a href="mailto:privacidad@kamplay.es" className="text-orange-600 hover:underline">privacidad@kamplay.es</a></p>
        </Section>

        <Section title="2. Datos que recopilamos">
          <p>Recopilamos los siguientes datos personales:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Datos de cuenta:</strong> nombre, dirección de correo electrónico y contraseña cifrada.</li>
            <li><strong>Datos de programa:</strong> información sobre participantes, grupos, actividades e incidencias introducida por coordinadores y monitores.</li>
            <li><strong>Datos de pago:</strong> gestionados íntegramente por Stripe. Kamplay no almacena datos de tarjetas.</li>
            <li><strong>Datos técnicos:</strong> dirección IP, tipo de navegador, sistema operativo y páginas visitadas (solo con su consentimiento para cookies analíticas).</li>
          </ul>
        </Section>

        <Section title="3. Finalidad y base jurídica del tratamiento">
          <p>Tratamos sus datos para:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Prestar el servicio</strong> (art. 6.1.b RGPD — ejecución del contrato): gestión de cuentas, campamentos, campus y comunicaciones internas.</li>
            <li><strong>Gestionar pagos</strong> (art. 6.1.b RGPD): procesamiento de suscripciones y pagos por evento a través de Stripe.</li>
            <li><strong>Cumplir obligaciones legales</strong> (art. 6.1.c RGPD): facturación y obligaciones fiscales.</li>
            <li><strong>Interés legítimo</strong> (art. 6.1.f RGPD): seguridad de la plataforma y mejora del servicio.</li>
            <li><strong>Consentimiento</strong> (art. 6.1.a RGPD): envío de comunicaciones comerciales y uso de cookies no esenciales.</li>
          </ul>
        </Section>

        <Section title="4. Destinatarios de los datos">
          <p>Sus datos pueden ser compartidos con:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Firebase / Google Cloud</strong> — infraestructura de almacenamiento y autenticación (servidores en Europa).</li>
            <li><strong>Stripe</strong> — procesador de pagos (certificado PCI-DSS).</li>
            <li><strong>Anthropic</strong> — procesamiento de documentos mediante IA (solo el contenido del documento subido).</li>
          </ul>
          <p>No vendemos ni cedemos sus datos a terceros con fines publicitarios.</p>
        </Section>

        <Section title="5. Conservación de los datos">
          <p>Conservamos sus datos mientras mantenga una cuenta activa en Kamplay. Tras la cancelación de la cuenta, los datos se eliminarán en un plazo máximo de <strong>12 meses</strong>, salvo obligación legal de conservación (p. ej., datos de facturación: 5 años).</p>
        </Section>

        <Section title="6. Sus derechos">
          <p>Con arreglo al RGPD y la LOPDGDD, usted tiene derecho a:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Acceso:</strong> obtener confirmación de si tratamos sus datos y una copia de los mismos.</li>
            <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
            <li><strong>Supresión («derecho al olvido»):</strong> solicitar la eliminación de sus datos.</li>
            <li><strong>Limitación:</strong> solicitar que suspendamos el tratamiento en determinadas circunstancias.</li>
            <li><strong>Portabilidad:</strong> recibir sus datos en formato estructurado y legible por máquina.</li>
            <li><strong>Oposición:</strong> oponerse al tratamiento basado en interés legítimo.</li>
            <li><strong>Retirar el consentimiento</strong> en cualquier momento, sin que ello afecte a la licitud del tratamiento previo.</li>
          </ul>
          <p>Para ejercer estos derechos, escríbanos a <a href="mailto:privacidad@kamplay.es" className="text-orange-600 hover:underline">privacidad@kamplay.es</a>. También puede reclamar ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong> en <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">aepd.es</a>.</p>
        </Section>

        <Section title="7. Seguridad">
          <p>Aplicamos medidas técnicas y organizativas adecuadas para proteger sus datos: cifrado en tránsito (HTTPS/TLS), autenticación segura, control de acceso por roles y copias de seguridad automáticas.</p>
        </Section>

        <Section title="8. Menores de edad">
          <p>Kamplay no recoge directamente datos de menores de 14 años. Los datos de participantes menores son introducidos por coordinadores bajo su responsabilidad, quienes deben contar con el consentimiento de los tutores legales conforme a la normativa aplicable.</p>
        </Section>

        <Section title="9. Cambios en esta política">
          <p>Podemos actualizar esta política ocasionalmente. Notificaremos los cambios relevantes por correo electrónico o mediante un aviso destacado en la plataforma.</p>
        </Section>

        <div className="border-t border-gray-200 pt-6 mt-6 flex gap-4 text-sm">
          <Link to="/terminos" className="text-orange-600 hover:underline">Términos y Condiciones</Link>
          <Link to="/cookies" className="text-orange-600 hover:underline">Política de Cookies</Link>
        </div>
      </div>
    </div>
  );
}
