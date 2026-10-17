"use client";
import Image from "next/image";
import {useState, useEffect, useRef} from 'react';
import Link from 'next/link';
import {Product} from './tipos/elementsType'


export default function Home() {

    const containerImg = useRef<HTMLDivElement|null>(null);
    const arrowRight = useRef<SVGSVGElement|null>(null);
    const arrowLeft = useRef<SVGSVGElement|null>(null);
    const idInterval = useRef<ReturnType<typeof setInterval> | null>(null)
    const flagInterval = useRef<boolean>(true);
    const firstImg = useRef<HTMLImageElement|null>(null);
    const containerCarrusel = useRef<HTMLDivElement|null>(null);


    const [changeLeft, setChangeLeft] = useState<boolean>(false);
    const [changeRight, setChangeRight] = useState<boolean>(false);
    const [paintCircle, setPaintCircle] = useState<number>(1);
    const [bagSlider, setBagSlider] = useState<boolean>(false);
    const [positionImg, setPositionImg] = useState<number>(0);


    const [categorias, setCategorias] = useState<Product[]|null>(null)

    useEffect(() => {

        const obtenerCategorias = async () => {

            const response = await fetch('http://localhost:3001/getProductosCategoria');
            const result = await response.json();
            console.log(result);
            setCategorias(result);

        }
        obtenerCategorias();
    },[])





    const [imagenes, setImagenes] = useState<string[]|null>(["https://res.cloudinary.com/dlrd1wxwd/image/upload/v1780188156/main-sample.png",
                                                            "https://res.cloudinary.com/dlrd1wxwd/image/upload/v1780188156/cld-sample-4.jpg",
                                                            "https://res.cloudinary.com/dlrd1wxwd/image/upload/v1780188156/cld-sample-3.jpg",
                                                            "https://res.cloudinary.com/dlrd1wxwd/image/upload/v1780188154/samples/zoom.avif",
                                                            "https://res.cloudinary.com/dlrd1wxwd/image/upload/v1780188154/samples/upscale-face-1.jpg"])

    const [imagenesCarrusel, setImagenesCarrusel] = useState<string[]>(["https://res.cloudinary.com/dlrd1wxwd/image/upload/v1780188143/samples/sheep.jpg",
                                                            "https://res.cloudinary.com/dlrd1wxwd/image/upload/v1780188146/samples/imagecon-group.jpg",
                                                            "https://res.cloudinary.com/dlrd1wxwd/image/upload/v1780188152/samples/man-portrait.jpg",
                                                            "https://res.cloudinary.com/dlrd1wxwd/image/upload/v1780188151/samples/man-on-a-escalator.jpg",
                                                            "https://res.cloudinary.com/dlrd1wxwd/image/upload/v1780188142/samples/animals/reindeer.jpg","https://res.cloudinary.com/dlrd1wxwd/image/upload/v1780188142/samples/food/pot-mussels.jpg",
                                                            "https://res.cloudinary.com/dlrd1wxwd/image/upload/v1780188146/samples/imagecon-group.jpg",
                                                            "https://res.cloudinary.com/dlrd1wxwd/image/upload/v1780188141/samples/ecommerce/analog-classic.jpg",
                                                            "https://res.cloudinary.com/dlrd1wxwd/image/upload/v1780188154/samples/zoom.avif",
                                                            "https://res.cloudinary.com/dlrd1wxwd/image/upload/v1780188146/samples/imagecon-group.jpg"])


    const moveDirectionImgRight = () => {

        if(!imagenes || imagenes.length === 0) return;
        setImagenes( prev => {
            if(!prev || prev.length === 0) return prev;
         return  [...prev.slice(1), prev[0]];
        })
        setChangeLeft(false);
        setChangeRight(false);
    }

    const moverDirectionImgLeft = () => {
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
                moverDirectionImgLeft();
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

    // const movCarrusel = (mov : number) => {
    //
    //     if (!firstImg.current || !containerCarrusel.current) return;
    //
    //     const containerRect = containerCarrusel.current.parentElement?.getBoundingClientRect();
    //     const imgRect = firstImg.current.getBoundingClientRect();
    //
    //
    //     if(!containerRect) return;
    //
    //     console.log(containerRect.left)
    //
    //     if (imgRect.right + 20 <= containerRect.left) {
    //         console.log('si se cambio de imagen');
    //         setImagenesCarrusel(prev => [...prev.slice(1), prev[0]]);
    //         mov = 1;
    //     }
    //
    //     containerCarrusel.current.style.transform = `translateX(-${mov}px)`;
    //
    //     requestAnimationFrame(()=>movCarrusel(mov+1)); // aqui no se deberia de usar el post-incremento
    //     //es decir porner movCarrusel(mov++) por que esto hace que se ejecute la funcion y recien se agregue el +1 a la variable pero
    //     //para eso ya esta en otra funcion con su respectivo scoope y ya no es reflejado.
    // }
    //
    // useEffect(() => {
    //
    //     const id = requestAnimationFrame(()=>movCarrusel(1));
    //
    //     return () => {
    //         cancelAnimationFrame(id);
    //     };
    //
    // }, []);

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
          <div  className={`relative h-[750px] flex flex-col justify-center w-screen overflow-hidden border-2`}>
              <div ref={containerImg} style={{transform : `translateX(${-100}vw)`}} className={`${ changeRight ? "-translate-x-[100vw] transition-transform duration-500 ease-in-out" : ""} ${changeLeft ? "translate-x-[100vw] transition-transform duration-500 ease-in-out" : ""} flex h-full `}>
                  {
                      imagenes &&  imagenes.map((el, index) => (
                          <img src={el} alt="" key={index} className={"h-full min-w-screen"}/>
                      ))
                  }
              </div>
              <div className={"absolute flex justify-between w-screen px-[10px] left-0"}>
                  <svg ref={arrowLeft} onClick={changeImgLeft} className={"size-[40px] border"} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z"/></svg>
                  <svg ref={arrowRight} onClick={changeImgRight} className={"size-[40px] border translate-x-[12px] flex justify-center"} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z"/></svg>
              </div>
              <div className={"absolute bottom-[2.5%] flex left-1/2 -translate-x-1/2 gap-[10px]"}>
                  {
                      imagenes && imagenes.map((_, index) => (
                          <div className={` ${ paintCircle === index ? "w-[100px] largeCircle relative overflow-hidden" : ""} size-[15px] rounded-full border-2 border-amber-800 transition-all duration-500 ease-in-out`} key={index}/>
                      ))
                  }
              </div>
          </div>

          {/*-----------------------------------------------------*/}

          <div className={"w-[90%] mx-auto"}>
              <div className={"py-[25px] flex gap-[10px] justify-center items-center"}>
                  <span className={"block w-[350px] h-[1px] bg-white"}/>
                  <h1 className={"text-[35px] text-center"}>Nuestras marcas </h1>
                  <span className={"block w-[350px] h-[1px] bg-white"}/>
              </div>
          </div>

          <div  className={"w-[90%] mx-auto overflow-hidden"}>
              <div ref={containerCarrusel} className={"border-4 border-amber-300 py-[25px]"}>
                  <div className={"flex carrusel gap-[35px]"}>
                      {
                          imagenesCarrusel && imagenesCarrusel.map((el, index) => (
                              <img  src={el} alt="" key={index} className={"w-[200px] h-[100px] object-cover"}/>
                          ))
                      }
                      {
                          imagenesCarrusel && imagenesCarrusel.map((el, index) => (
                              <img  src={el} alt="" key={index} className={"w-[200px] h-[100px] object-cover"}/>
                          ))
                      }
                  </div>
              </div>

          </div>

          {/*---------------categoria de productos---------------*/}

          <div className={"w-[90%] mx-auto"}>
              <div className={"flex gap-[15px] items-center justify-center py-[25px]"}>
                  <span className={"block w-[450px] h-[1px] bg-white"}/>
                  <h1 className={"text-[35px] text-center"}>Categorias de prodcutos EPPS</h1>
                  <span className={"block w-[450px] h-[1px] bg-white"}/>
              </div>
              {/*<h2> J & M Andes security EIRL</h2>*/}
              {/*<h1>3M - STEELPRO - MSA -NORTH -ANSELL -CAT- CLUTE - DELTA PLUS</h1>*/}
              <div className={"grid grid-cols-2 gap-y-10 justify-items-center border-1 border-blue-400"}>
                  {
                      categorias && categorias.map((el : Product, index : number) => (
                          <Link href={`/productos/${el.categoria.replace(/\s+/g, "-").toLowerCase()}`} key={index} className={"w-[350px] h-[550px] rounded-[8px] border-6 bg-gradient-to-b from-blue-500 to-yellow-400 flex items-center justify-center text-[75px]"}>
                              <img src={el.img[0]} alt=""/>
                          </Link>
                      ))
                  }
              </div>
          </div>

          {/*---------------------productos mas buscados------------------------------*/}

          <div className={"flex gap-[15px] items-center py-[25px]"}>
              <span className={"block w-[450px] h-[1px] bg-white"}/>
              <h1 className={"text-[35px] text-center"}>productos mas buscados</h1>
              <span className={"block w-[450px] h-[1px] bg-white"}/>
          </div>

          {/*-----------------------------grid de productos  mas buscados -----------------------------------------*/}
          <div className={"flex w-[90%] mx-auto flex-wrap gap-[10px] justify-center"}>
              {
                  categorias && categorias.map((el, index) => (
                      <div key={index} className={"size-[200px] border-2 rounded-[8px] flex items-center justify-center"}>{el.name}</div>
                  ))
              }
          </div>


          {/*--------------------------recomendados--------------------------------------------*/}
          <div className={"bg-blue-500 py-[50px]"}>
              <div className={"border-2 w-[90%] mx-auto justify-center grid grid-cols-[repeat(auto-fit,250px)] gap-x-[40px] gap-y-[40px] "}>
                  <div className={"w-[250px] h-[500px] border flex items-center justify-center text-[75px]"}>1</div>
                  <div className={"w-[250px] h-[500px] border flex items-center justify-center text-[75px]"}>1</div>
                  <div className={"w-[250px] h-[500px] border flex items-center justify-center text-[75px]"}>1</div>
              </div>
          </div>

          <div className={"size-[75px] bg-blue-500 border-4 rounded-full fixed top-[90%] left-[90%]"}/>


      </div>
  )
}
