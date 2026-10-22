'use client'
import {useState, useEffect, useMemo, type ReactNode} from 'react';
import {Product} from '@/app/tipos/elementsType';
import {poppins} from '@/app/fuentes';
import {TarjetaProducto} from './TarjetaProducto';
import {formatoPrecio, precioFinal, enOferta, compararIngreso, idsNuevosIngresos, CANTIDAD_NUEVOS} from './elementosProducto';

type FacetaClave = 'categoria' | 'marca' | 'norma' | 'talla' | 'color' | 'material';
type Orden = 'relevancia' | 'recientes' | 'descuento' | 'precio-asc' | 'precio-desc' | 'nombre' | 'calificacion';

type Filtros = Record<FacetaClave, string[]> & {
    q : string,
    min : number | null,
    max : number | null,
    stock : boolean,
    oferta : boolean,
    nuevos : boolean,
    cal : number | null,
    orden : Orden,
}

// facetas propias de una tienda de EPP; las que no tienen datos en los productos no se muestran
const FACETAS : {clave : FacetaClave, titulo : string, valores : (p : Product) => string[]}[] = [
    {clave: 'categoria', titulo: 'Tipo de protección', valores: p => [p.categoria]},
    {clave: 'marca', titulo: 'Marca', valores: p => p.marca ? [p.marca] : []},
    {clave: 'norma', titulo: 'Norma / certificación', valores: p => p.normas ?? []},
    {clave: 'talla', titulo: 'Talla', valores: p => p.tallas ?? []},
    {clave: 'color', titulo: 'Color', valores: p => p.colores ?? []},
    {clave: 'material', titulo: 'Material', valores: p => p.material ? [p.material] : []},
];

const ORDENES : {valor : Orden, texto : string}[] = [
    {valor: 'relevancia', texto: 'Relevancia'},
    {valor: 'recientes', texto: 'Más recientes'},
    {valor: 'descuento', texto: 'Mayor descuento'},
    {valor: 'precio-asc', texto: 'Precio: menor a mayor'},
    {valor: 'precio-desc', texto: 'Precio: mayor a menor'},
    {valor: 'nombre', texto: 'Nombre: A - Z'},
    {valor: 'calificacion', texto: 'Mejor calificados'},
];

const CALIFICACIONES = [4, 3, 2];
const VISIBLES_POR_FACETA = 6;

