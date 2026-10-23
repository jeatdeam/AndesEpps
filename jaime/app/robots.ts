import type {MetadataRoute} from 'next';
import {SITIO} from './seo';

// le dice a Google que puede leer toda la tienda menos el dashboard y las rutas internas
export default function robots() : MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard', '/api/'],
        },
        sitemap: `${SITIO}/sitemap.xml`,
    };
}
