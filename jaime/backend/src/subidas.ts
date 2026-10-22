import type {Request, Response, NextFunction} from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {v2 as cloudinary} from 'cloudinary';
import {CARPETA_UPLOADS} from './almacen';

export const MAX_IMAGENES = 8;
const MAX_BYTES = 5 * 1024 * 1024;

// la extension sale del tipo de archivo, no del nombre que manda el navegador
const EXTENSIONES : Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/avif': '.avif',
};

// ---------------- cloudinary ----------------

// con las tres variables en backend/.env las imagenes van a cloudinary; si faltan se guardan en backend/uploads
const cloudinaryConfigurado = () => Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
const carpetaCloudinary = () => (process.env.CLOUDINARY_CARPETA || 'los-andes').replace(/^\/+|\/+$/g, '');

const configurarCloudinary = () => cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME ?? '',
    api_key : process.env.CLOUDINARY_API_KEY ?? '',
    api_secret : process.env.CLOUDINARY_API_SECRET ?? '',
    secure : true,
});

const subirACloudinary = (contenido : Buffer, subcarpeta : string) => new Promise<string>((resolve, reject) => {
    configurarCloudinary();
    cloudinary.uploader.upload_stream({folder: `${carpetaCloudinary()}/${subcarpeta}`, resource_type: 'image'}, (error, resultado) => {
        if (error || !resultado) return reject(error ?? new Error('Cloudinary no devolvió la imagen'));
        resolve(resultado.secure_url);
    }).end(contenido);
});

// public_id de una url de esta cuenta (…/<cloud>/image/upload/v123/<carpeta>/productos/abc.jpg -> <carpeta>/productos/abc)
const publicIdPropio = (url : string) => {
    const coincidencia = url.match(/^https:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
    if (!coincidencia || coincidencia[1] !== process.env.CLOUDINARY_CLOUD_NAME) return null;
    // solo se borran las que subio esta tienda; las de otras carpetas o cuentas se dejan intactas
    return coincidencia[2]!.startsWith(`${carpetaCloudinary()}/`) ? coincidencia[2]! : null;
}

// borra imagenes que ya no se usan: las de backend/uploads y las de la carpeta de la tienda en cloudinary
export const borrarImagenes = (urls : string[]) => {
    urls.forEach(url => {
        const local = url.match(/\/uploads\/([^/?#]+)$/);
        if (local?.[1]) return fs.rm(path.join(CARPETA_UPLOADS, local[1]), {force: true}, () => {});
        const publicId = cloudinaryConfigurado() ? publicIdPropio(url) : null;
        if (!publicId) return;
        configurarCloudinary();
        cloudinary.uploader.destroy(publicId).catch(error => console.error(`No se pudo borrar ${publicId} de Cloudinary:`, error));
    });
}

// ---------------- subida con multer ----------------

// el archivo queda en memoria; despues de validarlo se guarda en cloudinary o en disco y se anota su url publica
export type ArchivoSubido = Express.Multer.File & {url : string};

const guardarArchivo = async (req : Request, archivo : Express.Multer.File, subcarpeta : string) => {
    let url : string;
    if (cloudinaryConfigurado()) {
        url = await subirACloudinary(archivo.buffer, subcarpeta);
    } else {
        fs.mkdirSync(CARPETA_UPLOADS, {recursive: true});
        const nombre = `${Date.now()}-${crypto.randomUUID()}${EXTENSIONES[archivo.mimetype]}`;
        await fs.promises.writeFile(path.join(CARPETA_UPLOADS, nombre), archivo.buffer);
        url = `${req.protocol}://${req.get('host')}/uploads/${nombre}`;
    }
    (archivo as ArchivoSubido).url = url;
}

const filtroImagenes = (_req : Request, archivo : Express.Multer.File, cb : multer.FileFilterCallback) => {
    if (EXTENSIONES[archivo.mimetype]) return cb(null, true);
    cb(new Error('Solo se permiten imágenes JPG, PNG, WEBP, GIF o AVIF'));
}

const subida = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: MAX_BYTES, files: MAX_IMAGENES},
    fileFilter: filtroImagenes,
}).array('imagenes', MAX_IMAGENES);

const subidaBanner = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: MAX_BYTES, files: 1},
    fileFilter: filtroImagenes,
}).single('imagen');

const MENSAJES : Record<string, string> = {
    LIMIT_FILE_SIZE: 'Cada imagen debe pesar como máximo 5 MB',
    LIMIT_FILE_COUNT: `Máximo ${MAX_IMAGENES} imágenes por producto`,
    LIMIT_UNEXPECTED_FILE: `Máximo ${MAX_IMAGENES} imágenes por producto`,
};

// envuelve multer para responder los errores de subida como JSON en vez de un 500 y guarda los archivos recibidos
const conErroresJson = (middleware : typeof subida, subcarpeta : string) => (req : Request, res : Response, next : NextFunction) => {
    middleware(req, res, async (error : unknown) => {
        if (error) {
            const mensaje = error instanceof multer.MulterError ? MENSAJES[error.code] ?? error.message : error instanceof Error ? error.message : 'No se pudieron subir las imágenes';
            return res.status(400).json({error: mensaje});
        }
        const archivos = [...((req.files as Express.Multer.File[] | undefined) ?? []), ...(req.file ? [req.file] : [])];
        const resultados = await Promise.allSettled(archivos.map(archivo => guardarArchivo(req, archivo, subcarpeta)));
        const fallo = resultados.find(r => r.status === 'rejected');
        if (fallo) {
            console.error('No se pudo guardar una imagen:', fallo.reason);
            // las que si se guardaron no se van a usar
            borrarImagenes(archivos.map(a => (a as Partial<ArchivoSubido>).url).filter((url) : url is string => Boolean(url)));
            return res.status(502).json({error: 'No se pudieron guardar las imágenes. Inténtalo de nuevo.'});
        }
        next();
    });
}

export const subirImagenes = conErroresJson(subida, 'productos');
export const subirImagenBanner = conErroresJson(subidaBanner, 'banners');
