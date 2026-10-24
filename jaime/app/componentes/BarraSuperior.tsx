'use client'
import {useEffect, useLayoutEffect, useRef, useState, type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import {AnimacionLottie} from './AnimacionLottie';
import caminante from '@/app/animaciones/caminanteConstruccion.json';

// alto de la barra: el header flotante (Header.tsx) se ubica debajo de ella mientras la pagina esta arriba del todo
export const ALTO_BARRA = 34;
// pixeles por segundo: la duracion de cada pasada se calcula con el ancho, asi va igual de rapido en cualquier pantalla
const VELOCIDAD = 70;

// los dos mensajes se turnan: uno en cada pasada del obrero.
// en el inicio el primero es el h1 de la pagina (el que lee Google); en las demas paginas es un parrafo,
// porque cada una tiene su propio h1 (producto, catalogo, paginas legales)
const mensajes = (esInicio : boolean) : ReactNode[] => {
    const Titulo = esInicio ? 'h1' : 'p';
    return [
        <Titulo key={"titulo"} className={"text-[13px] font-semibold text-[#facc15] leading-none"}>
            Equipos de protección personal para minería y construcción
        </Titulo>,
        <p key={"descripcion"} className={"text-[13px] text-white/85 leading-none"}>
            Abastecemos a empresas mineras, contratistas y obras de construcción con EPP certificados. Venta al por mayor y menor en Lima - Perú.
        </p>,
    ];
}

// franja de arriba de la pagina: el obrero de construccion entra por la derecha y camina hacia la izquierda llevando
// el mensaje detras de el, asi el texto se lee de izquierda a derecha a medida que aparece.
// cuando sale por la izquierda, vuelve a entrar por la derecha con el otro mensaje. Con el cursor encima se detiene
export const BarraSuperior = () => {

    const barra = useRef<HTMLDivElement|null>(null);
    const grupo = useRef<HTMLDivElement|null>(null);
    const [mensaje, setMensaje] = useState(0);
    const MENSAJES = mensajes(usePathname() === '/');

    // cada pasada es una animacion nueva (el grupo se vuelve a montar con key={mensaje}); su duracion se fija antes
    // de pintarse y no cambia mientras corre, porque cambiarla a mitad de camino hace que el texto salte o parpadee
    const ajustarDuracion = () => {
        const contenedor = barra.current, movil = grupo.current;
        if (contenedor && movil) movil.style.setProperty('--duracion-barra', `${(contenedor.clientWidth + movil.offsetWidth) / VELOCIDAD}s`);
    }
    useLayoutEffect(ajustarDuracion, [mensaje]);

    // si cambia el ancho de la ventana se recalcula (solo en ese caso)
    useEffect(() => {
        const contenedor = barra.current;
        if (!contenedor) return;
        let ancho = contenedor.clientWidth;
        const observador = new ResizeObserver(() => {
            if (contenedor.clientWidth === ancho) return;
            ancho = contenedor.clientWidth;
            ajustarDuracion();
        });
        observador.observe(contenedor);
        return () => observador.disconnect();
    }, []);

    return (
        <div ref={barra} style={{height: ALTO_BARRA}} className={"barraSuperior relative overflow-hidden bg-slate-900 text-white"}>
            <div key={mensaje} ref={grupo} onAnimationEnd={(e) => { if (e.target === e.currentTarget) setMensaje(m => (m + 1) % MENSAJES.length); }}
                className={"barraMovil absolute top-0 h-full flex items-center gap-[10px] whitespace-nowrap"}>
                {/* el obrero va delante: a la izquierda del mensaje, que es hacia donde avanza */}
                <AnimacionLottie datos={caminante} className={"caminanteBarra w-[28px] h-[26px] shrink-0"}/>
                {MENSAJES[mensaje]}
            </div>
        </div>
    )
}
