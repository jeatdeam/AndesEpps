// 'use client'
// import {useState, useEffect, useRef} from 'react'; hook exclusivo de cliente component
// import {useParams} from 'next/navigation'; hook exclusivo de client component
import {notFound} from 'next/navigation';
import Link from 'next/link';
import {Product} from '../../tipos/elementsType'

export default async function  Page({params} :{ params : Promise<{categoria: string}>}) {

    const {categoria} = await params;
    const categoriaNormalizada = categoria.replace(/-+/g, ' ')
    console.log(categoriaNormalizada)

    const response = await fetch("http://localhost:3001/getProductosCategoria")
    const result = await response.json();

    //     // notFound();

    const elementosFiltrados = result.filter((el: Product, index : number) => el.categoria === categoriaNormalizada );


    return(
        <div className={"w-[90%] mx-auto grid grid-cols-[repeat(auto-fit,minmax(255px,1fr))] justify-items-center"}>
            {
                elementosFiltrados.map((producto : Product , index : number) => (
                    <Link href={`/productos/${categoria}/${producto.name.replace(/\s+/g, "-").toLowerCase()}`} key={index} className={"w-[225px] py-[25px] px-[12.5px] border-2 rounded-[8px] flex flex-col justify-between gap-[12.5px]"}>
                        <img src={producto.img[0]} alt=""/>
                        <div>
                            <h1 className={"font-bold"}>{producto.name}</h1>
                            <h2>{producto.descripcionPrimaria}</h2>
                        </div>
                        <button className={"border block"}>añadir al carrito</button>
                    </Link>
                ))
            }
        </div>
    )

    // href={`/productos/${el.replace(/\s+/g, "-").toLowerCase()}`}
}