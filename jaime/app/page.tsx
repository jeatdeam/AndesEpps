import type {Metadata} from 'next';
import {Inicio} from './componentes/Inicio';
import {obtenerProductos, obtenerBanners} from './datos';
import {SITIO, MARCA, RAZON_SOCIAL, DESCRIPCION_SITIO} from './seo';
import {WHATSAPP_TIENDA} from './configuracion';

export const metadata : Metadata = {
    alternates: {canonical: '/'},
};

// datos de la empresa para Google (no se ven en la pagina)
const datosEmpresa = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: MARCA,
    legalName: RAZON_SOCIAL,
    url: SITIO,
    description: DESCRIPCION_SITIO,
    telephone: `+${WHATSAPP_TIENDA}`,
    areaServed: 'PE',
};

// la pagina se arma en el servidor con los datos en cache (ISR); si Render no responde
// se entrega igual y el navegador pide los datos, como antes
export default async function Home() {

    const [productos, banners] = await Promise.all([
        obtenerProductos().catch(() => null),
        obtenerBanners().catch(() => null),
    ]);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(datosEmpresa)}}/>
            <Inicio productosIniciales={productos} bannersIniciales={banners}/>
        </>
    )
}
