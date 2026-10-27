'use client'
import {useRef, useEffect} from 'react';
import {Product} from '@/app/tipos/elementsType';
import {TarjetaProducto} from './TarjetaProducto';

// pixeles por milisegundo
const VELOCIDAD = 0.08;
// a partir de cuantos pixeles se considera arrastre y no click
const UMBRAL_ARRASTRE = 5;
// que tan rapido se frena el impulso al soltar (por cada 16ms), mas cerca de 1 = desliza mas
const FRICCION = 0.94;
// suavizado mientras se arrastra: 1 = sigue al mouse exacto, menor = va un poco detras
const SUAVIZADO = 0.25;

export const CarruselMasBuscados = ({productos} : {productos : Product[]}) => {

    const contenedor = useRef<HTMLDivElement|null>(null);
    const posicion = useRef(0);
    const pausado = useRef(false);
    const arrastre = useRef({activo : false, inicioX : 0, posicionInicio : 0, movido : false});
    // posicion hacia donde va el carrusel mientras se arrastra
    const objetivo = useRef(0);
    // impulso en px/ms que queda al soltar
    const inercia = useRef(0);
    const ultimoMovimiento = useRef({x : 0, tiempo : 0});

    // la lista va duplicada, al pasar la mitad se regresa al inicio sin que se note
    const ajustarPosicion = (valor : number) => {
        const el = contenedor.current;
        if (!el) return valor;
        const mitad = el.scrollWidth / 2;
        if (mitad <= 0) return valor;
        return ((valor % mitad) + mitad) % mitad;
    }

    useEffect(() => {
        let idAnimacion : number;
        let anterior = performance.now();

        const avanzar = (tiempo : number) => {
            const diferencia = tiempo - anterior;
            anterior = tiempo;
            const el = contenedor.current;
            if (el) {
                if (arrastre.current.activo) {
                    // se acerca poco a poco a donde esta el mouse
                    posicion.current += (objetivo.current - posicion.current) * SUAVIZADO;
                } else if (Math.abs(inercia.current) > 0.01) {
                    // sigue deslizando despues de soltar y se va frenando
                    posicion.current += inercia.current * diferencia;
                    inercia.current *= Math.pow(FRICCION, diferencia / 16);
                } else if (!pausado.current) {
                    posicion.current += VELOCIDAD * diferencia;
                }

                const ajustada = ajustarPosicion(posicion.current);
                const salto = ajustada - posicion.current;
                posicion.current = ajustada;
                objetivo.current += salto;
                arrastre.current.posicionInicio += salto;
                el.scrollLeft = posicion.current;
            }
            idAnimacion = requestAnimationFrame(avanzar);
        }
        idAnimacion = requestAnimationFrame(avanzar);

        return () => cancelAnimationFrame(idAnimacion);
    }, [])

    const iniciarArrastre = (e : React.PointerEvent) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        arrastre.current = {activo : true, inicioX : e.clientX, posicionInicio : posicion.current, movido : false};
        objetivo.current = posicion.current;
        inercia.current = 0;
        ultimoMovimiento.current = {x : e.clientX, tiempo : performance.now()};

        const mover = (ev : PointerEvent) => {
            const distancia = ev.clientX - arrastre.current.inicioX;
            if (Math.abs(distancia) > UMBRAL_ARRASTRE) arrastre.current.movido = true;
            if (!arrastre.current.movido) return;
            objetivo.current = arrastre.current.posicionInicio - distancia;

            // velocidad del mouse, suavizada para que un tiron final no la dispare
            const ahora = performance.now();
            const tiempo = Math.max(1, ahora - ultimoMovimiento.current.tiempo);
            const velocidad = -(ev.clientX - ultimoMovimiento.current.x) / tiempo;
            inercia.current = inercia.current * 0.6 + velocidad * 0.4;
            ultimoMovimiento.current = {x : ev.clientX, tiempo : ahora};
        }

        const soltar = () => {
            arrastre.current.activo = false;
            // si se quedo quieto antes de soltar no hay impulso
            if (performance.now() - ultimoMovimiento.current.tiempo > 100) inercia.current = 0;
            inercia.current = Math.max(-3, Math.min(3, inercia.current));
            window.removeEventListener('pointermove', mover);
            window.removeEventListener('pointerup', soltar);
            window.removeEventListener('pointercancel', soltar);
        }

        window.addEventListener('pointermove', mover);
        window.addEventListener('pointerup', soltar);
        window.addEventListener('pointercancel', soltar);
    }

    // si el usuario arrastro, el click final no debe abrir el producto ni agregarlo al carrito
    const bloquearClickTrasArrastre = (e : React.MouseEvent) => {
        if (!arrastre.current.movido) return;
        e.preventDefault();
        e.stopPropagation();
        arrastre.current.movido = false;
    }

    if (productos.length === 0) return null;

    return (
        <div
            ref={contenedor}
            onMouseEnter={() => pausado.current = true}
            onMouseLeave={() => pausado.current = false}
            onPointerDown={iniciarArrastre}
            onClickCapture={bloquearClickTrasArrastre}
            onDragStart={(e) => e.preventDefault()}
            className={"w-full overflow-hidden select-none cursor-grab active:cursor-grabbing touch-pan-y py-[15px] -my-[15px]"}
        >
            <div className={"flex w-max gap-[20px] pr-[20px]"}>
                {[...productos, ...productos].map((producto, index) => (
                    <div key={index} aria-hidden={index >= productos.length}>
                        <TarjetaProducto producto={producto} fino/>
                    </div>
                ))}
            </div>
        </div>
    )
}
