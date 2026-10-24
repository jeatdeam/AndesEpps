'use client'
import {useEffect, useRef, useState, type ReactNode} from 'react';
import {AnimacionLottie} from './AnimacionLottie';
import caminante from '@/app/animaciones/caminanteConstruccion.json';

// alto de la barra: el header flotante (Header.tsx) se ubica debajo de ella mientras la pagina esta arriba del todo
export const ALTO_BARRA = 34;
// pixeles por segundo: la duracion de cada pasada se calcula con el ancho, asi va igual de rapido en cualquier pantalla
const VELOCIDAD = 70;

// los dos mensajes se turnan: uno en cada pasada del obrero (el primero es el mismo texto del h1 de la pagina)
const MENSAJES : ReactNode[] = [
    <span key={"titulo"} className={"text-[13px] font-semibold text-[#facc15]"}>
        Equipos de protección personal para minería y construcción
    </span>,
    <span key={"descripcion"} className={"text-[13px] text-white/85"}>
        Abastecemos a empresas mineras, contratistas y obras de construcción con EPP certificados. Venta al por mayor y menor en Lima - Perú.
    </span>,
];

// franja de arriba de la pagina: el obrero de construccion cruza de izquierda a derecha llevando el mensaje detras de el.
// al salir por la derecha vuelve a entrar por la izquierda con el otro mensaje. Con el cursor encima se detiene
export const BarraSuperior = () => {

    const barra = useRef<HTMLDivElement|null>(null);
    const grupo = useRef<HTMLDivElement|null>(null);
    const [mensaje, setMensaje] = useState(0);

    // la pasada recorre el ancho de la barra mas el ancho del grupo (entra y sale completo)
    useEffect(() => {
        const contenedor = barra.current, movil = grupo.current;
        if (!contenedor || !movil) return;
        const ajustar = () => movil.style.setProperty('--duracion-barra', `${(contenedor.clientWidth + movil.offsetWidth) / VELOCIDAD}s`);
        ajustar();
        const observador = new ResizeObserver(ajustar);
        observador.observe(contenedor);
        observador.observe(movil);
        return () => observador.disconnect();
    }, []);

    return (
        <div ref={barra} style={{height: ALTO_BARRA}} className={"barraSuperior relative overflow-hidden bg-slate-900 text-white"}>
            <div ref={grupo} onAnimationIteration={() => setMensaje(m => (m + 1) % MENSAJES.length)}
                className={"barraMovil absolute top-0 h-full flex items-center gap-[10px] whitespace-nowrap"}>
                {MENSAJES[mensaje]}
                {/* el obrero va delante: a la derecha del mensaje, que es hacia donde avanza */}
                <AnimacionLottie datos={caminante} className={"caminanteBarra w-[28px] h-[26px] shrink-0"}/>
            </div>
        </div>
    )
}
