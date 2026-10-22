import sharp from 'sharp';

// miniaturas jpg de las fotos de los productos para el pdf (pdfkit solo lee jpg y png) y el correo
const TAMANO = 160;
const MAX_BYTES = 8 * 1024 * 1024;
const ESPERA_MS = 6000;

const descargar = async (url : string) => {
    const respuesta = await fetch(url, {signal: AbortSignal.timeout(ESPERA_MS)});
    if (!respuesta.ok) throw new Error(`${respuesta.status} al descargar ${url}`);
    const contenido = Buffer.from(await respuesta.arrayBuffer());
    if (contenido.length > MAX_BYTES) throw new Error(`imagen demasiado grande: ${url}`);
    return contenido;
}

const miniatura = async (url : string) =>
    sharp(await descargar(url))
        .resize(TAMANO, TAMANO, {fit: 'contain', background: '#ffffff'})
        // las fotos con fondo transparente quedan sobre blanco
        .flatten({background: '#ffffff'})
        .jpeg({quality: 80})
        .toBuffer();

// devuelve id del producto -> miniatura; si una foto falla se omite y el producto sale sin imagen
export const cargarMiniaturas = async (items : {id : number, imagen? : string | undefined}[]) => {
    const resultados = await Promise.allSettled(items.map(async item => [item.id, item.imagen ? await miniatura(item.imagen) : null] as const));
    const miniaturas = new Map<number, Buffer>();
    resultados.forEach(resultado => {
        if (resultado.status === 'rejected') console.error('No se pudo preparar la foto de un producto:', resultado.reason);
        else if (resultado.value[1]) miniaturas.set(resultado.value[0], resultado.value[1]);
    });
    return miniaturas;
}
