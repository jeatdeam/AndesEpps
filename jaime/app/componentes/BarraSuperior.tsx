'use client'
import {useEffect, useRef, useState, type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import {AnimacionLottie} from './AnimacionLottie';
import caminante from '@/app/animaciones/caminanteConstruccion.json';

// alto de la barra: el header flotante (Header.tsx) se ubica debajo de ella mientras la pagina esta arriba del todo
export const ALTO_BARRA = 34;
// pixeles por segundo, igual en cualquier pantalla
const VELOCIDAD = 70;
// el primer obrero aparece en el 60% del ancho de la barra; los siguientes entran caminando desde el borde derecho
const INICIO = 0.6;
// segundos entre que un obrero sale por la izquierda y aparece el siguiente
const ESPERA = 1;
// separacion minima con el final del mensaje anterior, para que no se encimen en pantallas angostas
const SEPARACION = 40;

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

// franja de arriba de la pagina: un obrero de construccion aparece en el 60% de la barra y camina hacia la izquierda
// llevando el mensaje detras de el. Un segundo despues de que sale por la izquierda (aunque su mensaje siga pasando)
// entra otro obrero caminando desde el borde derecho con el otro mensaje. Con el cursor encima todo se detiene.
// cada pasada tiene un id; el mensaje que lleva es id % cantidad de mensajes
export const BarraSuperior = () => {

    const barra = useRef<HTMLDivElement|null>(null);
    const [pasadas, setPasadas] = useState<number[]>([0]);
    const MENSAJES = mensajes(usePathname() === '/');
    // la posicion cambia en cada cuadro: se guarda fuera del estado y se escribe directo en el estilo
    const posiciones = useRef(new Map<number, number>());
    const elementos = useRef(new Map<number, HTMLDivElement>());
    const pausado = useRef(false);

    useEffect(() => {
        // sin animacion: el primer mensaje queda quieto y centrado (ver globals.css)
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let cuadro = 0, anterior = performance.now();
        let ultima = 0, siguiente = 1;
        let espera : number | null = null, esperaPara = -1;

        const paso = (ahora : number) => {
            // al volver de otra pestaña no se "teletransporta"
            const dt = Math.min((ahora - anterior) / 1000, .1);
            anterior = ahora;
            const contenedor = barra.current;

            if (contenedor && !pausado.current) {
                const ancho = contenedor.clientWidth;
                const terminadas : number[] = [];

                elementos.current.forEach((elemento, id) => {
                    const x = (posiciones.current.get(id) ?? ancho * INICIO) - VELOCIDAD * dt;
                    posiciones.current.set(id, x);
                    elemento.style.left = `${x}px`;
                    if (x + elemento.offsetWidth < 0) terminadas.push(id);
                });

                // el obrero de la ultima pasada ya salio: se cuenta un segundo para el siguiente
                const elementoUltima = elementos.current.get(ultima);
                const obrero = elementoUltima?.firstElementChild as HTMLElement | null | undefined;
                if (elementoUltima && obrero && esperaPara !== ultima && posiciones.current.get(ultima)! + obrero.offsetWidth <= 0) {
                    espera = ESPERA;
                    esperaPara = ultima;
                }
                if (espera !== null) {
                    espera -= dt;
                    if (espera <= 0) {
                        espera = null;
                        const finAnterior = elementoUltima ? posiciones.current.get(ultima)! + elementoUltima.offsetWidth + SEPARACION : 0;
                        ultima = siguiente++;
                        // justo fuera del borde derecho (o detras del mensaje anterior si aun no termina de entrar)
                        posiciones.current.set(ultima, Math.max(ancho, finAnterior));
                        setPasadas(p => [...p, ultima]);
                    }
                }

                if (terminadas.length > 0) {
                    terminadas.forEach(id => { posiciones.current.delete(id); elementos.current.delete(id); });
                    setPasadas(p => p.filter(id => !terminadas.includes(id)));
                }
            }
            cuadro = requestAnimationFrame(paso);
        }
        cuadro = requestAnimationFrame(paso);
        return () => cancelAnimationFrame(cuadro);
    }, []);

    return (
        <div ref={barra} style={{height: ALTO_BARRA}} onMouseEnter={() => pausado.current = true} onMouseLeave={() => pausado.current = false}
            className={"barraSuperior relative overflow-hidden bg-gradient-to-r from-[#0f172a] to-[#172554] text-white"}>
            {pasadas.map(id => (
                // left inicial en % para el primer render (servidor); despues lo maneja el bucle en px
                <div key={id} style={{left: `${INICIO * 100}%`}}
                    ref={elemento => {
                        if (!elemento) return;
                        elementos.current.set(id, elemento);
                        const x = posiciones.current.get(id);
                        if (x !== undefined) elemento.style.left = `${x}px`;
                    }}
                    // solo el primero aparece con un fundido (nace en medio de la barra); los demas entran caminando
                    className={`barraMovil ${id === 0 ? "barraPrimera" : ""} absolute top-0 h-full flex items-center gap-[10px] whitespace-nowrap`}>
                    {/* el obrero va delante: a la izquierda del mensaje, que es hacia donde avanza */}
                    <AnimacionLottie datos={caminante} className={"caminanteBarra w-[28px] h-[26px] shrink-0"}/>
                    {MENSAJES[id % MENSAJES.length]}
                </div>
            ))}
        </div>
    )
}
