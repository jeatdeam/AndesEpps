// copia a la base de datos los productos, banners y cotizaciones que estaban en backend/data/*.json
// uso: npx ts-node src/scripts/importarJson.ts   (no duplica: lo que ya existe se actualiza)
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import {Prisma} from '@prisma/client';
import {prisma} from '../db';
import {productosIniciales} from '../datos/productosIniciales';

const CARPETA_DATA = path.join(__dirname, '..', '..', 'data');
const leerJson = <T>(nombre : string, porDefecto : T) : T => {
    const ruta = path.join(CARPETA_DATA, nombre);
    return fs.existsSync(ruta) ? JSON.parse(fs.readFileSync(ruta, 'utf-8')) : porDefecto;
}

const main = async () => {
    // sin productos.json se cargan los productos iniciales del codigo
    const productos : any[] = leerJson('productos.json', productosIniciales);
    for (const p of productos) {
        const datos = {
            name : p.name, precio : p.precio, stock : p.stock, img : p.img ?? [],
            descripcionPrimaria : p.descripcionPrimaria ?? '', descripcionSecundaria : p.descripcionSecundaria ?? [],
            caracteristicas : p.caracteristicas ?? [], informacionAdicional : p.informacionAdicional ?? [],
            categoria : p.categoria, marca : p.marca ?? null, normas : p.normas ?? [], tallas : p.tallas ?? [],
            colores : p.colores ?? [], material : p.material ?? null, descuento : p.descuento ?? 0,
            creadoEn : p.creadoEn ? new Date(p.creadoEn) : null, calificacion : p.calificacion ?? null, resenas : p.resenas ?? null,
        };
        await prisma.producto.upsert({where: {id: p.id}, create: {id: p.id, ...datos}, update: datos});
    }

    const banners : Record<string, any> = leerJson('banners.json', {});
    let cantidadBanners = 0;
    for (const [posicion, b] of Object.entries(banners)) {
        if (!b) continue;
        const datos = {imagen: b.imagen, titulo: b.titulo ?? '', categoria: b.categoria ?? null, productoId: b.productoId ?? null};
        await prisma.banner.upsert({where: {posicion}, create: {posicion, ...datos}, update: datos});
        cantidadBanners++;
    }

    const cotizaciones : any[] = leerJson('cotizaciones.json', []);
    for (const c of cotizaciones) {
        const datos = {
            numero : c.numero, archivo : c.archivo, fecha : new Date(c.fecha), cliente : c.cliente, items : c.items, total : c.total,
            enviosCorreo : c.envios?.correo ?? 0, enviosWhatsapp : c.envios?.whatsapp ?? 0,
        };
        await prisma.cotizacion.upsert({where: {numero: c.numero}, create: {id: Number(c.numero.replace(/\D/g, '')), ...datos}, update: datos});
    }

    // los ids se pusieron a mano: el autoincremento debe seguir desde el mayor
    for (const tabla of ['Producto', 'Cotizacion']) {
        await prisma.$executeRaw(Prisma.sql`SELECT setval(pg_get_serial_sequence(${`"${tabla}"`}, 'id'), COALESCE((SELECT MAX(id) FROM ${Prisma.raw(`"${tabla}"`)}), 1))`);
    }

    console.log(`Importados: ${productos.length} productos, ${cantidadBanners} banners, ${cotizaciones.length} cotizaciones.`);
}

main()
    .catch(error => { console.error('No se pudo importar:', error); process.exitCode = 1; })
    .finally(() => prisma.$disconnect());
