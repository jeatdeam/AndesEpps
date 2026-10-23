import type {Metadata} from 'next';
import Link from 'next/link';
import {PaginaLegal, Seccion, Lista, Correo, EMPRESA, WHATSAPP_ATENCION} from '@/app/componentes/PaginaLegal';

export const metadata : Metadata = {
    title: `Política de privacidad | ${EMPRESA}`,
    description: `Cómo ${EMPRESA} recopila, usa y protege los datos personales de sus clientes.`,
};

export default function Page() {
    return (
        <PaginaLegal titulo={"Política de privacidad"} resumen={`En ${EMPRESA} cuidamos los datos que nos confías. Esta política explica qué información recopilamos en este sitio web, para qué la usamos y cuáles son tus derechos, de acuerdo con la Ley N° 29733, Ley de Protección de Datos Personales del Perú, y su reglamento.`}>

            <Seccion titulo={"1. Responsable del tratamiento"}>
                <p>El responsable de tus datos personales es {EMPRESA}. Puedes comunicarte con nosotros por correo a <Correo/> o por WhatsApp al {WHATSAPP_ATENCION}.</p>
            </Seccion>

            <Seccion titulo={"2. Datos que recopilamos"}>
                <p>Solo recopilamos los datos que tú nos das al solicitar una cotización o al escribirnos:</p>
                <Lista>
                    <li>Nombre y apellido.</li>
                    <li>Empresa (opcional).</li>
                    <li>RUC o DNI (opcional).</li>
                    <li>Correo electrónico y número de WhatsApp.</li>
                    <li>Los productos, cantidades y comentarios de tu cotización.</li>
                    <li>Los mensajes que nos envíes por WhatsApp o correo.</li>
                </Lista>
                <p>No pedimos ni guardamos datos de tarjetas ni contraseñas de clientes.</p>
            </Seccion>

            <Seccion titulo={"3. Para qué usamos tus datos"}>
                <Lista>
                    <li>Preparar y enviarte la cotización que solicitaste (en PDF, por correo o WhatsApp).</li>
                    <li>Responder tus consultas y darte seguimiento comercial sobre esa cotización.</li>
                    <li>Emitir comprobantes de pago si concretas una compra.</li>
                    <li>Cumplir obligaciones legales y tributarias.</li>
                </Lista>
                <p>No vendemos ni alquilamos tus datos personales. Solo te enviaremos publicidad si nos das tu consentimiento, y puedes retirarlo cuando quieras.</p>
            </Seccion>

            <Seccion titulo={"4. Con quién compartimos tus datos"}>
                <p>Para que el sitio funcione usamos proveedores que tratan los datos por encargo nuestro y solo para prestarnos su servicio:</p>
                <Lista>
                    <li>Alojamiento del sitio y del servidor (Vercel y Render).</li>
                    <li>Base de datos donde se guardan las cotizaciones (Supabase).</li>
                    <li>Almacenamiento de imágenes de productos (Cloudinary).</li>
                    <li>Envío de correos electrónicos y mensajería por WhatsApp (Meta).</li>
                </Lista>
                <p>Algunos de estos proveedores almacenan la información fuera del Perú, lo que constituye un flujo transfronterizo de datos. Al usar el sitio aceptas esta transferencia, que se realiza con proveedores que aplican medidas de seguridad adecuadas.</p>
            </Seccion>

            <Seccion titulo={"5. Cuánto tiempo guardamos tus datos"}>
                <p>Conservamos los datos de tus cotizaciones mientras sean necesarios para atenderte y durante los plazos que exige la normativa tributaria y comercial. Después los eliminamos o anonimizamos.</p>
            </Seccion>

            <Seccion titulo={"6. Datos guardados en tu navegador"}>
                <p>Para que no tengas que volver a escribirlos, el sitio guarda en tu propio navegador (almacenamiento local) los productos de tu carrito y los datos del formulario de cotización. Puedes borrarlos cuando quieras limpiando los datos de navegación. El panel de administración usa una cookie de sesión solo para el personal autorizado de la tienda.</p>
            </Seccion>

            <Seccion titulo={"7. Tus derechos"}>
                <p>Puedes ejercer en cualquier momento tus derechos de acceso, rectificación, cancelación y oposición (derechos ARCO) sobre tus datos personales. Escríbenos a <Correo/> indicando tu nombre, tu documento de identidad y lo que solicitas; te responderemos dentro de los plazos de ley.</p>
                <p>Si quieres que eliminemos tus datos, sigue las instrucciones de la página <Link href={"/eliminacion-de-datos"} className={"font-medium text-sky-700 hover:underline"}>Eliminación de datos</Link>.</p>
                <p>Si consideras que no atendimos tu solicitud, puedes acudir a la Autoridad Nacional de Protección de Datos Personales del Ministerio de Justicia y Derechos Humanos.</p>
            </Seccion>

            <Seccion titulo={"8. Seguridad"}>
                <p>Aplicamos medidas técnicas y organizativas para proteger tus datos: conexión cifrada (HTTPS), acceso restringido al panel de administración y enlaces de descarga de cotizaciones difíciles de adivinar.</p>
            </Seccion>

            <Seccion titulo={"9. Cambios en esta política"}>
                <p>Podemos actualizar esta política. Publicaremos cualquier cambio en esta misma página, indicando la fecha de la última actualización.</p>
            </Seccion>
        </PaginaLegal>
    )
}
