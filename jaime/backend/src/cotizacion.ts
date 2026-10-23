import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import {Prisma, type Cotizacion as FilaCotizacion} from '@prisma/client';
import {prisma} from './db';

export type ClienteCotizacion = {
    nombre : string,
    empresa? : string | undefined,
    documento? : string | undefined,
    // el cliente elige por donde recibirla: el correo y el whatsapp son opcionales
    correo? : string | undefined,
    // solo digitos con codigo de pais (ej. 51987654321)
    whatsapp? : string | undefined,
    mensaje? : string | undefined,
}

export type ItemCotizacion = {
    id : number,
    nombre : string,
    categoria : string,
    // primera foto del producto
    imagen? : string | undefined,
    cantidad : number,
    precioLista : number,
    descuento : number,
    // precio con descuento aplicado, incluye IGV
    precioUnitario : number,
    subtotal : number,
}

export type Cotizacion = {
    numero : string,
    // parte aleatoria del nombre del pdf para que no se pueda adivinar la url de otra cotizacion
    archivo : string,
    fecha : string,
    cliente : ClienteCotizacion,
    items : ItemCotizacion[],
    total : number,
    // veces que se envio por cada canal (limita los reenvios)
    envios : {correo : number, whatsapp : number},
}

export const DIAS_VALIDEZ = 7;
export const IGV = 0.18;
export const CARPETA_COTIZACIONES = path.join(__dirname, '..', 'data', 'cotizaciones');
const aCotizacion = (fila : FilaCotizacion) : Cotizacion => ({
    numero : fila.numero,
    archivo : fila.archivo,
    fecha : fila.fecha.toISOString(),
    cliente : fila.cliente as ClienteCotizacion,
    items : fila.items as ItemCotizacion[],
    total : Number(fila.total),
    envios : {correo: fila.enviosCorreo, whatsapp: fila.enviosWhatsapp},
});

// el nombre del pdf (con su parte aleatoria) identifica la cotizacion al reenviarla
export const buscarCotizacion = async (archivo : string) => {
    const fila = await prisma.cotizacion.findUnique({where: {archivo}});
    return fila ? aCotizacion(fila) : undefined;
}

// guarda el contacto corregido y los envios contados
export const actualizarCotizacion = async (cotizacion : Cotizacion) => {
    await prisma.cotizacion.update({
        where : {archivo: cotizacion.archivo},
        data : {cliente: cotizacion.cliente as Prisma.InputJsonObject, enviosCorreo: cotizacion.envios.correo, enviosWhatsapp: cotizacion.envios.whatsapp},
    });
}

// el numero sale del id que asigna la base de datos, asi dos cotizaciones simultaneas no lo repiten
export const registrarCotizacion = async (datos : Omit<Cotizacion, 'numero' | 'archivo' | 'fecha' | 'envios'>) : Promise<Cotizacion> => {
    const fila = await prisma.$transaction(async tx => {
        const temporal = `pendiente-${crypto.randomUUID()}`;
        const creada = await tx.cotizacion.create({data: {
            numero : temporal,
            archivo : temporal,
            cliente : datos.cliente as Prisma.InputJsonObject,
            items : datos.items as unknown as Prisma.InputJsonArray,
            total : datos.total,
        }});
        const numero = `COT-${String(creada.id).padStart(6, '0')}`;
        return tx.cotizacion.update({where: {id: creada.id}, data: {numero, archivo: `${numero}-${crypto.randomBytes(8).toString('hex')}.pdf`}});
    });
    return aCotizacion(fila);
}

