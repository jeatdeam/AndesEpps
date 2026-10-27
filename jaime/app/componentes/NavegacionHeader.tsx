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
        axios.get<Product[]>(`/api/productos`)
            .then(({data}) => setCategorias([...new Set(data.map(p => p.categoria))].sort((a, b) => a.localeCompare(b, 'es'))))
            .catch(() => setCategorias([]));
    }, []);

    return categorias;
}

// el header es azul marino: texto blanco y un fondo blanco translucido al pasar el cursor o en la seccion activa
const claseEnlace = (activo : boolean) => `px-[12px] py-[6px] rounded-[10px] text-[15px] font-normal text-white transition-colors duration-300 hover:bg-white/15 ${activo ? "bg-white/15" : ""}`;

// "/productos/[categoria]" pertenece a Categorias, no a Productos
const estaActivo = (pathname : string, href : string) => href === '/productos' ? pathname === href : pathname.startsWith(href);

// Productos, Ofertas y Categorias
export const TOTAL_ENLACES = ENLACES.length + 1;
const SEPARACION_ENLACES = 4;

const FlechaCategorias = ({abierto} : {abierto : boolean}) => (
    <svg viewBox="0 0 24 24" className={`w-[16px] h-[16px] transition-transform duration-300 ${abierto ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6"/>
    </svg>
);

// desde 1024px los enlaces ocupan el espacio que sobra entre el logo y el buscador (flex-1 con base 0, asi el buscador conserva su ancho).
// si no entran todos, los que estan mas cerca del buscador pasan al menu de hamburguesa uno por uno.
// "visibles" lo guarda el Header para que MenuHeader muestre los que faltan; empieza en 0 para que en el
// primer render (servidor) ningun enlace se monte sobre el buscador antes de medir
export const EnlacesHeader = ({visibles, onVisibles} : {visibles : number, onVisibles : (cantidad : number) => void}) => {

    const pathname = usePathname();
    const categorias = useCategorias();
    const [abierto, setAbierto] = useState(false);
    const contenedor = useRef<HTMLDivElement|null>(null);
    const nav = useRef<HTMLElement|null>(null);
    // copia invisible de los tres enlaces para conocer su ancho aunque esten en el menu
    const medidas = useRef<HTMLDivElement|null>(null);

    useEffect(() => {
        if(!nav.current || !medidas.current) return;
        const calcular = () => {
            if(!nav.current || !medidas.current) return;
            const disponible = nav.current.clientWidth;
            // bajo 1024px el nav esta oculto (ancho 0): todos los enlaces van al menu
            if(disponible === 0) return onVisibles(0);
            let usado = 0, cantidad = 0;
            for(const enlace of Array.from(medidas.current.children) as HTMLElement[]) {
                usado += enlace.offsetWidth + (cantidad > 0 ? SEPARACION_ENLACES : 0);
                if(usado > disponible) break;
                cantidad++;
            }
            onVisibles(cantidad);
        }
        // tambien se observa la copia: cambia de ancho cuando termina de cargar la fuente
        const observador = new ResizeObserver(calcular);
        observador.observe(nav.current);
        observador.observe(medidas.current);
        return () => observador.disconnect();
    }, [onVisibles]);

    useEffect(() => {
        const handleClickOutside = (event : MouseEvent) => {
            if(contenedor.current && !contenedor.current.contains(event.target as Node)) setAbierto(false);
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const categoriasActivo = pathname.startsWith('/productos/');

    return (
        <nav ref={nav} className={"relative flex-1 min-w-0 hidden lg:flex items-center justify-end gap-[4px]"}>
            <div ref={medidas} aria-hidden={true} className={"absolute invisible pointer-events-none flex whitespace-nowrap"}>
                {ENLACES.map(({texto, href}) => <span key={href} className={claseEnlace(false)}>{texto}</span>)}
                <span className={`${claseEnlace(false)} flex items-center gap-[4px]`}>Categorías<FlechaCategorias abierto={false}/></span>
            </div>
            {ENLACES.slice(0, visibles).map(({texto, href}) => (
                <Link key={href} href={href} className={`${claseEnlace(estaActivo(pathname, href))} shrink-0 whitespace-nowrap`}>{texto}</Link>
            ))}
            {visibles === TOTAL_ENLACES && <div ref={contenedor} onMouseLeave={() => setAbierto(false)} className={"relative shrink-0"}>
                <button onClick={() => setAbierto(!abierto)} onMouseEnter={() => setAbierto(true)} aria-expanded={abierto} className={`${claseEnlace(categoriasActivo)} flex items-center gap-[4px] whitespace-nowrap cursor-pointer`}>
                    Categorías
                    <FlechaCategorias abierto={abierto}/>
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
            </div>}
        </nav>
    )
}

export const MenuHeader = ({enlacesVisibles} : {enlacesVisibles : number}) => {

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
                <svg className={""} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>
            </button>
            <nav className={`absolute right-0 top-[calc(100%+8px)] w-[260px] max-w-[90vw] bg-white rounded-[12px] p-[6px] shadow-[0_0_0_1px_rgba(0,0,0,.12)] flex flex-col transition-all duration-200 ${abierto ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-[4px]"}`}>
                {/* solo los enlaces que no entraron en el header (ver EnlacesHeader) */}
                {enlacesVisibles < TOTAL_ENLACES && <div className={"flex flex-col"}>
                    {ENLACES.slice(enlacesVisibles).map(({texto, href}) => (
                        <Link key={href} href={href} onClick={cerrar} className={claseItem(estaActivo(pathname, href))}>{texto}</Link>
                    ))}
                    <button onClick={() => setVerCategorias(!verCategorias)} aria-expanded={verCategorias} className={`${claseItem(pathname.startsWith('/productos/'))} flex items-center justify-between cursor-pointer`}>
                        Categorías
                        <FlechaCategorias abierto={verCategorias}/>
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
                </div>}
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
