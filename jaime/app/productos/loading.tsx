import {Cargando} from '@/app/componentes/Cargando';

// se muestra mientras la pagina del catalogo trae los productos del backend
export default function Loading() {
    return <Cargando texto={"Cargando productos..."} className={"flex-1 min-h-[50vh]"}/>
}
