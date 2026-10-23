'use client'
import {useEffect, useRef, useState, type ReactNode} from 'react';

// muestra su contenido con una transicion suave (aparece y sube un poco) la primera vez que entra en pantalla
// al bajar por la pagina. Los estilos estan en globals.css (.aparecer); con "reducir movimiento" se muestra sin animar
export const Aparecer = ({children, className = ''} : {children : ReactNode, className? : string}) => {

    const caja = useRef<HTMLDivElement|null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const elemento = caja.current;
        if (!elemento) return;
        const observador = new IntersectionObserver(([entrada]) => {
            if (!entrada.isIntersecting) return;
            setVisible(true);
            observador.disconnect();
        }, {threshold: 0.12, rootMargin: '0px 0px -40px 0px'});
        observador.observe(elemento);
        return () => observador.disconnect();
    }, []);

    return <div ref={caja} className={`aparecer ${visible ? 'aparecer-visible' : ''} ${className}`}>{children}</div>
}
