import type {Request, Response} from 'express';
import crypto from 'crypto';

// webhook de WhatsApp Business Cloud API (Meta > tu app > WhatsApp > Configuración)
// url de devolucion de llamada: https://<tu-backend>/webhook/whatsapp
// token de verificacion: el mismo valor que WHATSAPP_VERIFY_TOKEN

// meta llama con GET una sola vez al guardar el webhook: si el token coincide se devuelve el challenge
const verificar = (req : Request, res : Response) => {
    const esperado = process.env.WHATSAPP_VERIFY_TOKEN;
    const modo = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (esperado && modo === 'subscribe' && token === esperado && typeof challenge === 'string') {
        res.status(200).type('text/plain').send(challenge);
        return;
    }
    res.sendStatus(403);
}

// con WHATSAPP_APP_SECRET (Meta > Configuración de la app > Básica) se comprueba que el aviso viene de meta
const firmaValida = (cuerpo : Buffer, firma : string | undefined) => {
    const secreto = process.env.WHATSAPP_APP_SECRET;
    if (!secreto) return true;
    if (!firma?.startsWith('sha256=')) return false;
    const calculada = Buffer.from(crypto.createHmac('sha256', secreto).update(cuerpo).digest('hex'));
    const recibida = Buffer.from(firma.slice('sha256='.length));
    return calculada.length === recibida.length && crypto.timingSafeEqual(calculada, recibida);
}

// meta avisa por POST los mensajes que escriben los clientes y el estado de los que se enviaron
// (entregado, leido, fallido). Hay que responder 200 rapido o meta reintenta el aviso
const recibir = (req : Request, res : Response) => {
    const cuerpo = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    if (!firmaValida(cuerpo, req.get('x-hub-signature-256'))) {
        res.sendStatus(401);
        return;
    }
    res.sendStatus(200);

    let aviso : any;
    try { aviso = JSON.parse(cuerpo.toString('utf8')); } catch { return; }
    for (const entrada of aviso?.entry ?? []) {
        for (const cambio of entrada?.changes ?? []) {
            const valor = cambio?.value ?? {};
            for (const mensaje of valor.messages ?? []) {
                console.log(`WhatsApp: mensaje de ${mensaje.from} (${mensaje.type}): ${mensaje.text?.body ?? ''}`);
            }
            for (const estado of valor.statuses ?? []) {
                const error = estado.errors?.[0]?.title ? ` - ${estado.errors[0].title}` : '';
                console.log(`WhatsApp: mensaje a ${estado.recipient_id} ${estado.status}${error}`);
            }
        }
    }
}

export default {verificar, recibir};
