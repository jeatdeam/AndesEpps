import { create } from 'zustand'

type controlador = {
    statusBusqueda : boolean,
    changeStatusBusqueda : () => void,
    desactiveBusqueda : () => void,
    activeBusqueda : () => void,
}

export const useControladorBusqueda =  create<controlador>((set) => ({
    desactiveBusqueda : () => set({statusBusqueda : false}),
    changeStatusBusqueda : () => set((state)=>({
        statusBusqueda : !state.statusBusqueda,
    })),
    activeBusqueda : () => set({statusBusqueda : true}),
    statusBusqueda : false,
}))





