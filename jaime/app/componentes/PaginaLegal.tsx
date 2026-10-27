import type {ReactNode} from 'react';
import Link from 'next/link';

// datos que se repiten en las paginas legales (privacidad, terminos y eliminacion de datos)
export const EMPRESA = 'Los Andes EPPS (J & M Andes Security E.I.R.L.)';
export const CORREO_ATENCION = 'servicioalcliente@rashperu.com';
export const WHATSAPP_ATENCION = '986 680 850';
export const ACTUALIZACION = '22 de octubre de 2026';

// el header es fijo (80px de alto a 10px del borde), por eso el contenido empieza mas abajo
export const PaginaLegal = ({titulo, resumen, children} : {titulo : string, resumen : string, children : ReactNode}) => (
    <main className={`w-[calc(100%-16px)] sm:w-[94%] max-w-[860px] mx-auto pt-[120px] pb-[60px] text-slate-700`}>
        <article className={"rounded-[20px] bg-white/70 ring-1 ring-white shadow-[0px_6px_20px_rgba(15,23,42,.06)] px-[22px] py-[30px] md:px-[44px] md:py-[40px] flex flex-col gap-[26px]"}>
            <header className={"flex flex-col gap-[8px] border-b border-slate-200 pb-[20px]"}>
                <p className={"text-[12px] font-semibold uppercase tracking-[.14em] text-sky-700"}>{EMPRESA}</p>
                <h1 className={"text-[26px] md:text-[32px] font-bold text-slate-900 leading-tight"}>{titulo}</h1>
                <p className={"text-[14px] leading-relaxed"}>{resumen}</p>
                <p className={"text-[12px] text-slate-500"}>Última actualización: {ACTUALIZACION}</p>
            </header>
            {children}
            <footer className={"border-t border-slate-200 pt-[18px] flex flex-wrap gap-x-[18px] gap-y-[8px] text-[13px]"}>
                <Link href={"/privacidad"} className={"text-sky-700 hover:underline"}>Política de privacidad</Link>
                <Link href={"/terminos"} className={"text-sky-700 hover:underline"}>Términos y condiciones</Link>
                <Link href={"/eliminacion-de-datos"} className={"text-sky-700 hover:underline"}>Eliminación de datos</Link>
            </footer>
        </article>
    </main>
)

export const Seccion = ({titulo, children} : {titulo : string, children : ReactNode}) => (
    <section className={"flex flex-col gap-[10px] text-[15px] leading-relaxed"}>
        <h2 className={"text-[18px] font-semibold text-slate-900"}>{titulo}</h2>
        {children}
    </section>
)

export const Lista = ({children} : {children : ReactNode}) => (
    <ul className={"list-disc pl-[22px] flex flex-col gap-[6px]"}>{children}</ul>
)

export const Correo = () => (
    <a href={`mailto:${CORREO_ATENCION}`} className={"font-medium text-sky-700 hover:underline [overflow-wrap:anywhere]"}>{CORREO_ATENCION}</a>
)
