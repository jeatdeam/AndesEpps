import {create} from 'zustand';

type controlador = {
    statusIcon : boolean,
    changeStatusIcon : () => void,
    desactiveIcon : ()  => void,
    activeIcon : () => void,
}



export const useControladorIconoSearch = create<controlador>((set)=> ({
    statusIcon : true,
    changeStatusIcon : () => set((state)=>({
        statusIcon : !state.statusIcon,
    })),
    desactiveIcon : () => set((state) => ({
        statusIcon : false})),
    activeIcon : () => set({statusIcon : true}),
}));



