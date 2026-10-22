'use client'
import {useState} from 'react';

// tiempo que se muestra cada imagen; es la duracion de la barra de carga de la bolita activa
const INTERVALO = 5000;

const FlechaIOS = ({direccion} : {direccion : 'izquierda' | 'derecha'}) => (
    <svg viewBox="0 0 24 24" className={"w-[22px] h-[22px]"} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        {direccion === 'izquierda'
            ? <path d="M15 4.5 7.5 12l7.5 7.5"/>
            : <path d="M9 4.5 16.5 12 9 19.5"/>}
    </svg>
)

export const GaleriaProducto = ({imagenes} : {imagenes : string[]}) => {

    const [inicio, setInicio] = useState(0);
    // con el cursor sobre la imagen grande la barra se detiene
    const [pausado, setPausado] = useState(false);
    const total = imagenes.length;

    const mover = (paso : number) => setInicio(prev => (prev + paso + total) % total);

    const principal = imagenes[inicio];
    const miniaturas = Array.from({length: Math.min(3, total - 1)}, (_, i) => (inicio + i + 1) % total);

    return (
        // mismo ancho, borde, redondeo y relleno que el recuadro de la descripcion que esta al costado
        <div className={"w-full lg:w-1/2 flex flex-col gap-[20px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.12)] rounded-[12.5px] p-[25px]"}>
            {/* la imagen principal siempre es cuadrada: en columna mide hasta 480px; en pantallas grandes ocupa el alto que
                sobra y el cuadrado toma el menor entre ese ancho y ese alto (unidades cq del contenedor) */}
            <div className={"w-full max-w-[480px] mx-auto lg:max-w-none lg:flex-1 lg:min-h-0 lg:[container-type:size] flex items-center justify-center"}>
                <div onMouseEnter={() => setPausado(true)} onMouseLeave={() => setPausado(false)} className={"w-full lg:w-[min(100cqw,100cqh)] aspect-square rounded-[10px] p-[10px] flex items-center justify-center bg-white"}>
                    <img key={inicio} src={principal} alt="" className={"animateElement max-w-full max-h-full object-contain"}/>
                </div>
            </div>

            {/* una bolita por imagen: la activa se llena como barra de carga y al terminar pasa a la siguiente.
                la key reinicia la barra cada vez que cambia la imagen (automatico, flechas, miniaturas o bolitas) */}
            {total > 1 && (
                <div className={"flex justify-center items-center gap-[10px] shrink-0"}>
                    {imagenes.map((_, indice) => (
                        <button key={indice} onClick={() => setInicio(indice)} aria-label={`Ver imagen ${indice + 1}`} aria-current={indice === inicio}
                            className={`relative h-[12px] rounded-full overflow-hidden border border-gray-400 transition-all duration-500 ease-in-out cursor-pointer ${indice === inicio ? "w-[70px]" : "w-[12px] hover:border-gray-700"}`}>
                            {indice === inicio && (
                                <span key={inicio} onAnimationEnd={() => mover(1)} style={{animationDuration: `${INTERVALO}ms`, animationPlayState: pausado ? 'paused' : 'running'}}
                                    className={"barraCarga absolute inset-0 bg-blue-500"}/>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {miniaturas.length > 0 && (
                <div className={"w-full max-w-[480px] mx-auto lg:max-w-none flex items-center gap-[10px] shrink-0"}>
                    <button onClick={() => mover(-1)} aria-label="Imagen anterior" className={"shrink-0 w-[40px] h-[40px] rounded-full bg-white/80 shadow-[0_0_0_1px_rgba(0,0,0,.12)] flex items-center justify-center hover:bg-white active:scale-90 transition"}>
                        <FlechaIOS direccion="izquierda"/>
                    </button>

                    <div className={"flex-1 min-w-0 grid grid-cols-3 gap-[10px]"}>
                        {miniaturas.map((indice) => (
                            <button key={indice} onClick={() => setInicio(indice)} className={"w-full aspect-square rounded-[10px] p-[8px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.12)] overflow-hidden"}>
                                <img src={imagenes[indice]} alt="" className={"w-full h-full object-contain"}/>
                            </button>
                        ))}
                    </div>

                    <button onClick={() => mover(1)} aria-label="Imagen siguiente" className={"shrink-0 w-[40px] h-[40px] rounded-full bg-white/80 shadow-[0_0_0_1px_rgba(0,0,0,.12)] flex items-center justify-center hover:bg-white active:scale-90 transition"}>
                        <FlechaIOS direccion="derecha"/>
                    </button>
                </div>
            )}
        </div>
    )
}