const normalizar = (texto : string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const aLista = (valor : string | string[] | undefined) => valor === undefined ? [] : Array.isArray(valor) ? valor : [valor];
const aNumero = (valor : string | string[] | undefined) => {
    const n = Number(aLista(valor)[0]);
    return aLista(valor).length && !Number.isNaN(n) ? n : null;
}

const leerParametros = (parametros : {[key : string] : string | string[] | undefined}) : Filtros => ({
    q: aLista(parametros.q)[0] ?? '',
    categoria: aLista(parametros.categoria),
    marca: aLista(parametros.marca),
    norma: aLista(parametros.norma),
    talla: aLista(parametros.talla),
    color: aLista(parametros.color),
    material: aLista(parametros.material),
    min: aNumero(parametros.min),
    max: aNumero(parametros.max),
    stock: aLista(parametros.stock)[0] === '1',
    oferta: aLista(parametros.oferta)[0] === '1',
    nuevos: aLista(parametros.nuevos)[0] === '1',
    cal: aNumero(parametros.cal),
    orden: (ORDENES.find(o => o.valor === aLista(parametros.orden)[0])?.valor) ?? 'relevancia',
})

const escribirParametros = (f : Filtros) => {
    const params = new URLSearchParams();
    if (f.q) params.set('q', f.q);
    FACETAS.forEach(({clave}) => f[clave].forEach(v => params.append(clave, v)));
    if (f.min !== null) params.set('min', String(f.min));
    if (f.max !== null) params.set('max', String(f.max));
    if (f.stock) params.set('stock', '1');
    if (f.oferta) params.set('oferta', '1');
    if (f.nuevos) params.set('nuevos', '1');
    if (f.cal !== null) params.set('cal', String(f.cal));
    if (f.orden !== 'relevancia') params.set('orden', f.orden);
    return params.toString();
}

// "excepto" permite contar las opciones de una faceta sin que su propia seleccion las oculte
const cumpleFiltros = (p : Product, f : Filtros, nuevos : Set<number>, excepto? : FacetaClave) => {
    if (f.q) {
        const texto = normalizar(`${p.name} ${p.categoria} ${p.marca ?? ''} ${p.descripcionPrimaria}`);
        if (!normalizar(f.q).split(/\s+/).every(palabra => texto.includes(palabra))) return false;
    }
    for (const {clave, valores} of FACETAS) {
        if (clave === excepto || f[clave].length === 0) continue;
        if (!valores(p).some(v => f[clave].includes(v))) return false;
    }
    if (f.min !== null && precioFinal(p) < f.min) return false;
    if (f.max !== null && precioFinal(p) > f.max) return false;
    if (f.stock && p.stock <= 0) return false;
    if (f.oferta && !enOferta(p)) return false;
    if (f.nuevos && !nuevos.has(p.id)) return false;
    if (f.cal !== null && (p.calificacion ?? 0) < f.cal) return false;
    return true;
}

const ordenar = (lista : Product[], orden : Orden) => {
    const copia = [...lista];
    if (orden === 'recientes') copia.sort(compararIngreso);
    if (orden === 'descuento') copia.sort((a, b) => (b.descuento ?? 0) - (a.descuento ?? 0));
    if (orden === 'precio-asc') copia.sort((a, b) => precioFinal(a) - precioFinal(b));
    if (orden === 'precio-desc') copia.sort((a, b) => precioFinal(b) - precioFinal(a));
    if (orden === 'nombre') copia.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    if (orden === 'calificacion') copia.sort((a, b) => (b.calificacion ?? 0) - (a.calificacion ?? 0));
    return copia;
}

const SeccionFiltro = ({titulo, children} : {titulo : string, children : ReactNode}) => {
    const [abierta, setAbierta] = useState(true);
    return (
        <div className={"border-b border-gray-200 py-[14px]"}>
            <button onClick={() => setAbierta(!abierta)} className={"w-full flex items-center justify-between text-[14px] font-semibold text-gray-900 cursor-pointer"} aria-expanded={abierta}>
                {titulo}
                <svg viewBox="0 0 24 24" className={`w-[18px] h-[18px] transition-transform duration-300 ${abierta ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                </svg>
            </button>
            {abierta && <div className={"mt-[10px] flex flex-col gap-[8px]"}>{children}</div>}
        </div>
    )
}

const Opcion = ({tipo = 'checkbox', texto, cantidad, marcada, onChange} : {tipo? : 'checkbox' | 'radio', texto : ReactNode, cantidad? : number, marcada : boolean, onChange : () => void}) => (
    <label className={`flex items-center gap-[8px] text-[13px] cursor-pointer ${cantidad === 0 && !marcada ? "text-gray-400" : "text-gray-700 hover:text-gray-900"}`}>
        <input type={tipo} checked={marcada} onChange={onChange} disabled={cantidad === 0 && !marcada} className={"w-[16px] h-[16px] accent-slate-900 cursor-pointer"}/>
        <span className={"flex-1 first-letter:uppercase"}>{texto}</span>
        {cantidad !== undefined && <span className={"text-[12px] text-gray-400"}>({cantidad})</span>}
    </label>
)

const FiltroPrecio = ({min, max, limites, onAplicar} : {min : number | null, max : number | null, limites : [number, number], onAplicar : (min : number | null, max : number | null) => void}) => {
    const [desde, setDesde] = useState(min?.toString() ?? '');
    const [hasta, setHasta] = useState(max?.toString() ?? '');

    const aplicar = (e : React.FormEvent) => {
        e.preventDefault();
        onAplicar(desde === '' ? null : Number(desde), hasta === '' ? null : Number(hasta));
    }

    const claseInput = "w-full border border-gray-300 rounded-[8px] px-[8px] py-[6px] text-[13px] outline-none focus:border-slate-900";

    return (
        <form onSubmit={aplicar} className={"flex flex-col gap-[8px]"}>
            <div className={"flex items-center gap-[6px]"}>
                <input type="number" min={0} inputMode="numeric" value={desde} onChange={e => setDesde(e.target.value)} placeholder={`Mín. ${limites[0]}`} className={claseInput} aria-label={"Precio mínimo"}/>
                <span className={"text-gray-400"}>–</span>
                <input type="number" min={0} inputMode="numeric" value={hasta} onChange={e => setHasta(e.target.value)} placeholder={`Máx. ${limites[1]}`} className={claseInput} aria-label={"Precio máximo"}/>
            </div>
            <button type="submit" className={"border-2 border-slate-900 rounded-[8px] py-[5px] text-[12px] font-semibold cursor-pointer transition-colors duration-300 hover:bg-slate-900 hover:text-white"}>
                Aplicar
            </button>
        </form>
    )
}

export const CatalogoProductos = ({productos, parametros} : {productos : Product[], parametros : {[key : string] : string | string[] | undefined}}) => {

    const [filtros, setFiltros] = useState<Filtros>(() => leerParametros(parametros));
    const [panelAbierto, setPanelAbierto] = useState(false);
    const [facetasExpandidas, setFacetasExpandidas] = useState<FacetaClave[]>([]);

    // mantiene la URL sincronizada para poder compartir o recargar la busqueda filtrada
    useEffect(() => {
        const query = escribirParametros(filtros);
        window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
    }, [filtros]);

    useEffect(() => {
        document.body.style.overflow = panelAbierto ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [panelAbierto]);

    const nuevos = useMemo(() => idsNuevosIngresos(productos), [productos]);

    const resultado = useMemo(() => ordenar(productos.filter(p => cumpleFiltros(p, filtros, nuevos)), filtros.orden), [productos, filtros, nuevos]);

    const opcionesFacetas = useMemo(() => FACETAS.map(faceta => {
        const disponibles = productos.filter(p => cumpleFiltros(p, filtros, nuevos, faceta.clave));
        const valores = [...new Set(productos.flatMap(faceta.valores))].sort((a, b) => a.localeCompare(b, 'es'));
        const opciones = valores.map(valor => ({valor, cantidad: disponibles.filter(p => faceta.valores(p).includes(valor)).length}));
        return {...faceta, opciones};
    }).filter(f => f.opciones.length > 0), [productos, filtros, nuevos]);

    const limitesPrecio = useMemo<[number, number]>(() => {
        const precios = productos.map(precioFinal);
        return precios.length ? [Math.floor(Math.min(...precios)), Math.ceil(Math.max(...precios))] : [0, 0];
    }, [productos]);

    const hayCalificaciones = productos.some(p => p.calificacion !== undefined);
    const enStock = productos.filter(p => p.stock > 0 && cumpleFiltros(p, {...filtros, stock: false}, nuevos)).length;
    const hayOfertas = productos.some(enOferta);
    const conOferta = productos.filter(p => enOferta(p) && cumpleFiltros(p, {...filtros, oferta: false}, nuevos)).length;
    const conNuevos = productos.filter(p => nuevos.has(p.id) && cumpleFiltros(p, {...filtros, nuevos: false}, nuevos)).length;

    const actualizar = (cambios : Partial<Filtros>) => setFiltros(f => ({...f, ...cambios}));

    const alternarValor = (clave : FacetaClave, valor : string) => setFiltros(f => ({
        ...f,
        [clave]: f[clave].includes(valor) ? f[clave].filter(v => v !== valor) : [...f[clave], valor],
    }));

    const limpiar = () => setFiltros(f => ({...leerParametros({}), orden: f.orden}));

    const chips : {texto : string, quitar : () => void}[] = [
        ...(filtros.q ? [{texto: `"${filtros.q}"`, quitar: () => actualizar({q: ''})}] : []),
        ...FACETAS.flatMap(({clave}) => filtros[clave].map(valor => ({texto: valor, quitar: () => alternarValor(clave, valor)}))),
        ...(filtros.min !== null || filtros.max !== null ? [{
            texto: `${filtros.min !== null ? formatoPrecio(filtros.min) : 'S/ 0'} - ${filtros.max !== null ? formatoPrecio(filtros.max) : 'más'}`,
            quitar: () => actualizar({min: null, max: null}),
        }] : []),
        ...(filtros.stock ? [{texto: 'En stock', quitar: () => actualizar({stock: false})}] : []),
        ...(filtros.oferta ? [{texto: 'En oferta', quitar: () => actualizar({oferta: false})}] : []),
        ...(filtros.nuevos ? [{texto: 'Nuevos ingresos', quitar: () => actualizar({nuevos: false})}] : []),
        ...(filtros.cal !== null ? [{texto: `${filtros.cal}★ o más`, quitar: () => actualizar({cal: null})}] : []),
    ];

    const panelFiltros = (
        <>
            {opcionesFacetas.map(({clave, titulo, opciones}) => {
                const expandida = facetasExpandidas.includes(clave);
                const visibles = expandida ? opciones : opciones.slice(0, VISIBLES_POR_FACETA);
                return (
                    <SeccionFiltro key={clave} titulo={titulo}>
                        {visibles.map(({valor, cantidad}) => (
                            <Opcion key={valor} texto={valor} cantidad={cantidad} marcada={filtros[clave].includes(valor)} onChange={() => alternarValor(clave, valor)}/>
                        ))}
                        {opciones.length > VISIBLES_POR_FACETA && (
                            <button onClick={() => setFacetasExpandidas(e => expandida ? e.filter(c => c !== clave) : [...e, clave])} className={"self-start text-[13px] font-semibold text-slate-900 underline cursor-pointer"}>
                                {expandida ? 'Ver menos' : `Ver más (${opciones.length - VISIBLES_POR_FACETA})`}
                            </button>
                        )}
                    </SeccionFiltro>
                )
            })}

            <SeccionFiltro titulo={"Precio"}>
                {/* la key reinicia los inputs cuando el filtro se quita desde un chip */}
                <FiltroPrecio key={`${filtros.min}-${filtros.max}`} min={filtros.min} max={filtros.max} limites={limitesPrecio} onAplicar={(min, max) => actualizar({min, max})}/>
            </SeccionFiltro>

            {hayOfertas && (
                <SeccionFiltro titulo={"Ofertas"}>
                    <Opcion texto={"Solo productos en oferta"} cantidad={conOferta} marcada={filtros.oferta} onChange={() => actualizar({oferta: !filtros.oferta})}/>
                </SeccionFiltro>
            )}

            <SeccionFiltro titulo={"Nuevos ingresos"}>
                <Opcion texto={`Solo los ${CANTIDAD_NUEVOS} más recientes`} cantidad={conNuevos} marcada={filtros.nuevos} onChange={() => actualizar({nuevos: !filtros.nuevos})}/>
            </SeccionFiltro>

            <SeccionFiltro titulo={"Disponibilidad"}>
                <Opcion texto={"Solo productos en stock"} cantidad={enStock} marcada={filtros.stock} onChange={() => actualizar({stock: !filtros.stock})}/>
            </SeccionFiltro>

            {hayCalificaciones && (
                <SeccionFiltro titulo={"Calificación"}>
                    {CALIFICACIONES.map(c => (
                        <Opcion key={c} tipo={"radio"} texto={<><span className={"text-yellow-400"}>{'★'.repeat(c)}</span><span className={"text-gray-300"}>{'★'.repeat(5 - c)}</span> o más</>} marcada={filtros.cal === c} onChange={() => actualizar({cal: filtros.cal === c ? null : c})}/>
                    ))}
                </SeccionFiltro>
            )}
        </>
    );

    return (
        // todo el catalogo va dentro de una tarjeta con el mismo borde de 1px y redondeo que el detalle de producto
        <section className={`${poppins.className} w-[92%] max-w-[1400px] mx-auto my-[32px] p-[20px] lg:p-[28px] bg-white rounded-[12.5px] shadow-[0_0_0_1px_rgba(0,0,0,.12)] text-gray-900`}>

            <div className={"flex flex-col gap-[4px] mb-[20px]"}>
                <h1 className={"text-[26px] font-bold first-letter:uppercase leading-none"}>
                    {filtros.categoria.length === 1 ? filtros.categoria[0] : filtros.nuevos ? 'Nuevos ingresos' : filtros.oferta ? 'Ofertas' : 'Equipos de protección personal'}
                </h1>
                <p className={"text-[13px] text-gray-500"}>{resultado.length} {resultado.length === 1 ? 'producto encontrado' : 'productos encontrados'}</p>
            </div>

            <div className={"flex gap-[28px] items-start"}>

                {/* panel lateral: en escritorio es un recuadro con borde de 1px dentro de la tarjeta del catalogo; en movil un cajon deslizable */}
                <div onClick={() => setPanelAbierto(false)} className={`fixed inset-0 z-[40] bg-black/40 transition-opacity duration-300 lg:hidden ${panelAbierto ? "opacity-100" : "opacity-0 pointer-events-none"}`}/>
                <aside className={`fixed top-0 left-0 z-[50] h-full w-[300px] max-w-[85%] bg-white px-[20px] py-[16px] overflow-y-auto scroll-fino transition-transform duration-300 ${panelAbierto ? "translate-x-0" : "-translate-x-full"} lg:z-auto lg:h-auto lg:w-[270px] lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:p-[18px] lg:rounded-[12.5px] lg:shadow-[0_0_0_1px_rgba(0,0,0,.12)] lg:overflow-visible lg:sticky lg:top-[20px]`}>
                    <div className={"flex items-center justify-between pb-[6px] border-b-2 border-slate-900"}>
                        <h2 className={"text-[16px] font-bold leading-none"}>Filtrar por</h2>
                        <button onClick={() => setPanelAbierto(false)} className={"lg:hidden text-[22px] leading-none cursor-pointer"} aria-label={"Cerrar filtros"}>×</button>
                    </div>
                    {panelFiltros}
                    <button onClick={() => setPanelAbierto(false)} className={"lg:hidden w-full mt-[16px] bg-slate-900 text-white rounded-[10px] py-[10px] text-[13px] font-semibold cursor-pointer"}>
                        Ver {resultado.length} productos
                    </button>
                </aside>

                {/* productos (buscador, orden y resultados) en su propio recuadro con borde de 1px */}
                <div className={"flex-1 min-w-0 p-[14px] sm:p-[18px] rounded-[12.5px] shadow-[0_0_0_1px_rgba(0,0,0,.12)]"}>
                    <div className={"flex flex-wrap items-center gap-[10px]"}>
                        <div className={"flex-1 min-w-[200px] flex items-center gap-[8px] border-2 border-gray-300 rounded-[10px] px-[10px] py-[6px] focus-within:border-slate-900"}>
                            <svg viewBox="0 0 24 24" className={"w-[18px] h-[18px] text-gray-400 shrink-0"} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                                <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
                            </svg>
                            <input value={filtros.q} onChange={e => actualizar({q: e.target.value})} type="search" placeholder={"Buscar casco, guantes, lentes..."} className={"w-full text-[13px] outline-none"}/>
                        </div>
                        <button onClick={() => setPanelAbierto(true)} className={"lg:hidden flex items-center gap-[6px] border-2 border-gray-300 rounded-[10px] px-[12px] py-[6px] text-[13px] font-semibold cursor-pointer"}>
                            <svg viewBox="0 0 24 24" className={"w-[18px] h-[18px]"} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                                <path d="M4 6h16M7 12h10M10 18h4"/>
                            </svg>
                            Filtros{chips.length > 0 && ` (${chips.length})`}
                        </button>
                        <label className={"flex items-center gap-[6px] text-[13px] text-gray-600"}>
                            Ordenar por
                            <select value={filtros.orden} onChange={e => actualizar({orden: e.target.value as Orden})} className={"border-2 border-gray-300 rounded-[10px] px-[8px] py-[6px] text-[13px] text-gray-900 outline-none cursor-pointer focus:border-slate-900"}>
                                {ORDENES.map(o => <option key={o.valor} value={o.valor}>{o.texto}</option>)}
                            </select>
                        </label>
                    </div>

                    {chips.length > 0 && (
                        <div className={"flex flex-wrap items-center gap-[8px] mt-[14px]"}>
                            {chips.map(chip => (
                                <button key={chip.texto} onClick={chip.quitar} className={"flex items-center gap-[6px] bg-gray-100 rounded-full pl-[12px] pr-[8px] py-[4px] text-[12px] font-medium cursor-pointer hover:bg-gray-200"}>
                                    <span className={"first-letter:uppercase"}>{chip.texto}</span>
                                    <span className={"text-[15px] leading-none text-gray-500"} aria-label={"Quitar filtro"}>×</span>
                                </button>
                            ))}
                            <button onClick={limpiar} className={"text-[12px] font-semibold underline cursor-pointer"}>Limpiar filtros</button>
                        </div>
                    )}

                    {resultado.length > 0 ? (
                        <div className={"mt-[20px] grid grid-cols-[repeat(auto-fill,275px)] justify-center gap-[20px]"}>
                            {resultado.map(producto => <TarjetaProducto key={producto.id} producto={producto}/>)}
                        </div>
                    ) : (
                        <div className={"mt-[40px] flex flex-col items-center gap-[10px] text-center py-[40px]"}>
                            <p className={"text-[16px] font-semibold"}>No encontramos productos con estos filtros</p>
                            <p className={"text-[13px] text-gray-500"}>Prueba quitando algún filtro o buscando otro término.</p>
                            <button onClick={limpiar} className={"mt-[6px] bg-slate-900 text-white rounded-[10px] px-[16px] py-[8px] text-[13px] font-semibold cursor-pointer"}>Limpiar filtros</button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
