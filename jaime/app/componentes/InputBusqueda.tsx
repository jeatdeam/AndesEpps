'use client'
import axios from 'axios';
import {Product} from '../tipos/elementsType';
import {useState, useEffect, useRef} from 'react';
import {useControladorBusqueda} from "@/app/controladoresGlobales/controladorBusqueda";
import {useControladorIconoSearch} from "@/app/controladoresGlobales/controladorIconoSearch";


export const InputBusqueda = () => {


    const [elementosBuscados, setElementosBuscados] = useState<Product[]|null>(null);
    const [activeSubInput, setActiveSubInput] = useState<boolean>(false);
    const [activeSearch, setActiveSearch] = useState<boolean>(false);


    const inputBusqueda = useRef<HTMLInputElement|null>(null)

    const {statusBusqueda, activeBusqueda} = useControladorBusqueda()
    const {statusIcon} = useControladorIconoSearch();

    // React.TipoDeEvento<ElementoHTML>

    const getProducts = async () : Promise<Product[]> => {

        const {data} = await axios.get('http://localhost:3001/getProductosCategoria');

        return data
    }

    const busquedaTxt = async (e : React.ChangeEvent<HTMLInputElement>) => {

        const txtIngresado = e.target.value.replace(/\s+/g,' ').trim();
        console.log(txtIngresado.length);
        if(txtIngresado.length === 0) {
            setElementosBuscados(null);
            setActiveSubInput(false);
            return;
        }

        activeBusqueda();
        setActiveSubInput(true);
        const productosObtenidos = await getProducts();

        const coincidenciasBusqueda = productosObtenidos.filter((producto : Product, index : number) => {
            if(producto.name.includes(txtIngresado)) return producto
        })

        setElementosBuscados(coincidenciasBusqueda);
    }

    useEffect(()=> {
        if(!statusBusqueda && inputBusqueda.current) inputBusqueda.current.value="";
    },[statusBusqueda])




    return(

            <div className={`${statusIcon ? "" : "absolute top-[150px] left-1/2 -translate-x-1/2"}`}>
                <div className={` ${statusIcon ? "bg-yellow-500" : "bg-purple-500"} md:w-[275px] lg:w-[350px] xl:w-[450px]  relative`}>
                    <input ref={inputBusqueda}  onChange={busquedaTxt} className={`xs:hidden md:block w-full outline-none`} type="text" placeholder={"escriba el nombre del producto"}/>
                    {
                        statusBusqueda &&
                        <div className={`py-[5px] px-[7.5px] ${elementosBuscados && elementosBuscados.length > 0 ? "overflow-y-scroll" : ""} ${activeSubInput ? 'max-h-[300px]' : 'hidden'} w-full absolute border-2 top-[125%] bg-white rounded-[8px] z-[10] flex flex-col transition-all duration-300 ease-in-out`}>
                            {

                                (elementosBuscados && elementosBuscados.length > 0) ? elementosBuscados.map((product, index) => (
                                        <div key={index} className={"animateElement flex justify-between border h-[50px]"}>
                                            <img className={"h-[full]"} src={product.img[0]} alt=""/>
                                            <div className={"text-black"}>{product.name}</div>
                                            <div className={"text-black"}>{product.precio}</div>
                                        </div>
                                    ))
                                    :
                                    <div className={`text-black ${elementosBuscados? 'h-full animateElement' : 'hidden'}`}>
                                        no hay coincidencias de busqueda ...
                                    </div>
                            }
                        </div>
                    }
                </div>
           </div>
)
}


