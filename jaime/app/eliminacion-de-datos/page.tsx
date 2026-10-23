import type {Metadata} from 'next';
import {PaginaLegal, Seccion, Lista, Correo, EMPRESA, CORREO_ATENCION, WHATSAPP_ATENCION} from '@/app/componentes/PaginaLegal';

export const metadata : Metadata = {
    title: 'Eliminación de datos',
    description: `Cómo solicitar a ${EMPRESA} que elimine tus datos personales.`,
};

// enlace mailto con el asunto y el cuerpo ya escritos para que el cliente solo complete sus datos
const ASUNTO = 'Solicitud de eliminación de datos personales';
const CUERPO = 'Hola, solicito que eliminen mis datos personales.\n\nNombre completo:\nCorreo y/o WhatsApp usados en las cotizaciones:\nDNI o RUC (opcional):\nN° de cotización (si lo tienes):';
const ENLACE_CORREO = `mailto:${CORREO_ATENCION}?subject=${encodeURIComponent(ASUNTO)}&body=${encodeURIComponent(CUERPO)}`;

export default function Page() {
    return (
        <PaginaLegal titulo={"Eliminación de datos"} resumen={`Puedes pedirnos en cualquier momento que eliminemos los datos personales que nos diste al usar este sitio o al escribirnos por WhatsApp. Aquí te explicamos cómo hacerlo.`}>

            <Seccion titulo={"Cómo solicitar la eliminación"}>
                <ol className={"list-decimal pl-[22px] flex flex-col gap-[6px]"}>
                    <li>Escríbenos a <Correo/> con el asunto <span className={"font-medium text-slate-900"}>“{ASUNTO}”</span>. También puedes pedirlo por WhatsApp al {WHATSAPP_ATENCION}.</li>
                    <li>Indica tu nombre completo y el correo o número de WhatsApp que usaste con nosotros. Si lo tienes, agrega el número de cotización.</li>
                    <li>Podemos pedirte un dato adicional para confirmar que la solicitud es tuya y así proteger tu información.</li>
                </ol>
                <a href={ENLACE_CORREO} className={"w-fit mt-[6px] rounded-full bg-slate-900 hover:bg-slate-700 text-white text-[14px] font-semibold px-[18px] py-[11px] transition-colors"}>
                    Enviar solicitud por correo
                </a>
            </Seccion>

            <Seccion titulo={"Qué eliminamos"}>
                <Lista>
                    <li>Tus datos de contacto y las cotizaciones asociadas a ellos, incluidos los PDF generados.</li>
                    <li>Las conversaciones que tengamos registradas contigo en nuestros canales de atención.</li>
                </Lista>
                <p>Si existen comprobantes de pago emitidos a tu nombre, debemos conservarlos durante el plazo que exige la normativa tributaria; en ese caso solo guardaremos lo estrictamente necesario y te lo informaremos.</p>
            </Seccion>

            <Seccion titulo={"Plazo de respuesta"}>
                <p>Confirmaremos la eliminación por el mismo medio por el que nos escribiste, dentro de los plazos que establece la Ley N° 29733, Ley de Protección de Datos Personales.</p>
            </Seccion>

            <Seccion titulo={"Datos guardados en tu navegador"}>
                <p>El carrito y los datos del formulario de cotización se guardan solo en tu propio navegador. Puedes borrarlos tú mismo limpiando los datos de navegación (historial, cookies y datos de sitios) de este sitio.</p>
            </Seccion>
        </PaginaLegal>
    )
}
