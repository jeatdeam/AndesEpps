import {AnimacionLottie} from "@/app/componentes/AnimacionLottie";
import firmaJeatdeamDev from "@/app/animaciones/firmaJeatdeamDev.json";
import {TextoEscritura} from "@/app/componentes/TextoEscritura";
import {doto} from "@/app/fuentes";

// franja de creditos con la firma del desarrollador: va al final del footer y, en el dashboard, sola al fondo de la pagina
export const CreditosDesarrollador = () => {
    return (
        <div className={"bg-neutral-900"}>
            {/* el texto y la firma van siempre en una sola linea; en celular y tablet la firma es mas chica para que quepa */}
            <div className={"w-[90%] xl:w-[80%] mx-auto py-[4px] flex flex-row items-center justify-center gap-[8px] sm:gap-[16px] lg:gap-[22px]"}>
                <span className={"sm:hidden"}>
                    <TextoEscritura texto={"Desarrollado por:"} className={`${doto.className} text-[12px] font-bold uppercase tracking-[.14em] text-neutral-300`}/>
                </span>
                <span className={"hidden sm:inline"}>
                    <TextoEscritura texto={"Desarrollado y diseñado por:"} className={`${doto.className} text-[14px] font-bold uppercase tracking-[.14em] text-neutral-300`}/>
                </span>
                <a href="https://github.com/jeatdeam" target="_blank" rel="noopener noreferrer" aria-label={"Portafolio de jeatdeam en GitHub"} className={"flex items-center shrink-0 hover:opacity-80 transition-opacity"}>
                    {/* la animacion es de 1000x420: la firma, la brocha y el "</>" ocupan ~66% del ancho y ~64% del alto, un poco a la derecha y arriba.
                        los margenes negativos recortan ese espacio vacio; al final se deshace en particulas y el ultimo cuadro queda vacio,
                        por eso con "reducir movimiento" se deja quieta en el cuadro 130, con la firma completa */}
                    <AnimacionLottie datos={firmaJeatdeamDev} cuadroReposo={130} className={"w-[205px] h-[86px] -mt-[12px] -mb-[19px] -ml-[38px] -mr-[28px] lg:w-[320px] lg:h-[134px] lg:-mt-[18px] lg:-mb-[29px] lg:-ml-[60px] lg:-mr-[44px] shrink-0"}/>
                </a>
            </div>
        </div>
    )
}
