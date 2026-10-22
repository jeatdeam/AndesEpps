export const formatoPrecio = (precio : number) => `S/ ${precio.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

export const enOferta = (producto : {descuento? : number}) => (producto.descuento ?? 0) > 0;

// precio que paga el cliente: "precio" es el precio de lista y "descuento" un porcentaje sobre el
export const precioFinal = (producto : {precio : number, descuento? : number}) =>
    enOferta(producto) ? Math.round(producto.precio * (100 - producto.descuento!)) / 100 : producto.precio;

// cantidad de productos mas recientes que se consideran "nuevos ingresos"
export const CANTIDAD_NUEVOS = 6;

// mas reciente primero: los creados desde el dashboard tienen fecha; los antiguos se ordenan por id
export const compararIngreso = (a : {id : number, creadoEn? : string}, b : {id : number, creadoEn? : string}) =>
    (b.creadoEn ?? '').localeCompare(a.creadoEn ?? '') || b.id - a.id;

export const idsNuevosIngresos = (productos : {id : number, creadoEn? : string}[]) =>
    new Set([...productos].sort(compararIngreso).slice(0, CANTIDAD_NUEVOS).map(p => p.id));

export const EtiquetaDescuento = ({descuento, className = ''} : {descuento : number, className? : string}) => (
    <span className={`bg-red-600 text-white font-bold rounded-full leading-none ${className}`}>-{descuento}%</span>
)

export const IconoCarrito = () => (
    <svg viewBox="0 0 24 24" className={"w-[20px] h-[20px] shrink-0"} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="20" r="1.5"/>
        <circle cx="18" cy="20" r="1.5"/>
        <path d="M2.5 3.5h2.6l2.4 11.2a1.8 1.8 0 0 0 1.8 1.4h8.4a1.8 1.8 0 0 0 1.8-1.4L21 7.5H6.2"/>
    </svg>
)

export const IconoCotizar = () => (
    <svg viewBox="0 0 24 24" className={"w-[20px] h-[20px] shrink-0"} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/>
        <path d="M14 3v5h5"/>
        <path d="M9 13h6M9 17h4"/>
    </svg>
)

// clases de los botones "Agregar al carrito" y "Cotizar" (tarjetas y detalle del producto)
export const claseBotonProducto = "border-2 border-gray-300 flex items-center justify-center gap-[6px] p-[7.5px] text-[12px] font-semibold leading-tight rounded-[10px] cursor-pointer transition-all duration-300 ease-out hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:-translate-y-[2px] active:translate-y-0 active:scale-95";

export const EstrellaUnica = ({calificacion, resenas} : {calificacion? : number, resenas? : number}) => (
    <span className={"flex items-center gap-[3px] text-[12px] leading-none text-gray-600 shrink-0"} aria-label={calificacion ? `Calificación ${calificacion} de 5` : 'Sin calificaciones'}>
        <span className={`text-[15px] ${calificacion ? "text-yellow-400" : "text-gray-300"}`}>★</span>
        {calificacion ? `${calificacion.toFixed(1)}${resenas ? ` (${resenas})` : ''}` : 'Sin reseñas'}
    </span>
)
