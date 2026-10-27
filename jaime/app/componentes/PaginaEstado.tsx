import type {ReactNode} from 'react';

// estructura comun de las paginas de 404 y de error
// ilustracion: reemplaza al circulo con el casco (la 404 usa la animacion lottie)
export const PaginaEstado = ({codigo, titulo, descripcion, children, detalle, ilustracion} : {codigo : string, titulo : string, descripcion : string, children : ReactNode, detalle? : ReactNode, ilustracion? : ReactNode}) => (
    <main className={`w-full flex-1 flex items-center justify-center px-[16px] py-[60px] text-gray-900`}>
        <div className={"w-full max-w-[560px] flex flex-col items-center text-center gap-[18px]"}>
            <div className={"relative flex items-center justify-center"}>
                <span className={"text-[110px] sm:text-[140px] font-extrabold leading-none tracking-tight text-slate-900/10 select-none"}>{codigo}</span>
                {ilustracion ?? (
                    <span className={"absolute flex items-center justify-center w-[76px] h-[76px] rounded-full bg-yellow-400 text-slate-900 shadow-[0px_6px_20px_rgba(0,0,0,.15)]"}>
                        <svg viewBox="0 0 24 24" className={"w-[42px] h-[42px]"} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M2 18h20v-2H2Z"/><path d="M4 16v-3a8 8 0 0 1 16 0v3"/><path d="M10 5.3V10M14 5.3V10"/>
                        </svg>
                    </span>
                )}
            </div>
            <h1 className={"text-[26px] sm:text-[30px] font-bold leading-none"}>{titulo}</h1>
            <p className={"text-[15px] leading-relaxed text-gray-600"}>{descripcion}</p>
            <div className={"flex flex-wrap justify-center gap-[10px] mt-[6px]"}>{children}</div>
            {detalle}
        </div>
    </main>
)

export const claseBotonPrincipal = "flex items-center gap-[8px] bg-slate-900 text-white rounded-[10px] px-[18px] py-[10px] text-[14px] font-semibold hover:bg-slate-700 transition-colors cursor-pointer";
export const claseBotonSecundario = "flex items-center gap-[8px] border-2 border-gray-300 rounded-[10px] px-[18px] py-[8px] text-[14px] font-semibold text-gray-800 hover:border-slate-900 transition-colors cursor-pointer";
