import {redirect} from 'next/navigation';

// cada categoria se muestra en el catalogo con su filtro ya marcado, asi el usuario puede seguir filtrando
export default async function Page({params} :{ params : Promise<{categoria: string}>}) {

    const {categoria} = await params;
    // el parametro llega codificado (ej. "se%C3%B1alizacion") cuando tiene tildes o ñ
    const categoriaNormalizada = decodeURIComponent(categoria).replace(/-+/g, ' ')

    redirect(`/productos?${new URLSearchParams({categoria: categoriaNormalizada})}`);
}
