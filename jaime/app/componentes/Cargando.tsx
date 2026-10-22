import {AnimacionLottie} from './AnimacionLottie';
import animacionCargando from '@/app/animaciones/cargando.json';

// indicador de carga con el casco animado
export const Cargando = ({texto = 'Cargando...', className = ''} : {texto? : string, className? : string}) => (
    <div role={"status"} className={`flex flex-col items-center justify-center gap-[6px] py-[40px] ${className}`}>
        <AnimacionLottie datos={animacionCargando} className={"size-[90px]"}/>
        <span className={"text-[14px] text-gray-500"}>{texto}</span>
    </div>
)
