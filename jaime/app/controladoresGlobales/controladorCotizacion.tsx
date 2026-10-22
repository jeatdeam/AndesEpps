import {create} from 'zustand';
import type {ProductoCarrito} from './controladorCarrito';

type controlador = {
    abierto : boolean,
    productos : ProductoCarrito[],
    // abre el formulario de cotizacion con los productos del carrito o con uno solo
    abrir : (productos : ProductoCarrito[]) => void,
    cerrar : () => void,
}

export const useControladorCotizacion = create<controlador>()((set) => ({
    abierto : false,
    productos : [],
    abrir : (productos) => set({abierto : true, productos}),
    cerrar : () => set({abierto : false}),
}));
