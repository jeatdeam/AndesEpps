import axios from 'axios';
import {Product} from '../../../tipos/elementsType'
// import {Product} from '@/app/tipos/elementsType'
import {SideOptions} from './sideOptions';

export default async function Page ({params} : {params : Promise<{producto:string}>}) {

    const {producto} = await params;
    const productoNormalizado = producto.replace(/-+/g, ' ')
    const {data} = await axios.get(`http://localhost:3001/getProductosCategoria`);
    const elementoFiltrado = data.filter( (producto : Product, _ : number) => producto.name === productoNormalizado )[0]

    const categoriaMasBuscada = data.filter( (producto: Product, _ : number) => producto.categoria === elementoFiltrado.categoria )



    return(
        <div className={"bg-blue-500 pb-[40px] "}>
            <div className={"w-[90%] mx-auto ]"}>
                <h1 className={"p-[25px] text-[35px] font-bold text-center "}>{elementoFiltrado.name.toUpperCase()}</h1>
                {/*---------imagen y descripcion básica---------------*/}
                <div className={"flex flex-col gap-[40px]"}>
                    <div className={"mx-auto gap-[40px] flex justify-between h-[750px]"}>
                        <div className={" w-1/2 h-full"}>
                            <img src={elementoFiltrado.img[0]} alt="" className={"p-[25px] border-2 rounded-[12.5px] shadow-[0px_0px_10px_rgba(5,5,5,.9)]"}/>
                        </div>
                        <div className={"border-2 flex flex-col gap-[25px] w-1/2 h-full shadow-[0px_0px_10px_rgba(0,0,0,.9)] rounded-[12.5px] p-[25px]"}>
                            {/*<div className={"w-full border-2 text-[25px]"}>*/}
                            {/*    {elementoFiltrado.name}*/}
                            {/*</div>*/}
                            <div className={"w-full text-[25px]"}>
                                {elementoFiltrado.descripcionPrimaria}
                            </div>
                            <div className={"text-[25px] flex flex-wrap w-full"}>
                                {
                                    elementoFiltrado.descripcionSecundaria.map((el : string, index: number) => (
                                        <div key={index}>
                                            - {el}
                                        </div>
                                    ))
                                }
                            </div>
                            <div className={"flex justify-between w-[90%] mx-auto"}>
                                <button className={"border-2 block p-[12.5px] rounded-[12px] w-[150px] shadow-[0px_0px_7.5px_rgba(0,0,0,.9)]"}>agregar al carrito</button>
                                <button className={"border-2 block p-[12.5px] rounded-[12px] w-[150px] shadow-[0px_0px_7.5px_rgba(0,0,0,.9)]"}>cotizar</button>
                            </div>
                        </div>
                    </div>


                    <SideOptions producto={producto}/>

                    {/*--------------------------productos recomendadops-----------------------------*/}
                    <h1 className={"text-[50px] font-bold text-center"}>Productos recomendados</h1>

                    <div className={"w-full rounded-[12px] flex gap-[25px]"}>
                            {
                                categoriaMasBuscada && categoriaMasBuscada.map((el : Product, _ : number) => (
                                    <div key={_} className={"w-[275px] h-[475px] border-2 rounded-[12px] p-[12.5px] flex flex-col gap-[10px]"}>
                                        <img className={"w-full object-cover"} src={el.img[0]} alt=""/>
                                        <h1 className={"font-bold"}>{el.name}</h1>
                                        <h2 className={"font-medium"}>{el.descripcionPrimaria}</h2>
                                        <div className={"flex justify-between w-[90%] mx-auto gap-[25px]"}>
                                            <button className={"border-2 w-[125px] p-[7.5px] leading-none rounded-[12px] mx-auto"}>añadir al carrito</button>
                                            <button className={"border-2 w-[125px] p-[7.5px] leading-none rounded-[12px] mx-auto"}>cotizar</button>
                                        </div>
                                    </div>
                                ))
                            }
                    </div>

                </div>
            </div>
        </div>
    )

}