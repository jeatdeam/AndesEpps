'use client' // los error boundaries deben ser Client Components
import './globals.css';
import {PaginaEstado, claseBotonPrincipal} from '@/app/componentes/PaginaEstado';

// solo aparece si falla el layout raiz (header/footer); reemplaza todo el documento, por eso lleva html y body
export default function GlobalError({error, unstable_retry} : {error : Error & {digest? : string}, unstable_retry : () => void}) {
    return (
        <html lang="es">
            <body className={"min-h-screen flex flex-col"}>
                <title>Algo salió mal | Los Andes J & C</title>
                <PaginaEstado
                    codigo={"500"}
                    titulo={"Algo salió mal"}
                    descripcion={"Ocurrió un error inesperado al cargar el sitio. Intenta de nuevo en unos segundos."}
                    detalle={error.digest && <span className={"text-[12px] text-gray-400"}>Código de referencia: {error.digest}</span>}>
                    <button onClick={() => unstable_retry()} className={claseBotonPrincipal}>Intentar de nuevo</button>
                    {/* <a> y no <Link>: el router puede estar roto si fallo el layout raiz */}
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a href="/" className={"flex items-center border-2 border-gray-300 rounded-[10px] px-[18px] py-[8px] text-[14px] font-semibold text-gray-800 hover:border-slate-900"}>Ir al inicio</a>
                </PaginaEstado>
            </body>
        </html>
    )
}
