import Link from 'next/link';
import {Product, BannerOferta, Banners, PosicionBanner, POSICIONES_NUEVOS} from '@/app/tipos/elementsType';
import {TituloSeccion} from './TituloSeccion';
import {formatoPrecio, precioFinal, enOferta, compararIngreso, CANTIDAD_NUEVOS} from './elementosProducto';

// banners de la pagina principal: seccion "Ofertas" (principal + 3 secundarios) y
// seccion "Nuevos ingresos" (2 + 3). Cada posicion muestra la imagen subida en el dashboard
// o, si no hay, un banner automatico armado con los productos

const aSlug = (texto : string) => texto.replace(/\s+/g, '-').toLowerCase();
const capitalizar = (texto : string) => texto.charAt(0).toUpperCase() + texto.slice(1);

type BannerCategoria = {tipo : 'categoria', categoria : string, maxDescuento : number, cantidad : number, productos : Product[]};
type BannerProducto = {tipo : 'producto', producto : Product};
type BannerNuevo = {tipo : 'nuevo', producto : Product};
type BannerImagen = {tipo : 'imagen', banner : BannerOferta};
type Banner = BannerCategoria | BannerProducto;
// lo que ocupa cada posicion: el banner subido en el dashboard o uno automatico
export type Ranura = Banner | BannerNuevo | BannerImagen;

export type GrupoBanner = 'ofertas' | 'nuevos';
type Formato = 'completo' | 'medio' | 'tercio';

export const grupoDe = (posicion : PosicionBanner) : GrupoBanner => posicion.startsWith('nuevos') ? 'nuevos' : 'ofertas';
export const formatoDe = (posicion : PosicionBanner) : Formato =>
    posicion === 'principal' ? 'completo' : posicion === 'nuevos-1' || posicion === 'nuevos-2' ? 'medio' : 'tercio';

// proporcion de las imagenes subidas segun el espacio que ocupan
export const ASPECTO : Record<Formato, string> = {
    completo: "aspect-[2/1] sm:aspect-[3/1] lg:aspect-[4/1]",
    medio: "aspect-[16/9]",
    tercio: "aspect-[4/3]",
};

// catalogo filtrado: ofertas de una categoria ordenadas por descuento, o nuevos ingresos por fecha
const hrefCategoria = (categoria : string) => `/productos?${new URLSearchParams({categoria, oferta: '1', orden: 'descuento'})}`;
const hrefNuevos = (categoria? : string) => `/productos?${new URLSearchParams({...(categoria ? {categoria} : {}), nuevos: '1', orden: 'recientes'})}`;
const hrefProducto = (p : Product) => `/productos/${aSlug(p.categoria)}/${aSlug(p.name)}`;

// destino de un banner del dashboard; si su producto ya no existe lleva a todo el grupo
const hrefBannerImagen = (banner : BannerOferta, productos : Product[], grupo : GrupoBanner) => {
    const producto = banner.productoId !== undefined ? productos.find(p => p.id === banner.productoId) : undefined;
    if (producto) return hrefProducto(producto);
    if (grupo === 'nuevos') return hrefNuevos(banner.categoria);
    if (banner.categoria) return hrefCategoria(banner.categoria);
    return '/productos?oferta=1&orden=descuento';
}

const ImagenBanner = ({banner, productos, posicion} : {banner : BannerOferta, productos : Product[], posicion : PosicionBanner}) => (
    <Link href={hrefBannerImagen(banner, productos, grupoDe(posicion))} className={`group relative block overflow-hidden ${posicion === 'principal' ? "rounded-[18px]" : "rounded-[16px]"} ${ASPECTO[formatoDe(posicion)]} bg-sky-50 shadow-[0px_4px_14px_rgba(0,0,0,.12)] hover:shadow-[0px_10px_28px_rgba(0,0,0,.22)] transition-shadow duration-300`}>
        <img src={banner.imagen} alt={banner.titulo || 'Ver productos'} className={"absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"}/>
    </Link>
)

// ---------------- ofertas ----------------

