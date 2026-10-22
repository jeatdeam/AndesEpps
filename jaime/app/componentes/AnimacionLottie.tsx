'use client'
import {useEffect, useRef} from 'react';
import type {AnimationItem} from 'lottie-web';

type DatosLottie = {op : number, ip : number};

// reproduce un json lottie (app/animaciones). lottie-web usa el dom, por eso se importa dentro del efecto.
// bucleDesde: se reproduce una vez completa y luego repite solo desde ese cuadro hasta el final
// activo: si se pasa, la animacion solo corre mientras es true (ej. al pasar el cursor) y vuelve al inicio al soltar
export const AnimacionLottie = ({datos, className, bucle = true, bucleDesde, etiqueta, activo} : {datos : DatosLottie, className? : string, bucle? : boolean, bucleDesde? : number, etiqueta? : string, activo? : boolean}) => {

    const contenedor = useRef<HTMLDivElement>(null);
    const animacionRef = useRef<AnimationItem | null>(null);
    // controlada: no arranca sola, la maneja el efecto de "activo"
    const controlada = activo !== undefined;

    useEffect(() => {
        let cancelado = false;
        let destruir = () => {};

        import('lottie-web/build/player/lottie_light').then(({default: lottie}) => {
            if (cancelado || !contenedor.current) return;
            const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const animacion = lottie.loadAnimation({
                container : contenedor.current,
                renderer : 'svg',
                loop : bucle && bucleDesde === undefined,
                autoplay : !reducirMovimiento && !controlada,
                // lottie modifica el objeto que recibe: se le pasa una copia
                animationData : structuredClone(datos),
            });
            animacionRef.current = animacion;
            destruir = () => {
                animacion.destroy();
                animacionRef.current = null;
            };

            if (reducirMovimiento) {
                // sin animacion se deja quieto el cuadro de reposo
                animacion.addEventListener('DOMLoaded', () => animacion.goToAndStop(bucleDesde ?? datos.op - 1, true));
                return;
            }
            if (bucle && bucleDesde !== undefined) {
                const quitar = animacion.addEventListener('complete', () => {
                    quitar();
                    animacion.loop = true;
                    animacion.playSegments([bucleDesde, datos.op], true);
                });
            }
        });

        return () => {
            cancelado = true;
            destruir();
        }
    }, [datos, bucle, bucleDesde, controlada]);

    useEffect(() => {
        const animacion = animacionRef.current;
        if (!animacion || activo === undefined) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (activo) {
            animacion.loop = true;
            if (animacion.isPaused) animacion.goToAndPlay(0, true);
        } else {
            // termina la vuelta en curso y se detiene en el ultimo cuadro, que es igual al de reposo
            animacion.loop = false;
        }
    }, [activo]);

    return <div ref={contenedor} className={className} role={etiqueta ? 'img' : undefined} aria-label={etiqueta} aria-hidden={etiqueta ? undefined : true}/>
}
