// import {useState, useEffect, useRef} from 'react';
import axios from 'axios';


type Product = {
    id: number,
    name: string,
    precio: number,
    stock : number,
    img : string[],
    descripcionPrimaria : string,
    descripcionSecundaria : string[],
    caracteristicas : string[],
    informacionAdicional: string[],
    categoria: string,
}



const  Product = async () => {

    const {data} = await axios.get('http://localhost:3001/getProductosCategoria')

    console.log('creo que me indica que esta mal')
    console.log(data);
    // grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))]
    return(
        <div className={"w-full "}>
            <div className={"bg-yellow-500  border-4 grid  grid-cols-[repeat(auto-fit,minmax(350px,1fr))] justify-items-center"}>
                {
                    data && data.map((el : Product, index : number) => (
                        <div className={"border-2 rounded-[8px] h-[500px] w-[350px]"} key={index}>{el.name}
                            <img src={el
                                .img[0]} alt=""/>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Product;