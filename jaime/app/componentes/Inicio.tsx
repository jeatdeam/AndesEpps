"use client";
import Image from "next/image";
import {useState, useEffect, useLayoutEffect, useRef} from 'react';
import Link from 'next/link';
import {API} from '@/app/configuracion';
import {Product, Banners} from '@/app/tipos/elementsType'
import {CarruselMasBuscados} from './CarruselMasBuscados'
import {BannersOfertas, BannersNuevos} from './BannersInicio'
import {TituloSeccion} from './TituloSeccion'
import {IconoWhatsapp} from './Footer'
import {AnimacionLottie} from './AnimacionLottie'
import {Cargando} from './Cargando'
import {Aparecer} from './Aparecer'
import pulsoWhatsapp from '@/app/animaciones/pulsoWhatsapp.json'


// mosaico de 6 columnas (desde md):
// fila 1 completa, fila 2 en dos mitades, fila 3 grande (2/3) + pequeña (1/3),
// luego grupos de 4 que mezclan bloques verticales y horizontales
const MOSAICO_INICIO = [
    "sm:col-span-2 md:col-span-6",
    "md:col-span-3",
    "md:col-span-3",
    "md:col-span-4",
    "sm:col-span-2 md:col-span-2",
];

const MOSAICO_GRUPOS = [
    ["md:col-span-2 md:row-span-2", "sm:col-span-2 md:col-span-4", "md:col-span-2", "md:col-span-2"],
    ["sm:col-span-2 md:col-span-4", "md:col-span-2 md:row-span-2", "md:col-span-2", "md:col-span-2"],
];

// si sobran elementos que no completan un grupo, se reparten para llenar la fila
const MOSAICO_SOBRANTES = [
    [],
    ["sm:col-span-2 md:col-span-6"],
    ["md:col-span-3", "md:col-span-3"],
    ["md:col-span-2", "md:col-span-2", "sm:col-span-2 md:col-span-2"],
];

const MAS_BUSCADOS_IDS = [3, 1, 7, 5, 9, 2, 10, 4];

// logos de "Nuestras marcas" (public/marcas): tarjetas de 400x200 con el color de fondo de cada marca
const MARCAS = [
    {nombre: '3M', imagen: '/marcas/3m.webp'},
    {nombre: 'Ansell', imagen: '/marcas/ansell.webp'},
    {nombre: 'DuPont', imagen: '/marcas/dupont.webp'},
    {nombre: 'CAT', imagen: '/marcas/cat.webp'},
    {nombre: 'DeWalt', imagen: '/marcas/dewalt.webp'},
    {nombre: 'Stanley', imagen: '/marcas/stanley.webp'},
    {nombre: 'Truper', imagen: '/marcas/truper.webp'},
    {nombre: 'Bosch', imagen: '/marcas/bosch.webp'},
    {nombre: 'Makita', imagen: '/marcas/makita.webp'},
    {nombre: 'Total', imagen: '/marcas/total.webp'},
];

// boton de flecha del slider: oculto hasta pasar el cursor; con [@media(hover:none)] queda visible en pantallas tactiles
// en celular el slider mide ~150px de alto, por eso la flecha es mas chica hasta sm
const CLASE_FLECHA_SLIDER = "pointer-events-auto size-[32px] sm:size-[46px] rounded-full bg-white/70 backdrop-blur-md ring-1 ring-black/5 shadow-[0_4px_14px_rgba(15,23,42,.15)] flex items-center justify-center text-slate-900 cursor-pointer opacity-0 group-hover/slider:opacity-100 focus-visible:opacity-100 focus-visible:translate-x-0 [@media(hover:none)]:opacity-100 [@media(hover:none)]:translate-x-0 hover:bg-white/90 active:scale-90 transition-all duration-300";

// chevron fino de iOS (mismo trazo que las flechas de la galeria del producto)
const ChevronIOS = ({direccion} : {direccion : 'izquierda' | 'derecha'}) => (
    <svg viewBox="0 0 24 24" className={"size-[16px] sm:size-[22px]"} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden={true}>
        <path d={direccion === 'izquierda' ? "M15 4.5 7.5 12l7.5 7.5" : "M9 4.5 16.5 12 9 19.5"}/>
    </svg>
)


