'use client'
import {useState, useEffect} from 'react';
import axios from 'axios'
import {Product} from '@/app/tipos/elementsType'


// pestaña elegida: texto marcado y una linea inferior de 2px (sin fondo de color)
const claseActiva = "font-semibold text-slate-900 shadow-[inset_0_-2px_0_#0f172a]";
const claseInactiva = "text-gray-500 hover:text-slate-900";

export const SideOptions =  ({producto} : {producto : string}) => {

    const [productoObtenido, setProductoObtenido] = useState<Product[]|null>(null)
    const [eleccion, setEleccion] = useState(1);

    useEffect( () => {

        const peticionProductos = async () => {
            const {data} = await axios.get('http://localhost:3001/getProductosCategoria');
            const productoFiltrado = data.filter((el : Product, index: number) => el.name === producto.replace(/-+/g,' '))
            console.log(productoFiltrado)
            setProductoObtenido(productoFiltrado)
        }
        peticionProductos()


    },[])

    return (
        <div className={"w-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,.12)] flex flex-col rounded-[12px]"}>
            {/* en celular el texto baja a 12px para que las tres pestañas entren sin scroll horizontal */}
            <div className={"flex"}>
                <div onClick={()=>setEleccion(1)} className={`${eleccion === 1 ? claseActiva : claseInactiva} rounded-tl-[12px] py-[8px] px-[4px] sm:px-[8px] flex-1 min-w-0 truncate text-[12px] sm:text-[16px] text-center cursor-pointer border-r border-b border-black/10`}>Especificaciones</div>
                <div onClick={()=>setEleccion(2)} className={`${eleccion === 2 ? claseActiva : claseInactiva} py-[8px] px-[4px] sm:px-[8px] flex-1 min-w-0 truncate text-[12px] sm:text-[16px] text-center cursor-pointer border-r border-b border-black/10`}>Descripcion</div>
                <div onClick={()=>setEleccion(3)} className={`${eleccion === 3 ? claseActiva : claseInactiva} rounded-tr-[12px] py-[8px] px-[4px] sm:px-[8px] flex-1 min-w-0 truncate text-[12px] sm:text-[16px] text-center cursor-pointer border-b border-black/10`}>Comentarios</div>
            </div>
            <div className={"p-[12.5px]"}>
                {
                   eleccion === 1 && productoObtenido && productoObtenido[0].descripcionSecundaria.map((el : string, index : number) => (
                        <div style={{animationDelay: `${index * 100}ms`}} className={"animateElement opacity-0"} key={index}>- {el}</div>
                    ))
                }
                {
                    eleccion === 2 && productoObtenido && productoObtenido[0].caracteristicas.map((el : string, index : number) => (
                        <div style={{animationDelay: `${index * 100}ms`}} className={"animateElement opacity-0"} key={index}>- {el}</div>
                    ))
                }
                {
                    eleccion === 3 && productoObtenido && productoObtenido[0].informacionAdicional.map((el : string, index : number) => (
                        <div style={{animationDelay: `${index * 100}ms`}} className={"animateElement opacity-0"} key={index}>- {el}</div>
                    ))
                }
            </div>

        </div>
    )
}