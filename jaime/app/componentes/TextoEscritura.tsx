'use client'
import {useEffect, useState} from 'react';

// escribe el texto letra por letra como una persona: ritmo irregular, una pausa ("suspiro")
// despues de cada palabra, descansa con el texto completo, lo borra y vuelve a empezar.
// el cursor parpadea solo mientras esta quieto; al escribir se queda fijo.
export const TextoEscritura = ({texto, className} : {texto : string, className? : string}) => {

    const [cantidad, setCantidad] = useState(0);
    const [borrando, setBorrando] = useState(false);
    const [escribiendo, setEscribiendo] = useState(false);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            // sin animacion se muestra el texto completo de una vez
            const temporizador = window.setTimeout(() => setCantidad(texto.length), 0);
            return () => window.clearTimeout(temporizador);
        }

        let espera : number;
        if (!borrando && cantidad < texto.length) {
            const anterior = texto[cantidad - 1];
            // suspiro: se detiene un poco mas despues de un espacio o de los dos puntos
            const suspiro = anterior === ' ' ? 260 + Math.random() * 220 : 0;
            espera = cantidad === 0 ? 900 : 55 + Math.random() * 90 + suspiro;
        } else if (!borrando) {
            espera = 3200; // descansa con el texto completo
        } else if (cantidad > 0) {
            espera = 28 + Math.random() * 20;
        } else {
            espera = 500;
        }

        const temporizador = window.setTimeout(() => {
            if (!borrando && cantidad < texto.length) {
                setEscribiendo(true);
                setCantidad(cantidad + 1);
            } else if (!borrando) {
                setBorrando(true);
            } else if (cantidad > 0) {
                setCantidad(cantidad - 1);
            } else {
                setBorrando(false);
            }
        }, espera);

        // en las pausas largas el cursor vuelve a parpadear
        const quieto = window.setTimeout(() => setEscribiendo(false), Math.min(espera, 200) + 120);

        return () => {
            window.clearTimeout(temporizador);
            window.clearTimeout(quieto);
        }
    }, [cantidad, borrando, texto]);

    return (
        <span className={`relative inline-grid ${className ?? ''}`}>
            <span className={"sr-only"}>{texto}</span>
            {/* reserva el ancho del texto completo para que nada se mueva mientras escribe */}
            <span aria-hidden={true} className={"invisible col-start-1 row-start-1 whitespace-pre"}>{texto}</span>
            <span aria-hidden={true} className={"col-start-1 row-start-1 whitespace-pre"}>
                {texto.slice(0, cantidad)}
                <span className={`inline-block w-[2px] h-[1.1em] -mb-[.15em] ml-[2px] bg-sky-700 ${escribiendo ? '' : 'cursorEscritura'}`}/>
            </span>
        </span>
    )
}
