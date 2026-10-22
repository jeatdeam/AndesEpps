'use client'
import Link from 'next/link';
import axios from 'axios';
import {usePathname} from 'next/navigation';
import {useState, useEffect, useRef} from 'react';
import {Product} from '../tipos/elementsType';

const aSlug = (texto : string) => texto.replace(/\s+/g, '-').toLowerCase();

const ENLACES = [
    {texto: 'Productos', href: '/productos'},
    {texto: 'Ofertas', href: '/ofertas'},
];

// secciones que solo viven en el menu de hamburguesa (en todas las pantallas).
// el dashboard no se enlaza: el administrador entra directo a /dashboard
const SECCIONES_MENU = [
    {texto: 'Ventas corporativas', href: '/ventas-corporativas', icono: <><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/></>},
    {texto: 'Ayuda', href: '/ayuda', icono: <><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/></>},
];

const useCategorias = () => {
    const [categorias, setCategorias] = useState<string[]>([]);

    useEffect(() => {
        axios.get<Product[]>('http://localhost:3001/getProductosCategoria')
            .then(({data}) => setCategorias([...new Set(data.map(p => p.categoria))].sort((a, b) => a.localeCompare(b, 'es'))))
            .catch(() => setCategorias([]));
    }, []);

    return categorias;
}

const claseEnlace = (activo : boolean) => `px-[12px] py-[6px] rounded-[10px] text-[15px] font-medium transition-colors duration-300 hover:bg-white/30 ${activo ? "bg-white/30" : ""}`;

// "/productos/[categoria]" pertenece a Categorias, no a Productos
const estaActivo = (pathname : string, href : string) => href === '/productos' ? pathname === href : pathname.startsWith(href);

export const EnlacesHeader = () => {

    const pathname = usePathname();
    const categorias = useCategorias();
    const [abierto, setAbierto] = useState(false);
    const contenedor = useRef<HTMLDivElement|null>(null);

    useEffect(() => {
        const handleClickOutside = (event : MouseEvent) => {
            if(contenedor.current && !contenedor.current.contains(event.target as Node)) setAbierto(false);
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const categoriasActivo = pathname.startsWith('/productos/');

    return (
        <nav className={"hidden lg:flex items-center gap-[4px] shrink-0"}>
            {ENLACES.map(({texto, href}) => (
                <Link key={href} href={href} className={claseEnlace(estaActivo(pathname, href))}>{texto}</Link>
            ))}
            <div ref={contenedor} onMouseLeave={() => setAbierto(false)} className={"relative"}>
                <button onClick={() => setAbierto(!abierto)} onMouseEnter={() => setAbierto(true)} aria-expanded={abierto} className={`${claseEnlace(categoriasActivo)} flex items-center gap-[4px] cursor-pointer`}>
                    Categorías
                    <svg viewBox="0 0 24 24" className={`w-[16px] h-[16px] transition-transform duration-300 ${abierto ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                    </svg>
                </button>
                {/* pt en vez de margin para que el mouse no "caiga" en un hueco y cierre el menu */}
                <div className={`absolute left-0 top-full pt-[8px] transition-all duration-200 ${abierto ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-[4px]"}`}>
                    <div className={"min-w-[220px] max-h-[320px] overflow-y-auto scroll-fino bg-white rounded-[12px] p-[6px] shadow-[0_0_0_1px_rgba(0,0,0,.12)] flex flex-col"}>
                        {categorias.length > 0 ? categorias.map(categoria => (
                            <Link key={categoria} href={`/productos/${aSlug(categoria)}`} onClick={() => setAbierto(false)} className={`px-[10px] py-[8px] rounded-[8px] text-[14px] text-gray-800 first-letter:uppercase hover:bg-gray-100 ${pathname === `/productos/${aSlug(categoria)}` ? "bg-gray-100 font-medium" : ""}`}>
                                {categoria}
                            </Link>
                        )) : (
                            <span className={"px-[10px] py-[8px] text-[14px] text-gray-500"}>Cargando categorías...</span>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export const MenuHeader = () => {

    const pathname = usePathname();
    const categorias = useCategorias();
    const [abierto, setAbierto] = useState(false);
    const [verCategorias, setVerCategorias] = useState(false);
    const contenedor = useRef<HTMLDivElement|null>(null);

    useEffect(() => {
        const handleClickOutside = (event : MouseEvent) => {
            if(contenedor.current && !contenedor.current.contains(event.target as Node)) setAbierto(false);
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const cerrar = () => { setAbierto(false); setVerCategorias(false); }

    const claseItem = (activo : boolean) => `px-[12px] py-[10px] rounded-[8px] text-[15px] text-gray-800 hover:bg-gray-100 ${activo ? "bg-gray-100 font-medium" : ""}`;

    return (
        <div ref={contenedor} className={"flex items-center"}>
            <button onClick={() => setAbierto(!abierto)} aria-expanded={abierto} aria-label={"Abrir menú"} className={"relative p-[5px] flex items-center justify-center cursor-pointer backCircle"}>
                <svg className={""} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>
            </button>
            <nav className={`absolute right-0 top-[calc(100%+8px)] w-[260px] max-w-[90vw] bg-white rounded-[12px] p-[6px] shadow-[0_0_0_1px_rgba(0,0,0,.12)] flex flex-col transition-all duration-200 ${abierto ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-[4px]"}`}>
                {/* en escritorio estos enlaces ya estan en el header, el menu solo muestra las secciones */}
                <div className={"lg:hidden flex flex-col"}>
                    {ENLACES.map(({texto, href}) => (
                        <Link key={href} href={href} onClick={cerrar} className={claseItem(estaActivo(pathname, href))}>{texto}</Link>
                    ))}
                    <button onClick={() => setVerCategorias(!verCategorias)} aria-expanded={verCategorias} className={`${claseItem(pathname.startsWith('/productos/'))} flex items-center justify-between cursor-pointer`}>
                        Categorías
                        <svg viewBox="0 0 24 24" className={`w-[16px] h-[16px] transition-transform duration-300 ${verCategorias ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="m6 9 6 6 6-6"/>
                        </svg>
                    </button>
                    {verCategorias && (
                        <div className={"max-h-[260px] overflow-y-auto scroll-fino flex flex-col pl-[10px]"}>
                            {categorias.map(categoria => (
                                <Link key={categoria} href={`/productos/${aSlug(categoria)}`} onClick={cerrar} className={`${claseItem(pathname === `/productos/${aSlug(categoria)}`)} text-[14px] first-letter:uppercase`}>
                                    {categoria}
                                </Link>
                            ))}
                        </div>
                    )}
                    <div className={"h-px bg-gray-200 my-[6px]"}/>
                </div>
                {SECCIONES_MENU.map(({texto, href, icono}) => (
                    <Link key={href} href={href} onClick={cerrar} className={`${claseItem(pathname.startsWith(href))} flex items-center gap-[10px]`}>
                        <svg viewBox="0 0 24 24" className={"w-[18px] h-[18px] shrink-0 text-gray-500"} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{icono}</svg>
                        {texto}
                    </Link>
                ))}
            </nav>
        </div>
    )
}
