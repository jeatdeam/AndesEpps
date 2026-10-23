import type {Metadata} from 'next';
import {obtenerProductos} from '@/app/datos';
import {CatalogoProductos} from '@/app/componentes/CatalogoProductos';
import {tituloCategoria, descripcionCategoria, MARCA} from '@/app/seo';

type Parametros = {searchParams : Promise<{[key : string] : string | string[] | undefined}>};

// cada categoria tiene su propio titulo para Google; el resto de filtros (orden, talla, etc.)
// apunta al catalogo general para que Google no vea cientos de paginas casi iguales
export async function generateMetadata({searchParams} : Parametros) : Promise<Metadata> {
    const {categoria, oferta} = await searchParams;

    if (typeof categoria === 'string') {
        return {
            title: tituloCategoria(categoria),
            description: descripcionCategoria(categoria),
            alternates: {canonical: `/productos?${new URLSearchParams({categoria})}`},
        };
    }
    if (oferta) {
        return {
            title: 'Ofertas en EPP para minería y construcción',
            description: `Equipos de protección personal con descuento: cascos, botas, guantes y más. Ofertas de ${MARCA} en Lima.`,
            alternates: {canonical: '/ofertas'},
        };
    }
    return {
        title: 'Catálogo de EPP para minería y construcción',
        description: `Catálogo completo de equipos de protección personal de ${MARCA}: protección de cabeza, calzado, alturas, manos, visual, auditiva y más. Venta por mayor y menor en Lima.`,
        alternates: {canonical: '/productos'},
    };
}

export default async function Page({searchParams} : Parametros) {

    const parametros = await searchParams;

    // la pagina depende de los filtros de la url, pero los productos salen de la cache
    const productos = await obtenerProductos();

    return(
        <>
            {/* la key reinicia los filtros al navegar a otra categoria, ya que el componente sigue montado */}
            <CatalogoProductos key={JSON.stringify(parametros)} productos={productos} parametros={parametros}/>
        </>
    )
}
