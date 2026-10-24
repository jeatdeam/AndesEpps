'use client'
import {useEffect, useState, type ReactNode} from 'react';
import {REDES_SOCIALES} from './Footer';
import {WHATSAPP_TIENDA} from '@/app/configuracion';

// alto de la barra: el header flotante (Header.tsx) se ubica debajo de ella mientras la pagina esta arriba del todo
export const ALTO_BARRA = 34;
const CAMBIO_CADA = 5000;
const DURACION = 500;

const claseEnlace = "uppercase tracking-[.08em] text-[12px] font-semibold text-white/85 hover:text-white transition-colors";

// dos "diapositivas" que se turnan: la que sale sube y la que entra llega desde abajo
const DIAPOSITIVAS : ReactNode[] = [
    <div key={"redes"} className={"h-full flex items-center justify-center sm:justify-between gap-[16px]"}>
        <div className={"flex items-center gap-[12px]"}>
            <span className={"text-[13px] text-white/80"}>Síguenos en</span>
            <div className={"flex items-center gap-[10px]"}>
                {REDES_SOCIALES.map(({nombre, href, icono}) => (
                    <a key={nombre} href={href} target="_blank" rel="noopener noreferrer" aria-label={nombre} className={"text-white/80 hover:text-white transition-colors [&_svg]:w-[15px] [&_svg]:h-[15px]"}>
                        {icono}
                    </a>
                ))}
            </div>
        </div>
        <div className={"hidden sm:flex items-center gap-[24px]"}>
            <a href={`https://wa.me/${WHATSAPP_TIENDA}`} target="_blank" rel="noopener noreferrer" className={claseEnlace}>Contáctenos</a>
            <a href={`https://wa.me/${WHATSAPP_TIENDA}`} target="_blank" rel="noopener noreferrer" className={claseEnlace}>Cotiza: 986 680 850</a>
        </div>
    </div>,
    <div key={"mensaje"} className={"h-full flex items-center justify-center text-[12px] sm:text-[13px] text-white/85 text-center truncate"}>
        <span className={"truncate"}>
            <span className={"text-[#facc15] font-semibold"}>EPP para minería y construcción</span>
            <span className={"hidden sm:inline"}> · Atención a empresas mineras, contratistas y obras</span>
            <span> · Venta por mayor y menor en Lima</span>
        </span>
    </div>,
];

export const BarraSuperior = () => {

    const [actual, setActual] = useState(0);
    const [anterior, setAnterior] = useState<number|null>(null);
    const [pausada, setPausada] = useState(false);

    // cada CAMBIO_CADA ms pasa a la siguiente; con el cursor encima se detiene
    useEffect(() => {
        if (pausada) return;
        const espera = setTimeout(() => {
            setAnterior(actual);
            setActual((actual + 1) % DIAPOSITIVAS.length);
        }, CAMBIO_CADA);
        return () => clearTimeout(espera);
    }, [actual, pausada]);

    // la que sale se quita cuando termina su animacion
    useEffect(() => {
        if (anterior === null) return;
        const espera = setTimeout(() => setAnterior(null), DURACION);
        return () => clearTimeout(espera);
    }, [anterior]);

    return (
        <div onMouseEnter={() => setPausada(true)} onMouseLeave={() => setPausada(false)} style={{height: ALTO_BARRA}} className={"bg-slate-900 text-white"}>
            {/* mismo ancho que el header flotante, asi los bordes de ambos quedan alineados */}
            <div className={"relative h-full overflow-hidden w-[calc(100%-16px)] sm:w-[94%] 2xl:w-[max(74%,1240px)] mx-auto"}>
                {anterior !== null && (
                    <div key={`sale-${anterior}`} aria-hidden={true} className={"barraSale absolute inset-0 px-[12px] sm:px-[20px]"}>{DIAPOSITIVAS[anterior]}</div>
                )}
                <div key={`entra-${actual}`} className={`${anterior !== null ? "barraEntra" : ""} absolute inset-0 px-[12px] sm:px-[20px]`}>{DIAPOSITIVAS[actual]}</div>
            </div>
        </div>
    )
}
