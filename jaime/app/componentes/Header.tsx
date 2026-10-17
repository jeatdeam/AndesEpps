'use client'
import Link from "next/link";
import {InputBusqueda} from './InputBusqueda'
import {useRef, useEffect, useState} from 'react';
import {useControladorBusqueda} from "@/app/controladoresGlobales/controladorBusqueda";
import {useControladorIconoSearch} from "@/app/controladoresGlobales/controladorIconoSearch";


export const  Header = () => {

    const containerBusqueda = useRef<HTMLDivElement|null>(null)

    const {statusBusqueda,desactiveBusqueda} = useControladorBusqueda();
    const {statusIcon ,changeStatusIcon, desactiveIcon, activeIcon} = useControladorIconoSearch();

    const [flagSearch, setFlagSearch] = useState<boolean>(false);


    const [activeMenu, setActiveMenu] = useState<boolean>(false);
    const containerMenu = useRef<HTMLDivElement|null>(null);
    const containerHeader = useRef<HTMLDivElement|null>(null);

    const showBusqueda = () => {
        if(!flagSearch) return;
        console.log(`aqui esta el valor del icono ${statusIcon}!`);
        changeStatusIcon();
        console.log('entramos en true por que estamos menos de 768px')
    }

    useEffect(()=> {
        const handleClickOutside = (event : MouseEvent) => {
            if(containerBusqueda.current && !containerBusqueda.current.contains(event.target as Node)) desactiveBusqueda();
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    },[])


    useEffect(()=>{

        if(!containerHeader.current) return;

        const observer = new IntersectionObserver(([entry]) => {

            // setVisible(entry.isIntersecting);
            if(!entry.isIntersecting) {
               setActiveMenu(true);
            } else {
                setActiveMenu(false)
            }


        },{
            threshold: 0.4,
        })


        observer.observe(containerHeader.current);

        return () => {
            observer.disconnect();
        }

    },[])

    useEffect(() => {
        const media = window.matchMedia("(max-width: 768px)");
        if(media.matches) {
            console.log('gaa ctmre iniciamos aqui');
            setFlagSearch(true);
        }
        const handleChange = (event: MediaQueryListEvent) => {
            if(event.matches) {
                // activeIcon();
                setFlagSearch(true);
                console.log('gaaaa ctmre llegamos a 768px');
            } else {
                // desactiveIcon();
                setFlagSearch(false);
                console.log('pantalla mayor a 768px');
            }
        }
        media.addEventListener('change', handleChange);

        return () => {
            media.removeEventListener('change', handleChange);
        }

    },[]);





    return (
        <div ref={containerHeader} className={"h-[100px]  flex items-center relative"}>
            <div ref={containerMenu} className={`${activeMenu ? "border-2 w-[85%] backdrop-blur-md" : "w-[90%] backdrop-blur-none"} border-2 transition-all duration-500 linear fixed top-[10px] z-[10] -translate-x-1/2 left-1/2  bg-white/10  flex justify-between p-[20px] rounded-[8px] items-center  origin-center mx-auto`}>
                <Link href={"/"} className={"sm:text-[20px] border flex items-center w-fit "}>Los Andes J & C </Link>
                <div className={"flex gap-[10px]"}>
                    <div ref={containerBusqueda} className={"flex items-center border rounded-[7.5px] p-[2.5px] border-gray-900 relative"}>
                        <svg onClick={showBusqueda} className={"hover:bg-white w-[50px] h-[22.5px] rounded-full"} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>
                        {statusIcon && <InputBusqueda/>}
                    </div>
                    <div className={"flex gap-[10px] items-center"}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M240-80q-33 0-56.5-23.5T160-160v-480q0-33 23.5-56.5T240-720h80q0-66 47-113t113-47q66 0 113 47t47 113h80q33 0 56.5 23.5T800-640v480q0 33-23.5 56.5T720-80H240Zm0-80h480v-480h-80v80q0 17-11.5 28.5T600-520q-17 0-28.5-11.5T560-560v-80H400v80q0 17-11.5 28.5T360-520q-17 0-28.5-11.5T320-560v-80h-80v480Zm160-560h160q0-33-23.5-56.5T480-800q-33 0-56.5 23.5T400-720ZM240-160v-480 480Z"/></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>
                    </div>
                </div>
                {!statusIcon && <InputBusqueda/>}
            </div>
        </div>
    )
}