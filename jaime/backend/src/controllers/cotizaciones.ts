import type {Request, Response} from 'express';
import fs from 'fs';
import path from 'path';
import {leerProductos} from '../almacen';
import {registrarCotizacion, buscarCotizacion, actualizarCotizacion, generarPdf, CARPETA_COTIZACIONES, type Cotizacion, type ClienteCotizacion, type ItemCotizacion} from '../cotizacion';
import {enviarCorreo, enviarWhatsapp, correoConfigurado, whatsappConfigurado, type EstadoEnvio} from '../envios';
import {cargarMiniaturas} from '../miniaturas';

const MAX_PRODUCTOS = 50;
const MAX_CANTIDAD = 9999;
// evita usar una misma cotizacion para mandar mensajes sin limite
const MAX_ENVIOS_POR_CANAL = 3;

type Canal = 'correo' | 'whatsapp';

// el nombre lleva una parte aleatoria, asi solo abre el pdf quien recibio el enlace
const ARCHIVO_VALIDO = /^COT-\d{6,}-[0-9a-f]{16}\.pdf$/;

const texto = (valor : unknown, maximo : number) => typeof valor === 'string' ? valor.trim().slice(0, maximo) : '';
const correoValido = (correo : string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

// acepta celulares peruanos de 9 digitos (se les agrega el 51) o numeros con codigo de pais
const normalizarWhatsapp = (valor : string) => {
    const digitos = valor.replace(/\D/g, '');
    if (/^9\d{8}$/.test(digitos)) return `51${digitos}`;
    return /^\d{10,15}$/.test(digitos) ? digitos : null;
}

// envia por un canal y lo cuenta; un error se registra en consola y se informa como 'error'
const enviarPorCanal = async (canal : Canal, cotizacion : Cotizacion, pdf : Buffer, miniaturas : Map<number, Buffer>) : Promise<EstadoEnvio> => {
    try {
        const estado = canal === 'correo' ? await enviarCorreo(cotizacion, pdf, miniaturas) : await enviarWhatsapp(cotizacion, pdf);
        if (estado === 'enviado') cotizacion.envios[canal]++;
        return estado;
    } catch (error) {
        console.error(`No se pudo enviar la cotización ${cotizacion.numero} por ${canal}:`, error);        return 'error';
    }
}

// GET /cotizaciones/canales: el formulario solo ofrece los canales configurados en backend/.env
const canalesDisponibles = (_req : Request, res : Response) => {
    res.json({correo: correoConfigurado(), whatsapp: whatsappConfigurado()});
}

// POST /cotizaciones
const crearCotizacion = async (req : Request, res : Response) => {
    const cuerpo = req.body ?? {};
    const entrada = cuerpo.cliente ?? {};
    const canales = {correo: cuerpo.canales?.correo === true, whatsapp: cuerpo.canales?.whatsapp === true};

    const correo = texto(entrada.correo, 150).toLowerCase();
    const whatsappIngresado = texto(entrada.whatsapp, 30);
    const whatsapp = whatsappIngresado ? normalizarWhatsapp(whatsappIngresado) : '';

    const cliente : ClienteCotizacion = {
        nombre : texto(entrada.nombre, 100),
        empresa : texto(entrada.empresa, 120) || undefined,
        documento : texto(entrada.documento, 11) || undefined,
        correo : correo || undefined,
        whatsapp : whatsapp || undefined,
        mensaje : texto(entrada.mensaje, 500) || undefined,
    };
    if (cliente.nombre.length < 2) return res.status(400).json({error: 'Ingresa tu nombre.'});
    if (canales.correo && !correo) return res.status(400).json({error: 'Ingresa el correo donde quieres recibir la cotización.'});
    if (correo && !correoValido(correo)) return res.status(400).json({error: 'El correo no es válido.'});
    if (canales.whatsapp && !whatsappIngresado) return res.status(400).json({error: 'Ingresa el WhatsApp donde quieres recibir la cotización.'});
    if (whatsapp === null) return res.status(400).json({error: 'El número de WhatsApp no es válido.'});
    if (cliente.documento && !/^(\d{8}|\d{11})$/.test(cliente.documento)) return res.status(400).json({error: 'El RUC debe tener 11 dígitos o el DNI 8.'});

    const pedidos = Array.isArray(cuerpo.productos) ? cuerpo.productos : [];
    if (pedidos.length === 0 || pedidos.length > MAX_PRODUCTOS) return res.status(400).json({error: `Cotiza entre 1 y ${MAX_PRODUCTOS} productos.`});

    // nombres, fotos y precios salen del catalogo, no del navegador
    const catalogo = await leerProductos();
    const items : ItemCotizacion[] = [];
    for (const pedido of pedidos) {
        const producto = catalogo.find(p => p.id === Number(pedido?.id));
        const cantidad = Number(pedido?.cantidad);
        if (!producto) return res.status(400).json({error: 'Uno de los productos ya no existe.'});
        if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAX_CANTIDAD) return res.status(400).json({error: `La cantidad debe estar entre 1 y ${MAX_CANTIDAD}.`});
        if (items.some(i => i.id === producto.id)) continue;
        const descuento = producto.descuento ?? 0;
        const precioUnitario = descuento > 0 ? Math.round(producto.precio * (100 - descuento)) / 100 : producto.precio;
        items.push({
            id : producto.id, nombre : producto.name, categoria : producto.categoria, imagen : producto.img[0], cantidad,
            precioLista : producto.precio, descuento, precioUnitario,
            subtotal : Math.round(precioUnitario * cantidad * 100) / 100,
        });
    }
    const total = Math.round(items.reduce((acc, i) => acc + i.subtotal, 0) * 100) / 100;

    try {
        const cotizacion = await registrarCotizacion({cliente, items, total});
        const miniaturas = await cargarMiniaturas(items);
        const pdf = await generarPdf(cotizacion, miniaturas);
        // los canales se envian a la vez; uno que falla no impide el otro
        const [estadoCorreo, estadoWhatsapp] = await Promise.all((['correo', 'whatsapp'] as const).map(canal =>
            canales[canal] ? enviarPorCanal(canal, cotizacion, pdf, miniaturas) : Promise.resolve<EstadoEnvio>('no-solicitado')));
        await actualizarCotizacion(cotizacion);
        res.status(201).json({
            numero : cotizacion.numero,
            archivo : cotizacion.archivo,
            total,
            pdf : `/cotizaciones-pdf/${cotizacion.archivo}`,
            correo : estadoCorreo,
            whatsapp : estadoWhatsapp,
        });
    } catch (error) {
        console.error('No se pudo generar la cotización:', error);
        res.status(500).json({error: 'No se pudo generar la cotización. Inténtalo de nuevo.'});
    }
}