// la categoria con mayor descuento ocupa el banner principal y las siguientes los 3 secundarios;
// si no alcanzan las categorias, se completan con productos
const armarBanners = (productos : Product[]) : {principal : BannerCategoria, secundarios : Banner[]} | null => {
    const ofertas = productos.filter(enOferta).sort((a, b) => b.descuento! - a.descuento!);
    if (ofertas.length === 0) return null;

    const grupos = new Map<string, Product[]>();
    ofertas.forEach(p => grupos.set(p.categoria, [...(grupos.get(p.categoria) ?? []), p]));
    const categorias : BannerCategoria[] = [...grupos].map(([categoria, lista]) => ({
        tipo: 'categoria' as const, categoria, maxDescuento: lista[0]!.descuento!, cantidad: lista.length, productos: lista,
    })).sort((a, b) => b.maxDescuento - a.maxDescuento || b.cantidad - a.cantidad);

    const [principal, ...resto] = categorias;
    const secundarios : Banner[] = resto.slice(0, 3);
    const usados = new Set(secundarios.map(b => b.tipo === 'categoria' ? b.productos[0]!.id : b.producto.id));
    usados.add(principal!.productos[0]!.id);
    for (const producto of ofertas) {
        if (secundarios.length >= 3) break;
        if (!usados.has(producto.id)) secundarios.push({tipo: 'producto', producto});
    }
    return {principal: principal!, secundarios};
}

const Flecha = () => (
    <svg viewBox="0 0 24 24" className={"w-[18px] h-[18px] transition-transform duration-300 group-hover:translate-x-[4px]"} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6"/>
    </svg>
)

// degradados de las tarjetas de ofertas y nuevos ingresos: empiezan con el azul marino del header (arriba a la
// izquierda, donde va el texto en blanco) y terminan en azul hielo o blanco (abajo a la derecha, donde va la foto)
const MARINO_HIELO = "bg-gradient-to-br from-[#0f172a] via-[#172554] to-[#a8d5ef] ring-1 ring-white/10";
const MARINO_BLANCO = "bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#f3f9fd] ring-1 ring-white/10";
const MARINO_CIELO = "bg-gradient-to-br from-[#172554] via-[#1e3a8a] to-[#d3ebf8] ring-1 ring-white/10";
const TEXTO_CLARO = {texto: "text-white", suave: "text-sky-100/75"};

// colores de los 3 banners secundarios
const TEMAS = [
    {fondo: MARINO_HIELO, ...TEXTO_CLARO, boton: "bg-white text-slate-900"},
    {fondo: MARINO_BLANCO, ...TEXTO_CLARO, boton: "bg-[#facc15] text-slate-900"},
    {fondo: MARINO_CIELO, ...TEXTO_CLARO, boton: "bg-white text-slate-900"},
];

const BannerSecundario = ({banner, indice} : {banner : Banner, indice : number}) => {
    const tema = TEMAS[indice % TEMAS.length]!;
    const esCategoria = banner.tipo === 'categoria';
    const destacado = esCategoria ? banner.productos[0]! : banner.producto;

    return (
        <Link href={esCategoria ? hrefCategoria(banner.categoria) : hrefProducto(banner.producto)} className={`group relative overflow-hidden rounded-[16px] ${tema.fondo} ${tema.texto} min-h-[230px] p-[22px] flex flex-col shadow-[0px_4px_14px_rgba(0,0,0,.12)] hover:shadow-[0px_10px_28px_rgba(0,0,0,.22)] transition-shadow duration-300`}>
            <div className={"relative z-[1] flex flex-col gap-[6px] max-w-[60%]"}>
                <span className={`text-[11px] font-semibold uppercase tracking-[0.15em] ${tema.suave}`}>
                    {esCategoria ? `${banner.cantidad} ${banner.cantidad === 1 ? 'producto' : 'productos'} en oferta` : 'Producto en oferta'}
                </span>
                <h3 className={"text-[19px] font-bold first-letter:uppercase line-clamp-2 leading-none"}>
                    {esCategoria ? banner.categoria : banner.producto.name}
                </h3>
                {esCategoria ? (
                    <span className={"text-[26px] font-extrabold leading-none mt-[2px]"}>
                        <span className={"text-[13px] font-semibold"}>Hasta </span>-{banner.maxDescuento}%
                    </span>
                ) : (
                    <span className={"flex flex-col mt-[2px]"}>
                        <span className={`text-[13px] line-through ${tema.suave}`}>{formatoPrecio(banner.producto.precio)}</span>
                        <span className={"text-[22px] font-extrabold leading-tight"}>{formatoPrecio(precioFinal(banner.producto))}</span>
                    </span>
                )}
            </div>
            {/* el espacio de arriba va en el contenedor: si va en el boton choca con su py y el texto queda abajo */}
            <div className={"relative z-[1] mt-auto pt-[16px]"}><span className={`inline-flex items-center gap-[6px] rounded-full px-[14px] py-[10px] text-[13px] font-semibold leading-none ${tema.boton}`}>
                {esCategoria ? 'Ver ofertas' : 'Ver producto'} <Flecha/>
            </span></div>
            {!esCategoria && (
                <span className={"absolute top-[16px] right-[16px] z-[2] bg-red-600 text-white text-[13px] font-bold rounded-full px-[10px] py-[5px]"}>-{banner.producto.descuento}%</span>
            )}
            <div className={"absolute -right-[18px] -bottom-[18px] w-[58%] aspect-square rounded-full bg-white/90 flex items-center justify-center"}>
                <img src={destacado.img[0]} alt="" className={"w-[72%] h-[72%] object-contain transition-transform duration-500 group-hover:scale-110"}/>
            </div>
        </Link>
    )
}

