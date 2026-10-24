'use client'
import {useEffect, useLayoutEffect, useRef, useState, type ReactNode} from 'react';

// muestra su contenido con una transicion suave (aparece y sube un poco) cuando llega a la pantalla al bajar por la pagina.
// lo que ya se ve al cargar (segun el alto de cada pantalla: celular, tablet, escritorio) se queda visible y sin animacion;
// solo se esconde, para animarse despues, lo que empieza mas abajo. Estilos en globals.css (.aparecer)
export const Aparecer = ({children, className = ''} : {children : ReactNode, className? : string}) => {

    const caja = useRef<HTMLDivElement|null>(null);
    // en el html del servidor todo es visible; antes de pintar se decide si esconderlo
    const [oculto, setOculto] = useState(false);

    useLayoutEffect(() => {
        const elemento = caja.current;
        if (!elemento || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (elemento.getBoundingClientRect().top < window.innerHeight) return;
        setOculto(true);
    }, []);

    useEffect(() => {
        const elemento = caja.current;
        if (!oculto || !elemento) return;
        const observador = new IntersectionObserver(([entrada]) => {
            if (!entrada.isIntersecting) return;
            setOculto(false);
            observador.disconnect();
        }, {threshold: 0.12, rootMargin: '0px 0px -40px 0px'});
        observador.observe(elemento);
        return () => observador.disconnect();
    }, [oculto]);

    return <div ref={caja} className={`aparecer ${oculto ? 'aparecer-oculto' : ''} ${className}`}>{children}</div>
}
