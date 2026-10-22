import {redirect} from 'next/navigation';

// el enlace "Ofertas" del header lleva al catalogo mostrando solo productos con descuento
export default function Page() {
    redirect('/productos?oferta=1&orden=descuento');
}
