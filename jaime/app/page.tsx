import {Inicio} from './componentes/Inicio';
import {obtenerProductos, obtenerBanners} from './datos';

// la pagina se arma en el servidor con los datos en cache (ISR); si Render no responde
// se entrega igual y el navegador pide los datos, como antes
export default async function Home() {

    const [productos, banners] = await Promise.all([
        obtenerProductos().catch(() => null),
        obtenerBanners().catch(() => null),
    ]);

    return <Inicio productosIniciales={productos} bannersIniciales={banners}/>
}