const BannerPrincipal = ({principal} : {principal : BannerCategoria}) => (
    // de izquierda a derecha: azul marino del header (texto en blanco) hasta azul hielo (fotos de los productos)
    <Link href={hrefCategoria(principal.categoria)} className={"group relative overflow-hidden rounded-[18px] bg-gradient-to-r from-[#0f172a] via-[#172554] to-[#a8d5ef] ring-1 ring-white/10 text-white min-h-[280px] px-[26px] py-[30px] md:px-[48px] flex flex-col md:flex-row md:items-center gap-[24px] shadow-[0px_6px_20px_rgba(0,0,0,.18)] hover:shadow-[0px_12px_32px_rgba(0,0,0,.28)] transition-shadow duration-300"}>
        <div className={"absolute -top-[80px] -left-[60px] w-[260px] h-[260px] rounded-full bg-white/5"}/>
        <div className={"relative flex flex-col gap-[10px] md:max-w-[50%]"}>
            <span className={"self-start bg-[#facc15] text-slate-900 text-[12px] font-bold uppercase tracking-[0.15em] rounded-full px-[12px] py-[5px]"}>Oferta</span>
            <h3 className={"text-[26px] md:text-[34px] font-extrabold first-letter:uppercase leading-none"}>{principal.categoria}</h3>
            <p className={"text-[40px] md:text-[54px] font-extrabold leading-none text-[#facc15]"}>
                <span className={"text-[18px] md:text-[22px] font-bold text-white"}>Hasta </span>-{principal.maxDescuento}%
            </p>
            <p className={"text-[14px] text-sky-100/80"}>
                {principal.cantidad} {principal.cantidad === 1 ? 'producto' : 'productos'} con descuento en esta categoría
            </p>
            <span className={"mt-[6px] self-start flex items-center gap-[8px] bg-white text-slate-900 rounded-full px-[18px] py-[9px] text-[14px] font-bold"}>
                Ver ofertas <Flecha/>
            </span>
        </div>
        <div className={"relative flex-1 flex justify-center md:justify-end items-center gap-[14px]"}>
            {principal.productos.slice(0, 3).map((p, i) => (
                <div key={p.id} className={`relative shrink-0 bg-white rounded-[16px] p-[10px] shadow-[0px_6px_18px_rgba(15,23,42,.15)] transition-transform duration-500 ${i === 0 ? "w-[150px] md:w-[190px] group-hover:-translate-y-[6px]" : "hidden sm:block w-[110px] md:w-[140px] group-hover:-translate-y-[3px]"}`}>
                    <img src={p.img[0]} alt={p.name} className={"w-full aspect-square object-contain"}/>
                    <span className={"absolute -top-[8px] -right-[8px] bg-red-600 text-white text-[12px] font-bold rounded-full px-[8px] py-[4px]"}>-{p.descuento}%</span>
                </div>
            ))}
        </div>
    </Link>
)

// ---------------- nuevos ingresos ----------------

// colores de los 5 banners de nuevos ingresos (2 grandes arriba y 3 abajo), alternando los degradados
const TEMAS_NUEVOS = [
    {fondo: MARINO_CIELO, ...TEXTO_CLARO, boton: "bg-white text-slate-900", etiqueta: "bg-[#facc15] text-slate-900"},
    {fondo: MARINO_HIELO, ...TEXTO_CLARO, boton: "bg-[#facc15] text-slate-900", etiqueta: "bg-white text-slate-900"},
    {fondo: MARINO_BLANCO, ...TEXTO_CLARO, boton: "bg-white text-slate-900", etiqueta: "bg-[#facc15] text-slate-900"},
    {fondo: MARINO_HIELO, ...TEXTO_CLARO, boton: "bg-white text-slate-900", etiqueta: "bg-[#facc15] text-slate-900"},
    {fondo: MARINO_CIELO, ...TEXTO_CLARO, boton: "bg-[#facc15] text-slate-900", etiqueta: "bg-white text-slate-900"},
];

