import type {MetadataRoute} from 'next';
import {obtenerProductos} from './datos';
import {SITIO, aSlug} from './seo';

// lista de paginas para Google (https://www.jm-andes-security.com.pe/sitemap.xml).
// se arma con los productos de la cache, asi los nuevos aparecen solos
export const revalidate = 3600;

export default async function sitemap() : Promise<MetadataRoute.Sitemap> {
    const productos = await obtenerProductos().catch(() => []);
    const categorias = [...new Set(productos.map(p => p.categoria))];

    return [
        {url: SITIO, changeFrequency: 'daily', priority: 1},
        {url: `${SITIO}/productos`, changeFrequency: 'daily', priority: 0.9},
        ...categorias.map(categoria => ({
            url: `${SITIO}/productos?${new URLSearchParams({categoria})}`,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        })),
        ...productos.map(producto => ({
            url: `${SITIO}/productos/${aSlug(producto.categoria)}/${aSlug(producto.name)}`,
            ...(producto.creadoEn && {lastModified: producto.creadoEn}),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
            images: producto.img.slice(0, 1),
        })),
        ...['privacidad', 'terminos', 'eliminacion-de-datos'].map(pagina => ({
            url: `${SITIO}/${pagina}`,
            changeFrequency: 'yearly' as const,
            priority: 0.2,
        })),
    ];
}
