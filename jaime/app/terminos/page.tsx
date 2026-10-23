import type {Metadata} from 'next';
import Link from 'next/link';
import {PaginaLegal, Seccion, Lista, Correo, EMPRESA, WHATSAPP_ATENCION} from '@/app/componentes/PaginaLegal';

export const metadata : Metadata = {
    title: 'Términos y condiciones',
    description: `Condiciones de uso del sitio web y de las cotizaciones de ${EMPRESA}.`,
};

export default function Page() {
    return (
        <PaginaLegal titulo={"Términos y condiciones"} resumen={`Estas condiciones regulan el uso de este sitio web de ${EMPRESA}. Al navegar por el sitio o solicitar una cotización, aceptas lo que se indica a continuación.`}>

            <Seccion titulo={"1. Sobre el sitio"}>
                <p>Este sitio es un catálogo en línea de equipos de protección personal (EPP) y productos de seguridad industrial. Su finalidad es mostrar nuestros productos y permitirte solicitar cotizaciones. Las compras se concretan con nuestro equipo de ventas, no directamente en el sitio.</p>
            </Seccion>

            <Seccion titulo={"2. Precios, stock e imágenes"}>
                <Lista>
                    <li>Los precios se muestran en soles (S/) e incluyen IGV, salvo que se indique lo contrario.</li>
                    <li>Los precios, descuentos y el stock pueden cambiar sin previo aviso y están sujetos a confirmación.</li>
                    <li>Las imágenes son referenciales; el color, el empaque o la presentación pueden variar ligeramente.</li>
                </Lista>
            </Seccion>

            <Seccion titulo={"3. Cotizaciones"}>
                <Lista>
                    <li>Una cotización generada en el sitio es una propuesta referencial y no constituye una venta ni una reserva de stock.</li>
                    <li>El precio final, los plazos de entrega y las condiciones de pago se confirman con nuestro equipo de ventas.</li>
                    <li>Salvo que se indique otra cosa, una cotización tiene una validez de 7 días calendario.</li>
                    <li>Los datos que ingreses en el formulario deben ser verdaderos; los usaremos según nuestra <Link href={"/privacidad"} className={"font-medium text-sky-700 hover:underline"}>Política de privacidad</Link>.</li>
                </Lista>
            </Seccion>

            <Seccion titulo={"4. Pedidos, entregas y comprobantes"}>
                <p>Al confirmar un pedido acordaremos contigo la forma de pago, la entrega y el tipo de comprobante (boleta o factura electrónica). Las condiciones acordadas en ese momento prevalecen sobre lo publicado en el sitio.</p>
            </Seccion>

            <Seccion titulo={"5. Uso correcto del sitio"}>
                <p>Te comprometes a no usar el sitio para fines ilícitos, a no intentar acceder al panel de administración sin autorización y a no enviar solicitudes masivas o automatizadas que afecten su funcionamiento.</p>
            </Seccion>

            <Seccion titulo={"6. Propiedad intelectual"}>
                <p>Los textos, el diseño y el contenido propio del sitio pertenecen a {EMPRESA}. Las marcas y logotipos de los fabricantes pertenecen a sus respectivos titulares y se muestran solo para identificar sus productos.</p>
            </Seccion>

            <Seccion titulo={"7. Responsabilidad"}>
                <p>Hacemos lo posible para que la información del sitio sea correcta y esté disponible, pero puede haber errores o interrupciones. La correcta selección y uso de los EPP según el riesgo de cada trabajo es responsabilidad del usuario; si tienes dudas, consúltanos antes de comprar.</p>
            </Seccion>

            <Seccion titulo={"8. Atención al cliente y reclamos"}>
                <p>Puedes escribirnos a <Correo/> o por WhatsApp al {WHATSAPP_ATENCION}. Como establece el Código de Protección y Defensa del Consumidor (Ley N° 29571), también ponemos a tu disposición nuestro Libro de Reclamaciones.</p>
            </Seccion>

            <Seccion titulo={"9. Ley aplicable"}>
                <p>Estos términos se rigen por las leyes de la República del Perú. Podemos actualizarlos en cualquier momento; la versión vigente es la publicada en esta página.</p>
            </Seccion>
        </PaginaLegal>
    )
}