export const formatoSoles = (monto : number) => `S/ ${monto.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
export const formatoFecha = (fecha : Date) => fecha.toLocaleDateString('es-PE', {day: '2-digit', month: '2-digit', year: 'numeric'});
export const venceEl = (cotizacion : Cotizacion) => new Date(new Date(cotizacion.fecha).getTime() + DIAS_VALIDEZ * 86400000);
const capitalizar = (texto : string) => texto.charAt(0).toUpperCase() + texto.slice(1);

const COLOR = {tinta: '#0F172A', gris: '#64748B', linea: '#E2E8F0', fila: '#F8FAFC', amarillo: '#FACC15'};

// columnas de la tabla de productos (x y ancho dentro del margen de 40)
const COLUMNAS = [
    {titulo: 'N°', x: 40, ancho: 26, alinear: 'left'},
    {titulo: '', x: 66, ancho: 50, alinear: 'left'},
    {titulo: 'Producto', x: 116, ancho: 199, alinear: 'left'},
    {titulo: 'Cant.', x: 315, ancho: 50, alinear: 'center'},
    {titulo: 'P. unit.', x: 365, ancho: 90, alinear: 'right'},
    {titulo: 'Subtotal', x: 455, ancho: 100, alinear: 'right'},
] as const;

const FOTO = 40;

// genera el pdf, lo guarda en data/cotizaciones y devuelve su contenido.
// miniaturas: id del producto -> jpg (ver miniaturas.ts); los que no tienen se dibujan sin foto
export const generarPdf = (cotizacion : Cotizacion, miniaturas : Map<number, Buffer>) : Promise<Buffer> => new Promise((resolve, reject) => {
    const doc = new PDFDocument({size: 'A4', margin: 40, info: {Title: `Cotización ${cotizacion.numero}`, Author: 'Los Andes EPPS'}});
    const partes : Buffer[] = [];
    doc.on('data', parte => partes.push(parte));
    doc.on('error', reject);
    doc.on('end', () => {
        const pdf = Buffer.concat(partes);
        fs.mkdirSync(CARPETA_COTIZACIONES, {recursive: true});
        fs.writeFileSync(path.join(CARPETA_COTIZACIONES, cotizacion.archivo), pdf);
        resolve(pdf);
    });

    const {cliente} = cotizacion;

    // encabezado
    doc.rect(0, 0, doc.page.width, 8).fill(COLOR.amarillo);
    doc.fillColor(COLOR.tinta).font('Helvetica-Bold').fontSize(20).text('Los Andes EPPS', 40, 36);
    doc.font('Helvetica').fontSize(9).fillColor(COLOR.gris)
        .text('Equipos de protección personal y seguridad industrial', 40, 60)
        .text('WhatsApp: 986 680 850  ·  servicioalcliente@rashperu.com', 40, 73);

    doc.font('Helvetica-Bold').fontSize(16).fillColor(COLOR.tinta).text('COTIZACIÓN', 355, 36, {width: 200, align: 'right'});
    doc.font('Helvetica').fontSize(9).fillColor(COLOR.gris)
        .text(`N° ${cotizacion.numero}`, 355, 58, {width: 200, align: 'right'})
        .text(`Fecha: ${formatoFecha(new Date(cotizacion.fecha))}`, 355, 71, {width: 200, align: 'right'})
        .text(`Válida hasta: ${formatoFecha(venceEl(cotizacion))}`, 355, 84, {width: 200, align: 'right'});

    // datos del cliente
    const datos : [string, string | undefined][] = [
        ['Cliente', cliente.nombre], ['Empresa', cliente.empresa], ['RUC / DNI', cliente.documento],
        ['Correo', cliente.correo], ['WhatsApp', cliente.whatsapp && `+${cliente.whatsapp}`],
    ];
    const visibles = datos.filter((dato) : dato is [string, string] => Boolean(dato[1]));
    const altoCliente = 30 + Math.ceil(visibles.length / 2) * 16;
    doc.roundedRect(40, 112, 515, altoCliente, 6).fill(COLOR.fila);
    doc.font('Helvetica-Bold').fontSize(10).fillColor(COLOR.tinta).text('Datos del cliente', 52, 122);
    visibles.forEach(([etiqueta, valor], i) => {
        const x = i % 2 === 0 ? 52 : 305, y = 140 + Math.floor(i / 2) * 16;
        doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR.gris).text(`${etiqueta}: `, x, y, {continued: true})
            .font('Helvetica').fillColor(COLOR.tinta).text(valor, {width: 240, lineBreak: false, ellipsis: true});
    });

    // tabla de productos
    const encabezadoTabla = (y : number) => {
        doc.rect(40, y, 515, 22).fill(COLOR.tinta);
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF');
        COLUMNAS.forEach(c => doc.text(c.titulo, c.x + 6, y + 7, {width: c.ancho - 12, align: c.alinear}));
        return y + 22;
    }
    let y = encabezadoTabla(112 + altoCliente + 20);

    cotizacion.items.forEach((item, i) => {
        const [colNumero, colFoto, colProducto, colCantidad, colPrecio, colSubtotal] = COLUMNAS;
        const nombre = capitalizar(item.nombre);
        doc.font('Helvetica').fontSize(9.5);
        const altoNombre = doc.heightOfString(nombre, {width: colProducto.ancho - 12});
        const alto = Math.max(FOTO + 12, altoNombre + 22);
        if (y + alto > doc.page.height - 150) {
            doc.addPage();
            y = encabezadoTabla(40);
        }
        if (i % 2 === 1) doc.rect(40, y, 515, alto).fill(COLOR.fila);
        const foto = miniaturas.get(item.id);
        if (foto) {
            const fotoY = y + (alto - FOTO) / 2;
            doc.image(foto, colFoto.x + 5, fotoY, {fit: [FOTO, FOTO], align: 'center', valign: 'center'});
            doc.roundedRect(colFoto.x + 5, fotoY, FOTO, FOTO, 4).lineWidth(0.5).strokeColor(COLOR.linea).stroke();
        }
        doc.fillColor(COLOR.tinta).font('Helvetica').fontSize(9.5);
        doc.text(String(i + 1), colNumero.x + 6, y + 8, {width: colNumero.ancho - 12});
        doc.text(nombre, colProducto.x + 6, y + 8, {width: colProducto.ancho - 12});
        doc.font('Helvetica').fontSize(8).fillColor(COLOR.gris)
            .text(capitalizar(item.categoria) + (item.descuento > 0 ? `  ·  -${item.descuento}% (antes ${formatoSoles(item.precioLista)})` : ''), colProducto.x + 6, y + 10 + altoNombre, {width: colProducto.ancho - 12});
        doc.font('Helvetica').fontSize(9.5).fillColor(COLOR.tinta);
        doc.text(String(item.cantidad), colCantidad.x + 6, y + 8, {width: colCantidad.ancho - 12, align: 'center'});
        doc.text(formatoSoles(item.precioUnitario), colPrecio.x + 6, y + 8, {width: colPrecio.ancho - 12, align: 'right'});
        doc.font('Helvetica-Bold').text(formatoSoles(item.subtotal), colSubtotal.x + 6, y + 8, {width: colSubtotal.ancho - 12, align: 'right'});
        y += alto;
        doc.moveTo(40, y).lineTo(555, y).lineWidth(0.5).strokeColor(COLOR.linea).stroke();
    });

    // totales: los precios de la tienda ya incluyen IGV
    if (y + 130 > doc.page.height - 40) {
        doc.addPage();
        y = 40;
    }
    const base = Math.round(cotizacion.total / (1 + IGV) * 100) / 100;
    const filasTotal : [string, string][] = [['Op. gravada', formatoSoles(base)], ['IGV (18%)', formatoSoles(Math.round((cotizacion.total - base) * 100) / 100)]];
    y += 12;
    filasTotal.forEach(([etiqueta, valor]) => {
        doc.font('Helvetica').fontSize(9.5).fillColor(COLOR.gris).text(etiqueta, 355, y, {width: 100, align: 'right'});
        doc.fillColor(COLOR.tinta).text(valor, 455, y, {width: 94, align: 'right'});
        y += 16;
    });
    doc.roundedRect(355, y + 2, 200, 28, 6).fill(COLOR.amarillo);
    doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR.tinta)
        .text('TOTAL', 367, y + 11)
        .text(formatoSoles(cotizacion.total), 455, y + 11, {width: 94, align: 'right'});
    y += 48;

    // notas
    const notas = [
        'Precios en soles, incluyen IGV.',
        `Cotización válida por ${DIAS_VALIDEZ} días o hasta agotar stock.`,
        'Para confirmar tu pedido responde a este correo o escríbenos por WhatsApp al 986 680 850.',
    ];
    doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR.tinta).text('Condiciones', 40, y);
    doc.font('Helvetica').fontSize(8.5).fillColor(COLOR.gris).list(notas, 40, y + 14, {bulletRadius: 1.5, textIndent: 10, width: 515});
    if (cliente.mensaje) {
        doc.moveDown(0.8);
        doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR.tinta).text('Comentario del cliente', 40);
        doc.font('Helvetica').fontSize(8.5).fillColor(COLOR.gris).text(cliente.mensaje, 40, undefined, {width: 515});
    }

    doc.end();
});