// POST /cotizaciones/enviar {archivo, canal, destino}: envia (o reenvia) una cotizacion ya generada
const enviarCotizacion = async (req : Request, res : Response) => {
    const archivo = texto(req.body?.archivo, 80);
    const canalIngresado : unknown = req.body?.canal;
    if (canalIngresado !== 'correo' && canalIngresado !== 'whatsapp') return res.status(400).json({error: 'Canal no válido.'});
    const canal : Canal = canalIngresado;
    const cotizacion = ARCHIVO_VALIDO.test(archivo) ? await buscarCotizacion(archivo) : undefined;
    if (!cotizacion) return res.status(404).json({error: 'La cotización no existe.'});
    if (cotizacion.envios[canal] >= MAX_ENVIOS_POR_CANAL) return res.status(429).json({error: 'Ya se envió varias veces por este medio. Si no la recibiste, escríbenos por WhatsApp.'});

    // el destino puede cambiar (ej. corrigio un correo mal escrito)
    const ingresado = texto(req.body?.destino, canal === 'correo' ? 150 : 30);
    if (canal === 'correo') {
        const correo = ingresado.toLowerCase();
        if (!correoValido(correo)) return res.status(400).json({error: 'El correo no es válido.'});
        cotizacion.cliente.correo = correo;
    } else {
        const whatsapp = normalizarWhatsapp(ingresado);
        if (!whatsapp) return res.status(400).json({error: 'El número de WhatsApp no es válido.'});
        cotizacion.cliente.whatsapp = whatsapp;
    }

    // las cotizaciones guardadas antes de incluir fotos toman la del catalogo
    const catalogo = await leerProductos();
    cotizacion.items.forEach(item => { item.imagen ??= catalogo.find(p => p.id === item.id)?.img[0]; });

    try {
        const miniaturas = await cargarMiniaturas(cotizacion.items);
        // se vuelve a generar para que el pdf muestre el contacto actualizado
        const pdf = await generarPdf(cotizacion, miniaturas);
        const estado = await enviarPorCanal(canal, cotizacion, pdf, miniaturas);
        await actualizarCotizacion(cotizacion);
        res.json({estado});
    } catch (error) {
        console.error('No se pudo reenviar la cotización:', error);
        res.status(500).json({error: 'No se pudo enviar la cotización. Inténtalo de nuevo.'});
    }
}

// GET /cotizaciones-pdf/:archivo: si el pdf ya no esta en disco (ej. tras un despliegue) se vuelve a generar desde la base de datos
const descargarPdf = async (req : Request, res : Response) => {
    const archivo = String(req.params.archivo ?? '');
    if (!ARCHIVO_VALIDO.test(archivo)) return res.status(404).json({error: 'La cotización no existe.'});
    const ruta = path.join(CARPETA_COTIZACIONES, archivo);
    if (!fs.existsSync(ruta)) {
        const cotizacion = await buscarCotizacion(archivo);
        if (!cotizacion) return res.status(404).json({error: 'La cotización no existe.'});
        await generarPdf(cotizacion, await cargarMiniaturas(cotizacion.items));
    }
    res.type('application/pdf').sendFile(ruta);
}

export default {canalesDisponibles, crearCotizacion, enviarCotizacion, descargarPdf};
