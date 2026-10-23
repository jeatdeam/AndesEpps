import {obtenerProductos} from '@/app/datos';
import {notFound} from 'next/navigation';
import {Product} from '../../../tipos/elementsType'
// import {Product} from '@/app/tipos/elementsType'
import {SideOptions} from './sideOptions';
import {GaleriaProducto} from './galeriaProducto';
import {BotonAgregarCarrito} from '@/app/componentes/BotonAgregarCarrito';
import {BotonCotizar} from '@/app/componentes/BotonCotizar';
import {TarjetaProducto} from '@/app/componentes/TarjetaProducto';
import {MediosPago} from '@/app/componentes/MediosPago';
import {formatoPrecio, precioFinal, enOferta, EtiquetaDescuento, EstrellaUnica, IconoCarrito, IconoCotizar, claseBotonProducto} from '@/app/componentes/elementosProducto';
import {poppins} from '@/app/fuentes';


const Separador = () => <div className={"w-full self-stretch h-px shrink-0 bg-current opacity-30"}/>;

export default async function Page ({params} : {params : Promise<{producto:string}>}) {

    const {producto} = await params;
    // el parametro llega codificado (ej. "diel%C3%A9ctrico") cuando tiene tildes o ñ
    const productoNormalizado = decodeURIComponent(producto).replace(/-+/g, ' ')
    const data = await obtenerProductos();
    const elementoFiltrado = data.filter( (producto : Product, _ : number) => producto.name === productoNormalizado )[0]
    if (!elementoFiltrado) notFound();

    const categoriaMasBuscada = data.filter( (producto: Product, _ : number) => producto.categoria === elementoFiltrado.categoria )

    // un producto por cada categoria distinta a la actual, maximo 3
    const otrasCategorias = data.reduce((acc : Product[], producto : Product) => {
        const categoriaUsada = producto.categoria === elementoFiltrado.categoria || acc.some(el => el.categoria === producto.categoria);
        return !categoriaUsada && acc.length < 3 ? [...acc, producto] : acc;
    }, [])

    const recomendados : Product[] = [...categoriaMasBuscada, ...otrasCategorias]



    return(
        <div className={"pb-[40px]"}>
            {/* de 768px a 1023px el ancho se queda fijo en el que tiene a 768px (90% = 691px); desde 1024px vuelve a ser relativo */}
            <div className={"w-[90%] md:w-[691px] lg:w-[90%] xl:w-[70%] 2xl:w-[1200px] mx-auto"}>
                <h1 className={"p-[25px] text-[35px] font-bold text-center leading-none"}>{elementoFiltrado.name.toUpperCase()}</h1>
                {/*---------imagen y descripcion básica---------------*/}
                <div className={"flex flex-col gap-[40px]"}>
                    <div className={"mx-auto w-full gap-[40px] flex flex-col lg:flex-row justify-between  lg:min-h-[750px]"}>
                        {/* alto minimo en vez de fijo: si la descripcion no cabe la fila crece y no aparece scroll interno */}
                        <GaleriaProducto imagenes={elementoFiltrado.img}/>
                        <div className={`${poppins.className} flex flex-col gap-[18px] w-full lg:w-1/2 bg-white shadow-[0_0_0_1px_rgba(0,0,0,.12)] rounded-[12.5px] p-[25px]`}>
                            <div className={"flex flex-col gap-[6px]"}>
                                <span className={"text-[13px] font-semibold uppercase tracking-[0.15em] opacity-80"}>
                                    {elementoFiltrado.categoria}
                                </span>
                                <h2 className={"text-[26px] font-bold leading-none"}>
                                    {elementoFiltrado.name}
                                </h2>
                                <EstrellaUnica calificacion={elementoFiltrado.calificacion} resenas={elementoFiltrado.resenas}/>
                                <span className={"text-[13px] opacity-80"}>SKU: #{String(elementoFiltrado.id).padStart(5, '0')}</span>
                            </div>

                            <Separador/>

                            <div className={"flex items-end justify-between flex-wrap gap-[10px]"}>
                                <div className={"flex flex-col"}>
                                    <span className={"text-[13px] uppercase tracking-wide opacity-80"}>Precio</span>
                                    {enOferta(elementoFiltrado) && (
                                        <span className={"flex items-center gap-[8px] mt-[2px]"}>
                                            <span className={"text-[15px] line-through opacity-70"}>{formatoPrecio(elementoFiltrado.precio)}</span>
                                            <EtiquetaDescuento descuento={elementoFiltrado.descuento!} className={"text-[12px] px-[8px] py-[4px]"}/>
                                        </span>
                                    )}
                                    <span className={"text-[24px] font-medium leading-tight"}>{formatoPrecio(precioFinal(elementoFiltrado))}</span>
                                    <span className={"text-[12px] opacity-80"}>Precio incluye IGV</span>
                                </div>
                                <span className={`text-[13px] font-semibold px-[12px] py-[5px] rounded-full ${elementoFiltrado.stock > 0 ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`}>
                                    {elementoFiltrado.stock > 0 ? `● En stock · ${elementoFiltrado.stock} und.` : "● Agotado"}
                                </span>
                            </div>

                            <Separador/>

                            <p className={"text-[16px] leading-relaxed"}>
                                {elementoFiltrado.descripcionPrimaria}
                            </p>

                            <Separador/>

                            <div className={"flex flex-col gap-[8px]"}>
                                <span className={"text-[15px] font-semibold"}>Características destacadas</span>
                                <ul className={"flex flex-col gap-[6px]"}>
                                    {
                                        elementoFiltrado.descripcionSecundaria.map((el : string, index: number) => (
                                            <li key={index} className={"flex gap-[8px] text-[15px] leading-snug"}>
                                                <span className={"font-bold"}>✓</span>
                                                <span>{el}</span>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>

                            <Separador/>

                            {/* misma separacion a la izquierda, entre los botones y a la derecha */}
                            <div className={"flex flex-wrap justify-evenly gap-y-[8px] w-full mt-auto"}>
                                <BotonAgregarCarrito producto={{id: elementoFiltrado.id, name: elementoFiltrado.name, precio: precioFinal(elementoFiltrado), img: elementoFiltrado.img[0]}} className={`w-[122px] ${claseBotonProducto}`}>
                                    <IconoCarrito/>
                                    Agregar al carrito
                                </BotonAgregarCarrito>
                                <BotonCotizar producto={{id: elementoFiltrado.id, name: elementoFiltrado.name, precio: precioFinal(elementoFiltrado), img: elementoFiltrado.img[0]}} className={`w-[122px] ${claseBotonProducto}`}>
                                    <IconoCotizar/>
                                    Cotizar
                                </BotonCotizar>
                            </div>

                            <Separador/>

                            <MediosPago/>
                        </div>
                    </div>


                    <SideOptions producto={producto}/>

                    {/*--------------------------productos recomendadops-----------------------------*/}
                    <h1 className={"text-[50px] font-bold text-center leading-none"}>Productos recomendados</h1>

                    <div className={"w-full rounded-[12px] flex flex-wrap justify-center gap-[25px]"}>
                            {
                                recomendados.map((el : Product) => (
                                    <TarjetaProducto key={el.id} producto={el}/>
                                ))
                            }
                    </div>

                </div>
            </div>
        </div>
    )

}