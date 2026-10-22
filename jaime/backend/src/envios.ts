import nodemailer from 'nodemailer';
import {type Cotizacion, formatoSoles, formatoFecha, venceEl} from './cotizacion';

// cada canal se activa cuando sus variables estan en backend/.env (ver .env.example)
export type EstadoEnvio = 'enviado' | 'no-solicitado' | 'no-configurado' | 'error';

const URL_TIENDA = () => (process.env.URL_TIENDA || 'http://localhost:3000').replace(/\/+$/, '');
const aSlug = (texto : string) => texto.replace(/\s+/g, '-').toLowerCase();

const escaparHtml = (texto : string) => texto.replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]!));

// ---------------- correo (SMTP) ----------------

export const correoConfigurado = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

// las fotos van adjuntas e incrustadas (cid): una url de localhost no se veria en el correo del cliente
const cidFoto = (id : number) => `producto-${id}@losandes`;

const htmlCorreo = (cotizacion : Cotizacion, miniaturas : Map<number, Buffer>) => {
    const tienda = URL_TIENDA();
    const filas = cotizacion.items.map(item => `
        <tr>
            <td style="padding:10px 0 10px 8px;border-bottom:1px solid #e2e8f0;width:56px">
                ${miniaturas.has(item.id) ? `<img src="cid:${cidFoto(item.id)}" width="52" height="52" alt="" style="display:block;border:1px solid #e2e8f0;border-radius:8px">` : ''}
            </td>
            <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0">
                <a href="${tienda}/productos/${encodeURIComponent(aSlug(item.categoria))}/${encodeURIComponent(aSlug(item.nombre))}" style="color:#0f172a;font-weight:600;text-decoration:none;text-transform:capitalize">${escaparHtml(item.nombre)}</a>
                <div style="color:#64748b;font-size:12px;text-transform:capitalize">${escaparHtml(item.categoria)}${item.descuento > 0 ? ` · -${item.descuento}%` : ''}</div>
            </td>
            <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:center">${item.cantidad}</td>
            <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap">${formatoSoles(item.precioUnitario)}</td>
            <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap;font-weight:600">${formatoSoles(item.subtotal)}</td>
        </tr>`).join('');

    return `
    <div style="background:#f1f5f9;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden">
            <div style="height:6px;background:#facc15"></div>
            <div style="padding:24px 28px">
                <div style="font-size:20px;font-weight:700">Los Andes J &amp; C</div>
                <div style="color:#64748b;font-size:13px">Cotización ${cotizacion.numero} · ${formatoFecha(new Date(cotizacion.fecha))}</div>
                <p style="font-size:15px;line-height:1.6;margin:22px 0 6px">Hola ${escaparHtml(cotizacion.cliente.nombre)},</p>
                <p style="font-size:15px;line-height:1.6;margin:0 0 18px">Gracias por tu interés. Estos son los productos que cotizaste; también adjuntamos la cotización en PDF.</p>
                <table style="width:100%;border-collapse:collapse;font-size:14px">
                    <thead>
                        <tr style="background:#0f172a;color:#ffffff">
                            <th style="padding:9px 8px;text-align:left" colspan="2">Producto</th>
                            <th style="padding:9px 8px">Cant.</th>
                            <th style="padding:9px 8px;text-align:right">P. unit.</th>
                            <th style="padding:9px 8px;text-align:right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>${filas}</tbody>
                </table>
                <div style="text-align:right;margin-top:14px">
                    <span style="display:inline-block;background:#facc15;border-radius:8px;padding:10px 16px;font-size:16px;font-weight:700">Total: ${formatoSoles(cotizacion.total)}</span>
                    <div style="color:#64748b;font-size:12px;margin-top:6px">Incluye IGV · Válida hasta el ${formatoFecha(venceEl(cotizacion))}</div>
                </div>
                <div style="text-align:center;margin:28px 0 8px">
                    <a href="${tienda}/productos" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:600;border-radius:999px;padding:12px 24px">Ver catálogo completo</a>
                </div>
                <p style="color:#64748b;font-size:13px;line-height:1.6;margin:20px 0 0">Para confirmar tu pedido responde a este correo o escríbenos por WhatsApp al <a href="https://wa.me/51986680850" style="color:#16a34a">986 680 850</a>.</p>
            </div>
        </div>
    </div>`;
}

