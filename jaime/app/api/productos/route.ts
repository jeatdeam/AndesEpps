import {obtenerProductos} from '@/app/datos';

// los componentes del navegador (menu, buscador) piden los productos aqui en vez de ir a Render:
// la respuesta sale de la misma cache que usan las paginas
export const revalidate = 60;

export async function GET() {
    try {
        return Response.json(await obtenerProductos());
    } catch {
        return Response.json([], {status: 502});
    }
}
