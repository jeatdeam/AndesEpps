import {Product} from '../tipos/elementsType'
import {CatalogoProductos} from '@/app/componentes/CatalogoProductos';

export default async function Page({searchParams} : {searchParams : Promise<{[key : string] : string | string[] | undefined}>}) {

    const parametros = await searchParams;

    const response = await fetch("http://localhost:3001/getProductosCategoria")
    const productos : Product[] = await response.json();

    return(
        <>
            {/* la key reinicia los filtros al navegar a otra categoria, ya que el componente sigue montado */}
            <CatalogoProductos key={JSON.stringify(parametros)} productos={productos} parametros={parametros}/>
        </>
    )
}
