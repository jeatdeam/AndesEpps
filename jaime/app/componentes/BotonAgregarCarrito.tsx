'use client'
import {useState, useEffect, type ReactNode} from 'react';
import {useControladorCarrito, type ProductoCarrito} from '@/app/controladoresGlobales/controladorCarrito';
import {AnimacionLottie} from './AnimacionLottie';
import agregarCarrito from '@/app/animaciones/agregarCarrito.json';

export const BotonAgregarCarrito = ({producto, className, children} : {producto : Omit<ProductoCarrito, 'cantidad'>, className : string, children : ReactNode}) => {

    const {agregarProducto} = useControladorCarrito();
    const [agregado, setAgregado] = useState(false);

    useEffect(() => {
        if (!agregado) return;
        const timer = setTimeout(() => setAgregado(false), 1200);
        return () => clearTimeout(timer);
    }, [agregado]);

    const agregar = (e : React.MouseEvent) => {
        e.preventDefault();
        agregarProducto(producto);
        setAgregado(true);
    }

    // los dos textos ocupan la misma celda del grid, asi el boton toma el tamaño del mas grande y no salta al cambiar
    return (
        <button onClick={agregar} className={`${className} ${agregado ? "!bg-blue-500 !border-blue-500 !text-white" : ""}`}>
            <span className={"grid [gap:inherit]"}>
                <span className={`[grid-area:1/1] flex items-center justify-center [gap:inherit] transition-all duration-300 ${agregado ? "opacity-0 scale-90" : "opacity-100 scale-100"}`}>
                    {children}
                </span>
                <span aria-hidden={!agregado} className={`[grid-area:1/1] flex items-center justify-center gap-[6px] transition-all duration-300 ${agregado ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
                    {/* se monta en cada clic para que la animacion empiece desde el inicio */}
                    {agregado ? <AnimacionLottie datos={agregarCarrito} bucle={false} className={"size-[22px] shrink-0"}/> : <span className={"size-[22px] shrink-0"}/>}
                    Agregado
                </span>
            </span>
        </button>
    )
}
