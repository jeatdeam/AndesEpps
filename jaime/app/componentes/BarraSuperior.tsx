'use client'
import {useEffect, useRef, useState, type ReactNode} from 'react';
import {REDES_SOCIALES} from './Footer';
import {AnimacionLottie} from './AnimacionLottie';
import {WHATSAPP_TIENDA} from '@/app/configuracion';
import caminante from '@/app/animaciones/caminanteConstruccion.json';

// alto de la barra: el header flotante (Header.tsx) se ubica debajo de ella mientras la pagina esta arriba del todo
export const ALTO_BARRA = 34;
// pixeles por segundo: la duracion de cada pasada se calcula con el ancho, asi va igual de rapido en cualquier pantalla
const VELOCIDAD = 70;

const claseEnlace = "uppercase tracking-[.08em] text-[12px] font-semibold text-white/85 hover:text-white transition-colors";

// los dos mensajes se turnan: uno en cada pasada del obrero
const MENSAJES : ReactNode[] = [
    <span key={"redes"} className={"flex items-center gap-[12px]"}>
        <span className={"text-[13px] text-white/80"}>Síguenos en</span>
        <span className={"flex items-center gap-[10px]"}>
            {REDES_SOCIALES.map(({nombre, href, icono}) => (
                <a key={nombre} href={href} target="_blank" rel="noopener noreferrer" aria-label={nombre} className={"text-white/80 hover:text-white transition-colors [&_svg]:w-[15px] [&_svg]:h-[15px]"}>
                    {icono}
                </a>
            ))}
        </span>
        <span className={"text-white/40"}>·</span>
        <a href={`https://wa.me/${WHATSAPP_TIENDA}`} target="_blank" rel="noopener noreferrer" className={claseEnlace}>Contáctenos</a>
        <span className={"text-white/40"}>·</span>
        <a href={`https://wa.me/${WHATSAPP_TIENDA}`} target="_blank" rel="noopener noreferrer" className={claseEnlace}>Cotiza: 986 680 850</a>
    </span>,
    <span key={"mensaje"} className={"text-[13px] text-white/85"}>
        <span className={"text-[#facc15] font-semibold"}>EPP para minería y construcción</span>
        <span> · Atención a empresas mineras, contratistas y obras · Venta por mayor y menor en Lima</span>
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