export const enviarCorreo = async (cotizacion : Cotizacion, pdf : Buffer, miniaturas : Map<number, Buffer>) : Promise<EstadoEnvio> => {
    if (!correoConfigurado()) return 'no-configurado';
    if (!cotizacion.cliente.correo) throw new Error('la cotización no tiene correo');
    const puerto = Number(process.env.SMTP_PORT || 465);
    const transporte = nodemailer.createTransport({
        host : process.env.SMTP_HOST,
        port : puerto,
        secure : puerto === 465,
        auth : {user: process.env.SMTP_USER, pass: process.env.SMTP_PASS},
    });
    await transporte.sendMail({
        from : process.env.CORREO_REMITENTE || process.env.SMTP_USER,
        to : cotizacion.cliente.correo,
        // copia oculta para que ventas reciba cada cotizacion
        bcc : process.env.CORREO_VENTAS || undefined,
        subject : `Tu cotización ${cotizacion.numero} - Los Andes J & C`,
        html : htmlCorreo(cotizacion, miniaturas),
        attachments : [
            {filename: `Cotizacion-${cotizacion.numero}.pdf`, content: pdf, contentType: 'application/pdf'},
            ...[...miniaturas].map(([id, foto]) => ({filename: `producto-${id}.jpg`, content: foto, contentType: 'image/jpeg', cid: cidFoto(id)})),
        ],
    });
    return 'enviado';
}

// ---------------- whatsapp (WhatsApp Business Cloud API de Meta) ----------------

export const whatsappConfigurado = () => Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

const llamarApi = async (ruta : string, cuerpo : FormData | object) => {
    const version = process.env.WHATSAPP_API_VERSION || 'v23.0';
    const esFormulario = cuerpo instanceof FormData;
    const respuesta = await fetch(`https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/${ruta}`, {
        method : 'POST',
        headers : {
            Authorization : `Bearer ${process.env.WHATSAPP_TOKEN}`,
            ...(esFormulario ? {} : {'Content-Type': 'application/json'}),
        },
        body : esFormulario ? cuerpo : JSON.stringify(cuerpo),
    });
    const json = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) throw new Error(`WhatsApp ${ruta}: ${json?.error?.message ?? respuesta.status}`);
    return json;
}

export const enviarWhatsapp = async (cotizacion : Cotizacion, pdf : Buffer) : Promise<EstadoEnvio> => {
    if (!whatsappConfigurado()) return 'no-configurado';
    if (!cotizacion.cliente.whatsapp) throw new Error('la cotización no tiene WhatsApp');
    const nombreArchivo = `Cotizacion-${cotizacion.numero}.pdf`;

    // 1. se sube el pdf a meta para obtener su id
    const formulario = new FormData();
    formulario.append('messaging_product', 'whatsapp');
    formulario.append('type', 'application/pdf');
    formulario.append('file', new Blob([new Uint8Array(pdf)], {type: 'application/pdf'}), nombreArchivo);
    const {id} = await llamarApi('media', formulario);

    // 2. se envia el documento. Meta solo permite mensajes libres si el cliente escribio en las ultimas 24 h;
    // para escribirle primero hace falta una plantilla aprobada con encabezado de tipo documento
    const plantilla = process.env.WHATSAPP_PLANTILLA;
    const mensaje = plantilla ? {
        type : 'template',
        template : {
            name : plantilla,
            language : {code: process.env.WHATSAPP_IDIOMA || 'es'},
            components : [
                {type: 'header', parameters: [{type: 'document', document: {id, filename: nombreArchivo}}]},
                // la plantilla debe tener {{1}} = nombre del cliente y {{2}} = numero de cotizacion
                {type: 'body', parameters: [{type: 'text', text: cotizacion.cliente.nombre}, {type: 'text', text: cotizacion.numero}]},
            ],
        },
    } : {
        type : 'document',
        document : {id, filename: nombreArchivo, caption: `Hola ${cotizacion.cliente.nombre}, esta es tu cotización ${cotizacion.numero} de Los Andes J & C. Total: ${formatoSoles(cotizacion.total)}`},
    };
    await llamarApi('messages', {messaging_product: 'whatsapp', to: cotizacion.cliente.whatsapp, ...mensaje});
    return 'enviado';
}