const BannerNuevoIngreso = ({producto, grande, indice} : {producto : Product, grande : boolean, indice : number}) => {
    const tema = TEMAS_NUEVOS[indice % TEMAS_NUEVOS.length]!;
    return (
        <Link href={hrefProducto(producto)} className={`group relative overflow-hidden rounded-[16px] ${tema.fondo} ${tema.texto} ${grande ? "min-h-[280px] p-[26px]" : "min-h-[230px] p-[22px]"} flex flex-col shadow-[0px_4px_14px_rgba(0,0,0,.12)] hover:shadow-[0px_10px_28px_rgba(0,0,0,.22)] transition-shadow duration-300`}>
            <div className={"relative z-[1] flex flex-col gap-[6px] max-w-[58%]"}>
                <span className={`self-start text-[11px] font-bold uppercase tracking-[0.15em] rounded-full px-[10px] py-[4px] ${tema.etiqueta}`}>Nuevo ingreso</span>
                <span className={`text-[11px] font-semibold uppercase tracking-wide ${tema.suave}`}>{producto.categoria}</span>
                <h3 className={`${grande ? "text-[24px]" : "text-[19px]"} font-bold leading-none first-letter:uppercase line-clamp-2`}>{producto.name}</h3>
                {/* en los banners pequenos el precio anterior va en otra linea para no chocar con la imagen */}
                <span className={`flex ${grande ? "items-baseline gap-[8px] flex-wrap" : "flex-col"}`}>
                    <span className={`${grande ? "text-[24px]" : "text-[20px]"} font-extrabold leading-tight`}>{formatoPrecio(precioFinal(producto))}</span>
                    {enOferta(producto) && <span className={`text-[13px] line-through ${tema.suave}`}>{formatoPrecio(producto.precio)}</span>}
                </span>
            </div>
            <div className={"relative z-[1] mt-auto pt-[16px]"}><span className={`inline-flex items-center gap-[6px] rounded-full px-[14px] py-[10px] text-[13px] font-semibold leading-none ${tema.boton}`}>
                Ver producto <Flecha/>
            </span></div>
            <div className={`absolute ${grande ? "-right-[24px] -bottom-[24px] w-[52%]" : "-right-[18px] -bottom-[18px] w-[58%]"} aspect-square rounded-full bg-white/90 flex items-center justify-center`}>
                <img src={producto.img[0]} alt="" className={"w-[72%] h-[72%] object-contain transition-transform duration-500 group-hover:scale-110"}/>
            </div>
        </Link>
    )
}

// ---------------- que se muestra en cada posicion ----------------

const ESPACIOS_SECUNDARIOS = ['secundario-1', 'secundario-2', 'secundario-3'] as const;

export const calcularRanuras = (productos : Product[], banners : Banners | null) : Record<PosicionBanner, Ranura | null> => {
    const subidos = Object.values(banners ?? {}).filter((b) : b is BannerOferta => !!b);
    const ranuras = {} as Record<PosicionBanner, Ranura | null>;
    const subido = (posicion : PosicionBanner) : BannerImagen | null => banners?.[posicion] ? {tipo: 'imagen', banner: banners[posicion]!} : null;

    // ofertas: si el principal es una imagen subida, su categoria automatica pasa a la cola de los
    // secundarios, y se saltan los automaticos que repetirian lo que ya muestra un banner subido
    const auto = armarBanners(productos);
    const repetido = (b : Banner) => b.tipo === 'categoria'
        ? subidos.some(s => s.categoria === b.categoria)
        : subidos.some(s => s.productoId === b.producto.id);
    const cola : Banner[] = [...(banners?.principal && auto ? [auto.principal] : []), ...(auto?.secundarios ?? [])].filter(b => !repetido(b));
    ranuras.principal = subido('principal') ?? auto?.principal ?? null;
    ESPACIOS_SECUNDARIOS.forEach(posicion => { ranuras[posicion] = subido(posicion) ?? cola.shift() ?? null; });

    // nuevos ingresos: los productos mas recientes, sin repetir los que ya tienen un banner subido
    const recientes = [...productos].sort(compararIngreso).slice(0, CANTIDAD_NUEVOS)
        .filter(p => !subidos.some(s => s.productoId === p.id))
        .map(producto => ({tipo: 'nuevo' as const, producto}));
    POSICIONES_NUEVOS.forEach(posicion => { ranuras[posicion] = subido(posicion) ?? recientes.shift() ?? null; });

    return ranuras;
}

