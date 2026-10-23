import {obtenerProductos} from '@/app/datos';
import {CatalogoProductos} from '@/app/componentes/CatalogoProductos';

export default async function Page({searchParams} : {searchParams : Promise<{[key : string] : string | string[] | undefined}>}) {

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
