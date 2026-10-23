'use client'
import {useEffect, useRef} from 'react';
import {AnimacionLottie} from './AnimacionLottie';
import caminante from '@/app/animaciones/caminanteConstruccion.json';

const ANCHO = 35;
// pixeles por segundo: la duracion se calcula con el ancho del header, asi camina igual de rapido en cualquier pantalla
const VELOCIDAD = 45;

// obrero de construccion que camina por el borde de abajo del header, de punta a punta (ver .caminante en globals.css).
// va detras del contenido del header (-z-[1]) y no recibe clics
export const CaminanteHeader = () => {

    const caja = useRef<HTMLDivElement|null>(null);

    useEffect(() => {
        const elemento = caja.current;
        const header = elemento?.parentElement;
        if (!elemento || !header) return;
        // ida y vuelta = dos veces el ancho del header
        const ajustar = () => elemento.style.setProperty('--duracion-caminante', `${Math.max(8, header.clientWidth * 2 / VELOCIDAD)}s`);
        ajustar();
        const observador = new ResizeObserver(ajustar);
        observador.observe(header);
        return () => observador.disconnect();
    }, []);

    return (
        <div ref={caja} aria-hidden={true} style={{'--ancho-caminante': `${ANCHO}px`, width: ANCHO} as React.CSSProperties} className={"caminante pointer-events-none absolute bottom-[2px] -z-[1] h-[32px]"}>
            <AnimacionLottie datos={caminante} className={"size-full"}/>
        </div>
    )
}
