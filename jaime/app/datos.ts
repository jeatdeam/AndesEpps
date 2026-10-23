import {API} from './configuracion';
import {Product, Banners} from './tipos/elementsType';

// productos y banners se piden desde el servidor de Vercel y quedan en su cache (ISR):
// los visitantes no esperan a Render. Se vuelven a pedir cada 60 s, o al instante cuando el
// backend avisa a /api/revalidar despues de guardar algo en el dashboard
export const ETIQUETA_CATALOGO = 'catalogo';
const CACHE = {next: {revalidate: 60, tags: [ETIQUETA_CATALOGO]}};

// si Render falla se lanza el error: una respuesta de error no debe quedar guardada en la cache
const pedir = async <T,>(ruta : string) : Promise<T> => {
    const response = await fetch(`${API}${ruta}`, CACHE);
    if (!response.ok) throw new Error(`${ruta} respondio ${response.status}`);
    return response.json();
}

export const obtenerProductos = () => pedir<Product[]>('/getProductosCategoria');
export const obtenerBanners = () => pedir<Banners>('/banners');
