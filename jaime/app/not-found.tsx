import Link from 'next/link';
import {PaginaEstado, claseBotonPrincipal, claseBotonSecundario} from '@/app/componentes/PaginaEstado';
import {AnimacionLottie} from '@/app/componentes/AnimacionLottie';
import casco404 from '@/app/animaciones/casco404.json';

export default function NotFound() {
    return (
        <PaginaEstado
            codigo={"404"}
            ilustracion={<AnimacionLottie datos={casco404} bucleDesde={70} className={"absolute left-1/2 bottom-[-28px] -translate-x-1/2 size-[210px] sm:size-[240px]"}/>}
            titulo={"Página no encontrada"}
            descripcion={"La página que buscas no existe o fue movida. Puedes volver al inicio o revisar nuestro catálogo de equipos de protección personal."}>
            <Link href={"/"} className={claseBotonPrincipal}>Ir al inicio</Link>
            <Link href={"/productos"} className={claseBotonSecundario}>Ver productos</Link>
        </PaginaEstado>
    )
}