// el destino se expresa como "" (todo el grupo), "categoria:<nombre>" o "producto:<id>"
export const destinoDeBanner = (banner : BannerOferta) =>
    banner.productoId !== undefined ? `producto:${banner.productoId}` : banner.categoria ? `categoria:${banner.categoria}` : '';

// descripcion y destino de lo que se ve en una posicion, para mostrarlos en el dashboard
export const describirRanura = (ranura : Ranura | null) : {descripcion : string, destino : string} => {
    if (!ranura) return {descripcion: '', destino: ''};
    if (ranura.tipo === 'imagen') return {descripcion: ranura.banner.titulo, destino: destinoDeBanner(ranura.banner)};
    if (ranura.tipo === 'categoria') return {descripcion: `${capitalizar(ranura.categoria)} hasta -${ranura.maxDescuento}%`, destino: `categoria:${ranura.categoria}`};
    if (ranura.tipo === 'nuevo') return {descripcion: `Nuevo ingreso: ${ranura.producto.name}`, destino: `producto:${ranura.producto.id}`};
    return {descripcion: `${capitalizar(ranura.producto.name)} con -${ranura.producto.descuento}%`, destino: `producto:${ranura.producto.id}`};
}

// "indice" elige el color del banner automatico dentro de su fila
export const VistaRanura = ({ranura, productos, posicion, indice = 0} : {ranura : Ranura, productos : Product[], posicion : PosicionBanner, indice? : number}) => {
    if (ranura.tipo === 'imagen') return <ImagenBanner banner={ranura.banner} productos={productos} posicion={posicion}/>;
    if (ranura.tipo === 'nuevo') return <BannerNuevoIngreso producto={ranura.producto} grande={formatoDe(posicion) === 'medio'} indice={indice}/>;
    if (posicion === 'principal' && ranura.tipo === 'categoria') return <BannerPrincipal principal={ranura}/>;
    return <BannerSecundario banner={ranura} indice={indice}/>;
}

const columnas = (cantidad : number) => cantidad === 1 ? "" : cantidad === 2 ? "md:grid-cols-2" : "md:grid-cols-3";

// fila de banners: solo las posiciones que tienen algo que mostrar
const FilaBanners = ({posiciones, ranuras, productos} : {posiciones : readonly PosicionBanner[], ranuras : Record<PosicionBanner, Ranura | null>, productos : Product[]}) => {
    const visibles = posiciones.filter(p => ranuras[p]);
    if (visibles.length === 0) return null;
    return (
        <div className={`grid grid-cols-1 gap-[18px] ${columnas(visibles.length)}`}>
            {visibles.map((posicion, i) => <VistaRanura key={posicion} ranura={ranuras[posicion]!} productos={productos} posicion={posicion} indice={posicion.startsWith('nuevos') ? POSICIONES_NUEVOS.indexOf(posicion as typeof POSICIONES_NUEVOS[number]) : i}/>)}
        </div>
    )
}

export const BannersOfertas = ({productos, banners} : {productos : Product[], banners : Banners | null}) => {
    const ranuras = calcularRanuras(productos, banners);
    if (!ranuras.principal && !ESPACIOS_SECUNDARIOS.some(p => ranuras[p])) return null;

    return (
        <section className={"w-[90%] 2xl:w-[70%] mx-auto"}>
            <TituloSeccion>Ofertas</TituloSeccion>
            <div className={`flex flex-col gap-[18px]`}>
                <FilaBanners posiciones={['principal']} ranuras={ranuras} productos={productos}/>
                <FilaBanners posiciones={ESPACIOS_SECUNDARIOS} ranuras={ranuras} productos={productos}/>
            </div>
        </section>
    )
}

export const BannersNuevos = ({productos, banners} : {productos : Product[], banners : Banners | null}) => {
    const ranuras = calcularRanuras(productos, banners);
    if (!POSICIONES_NUEVOS.some(p => ranuras[p])) return null;

    return (
        <section className={"w-[90%] 2xl:w-[70%] mx-auto"}>
            <TituloSeccion>Nuevos ingresos</TituloSeccion>
            <div className={`flex flex-col gap-[18px]`}>
                <FilaBanners posiciones={POSICIONES_NUEVOS.slice(0, 2)} ranuras={ranuras} productos={productos}/>
                <FilaBanners posiciones={POSICIONES_NUEVOS.slice(2)} ranuras={ranuras} productos={productos}/>
            </div>
        </section>
    )
}
