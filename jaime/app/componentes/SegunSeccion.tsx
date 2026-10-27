'use client'
import type {ReactNode} from 'react';
import {usePathname} from 'next/navigation';

// muestra "tienda" en todo el sitio y "dashboard" en /dashboard (incluido el login)
export const SegunSeccion = ({tienda, dashboard = null} : {tienda : ReactNode, dashboard? : ReactNode}) => {
    const pathname = usePathname();
    return pathname.startsWith('/dashboard') ? dashboard : tienda;
}
