'use client'
import axios from 'axios';
import {API} from '@/app/configuracion';
import {Product} from '../tipos/elementsType';
import {useState, useEffect, useRef} from 'react';
import {useControladorBusqueda} from "@/app/controladoresGlobales/controladorBusqueda";
import {useControladorIconoSearch} from "@/app/controladoresGlobales/controladorIconoSearch";
import {AnimacionLottie} from './AnimacionLottie';
import animacionSinResultados from '@/app/animaciones/sinResultados.json';


export const InputBusqueda = () => {


    const [elementosBuscados, setElementosBuscados] = useState<Product[]|null>(null);
    const [activeSubInput, setActiveSubInput] = useState<boolean>(false);
    const [activeSearch, setActiveSearch] = useState<boolean>(false);
    const [textoBuscado, setTextoBuscado] = useState('');


    const inputBusqueda = useRef<HTMLInputElement|null>(null)

    const {statusBusqueda, activeBusqueda} = useControladorBusqueda()
    const {statusIcon} = useControladorIconoSearch();

    // React.TipoDeEvento<ElementoHTML>

    const getProducts = async () : Promise<Product[]> => {

        const {data} = await axios.get(`${API}/getProductosCategoria`);

        return data
    }

    const busquedaTxt = async (e : React.ChangeEvent<HTMLInputElement>) => {

        const txtIngresado = e.target.value.replace(/\s+/g,' ').trim();
        setTextoBuscado(txtIngresado);
        if(txtIngresado.length === 0) {
            setElementosBuscados(null);
            setActiveSubInput(false);
            return;
        }

        activeBusqueda();
        setActiveSubInput(true);
        const productosObtenidos = await getProducts();

        const coincidenciasBusqueda = productosObtenidos.filter((producto : Product, index : number) => {
            // los nombres se guardan en minusculas: "Casco" tambien encuentra "casco"
            if(producto.name.toLowerCase().includes(txtIngresado.toLowerCase())) return producto
        })

        setElementosBuscados(coincidenciasBusqueda);
    }

    useEffect(()=> {
        if(!statusBusqueda && inputBusqueda.current) inputBusqueda.current.value="";
    },[statusBusqueda])

    return(
            <div className={`${!statusIcon ? "w-[450px] max-w-full min-w-0" : "min-w-[350px] absolute top-[150px] left-1/2 -translate-x-1/2"}`}>
                <div className={`w-full shadow-[0_0_1px_1.25px_rgba(255,255,255,0.8)] py-[2.5px] px-[10px] rounded-[12px] relative flex items-center gap-[8px]`}>
                    {/* la lupa dentro del input usa el mismo circulo de 35px de backCircle; el alto del input se ajusta a el */}
                    <button type="button" onClick={() => inputBusqueda.current?.focus()} aria-label={"Buscar"} className={"backCircle relative size-[35px] -ml-[7.5px] shrink-0 flex items-center justify-center cursor-pointer"}>
                        <svg className={"w-[22.5px] h-[22.5px] shrink-0"} xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#000000" aria-hidden="true"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>
                    </button>
                    <input ref={inputBusqueda}  onChange={busquedaTxt} className={`text-[15px] h-[25px] md:block w-full outline-none`} type="text" placeholder={"escriba el nombre del producto"}/>
                    {
                        statusBusqueda &&
                        <div className={`py-[10px] px-[10px] ${elementosBuscados && elementosBuscados.length > 0 ? "h-[250px]" : "h-auto"} ${activeSubInput ? '' : 'hidden'} w-full absolute top-[125%] bg-white rounded-[8px] z-[10]  gap-[7.5px] flex flex-col transition-all duration-300 ease-in-out left-0 shadow-[0_0_1px_1.25px_rgba(128,128,128,0.8)]`}>

                            <div className={`${elementosBuscados && elementosBuscados.length > 0 ? "h-[225px]" : "h-auto"} p-[10px] rounded-[12px]  flex flex-col gap-[10px] bg-blue-50 scroll-fino overflow-y-auto`}>
                                {

                                    (elementosBuscados && elementosBuscados.length > 0) ? elementosBuscados.map((product, index) => (
                                            <div key={index} className={"animateElement  flex border gap-[5px] border-gray-400 rounded-[12px] p-[7.5px] h-[55px] hover:bg-blue-300"}>
                                                <img className={"h-[full] w-[25%] block object-contain"} src={product.img[0]} alt=""/>
                                                <div className={"text-black w-[55%] leading-none self-center"}>
                                                    <div className={"text-[14px] font-thin"}>{product.name}</div>
                                                    <div className={"text-[14px] font-medium"}>{product.name}</div>
                                                </div>
                                                <div className={"text-black text-[14px] w-[20%] text-right self-center leading-none"}>
                                                    <div className={"line-through text-gray-500"}>S/. {product.precio}</div>
                                                    <div className={"text-gray-400 font-medium"}>S/. {product.precio}</div>
                                                </div>
                                            </div>
                                        ))
                                        :
                                        <div role={"status"} className={`text-black ${elementosBuscados? 'animateElement' : 'hidden'} flex flex-col items-center text-center gap-[4px] py-[6px]`}>
                                            {elementosBuscados && <AnimacionLottie datos={animacionSinResultados} className={"size-[110px]"}/>}
                                            <p className={"text-[14px] font-semibold leading-snug break-words max-w-full"}>No encontramos productos para &quot;{textoBuscado}&quot;</p>
                                            <p className={"text-[12px] text-gray-500 leading-snug"}>Revisa la ortografía o prueba con palabras más generales.</p>
                                        </div>
                                }
                            </div>

                        </div>
                    }
                </div>
           </div>
)
}


