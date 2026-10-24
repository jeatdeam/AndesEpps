'use client'
import Link from "next/link";
import {InputBusqueda} from './InputBusqueda'
import {CarritoHeader} from './CarritoHeader'
import {EnlacesHeader, MenuHeader} from './NavegacionHeader'
import {AnimacionLottie} from './AnimacionLottie'
import {ALTO_BARRA} from './BarraSuperior'

// arriba del todo, distancia entre la barra superior y el menu: el logo animado sobresale ~20px por encima del menu
// y con menos espacio sus letras quedaban encima del texto que se mueve en la barra
const SEPARACION_BARRA = 22;
import losAndesEpps from '@/app/animaciones/losAndesEpps.json'
import {useRef, useEffect, useState} from 'react';
import {useControladorBusqueda} from "@/app/controladoresGlobales/controladorBusqueda";
import {useControladorIconoSearch} from "@/app/controladoresGlobales/controladorIconoSearch";



export const  Header = () => {

    const containerBusqueda = useRef<HTMLDivElement|null>(null)

    const {statusBusqueda,desactiveBusqueda, changeStatusBusqueda} = useControladorBusqueda();
    const {statusIcon ,changeStatusIcon, desactiveIcon, activeIcon} = useControladorIconoSearch();


    const [activeSearch, setActiveSearch] = useState<boolean>(false)

    const [flagSearch, setFlagSearch] = useState<boolean>(false);


    const [activeMenu, setActiveMenu] = useState<boolean>(false);
    const containerMenu = useRef<HTMLDivElement|null>(null);
    const containerHeader = useRef<HTMLDivElement|null>(null);

    const showBusqueda = () => {
        if(!activeSearch) return;
        console.log('gaaaa')
        changeStatusIcon(); //click a la lupa
        changeStatusBusqueda()
        // if(!flagSearch) return;
        // changeStatusIcon();
    }

    useEffect(()=> {
        // tocar dentro de cualquier buscador (tambien el flotante de celular, marcado con data-buscador) no lo cierra
        const handleClickOutside = (event : MouseEvent) => {
            if ((event.target as Element).closest?.('[data-buscador]')) return;
            if(containerBusqueda.current && !containerBusqueda.current.contains(event.target as Node)) desactiveBusqueda();
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    },[])


    useEffect(()=>{

        if(!containerHeader.current) return;

        const observer = new IntersectionObserver(([entry]) => {

            // setVisible(entry.isIntersecting);
            if(!entry.isIntersecting) {
               setActiveMenu(true);
            } else {
                setActiveMenu(false)
            }


        },{
            threshold: 0.4,
        })


        observer.observe(containerHeader.current);

        return () => {
            observer.disconnect();
        }

    },[])

    // arriba del todo el menu flotante queda debajo de la barra superior; al bajar, la barra se va con la pagina
    // y el menu sube hasta quedar a 10px del borde de la ventana
    useEffect(() => {
        let cuadro = 0;
        const ubicar = () => {
            cancelAnimationFrame(cuadro);
            cuadro = requestAnimationFrame(() => {
                if (containerMenu.current) containerMenu.current.style.top = `${Math.max(10, ALTO_BARRA + SEPARACION_BARRA - window.scrollY)}px`;
            });
        }
        ubicar();
        window.addEventListener('scroll', ubicar, {passive: true});
        return () => {
            cancelAnimationFrame(cuadro);
            window.removeEventListener('scroll', ubicar);
        }
    }, []);

    useEffect(() => {
        const media = window.matchMedia("(max-width: 768px)");

        const sync = (matches: boolean) => {
            setActiveSearch(matches); //Deja que se use el evento click del svg
            desactiveIcon()
            // desactiveIcon()
        };

        sync(media.matches); // estado inicial

        const handleChange = (e: MediaQueryListEvent) => sync(e.matches);

        media.addEventListener("change", handleChange);
        return () => media.removeEventListener("change", handleChange);
    }, []);


    return (
        // el menu flotante sobresale un poco a cada lado del contenido de la pagina (90% del ancho, 70% en 2xl):
        // 8px de margen en celular, 94% desde sm y en 2xl el 74% sin bajar de 1240px (el detalle de producto llega a 1200px)
        // alto = separacion con la barra + 80px del menu + 10px hasta el contenido
        <div ref={containerHeader} style={{height: SEPARACION_BARRA + 80 + 10}} className={"flex items-center relative"}>
            {/* azul marino translucido (el mismo de los botones oscuros) con textos e iconos blancos;
                en vez de borde lleva una sombra solida de 1px muy tenue */}
            <div ref={containerMenu} style={{top: ALTO_BARRA + SEPARACION_BARRA}} className={`${activeMenu ? "backdrop-blur-md bg-slate-900/75" : "bg-slate-900/85 backdrop-blur-none"} menuOscuro text-white w-[calc(100%-16px)] sm:w-[94%] 2xl:w-[max(74%,1240px)] shadow-[0_0_0_1px_rgba(255,255,255,.14),0_8px_24px_rgba(15,23,42,.18)] transition-[background-color,backdrop-filter] duration-500 linear fixed z-[10] -translate-x-1/2 left-1/2 flex justify-between gap-[24px] p-[20px] rounded-[15px] items-center  origin-center mx-auto h-[80px]`}>

                {/* el margen negativo deja que la animacion sea mas alta que el contenido sin agrandar el header.
                    el dibujo empieza ~48px dentro de la animacion: bajo 1024px se corre 40px para que quede
                    a la misma distancia del borde que el icono del menu del lado derecho */}
                <Link href={"/"} aria-label={"Los Andes EPPS - inicio"} className={"flex items-center w-fit shrink-0 mr-auto -my-[56px] lg:-my-[78px]"}>
                    <AnimacionLottie datos={losAndesEpps} className={"w-[251px] h-[150.4px] lg:w-[326px] lg:h-[195.5px] shrink-0 max-lg:-ml-[40px] max-lg:translate-y-[8px] lg:translate-y-[14px]"}/>
                </Link>
                <EnlacesHeader/>
                {/* el logo empuja todo a la derecha (mr-auto): enlaces, buscador e iconos quedan juntos con la misma separacion */}
                <div className={`flex min-w-0 justify-end ${activeSearch ? "gap-[10px]" : "gap-[24px]"}`}>
                    <div ref={containerBusqueda} className={`flex items-center rounded-[7.5px] gap-[10px] py-[5px] ${activeSearch ? "" : "min-w-0"} relative`}>
                        {activeSearch &&
                            <div onClick={showBusqueda} className={"backCircle  relative size-[35px] shrink-0 flex items-center justify-center cursor-pointer"}>
                                <svg className={" block z-[-10] transition-all duration-300 linear w-[22.5px] h-[22.5px] rounded-full"} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>
                            </div>
                        }
                        {!activeSearch && <InputBusqueda/>}
                    </div>
                    <div className={"flex gap-[10px] items-center"}>
                        <CarritoHeader/>
                        <MenuHeader/>
                    </div>
                </div>

                {statusIcon && <InputBusqueda/>}

            </div>

            {/* en celular, con el buscador abierto, el resto de la pantalla queda detras de un vidrio esmerilado
                (debajo del header, z-[9]); tocarlo cierra la busqueda para seguir navegando */}
            {statusIcon && (
                <div onClick={() => { desactiveIcon(); desactiveBusqueda(); }} aria-hidden={true}
                    className={"fixed inset-0 z-[9] bg-slate-900/25 backdrop-blur-sm animate-[aparecerVidrio_.2s_ease-out]"}/>
            )}
        </div>
    )
}