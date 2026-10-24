'use client'
import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {useControladorCarrito} from '@/app/controladoresGlobales/controladorCarrito';
import {useControladorCotizacion} from '@/app/controladoresGlobales/controladorCotizacion';
import {formatoPrecio} from './elementosProducto';
import {AnimacionLottie} from './AnimacionLottie';
import carritoVacio from '@/app/animaciones/carritoVacio.json';
import animacionVaciar from '@/app/animaciones/vaciarCarrito.json';

// tacho animado: abre la tapa y se pone rojo mientras el cursor (o el foco) esta encima
const BotonVaciar = ({vaciar} : {vaciar : () => void}) => {
    const [activo, setActivo] = useState(false);
    return (
        <button onClick={vaciar} onMouseEnter={() => setActivo(true)} onMouseLeave={() => setActivo(false)} onFocus={() => setActivo(true)} onBlur={() => setActivo(false)}
            aria-label={"Vaciar carrito"} title={"Vaciar carrito"} className={"size-[36px] shrink-0 rounded-full flex items-center justify-center hover:bg-red-50 focus-visible:bg-red-50 transition-colors cursor-pointer"}>
            <AnimacionLottie datos={animacionVaciar} activo={activo} className={"size-[30px]"}/>
        </button>
    )
}

export const CarritoHeader = () => {

    const {productos, quitarProducto, vaciarCarrito} = useControladorCarrito();
    const abrirCotizacion = useControladorCotizacion(estado => estado.abrir);

    // en escritorio el panel se abre al pasar el cursor (group-hover). En celulares no hay cursor:
    // se abre y se cierra tocando la bolsa, y se cierra al tocar fuera del panel
    const [abierto, setAbierto] = useState(false);
    const contenedor = useRef<HTMLDivElement|null>(null);
    const alternar = () => {
        if (window.matchMedia('(hover: hover)').matches) return;
        setAbierto(!abierto);
    }

    useEffect(() => {
        if (!abierto) return;
        // el toque que cierra el panel no debe abrir ademas lo que habia debajo (un banner, un producto):
        // se descarta el clic que llega justo despues; si no llega (fue un scroll) se deja de esperar
        const descartarClic = (event : MouseEvent) => { event.preventDefault(); event.stopPropagation(); }
        const tocarFuera = (event : PointerEvent) => {
            if (!contenedor.current || contenedor.current.contains(event.target as Node)) return;
            setAbierto(false);
            document.addEventListener('click', descartarClic, {capture: true, once: true});
            setTimeout(() => document.removeEventListener('click', descartarClic, {capture: true}), 500);
        }
        document.addEventListener('pointerdown', tocarFuera);
        return () => document.removeEventListener('pointerdown', tocarFuera);
    }, [abierto]);

    // carga el carrito guardado en localStorage una vez montado en el cliente
    useEffect(() => {
        useControladorCarrito.persist.rehydrate();
    }, [])

    const cantidadTotal = productos.reduce((acc, el) => acc + el.cantidad, 0);
    const precioTotal = productos.reduce((acc, el) => acc + el.precio * el.cantidad, 0);

    return (
        <div ref={contenedor} className={"relative group"}>
            {/* en celular, con el carrito abierto, el resto de la pantalla queda detras del mismo vidrio que la busqueda.
                va en un portal a <body>: dentro del menu (que tiene transform) "fixed" cubriria solo el menu.
                z-[9] lo deja debajo del header (z-[10]); tocarlo cierra el panel (ver tocarFuera) */}
            {abierto && createPortal(
                <div aria-hidden={true} className={"fixed inset-0 z-[9] bg-slate-900/25 backdrop-blur-sm animate-[aparecerVidrio_.2s_ease-out]"}/>,
                document.body
            )}
            <button type={"button"} onClick={alternar} aria-label={"Ver carrito"} aria-expanded={abierto} className={"relative cursor-pointer p-[5px] backCircle"}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M240-80q-33 0-56.5-23.5T160-160v-480q0-33 23.5-56.5T240-720h80q0-66 47-113t113-47q66 0 113 47t47 113h80q33 0 56.5 23.5T800-640v480q0 33-23.5 56.5T720-80H240Zm0-80h480v-480h-80v80q0 17-11.5 28.5T600-520q-17 0-28.5-11.5T560-560v-80H400v80q0 17-11.5 28.5T360-520q-17 0-28.5-11.5T320-560v-80h-80v480Zm160-560h160q0-33-23.5-56.5T480-800q-33 0-56.5 23.5T400-720ZM240-160v-480 480Z"/></svg>
                {cantidadTotal > 0 && (
                    // contadorPulso (globals.css): cada ~1.8 s salen dos anillos detras del circulo, uno tenue y otro con borde
                    <span className={"contadorPulso absolute -top-[6px] -right-[8px] min-w-[18px] h-[18px] px-[4px] rounded-full bg-white text-slate-900 shadow-[0_0_0_1px_rgba(15,23,42,.25)] text-[11px] font-bold flex items-center justify-center leading-none"}>
                        {cantidadTotal}
                    </span>
                )}
            </button>

            {/* pt crea un puente invisible para que el hover no se pierda entre el icono y el panel.
                group-hover solo actua en pantallas con cursor; en celulares lo abre "abierto" (al tocar la bolsa).
                en celular el panel ocupa todo el ancho del menu, centrado: el menu tiene transform, asi que "fixed"
                se ubica respecto a el (left/right 0 = sus bordes, top-full = justo debajo) y no se sale de la pantalla */}
            <div className={`absolute max-sm:fixed right-0 max-sm:left-0 top-full pt-[18px] max-sm:pt-[10px] ${abierto ? "visible opacity-100 translate-y-0" : "invisible opacity-0 translate-y-[5px]"} group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-[20]`}>
                <div className={"w-[320px] max-w-[85vw] max-sm:w-full max-sm:max-w-none bg-white text-black rounded-[12px] shadow-[0_0_0_1px_rgba(0,0,0,.12)] p-[15px] flex flex-col gap-[12px]"}>
                    <div className={"flex justify-between items-center"}>
                        <span className={"font-bold"}>Mi carrito</span>
                        <span className={"text-[13px] opacity-70"}>{cantidadTotal} {cantidadTotal === 1 ? 'producto' : 'productos'}</span>
                    </div>

                    <div className={"w-full h-px bg-current opacity-20"}/>

                    {productos.length === 0 ? (
                        <div className={"flex flex-col items-center py-[5px]"}>
                            <AnimacionLottie datos={carritoVacio} className={"size-[110px]"}/>
                            <p className={"text-[14px] text-center opacity-70"}>Tu carrito está vacío</p>
                        </div>
                    ) : (
                        <>
                            <ul className={"flex flex-col gap-[10px] max-h-[300px] overflow-y-auto scroll-fino pr-[4px]"}>
                                {productos.map(el => (
                                    <li key={el.id} className={"flex gap-[10px] items-center"}>
                                        <img src={el.img} alt="" className={"w-[55px] h-[55px] shrink-0 object-contain border rounded-[8px] bg-white"}/>
                                        <div className={"flex-1 min-w-0 flex flex-col"}>
                                            <span className={"text-[14px] font-semibold truncate capitalize"}>{el.name}</span>
                                            <span className={"text-[13px] opacity-70"}>{el.cantidad} x {formatoPrecio(el.precio)}</span>
                                        </div>
                                        <button onClick={() => quitarProducto(el.id)} aria-label="Quitar producto" className={"shrink-0 w-[26px] h-[26px] rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 flex items-center justify-center text-[16px] leading-none transition-colors cursor-pointer"}>×</button>
                                    </li>
                                ))}
                            </ul>

                            <div className={"w-full h-px bg-current opacity-20"}/>

                            <div className={"flex justify-between items-center font-bold"}>
                                <span>Total</span>
                                <span>{formatoPrecio(precioTotal)}</span>
                            </div>

                            <div className={"flex items-center justify-between gap-[10px]"}>
                                {/* solo el icono; el texto "Cotizar" aparece a su derecha al pasar el cursor o enfocar con teclado.
                                    usa un grupo con nombre: el "group" de la bolsa ya esta activo mientras esta abierta */}
                                <button onClick={() => abrirCotizacion(productos)} aria-label={"Cotizar"} className={"group/cotizar relative size-[36px] shrink-0 rounded-full flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 focus-visible:bg-blue-50 focus-visible:text-blue-600 transition-colors cursor-pointer"}>
                                    {/* 22px: el dibujo queda del mismo alto (~17px) que el tachito de vaciar */}
                                    <svg viewBox="0 0 24 24" className={"w-[22px] h-[22px] shrink-0"} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <rect x="5" y="3.5" width="14" height="18" rx="2"/>
                                        <path d="M9 3.5V2.5h6v1M9 10h6M9 14h6M9 18h3"/>
                                    </svg>
                                    <span aria-hidden={true} className={"pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-[8px] whitespace-nowrap rounded-[6px] bg-blue-500 px-[8px] py-[3px] text-[12px] font-medium text-white opacity-0 -translate-x-[4px] group-hover/cotizar:opacity-100 group-hover/cotizar:translate-x-0 group-focus-visible/cotizar:opacity-100 group-focus-visible/cotizar:translate-x-0 transition-all duration-150"}>
                                        Cotizar
                                    </span>
                                </button>
                                <BotonVaciar vaciar={vaciarCarrito}/>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
