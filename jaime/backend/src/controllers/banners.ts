import type {Request, Response} from 'express';
import {leerBanners, guardarBanner as guardarFilaBanner, quitarBanner as quitarFilaBanner, buscarProducto, POSICIONES_BANNER, type Banner, type PosicionBanner} from '../almacen';
import {borrarImagenes, type ArchivoSubido} from '../subidas';

const esPosicion = (valor : unknown) : valor is PosicionBanner => POSICIONES_BANNER.includes(valor as PosicionBanner);

// subidas.ts ya guardo la imagen (cloudinary o disco) y le anoto su url
const urlSubida = (req : Request) => (req.file as ArchivoSubido | undefined)?.url;

const descartarArchivo = (req : Request) => {
    const url = urlSubida(req);
    if (url) borrarImagenes([url]);
}

const getBanners = async (req : Request, res : Response) => {
    res.json(await leerBanners());
}

// crea o reemplaza el banner de una posicion; la imagen es opcional si el banner ya tenia una
const guardarBanner = async (req : Request, res : Response) => {
    const posicion = req.params.posicion;
    if (!esPosicion(posicion)) {
        descartarArchivo(req);
        return res.status(404).json({error: 'Posición de banner no válida'});
    }

    let datos : Record<string, unknown>;
    try {
        datos = JSON.parse(req.body?.datos ?? '{}');
    } catch {
        descartarArchivo(req);
        return res.status(400).json({error: 'Los datos del banner no son válidos'});
    }

    const anterior = (await leerBanners())[posicion];
    const imagen = urlSubida(req) ?? anterior?.imagen;
    if (!imagen) return res.status(400).json({error: 'Sube una imagen para el banner'});

    const banner : Banner = {
        imagen,
        titulo: typeof datos.titulo === 'string' ? datos.titulo.trim() : '',
    };

    if (datos.productoId !== undefined && datos.productoId !== null && datos.productoId !== '') {
        const productoId = Number(datos.productoId);
        if (!(await buscarProducto(productoId))) {
            descartarArchivo(req);
            return res.status(400).json({error: 'El producto elegido no existe'});
        }
        banner.productoId = productoId;
    } else if (typeof datos.categoria === 'string' && datos.categoria.trim()) {
        banner.categoria = datos.categoria.trim().toLowerCase();
    }

    let guardado : Banner;
    try {
        guardado = await guardarFilaBanner(posicion, banner);
    } catch (error) {
        descartarArchivo(req);
        throw error;
    }
    if (anterior && anterior.imagen !== imagen) borrarImagenes([anterior.imagen]);
    res.json(guardado);
}

// vuelve la posicion al banner automatico
const quitarBanner = async (req : Request, res : Response) => {
    const posicion = req.params.posicion;
    if (!esPosicion(posicion)) return res.status(404).json({error: 'Posición de banner no válida'});
    const anterior = (await leerBanners())[posicion];
    await quitarFilaBanner(posicion);
    if (anterior) borrarImagenes([anterior.imagen]);
    res.status(204).end();
}

export default {
    getBanners,
    guardarBanner,
    quitarBanner,
}