const claseMosaico =(index : number, total : number) => {
    if (index < MOSAICO_INICIO.length) return MOSAICO_INICIO[index];
    const posicion = index - MOSAICO_INICIO.length;
    const restantes = total - MOSAICO_INICIO.length;
    const inicioSobrantes = restantes - (restantes % 4);
    if (posicion >= inicioSobrantes) return MOSAICO_SOBRANTES[restantes % 4][posicion - inicioSobrantes];
    return MOSAICO_GRUPOS[Math.floor(posicion / 4) % 2][posicion % 4];
}

// separa el texto en letras para la animacion de cascada; cada palabra queda junta
// para que el salto de linea no corte una palabra a la mitad
const TextoCascada = ({texto} : {texto : string}) => {
    let indice = 0;
    return (
        <span aria-hidden={true}>
            {texto.split(" ").map((palabra, p) => (
                <span key={p} className={"inline-block whitespace-nowrap"}>
                    {[...palabra].map((letra, l) => (
                        <span key={l} className={"letraCascada"} style={{"--i" : indice++} as React.CSSProperties}>{letra}</span>
                    ))}
                    {p < texto.split(" ").length - 1 && <span className={"inline-block"}>&nbsp;</span>}
                </span>
            ))}
        </span>
    );
}

// productos y banners llegan ya armados desde el servidor (app/page.tsx); si alli fallaron se piden aqui
export function Inicio({productosIniciales, bannersIniciales} : {productosIniciales : Product[] | null, bannersIniciales : Banners | null}) {

    const containerImg = useRef<HTMLDivElement|null>(null);
    const arrowRight = useRef<HTMLButtonElement|null>(null);
    const arrowLeft = useRef<HTMLButtonElement|null>(null);
    const idInterval = useRef<ReturnType<typeof setInterval> | null>(null)
    const flagInterval = useRef<boolean>(true);
    const firstImg = useRef<HTMLImageElement|null>(null);
    const containerCarrusel = useRef<HTMLDivElement|null>(null);


    const [changeLeft, setChangeLeft] = useState<boolean>(false);
    const [changeRight, setChangeRight] = useState<boolean>(false);
    const [paintCircle, setPaintCircle] = useState<number>(1);
    const [bagSlider, setBagSlider] = useState<boolean>(false);
    const [positionImg, setPositionImg] = useState<number>(0);




    const [categorias, setCategorias] = useState<Product[]|null>(productosIniciales)
    const [banners, setBanners] = useState<Banners|null>(bannersIniciales)

    // un producto por categoria para el mosaico
    const categoriasUnicas = (categorias ?? []).filter((el, index, arr) => arr.findIndex(p => p.categoria === el.categoria) === index);

    // simulado: orden fijo de ids hasta tener datos reales de busquedas
    const masBuscados = MAS_BUSCADOS_IDS
        .map(id => categorias?.find(p => p.id === id))
        .filter((p) : p is Product => !!p);

    useEffect(() => {
        if (productosIniciales) return;

        const obtenerCategorias = async () => {

            const response = await fetch(`${API}/getProductosCategoria`);
            const result = await response.json();
            setCategorias(result);

        }
        obtenerCategorias();

        // si fallan los banners del dashboard se muestran solo los automaticos
        fetch(`${API}/banners`)
            .then(response => response.json())
            .then(setBanners)
            .catch(() => setBanners(null));
    },[])





    // banners del slider (public/slider): todos de 1920x768 (5:2), la misma proporcion que el slider
    const [imagenes, setImagenes] = useState<string[]|null>(["/slider/3m.webp",
                                                            "/slider/herramientas-construccion.webp",
                                                            "/slider/cat-grafters.webp",
                                                            "/slider/dewalt-grid-x.webp"])


    const moveDirectionImgRight = () => {

        if(!imagenes || imagenes.length === 0) return;
        setImagenes( prev => {
            if(!prev || prev.length === 0) return prev;
         return  [...prev.slice(1), prev[0]];
        })
        setChangeLeft(false);
        setChangeRight(false);
    }

    const moveDirectionImgLeft = () => {
        if(!imagenes || imagenes.length === 0) return;
        setImagenes( prev => {
            if(!prev || prev.length === 0) return prev;
            return [prev[prev.length-1], ...prev.slice(0, -1)];
        });
        setChangeLeft(false);
        setChangeRight(false);
    }

    const changeImgRight = () => {

            if(flagInterval.current) {
                if( !idInterval.current ) return;
                flagInterval.current = false;


                clearInterval(idInterval.current);
                setChangeRight(true);
                changeCircleRight();
                setTimeout(()=>{
                    moveDirectionImgRight();
                    idInterval.current = setInterval(changeImgRight, 2000);
                    flagInterval.current = true;
                }, 500)
            }

    }

    const changeImgLeft = () => {

        if(flagInterval.current) {
            if(!idInterval.current) return;
            flagInterval.current = false;


            clearInterval(idInterval.current);
            setChangeLeft(true);
            changeCircleLeft();
            setTimeout(()=>{
                moveDirectionImgLeft();
                idInterval.current = setInterval(changeImgRight, 2000);
                flagInterval.current = true;
            }, 500)
        }

    }

    const changeCircleRight = () => {
        if( !imagenes || imagenes.length === 0 ) return;
        setPaintCircle(prev => (prev + 1) %  imagenes.length)
    }

    const changeCircleLeft = () => {
        if( !imagenes || imagenes.length === 0) return;
        setPaintCircle ( prev => (prev - 1 + imagenes.length) %  imagenes.length);
    }

    const activateInterval = () => {



    }

    // entrada del mosaico de categorias: la primera vez que se ve, cada caja llega desde fuera de la ventana por su lado
    // (las de la izquierda desde la izquierda, las de la derecha desde la derecha, las que ocupan casi todo el ancho desde arriba o abajo),
    // en orden aleatorio y una despues de otra
    const mosaico = useRef<HTMLDivElement|null>(null);
    useLayoutEffect(() => {
        const grilla = mosaico.current;
        if (!grilla || grilla.children.length === 0) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const cajas = [...grilla.children] as HTMLElement[];
        cajas.forEach(caja => caja.style.opacity = '0');

        // cada caja entra cuando llega a la pantalla (el mosaico es mas alto que la ventana);
        // las que entran a la vez lo hacen en orden aleatorio, una despues de otra
        const observador = new IntersectionObserver((entradas) => {
            const visibles = entradas.filter(e => e.isIntersecting).map(e => e.target as HTMLElement);
            if (visibles.length === 0) return;
            const g = grilla.getBoundingClientRect();
            const turnos = visibles.map((_, i) => i).sort(() => Math.random() - 0.5);
            visibles.forEach((caja, i) => {
                observador.unobserve(caja);
                const r = caja.getBoundingClientRect();
                // en celular (una sola columna) todas suben un poco desde abajo, como el resto de secciones.
                // en pantallas mayores: las anchas de la mitad de arriba bajan desde arriba de la ventana y las de la mitad
                // de abajo suben desde abajo; las demas entran por su lado
                const ancha = r.width > g.width * 0.7;
                const desde = window.innerWidth < 640
                    ? 'translateY(40px)'
                    : ancha
                    ? (r.top + r.height / 2 < g.top + g.height / 2 ? `translateY(${-(r.bottom + 20)}px)` : `translateY(${window.innerHeight - r.top + 20}px)`)
                    : r.left + r.width / 2 < g.left + g.width / 2
                        ? `translateX(${-(r.right + 20)}px)`
                        : `translateX(${window.innerWidth - r.left + 20}px)`;
                caja.style.opacity = '';
                caja.animate([{transform: desde, opacity: 0}, {transform: 'none', opacity: 1}], {
                    duration: 1000, delay: turnos[i] * 120, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards',
                });
            });
        }, {threshold: 0.2});
        cajas.forEach(caja => observador.observe(caja));
        return () => observador.disconnect();
    }, [categoriasUnicas.length]);

    // el boton de whatsapp es fixed, pero no baja mas alla de la fila de redes sociales del footer:
    // al llegar a ella se queda a su altura (centrado con los iconos) y sube junto con la pagina
    const botonWhatsapp = useRef<HTMLAnchorElement|null>(null);
    useEffect(() => {
        const redes = document.getElementById('redes-footer');
        if (!redes) return;
        let cuadro = 0;
        const ubicar = () => {
            cancelAnimationFrame(cuadro);
            cuadro = requestAnimationFrame(() => {
                const boton = botonWhatsapp.current;
                if (!boton) return;
                const fila = redes.getBoundingClientRect();
                const tope = window.innerHeight - (fila.top + fila.height / 2) - boton.offsetHeight / 2;
                boton.style.bottom = `${Math.max(25, tope)}px`;
            });
        }
        ubicar();
        window.addEventListener('scroll', ubicar, {passive: true});
        window.addEventListener('resize', ubicar);
        return () => {
            cancelAnimationFrame(cuadro);
            window.removeEventListener('scroll', ubicar);
            window.removeEventListener('resize', ubicar);
        }
    }, []);

    //interval
    useEffect(()=> {

        idInterval.current = setInterval(changeImgRight, 2000);

        return () => {
            if( !idInterval.current ) return;
            clearInterval(idInterval.current);
        }
    },[]);


  return (
      <div className={""}>
          {/* el slider mide lo mismo que el menu flotante del header (mismas clases de ancho que en Header.tsx).
              tiene la proporcion de los banners (5:2) en cualquier ancho, asi se ven completos sin recortes.
              cada imagen y cada desplazamiento usan 100cqw (el ancho de este contenedor) en lugar de 100vw (el de la pantalla) */}
          <div  className={`relative aspect-[5/2] flex flex-col justify-center w-[calc(100%-16px)] sm:w-[94%] 2xl:w-[max(74%,1240px)] mx-auto overflow-hidden rounded-[12px] [container-type:inline-size] group/slider`}>
              {/* las imagenes ya traen el degradado del fondo de la pagina, por eso no necesitan difuminar sus bordes */}
              <div className={"absolute inset-0"}>
                  <div ref={containerImg} style={{transform : `translateX(${-100}cqw)`}} className={`${ changeRight ? "-translate-x-[100cqw] transition-transform duration-500 ease-in-out" : ""} ${changeLeft ? "translate-x-[100cqw] transition-transform duration-500 ease-in-out" : ""} flex h-full `}>
                      {
                          imagenes &&  imagenes.map((el, index) => (
                              <img src={el} alt="" key={index} className={"h-full w-[100cqw] shrink-0 object-cover"}/>
                          ))
                      }
                  </div>
              </div>
              {/* flechas estilo iOS: circulo de vidrio con chevron fino. aparecen al pasar el cursor por el slider
                  (o al enfocarlas con teclado); en pantallas tactiles, sin cursor, se ven siempre */}
              <div className={"absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-[4%] pointer-events-none"}>
                  <button ref={arrowLeft} type={"button"} onClick={changeImgLeft} aria-label={"Imagen anterior"} className={`${CLASE_FLECHA_SLIDER} -translate-x-[8px] group-hover/slider:translate-x-0`}>
                      <ChevronIOS direccion={"izquierda"}/>
                  </button>
                  <button ref={arrowRight} type={"button"} onClick={changeImgRight} aria-label={"Imagen siguiente"} className={`${CLASE_FLECHA_SLIDER} translate-x-[8px] group-hover/slider:translate-x-0`}>
                      <ChevronIOS direccion={"derecha"}/>
                  </button>
              </div>
              <div className={"absolute bottom-[4%] flex left-1/2 -translate-x-1/2 gap-[5px] sm:gap-[8px]"}>
                  {
                      imagenes && imagenes.map((_, index) => (
                          // el punto activo se rellena con la animacion (largeCircle en globals.css); el resto va pintado con el mismo blanco al 80%
                          <div className={` ${ paintCircle === index ? "w-[32px] sm:w-[64px] largeCircle relative overflow-hidden" : "bg-white/80"} size-[7px] sm:size-[10px] rounded-full shadow-[0_0_0_1px_rgba(15,23,42,.35)] transition-all duration-500 ease-in-out`} key={index}/>
                      ))
                  }
              </div>
          </div>

          {/*---------------presentacion: el titulo principal (h1) que lee Google---------------*/}

          {/* tarjeta con el degradado celeste de los banners de ofertas y el borde de 1px de las demas tarjetas */}
          {/* desde aqui cada seccion aparece con una transicion suave al llegar a ella (componente Aparecer) */}
          <Aparecer className={"w-[90%] 2xl:w-[70%] mx-auto pt-[40.5px]"}>
              <div className={"rounded-[12px] bg-gradient-to-r from-[#d3ebf8] via-[#e6f4fb] to-[#a8d5ef] shadow-[0_0_0_1px_rgba(0,0,0,.12)] px-[20px] py-[24px] md:px-[40px] md:py-[32px] text-center"}>
                  <h1 className={"text-[22px] md:text-[30px] font-semibold leading-tight text-slate-900"}>Equipos de protección personal para minería y construcción</h1>
                  <p className={"mt-[8px] text-[15px] md:text-[17px] text-slate-600"}>Abastecemos a empresas mineras, contratistas y obras de construcción con EPP certificados. Venta por mayor y menor en Lima.</p>
              </div>
          </Aparecer>

          {/*-----------------------------------------------------*/}

          <Aparecer>
          <div className={"w-[90%] 2xl:w-[70%] mx-auto"}>
              <TituloSeccion>Nuestras marcas</TituloSeccion>
          </div>

          <div  className={"w-[90%] 2xl:w-[70%] mx-auto overflow-hidden"}>
              <div ref={containerCarrusel} className={"shadow-[0_0_0_1px_rgba(0,0,0,.12)] rounded-[12px]"}>
                  {/* la lista va dos veces para que la animacion de desplazamiento no tenga cortes;
                      el py de 2px deja ver la sombra de 1px de cada logo, que el overflow-hidden recortaria */}
                  <div className={"flex carrusel gap-[35px] py-[2px]"}>
                      {
                          [...MARCAS, ...MARCAS].map((marca, index) => (
                              <img src={marca.imagen} alt={index < MARCAS.length ? marca.nombre : ""} key={index} className={"rounded-[12px] w-[200px] h-[100px] object-cover shadow-[0_0_0_1px_rgba(0,0,0,.12)]"}/>
                          ))
                      }
                  </div>
              </div>

          </div>
          </Aparecer>

          {/*---------------banners de ofertas---------------*/}

          {categorias && <Aparecer><BannersOfertas productos={categorias} banners={banners}/></Aparecer>}

          {/*---------------categoria de productos---------------*/}

          <div className={"w-[90%] 2xl:w-[70%] mx-auto"}>
              {/* el titulo aparece suave; las cajas del mosaico tienen su propia entrada (ver "mosaico" arriba) */}
              <Aparecer><TituloSeccion>Categorias de productos EPPS</TituloSeccion></Aparecer>
              {/*<h2> J & M Andes security EIRL</h2>*/}
              {/*<h1>3M - STEELPRO - MSA -NORTH -ANSELL -CAT- CLUTE - DELTA PLUS</h1>*/}
              {!categorias && <Cargando texto={"Cargando categorías..."}/>}
              <div ref={mosaico} className={"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 auto-rows-[220px] md:auto-rows-[240px] grid-flow-dense gap-[15px]"}>
                  {
                      categoriasUnicas.map((el : Product, index : number) => (
                          <Link href={`/productos/${el.categoria.replace(/\s+/g, "-").toLowerCase()}`} key={el.categoria} className={`${claseMosaico(index, categoriasUnicas.length)} group relative overflow-hidden rounded-[12px] shadow-[0_0_0_1px_rgba(0,0,0,.12)]`}>
                              <img src={el.img[0]} alt={el.categoria} className={"absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"}/>
                              <div className={"absolute inset-0 bg-black/45 group-hover:bg-black/60 transition-colors duration-300"}/>
                              <div className={"relative h-full flex items-center justify-center p-[15px]"}>
                                  <h2 aria-label={el.categoria} className={"text-white text-center font-medium uppercase tracking-wide text-[22px] md:text-[26px] drop-shadow-[0_2px_6px_rgba(0,0,0,.8)] leading-none"}>
                                      <TextoCascada texto={el.categoria}/>
                                  </h2>
                              </div>
                          </Link>
                      ))
                  }
              </div>
          </div>

          {/*---------------------productos mas buscados------------------------------*/}

          <Aparecer>
          <div className={"w-[90%] 2xl:w-[70%] mx-auto"}>
              <TituloSeccion>productos mas buscados</TituloSeccion>
          </div>

          {/*-----------------------------grid de productos  mas buscados -----------------------------------------*/}
          <div className={"w-[90%] 2xl:w-[70%] mx-auto"}>
              <CarruselMasBuscados productos={masBuscados}/>
          </div>
          </Aparecer>


          {/*--------------------------nuevos ingresos--------------------------------------------*/}
          <div className={"pb-[50px]"}>
              {categorias && <Aparecer><BannersNuevos productos={categorias} banners={banners}/></Aparecer>}
          </div>

          <a ref={botonWhatsapp} href="https://wa.me/51986680850" target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp" className={"size-[60px] md:size-[70px] bg-[#25D366] text-white rounded-full fixed bottom-[25px] right-[25px] z-[30] flex items-center justify-center shadow-[0px_4px_14px_rgba(0,0,0,.35)] transition-transform duration-300 hover:scale-110 active:scale-95"}>
              {/* ondas detras del icono: el boton es fixed con z-index, asi -z-10 queda sobre su fondo y debajo del icono */}
              <AnimacionLottie datos={pulsoWhatsapp} className={"absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[200%] -z-10 pointer-events-none"}/>
              <IconoWhatsapp className={"w-[34px] h-[34px] md:w-[40px] md:h-[40px]"}/>
          </a>


      </div>
  )
}
