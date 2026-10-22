


export type Product = {
    id: number,
    name: string,
    precio: number,
    stock : number,
    img : string[],
    descripcionPrimaria : string,
    descripcionSecundaria : string[],
    caracteristicas : string[],
    informacionAdicional: string[],
    categoria: string,
    calificacion?: number,
    resenas?: number,
    // atributos de EPP usados por los filtros del catalogo (opcionales hasta que el backend los envie)
    marca?: string,
    normas?: string[],
    tallas?: string[],
    colores?: string[],
    material?: string,
    // porcentaje de descuento (1 a 90); sin descuento el producto no esta en oferta
    descuento?: number,
    // fecha ISO en que se creo desde el dashboard; los productos antiguos no la tienen
    creadoEn?: string,
}

// banners de ofertas de la pagina principal, editables desde el dashboard
export const POSICIONES_OFERTAS = ['principal', 'secundario-1', 'secundario-2', 'secundario-3'] as const;
export const POSICIONES_NUEVOS = ['nuevos-1', 'nuevos-2', 'nuevos-3', 'nuevos-4', 'nuevos-5'] as const;
export const POSICIONES_BANNER = [...POSICIONES_OFERTAS, ...POSICIONES_NUEVOS] as const;
export type PosicionBanner = typeof POSICIONES_BANNER[number];

// sin productoId ni categoria el banner lleva a todas las ofertas
export type BannerOferta = {
    imagen: string,
    titulo: string,
    categoria?: string,
    productoId?: number,
}

// una posicion en null muestra el banner automatico armado con los descuentos
export type Banners = Record<PosicionBanner, BannerOferta | null>;
