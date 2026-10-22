import {create} from 'zustand';
import {persist} from 'zustand/middleware';

export type ProductoCarrito = {
    id : number,
    name : string,
    precio : number,
    img : string,
    cantidad : number,
}

type controlador = {
    productos : ProductoCarrito[],
    agregarProducto : (producto : Omit<ProductoCarrito, 'cantidad'>) => void,
    quitarProducto : (id : number) => void,
    vaciarCarrito : () => void,
}

// se guarda en localStorage; skipHydration evita diferencias entre el html del servidor y el cliente
export const useControladorCarrito = create<controlador>()(persist((set) => ({
    productos : [],
    agregarProducto : (producto) => set((state) => {
        const existe = state.productos.find(el => el.id === producto.id);
        return {
            productos : existe
                ? state.productos.map(el => el.id === producto.id ? {...el, cantidad : el.cantidad + 1} : el)
                : [...state.productos, {...producto, cantidad : 1}],
        }
    }),
    quitarProducto : (id) => set((state) => ({
        productos : state.productos.filter(el => el.id !== id),
    })),
    vaciarCarrito : () => set({productos : []}),
}), {
    name : 'carrito',
    skipHydration : true,
}));
