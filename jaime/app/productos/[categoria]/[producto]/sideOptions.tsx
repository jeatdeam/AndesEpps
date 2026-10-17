'use client'
import {useState, useEffect} from 'react';
import axios from 'axios'
import {Product} from '@/app/tipos/elementsType'


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
        <div className={"w-full border-2  flex flex-col rounded-[12px]"}>
            <div className={"flex"}>
                <div onClick={()=>setEleccion(1)} className={` ${eleccion === 1 ? "bg-yellow-500" : ""}  rounded-tl-[12px] p-[5px] flex-1 bg-purple-500 text-center border-r-2 border-b-2`}>Especificaciones</div>
                <div onClick={()=>setEleccion(2)} className={` ${eleccion === 2 ? "bg-yellow-500" : ""}  p-[5px] flex-1 bg-purple-500 text-center border-r-2 border-b-2`}>Descripcion</div>
                <div onClick={()=>setEleccion(3)} className={` ${eleccion === 3 ? "bg-yellow-500" : ""}  rounded-tr-[12px] p-[5px] flex-1 bg-purple-500 text-center border-b-2`}>Comentarios</div>
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