import type {Request, Response} from 'express';
import {leerProductos, buscarProducto, crearProducto as insertarProducto, actualizarProducto as guardarProducto, eliminarProducto as borrarProducto, type Producto} from '../almacen';
import {MAX_IMAGENES, borrarImagenes, type ArchivoSubido} from '../subidas';

const cat: string[] = [
    "sistemas de bloqueo",
    "proteccion de cabeza",
    "proteccion visual",
    "proteccion auditiva",
    "proteccion corporal",
    "proteccion de manos",
    "calzados de seguridad",
    "proteccion facial",
    "proteccion para soldador",
    "proteccion respiratoria",
    "proteccion de alturas",
    "reflecivos señalizacion"
];


const categorias = (req: Request, res: Response) => {

    res.json(cat)
}

const getProductosCategoria = async (req: Request, res: Response) => {

    res.json(await leerProductos())
}

const getProductElegido = async (req: Request, res: Response) => {
    const producto = await buscarProducto(Number(req.params.id));
    if (!producto) return res.status(404).json({error: 'Producto no encontrado'});
    res.json(producto)
}


// ---------------- alta, edicion y baja de productos (dashboard) ----------------

// la imagen llega como url ya guardada o como indice de un archivo nuevo dentro de req.files
type ImagenEntrada = string | {nuevo : number};

const texto = (valor : unknown) => typeof valor === 'string' ? valor.trim().replace(/\s+/g, ' ') : '';
const lista = (valor : unknown) => Array.isArray(valor) ? valor.map(texto).filter(Boolean) : [];

// nombre y categoria forman la URL publica (/productos/categoria/nombre), por eso van en minusculas y sin estos caracteres
const CARACTERES_PROHIBIDOS = /[-/?#%]/;

// subidas.ts ya guardo cada archivo (cloudinary o disco) y le anoto su url
const descartarArchivos = (req : Request) => {
    borrarImagenes(((req.files as ArchivoSubido[] | undefined) ?? []).map(archivo => archivo.url));
}

const construirProducto = (req : Request, productos : Producto[], anterior? : Producto) : {producto : Producto} | {error : string} => {

    let datos : Record<string, unknown>;
    try {
        datos = JSON.parse(req.body?.datos ?? '');
    } catch {
        return {error: 'Los datos del producto no son válidos'};
    }

    const archivos = (req.files as ArchivoSubido[] | undefined) ?? [];

    const name = texto(datos.name).toLowerCase();
    if (!name) return {error: 'El nombre es obligatorio'};
    if (CARACTERES_PROHIBIDOS.test(name)) return {error: 'El nombre no puede tener los caracteres - / ? # %'};
    if (productos.some(p => p.id !== anterior?.id && p.name.toLowerCase() === name)) return {error: 'Ya existe un producto con ese nombre'};

    const categoria = texto(datos.categoria).toLowerCase();
    if (!categoria) return {error: 'La categoría es obligatoria'};
    if (CARACTERES_PROHIBIDOS.test(categoria)) return {error: 'La categoría no puede tener los caracteres - / ? # %'};

    const precio = Number(datos.precio);
    if (datos.precio === '' || !Number.isFinite(precio) || precio < 0) return {error: 'El precio debe ser un número mayor o igual a 0'};

    const stock = Number(datos.stock);
    if (datos.stock === '' || !Number.isInteger(stock) || stock < 0) return {error: 'El stock debe ser un número entero mayor o igual a 0'};

    // sin descuento (vacio o 0) el producto no esta en oferta
    const descuento = datos.descuento === undefined || datos.descuento === '' ? 0 : Number(datos.descuento);
    if (!Number.isInteger(descuento) || descuento < 0 || descuento > 90) return {error: 'El descuento debe ser un número entero entre 0 y 90'};

    if (!Array.isArray(datos.img)) return {error: 'Las imágenes no son válidas'};
    const img : string[] = [];
    for (const entrada of datos.img as ImagenEntrada[]) {
        if (typeof entrada === 'string' && entrada.trim()) img.push(entrada.trim());
        else if (typeof entrada === 'object' && entrada && archivos[entrada.nuevo]) img.push(archivos[entrada.nuevo]!.url);
        else return {error: 'Una de las imágenes no es válida'};
    }
    if (img.length === 0) return {error: 'Agrega al menos una imagen'};
    if (img.length > MAX_IMAGENES) return {error: `Máximo ${MAX_IMAGENES} imágenes por producto`};

    const producto : Producto = {
        // en un producto nuevo la base de datos asigna el id
        id: anterior?.id ?? 0,
        name,
        precio: Math.round(precio * 100) / 100,
        stock,
        img,
        descripcionPrimaria: texto(datos.descripcionPrimaria),
        descripcionSecundaria: lista(datos.descripcionSecundaria),
        caracteristicas: lista(datos.caracteristicas),
        informacionAdicional: lista(datos.informacionAdicional),
        categoria,
        normas: lista(datos.normas),
        tallas: lista(datos.tallas),
        colores: lista(datos.colores),
    };

    const marca = texto(datos.marca);
    const material = texto(datos.material);
    if (marca) producto.marca = marca;
    if (material) producto.material = material;
    if (descuento > 0) producto.descuento = descuento;
    // la fecha de creacion define los "nuevos ingresos" y no cambia al editar
    const creadoEn = anterior ? anterior.creadoEn : new Date().toISOString();
    if (creadoEn) producto.creadoEn = creadoEn;
    // las calificaciones vienen de los clientes, el dashboard no las edita
    if (anterior?.calificacion !== undefined) producto.calificacion = anterior.calificacion;
    if (anterior?.resenas !== undefined) producto.resenas = anterior.resenas;

    return {producto};
}

const crearProducto = async (req : Request, res : Response) => {
    const productos = await leerProductos();
    const resultado = construirProducto(req, productos);
    if ('error' in resultado) {
        descartarArchivos(req);
        return res.status(400).json(resultado);
    }
    try {
        res.status(201).json(await insertarProducto(resultado.producto));
    } catch (error) {
        // si no se guardo, las imagenes recien subidas no las usa nadie
        descartarArchivos(req);
        throw error;
    }
}

const actualizarProducto = async (req : Request, res : Response) => {
    const productos = await leerProductos();
    const anterior = productos.find(p => p.id === Number(req.params.id));
    if (!anterior) {
        descartarArchivos(req);
        return res.status(404).json({error: 'Producto no encontrado'});
    }
    const resultado = construirProducto(req, productos, anterior);
    if ('error' in resultado) {
        descartarArchivos(req);
        return res.status(400).json(resultado);
    }
    let producto : Producto;
    try {
        producto = await guardarProducto(resultado.producto);
    } catch (error) {
        descartarArchivos(req);
        throw error;
    }
    borrarImagenes(anterior.img.filter(url => !producto.img.includes(url)));
    res.json(producto);
}

const eliminarProducto = async (req : Request, res : Response) => {
    const producto = await buscarProducto(Number(req.params.id));
    if (!producto) return res.status(404).json({error: 'Producto no encontrado'});
    await borrarProducto(producto.id);
    borrarImagenes(producto.img);
    res.status(204).end();
}


export default {
    categorias,
    getProductosCategoria,
    getProductElegido,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
}