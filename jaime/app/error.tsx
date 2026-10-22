'use client' // los error boundaries deben ser Client Components
import Link from 'next/link';
import {useEffect} from 'react';
import {PaginaEstado, claseBotonPrincipal, claseBotonSecundario} from '@/app/componentes/PaginaEstado';

export default function Error({error, unstable_retry} : {error : Error & {digest? : string}, unstable_retry : () => void}) {

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <PaginaEstado
            codigo={"500"}
            titulo={"Algo salió mal"}
            descripcion={"No pudimos cargar esta página. Puede que el servidor de productos no esté disponible en este momento. Intenta de nuevo en unos segundos."}
            detalle={error.digest && <span className={"text-[12px] text-gray-400"}>Código de referencia: {error.digest}</span>}>
            <button onClick={() => unstable_retry()} className={claseBotonPrincipal}>Intentar de nuevo</button>
            <Link href={"/"} className={claseBotonSecundario}>Ir al inicio</Link>
        </PaginaEstado>
    )
}
