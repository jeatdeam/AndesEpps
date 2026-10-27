import Link from 'next/link';
import {Product} from '@/app/tipos/elementsType';
import {BotonAgregarCarrito} from './BotonAgregarCarrito';
import {BotonCotizar} from './BotonCotizar';
import {formatoPrecio, precioFinal, enOferta, EtiquetaDescuento, IconoCarrito, IconoCotizar, EstrellaUnica, claseBotonProducto} from './elementosProducto';

const aSlug = (texto : string) => texto.replace(/\s+/g, '-').toLowerCase();

const claseBoton = `flex-1 ${claseBotonProducto}`;

// fino: todo el texto con el mismo grosor que los enlaces del header (font-normal), lo usa el carrusel del inicio
export const TarjetaProducto = ({producto, fino = false} : {producto : Product, fino? : boolean}) => {

    const href = `/productos/${aSlug(producto.categoria)}/${aSlug(producto.name)}`;
    const peso = (normal : string) => fino ? "font-normal" : normal;
    // la etiqueta de descuento y los botones traen su propio grosor: se fuerza con !
    const pesoForzado = fino ? "font-normal!" : "";

    return (
        <div className={`w-[275px] h-[445px] shrink-0 overflow-hidden bg-white text-gray-900 rounded-[12px] p-[12px] flex flex-col shadow-[0_0_0_1px_rgba(0,0,0,.12)] hover:shadow-[0_0_0_1px_rgba(0,0,0,.35)] transition-shadow duration-300`}>
            <Link href={href} className={"relative block w-full"}>
                <img className={"w-[230px] max-w-full mx-auto aspect-square object-contain bg-white rounded-[8px]"} src={producto.img[0]} alt={producto.name}/>
                {enOferta(producto) && <EtiquetaDescuento descuento={producto.descuento!} className={`absolute top-0 left-0 text-[12px] px-[9px] py-[5px] ${pesoForzado}`}/>}
            </Link>

            {/* bloque de texto alineado a la izquierda y al ancho completo de la tarjeta */}
            <div className={"w-full flex flex-col text-left mt-[8px]"}>
                <span className={`text-[11px] ${peso("font-semibold")} uppercase tracking-[0.08em] text-gray-500 truncate`}>
                    {producto.categoria}
                </span>
                <Link href={href} className={`mt-[2px] text-[14px] ${peso("font-medium")} leading-[1.35] text-gray-900 line-clamp-2 min-h-[2.7em] first-letter:uppercase hover:underline`}>
                    {producto.name}
                </Link>
                <p className={"mt-[2px] text-[12px] leading-[1.4] text-gray-500 line-clamp-1"}>
                    {producto.descripcionPrimaria}
                </p>
                <div className={"mt-[8px] w-full flex items-center justify-between gap-[8px]"}>
                    <span className={"flex items-baseline gap-[6px] min-w-0"}>
                        <span className={`text-[16px] ${peso("font-semibold")} leading-none ${enOferta(producto) ? "text-red-600" : ""}`}>
                            {formatoPrecio(precioFinal(producto))}
                        </span>
                        {enOferta(producto) && <span className={"text-[12px] text-gray-400 line-through leading-none truncate"}>{formatoPrecio(producto.precio)}</span>}
                    </span>
                    <EstrellaUnica calificacion={producto.calificacion}/>
                </div>
            </div>

            <div className={"flex justify-between w-full gap-[8px] mt-auto"}>
                <BotonAgregarCarrito producto={{id: producto.id, name: producto.name, precio: precioFinal(producto), img: producto.img[0]}} className={`${claseBoton} ${pesoForzado}`}>
                    <IconoCarrito/>
                    Agregar al carrito
                </BotonAgregarCarrito>
                <BotonCotizar producto={{id: producto.id, name: producto.name, precio: precioFinal(producto), img: producto.img[0]}} className={`${claseBoton} ${pesoForzado}`}>
                    <IconoCotizar/>
                    Cotizar
                </BotonCotizar>
            </div>
        </div>
    )
}
