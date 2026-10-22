import path from 'path';
import type {Producto as FilaProducto, Banner as FilaBanner} from '@prisma/client';
import {prisma} from './db';

// productos y banners viven en la base de datos (supabase); aqui se pasan al formato que espera el frontend

export type Producto = {
    id : number,
    name : string,
    precio : number,
    stock : number,
    img : string[],
    descripcionPrimaria : string,
    descripcionSecundaria : string[],
    caracteristicas : string[],
    informacionAdicional : string[],
    categoria : string,
    marca? : string,
    normas? : string[],
    tallas? : string[],
    colores? : string[],
    material? : string,
    // porcentaje de descuento sobre "precio"; si no existe el producto no esta en oferta
    descuento? : number,
    // fecha ISO de creacion desde el dashboard; los productos iniciales no la tienen
    creadoEn? : string,
    calificacion? : number,
    resenas? : number,
}

// imagenes guardadas en disco cuando cloudinary no esta configurado
export const CARPETA_UPLOADS = path.join(__dirname, '..', 'uploads');

// los campos vacios se omiten, igual que cuando los productos estaban en el json
const aProducto = (fila : FilaProducto) : Producto => {
    const {precio, marca, material, descuento, creadoEn, calificacion, resenas, ...resto} = fila;
    const producto : Producto = {...resto, precio: Number(precio)};
    if (marca) producto.marca = marca;
    if (material) producto.material = material;
    if (descuento > 0) producto.descuento = descuento;
    if (creadoEn) producto.creadoEn = creadoEn.toISOString();
    if (calificacion !== null) producto.calificacion = calificacion;
    if (resenas !== null) producto.resenas = resenas;
    return producto;
}

const aFila = ({id: _id, creadoEn, ...producto} : Producto) => ({
    ...producto,
    normas : producto.normas ?? [],
    tallas : producto.tallas ?? [],
    colores : producto.colores ?? [],
    marca : producto.marca ?? null,
    material : producto.material ?? null,
    descuento : producto.descuento ?? 0,
    creadoEn : creadoEn ? new Date(creadoEn) : null,
    calificacion : producto.calificacion ?? null,
    resenas : producto.resenas ?? null,
});

export const leerProductos = async () : Promise<Producto[]> =>
    (await prisma.producto.findMany({orderBy: {id: 'asc'}})).map(aProducto);

export const buscarProducto = async (id : number) : Promise<Producto | undefined> => {
    if (!Number.isInteger(id)) return undefined;
    const fila = await prisma.producto.findUnique({where: {id}});
    return fila ? aProducto(fila) : undefined;
}

// el id que traiga el producto se ignora: lo asigna la base de datos
export const crearProducto = async (producto : Producto) =>
    aProducto(await prisma.producto.create({data: aFila(producto)}));

export const actualizarProducto = async (producto : Producto) =>
    aProducto(await prisma.producto.update({where: {id: producto.id}, data: aFila(producto)}));

export const eliminarProducto = async (id : number) => {
    await prisma.producto.delete({where: {id}});
}

// ---------------- banners de ofertas de la pagina principal ----------------

// principal y secundarios: seccion "Ofertas"; nuevos-*: seccion "Nuevos ingresos"
export const POSICIONES_BANNER = ['principal', 'secundario-1', 'secundario-2', 'secundario-3', 'nuevos-1', 'nuevos-2', 'nuevos-3', 'nuevos-4', 'nuevos-5'] as const;
export type PosicionBanner = typeof POSICIONES_BANNER[number];

// sin productoId ni categoria el banner lleva a todas las ofertas
export type Banner = {
    imagen : string,
    titulo : string,
    categoria? : string,
    productoId? : number,
}

// una posicion sin banner (null) se muestra con el banner automatico armado a partir de los descuentos
export type Banners = Record<PosicionBanner, Banner | null>;

const aBanner = (fila : FilaBanner) : Banner => {
    const banner : Banner = {imagen: fila.imagen, titulo: fila.titulo};
    if (fila.productoId !== null) banner.productoId = fila.productoId;
    else if (fila.categoria) banner.categoria = fila.categoria;
    return banner;
}

export const leerBanners = async () : Promise<Banners> => {
    const banners = Object.fromEntries(POSICIONES_BANNER.map(p => [p, null])) as Banners;
    for (const fila of await prisma.banner.findMany()) {
        if (POSICIONES_BANNER.includes(fila.posicion as PosicionBanner)) banners[fila.posicion as PosicionBanner] = aBanner(fila);
    }
    return banners;
}

export const guardarBanner = async (posicion : PosicionBanner, banner : Banner) => {
    const datos = {imagen: banner.imagen, titulo: banner.titulo, categoria: banner.categoria ?? null, productoId: banner.productoId ?? null};
    return aBanner(await prisma.banner.upsert({where: {posicion}, create: {posicion, ...datos}, update: datos}));
}

export const quitarBanner = async (posicion : PosicionBanner) => {
    await prisma.banner.deleteMany({where: {posicion}});
}
