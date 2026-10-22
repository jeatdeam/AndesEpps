'use client'
import type {ReactNode} from 'react';
import {useControladorCotizacion} from '@/app/controladoresGlobales/controladorCotizacion';
import type {ProductoCarrito} from '@/app/controladoresGlobales/controladorCarrito';

// abre el formulario de cotizacion solo con este producto
export const BotonCotizar = ({producto, className, children} : {producto : Omit<ProductoCarrito, 'cantidad'>, className : string, children : ReactNode}) => {

    const abrir = useControladorCotizacion(estado => estado.abrir);

    return (
        <button type={"button"} onClick={e => { e.preventDefault(); abrir([{...producto, cantidad: 1}]); }} className={className}>
            {children}
        </button>
    )
}
