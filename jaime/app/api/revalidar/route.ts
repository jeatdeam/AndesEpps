import type {NextRequest} from 'next/server';
import {revalidateTag} from 'next/cache';
import {ETIQUETA_CATALOGO} from '@/app/datos';

// el backend llama aqui despues de crear, editar o borrar productos y banners desde el dashboard,
// asi la tienda muestra el cambio sin esperar los 60 s de la cache.
// REVALIDAR_SECRETO debe tener el mismo valor en Vercel y en Render
export async function POST(request : NextRequest) {
    const secreto = process.env.REVALIDAR_SECRETO;
    if (!secreto || request.headers.get('x-revalidar-secreto') !== secreto) {
        return Response.json({revalidado: false}, {status: 401});
    }

    // expire: 0 porque el aviso viene de fuera (el backend): la siguiente visita ya trae los datos nuevos
    revalidateTag(ETIQUETA_CATALOGO, {expire: 0});
    return Response.json({revalidado: true});
}
