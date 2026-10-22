'use client'
import {clienteAdmin} from './clienteAdmin';
import Link from 'next/link';
import {useState, useEffect, useMemo, useCallback} from 'react';
import {Product} from '@/app/tipos/elementsType';
import {formatoPrecio, precioFinal, enOferta, EtiquetaDescuento} from '@/app/componentes/elementosProducto';
import {FormularioProducto, API} from './FormularioProducto';
import {Cargando} from '@/app/componentes/Cargando';

const STOCK_BAJO = 10;

const aSlug = (texto : string) => texto.replace(/\s+/g, '-').toLowerCase();
const normalizar = (texto : string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

type Aviso = {tipo : 'exito' | 'error', texto : string};

const Estadistica = ({titulo, valor, detalle} : {titulo : string, valor : string | number, detalle? : string}) => (
    <div className={"bg-white border border-gray-200 rounded-[14px] p-[16px] flex flex-col gap-[4px]"}>
        <span className={"text-[12px] font-medium uppercase tracking-wide text-gray-500"}>{titulo}</span>
        <span className={"text-[24px] font-bold text-gray-900 leading-tight"}>{valor}</span>
        {detalle && <span className={"text-[12px] text-gray-500"}>{detalle}</span>}
    </div>
)

const EstadoStock = ({stock} : {stock : number}) => {
    const clase = stock === 0 ? "bg-red-50 text-red-700" : stock < STOCK_BAJO ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700";
    return <span className={`inline-block rounded-full px-[10px] py-[2px] text-[12px] font-semibold ${clase}`}>{stock === 0 ? 'Agotado' : stock}</span>
}

const claseAccion = "w-[34px] h-[34px] rounded-[8px] flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer transition-colors";

export const GestorProductos = () => {

    const [productos, setProductos] = useState<Product[] | null>(null);
    const [categoriasBase, setCategoriasBase] = useState<string[]>([]);
    const [errorCarga, setErrorCarga] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    // undefined = formulario cerrado, null = producto nuevo
    const [editando, setEditando] = useState<Product | null | undefined>(undefined);
    const [eliminando, setEliminando] = useState<Product | null>(null);
    const [borrando, setBorrando] = useState(false);
    const [aviso, setAviso] = useState<Aviso | null>(null);

    const cargar = useCallback(async () => {
        try {
            const [{data : lista}, {data : categorias}] = await Promise.all([
                clienteAdmin.get<Product[]>(`${API}/getProductosCategoria`),
                clienteAdmin.get<string[]>(`${API}/productos`),
            ]);
            setProductos(lista);
            setCategoriasBase(categorias);
            setErrorCarga(false);
        } catch {
            setErrorCarga(true);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial desde la API
        cargar();
    }, [cargar]);

    useEffect(() => {
        if (!aviso) return;
        const timer = setTimeout(() => setAviso(null), 3500);
        return () => clearTimeout(timer);
    }, [aviso]);

    const categorias = useMemo(() => [...new Set([...categoriasBase, ...(productos ?? []).map(p => p.categoria)])].sort((a, b) => a.localeCompare(b, 'es')), [categoriasBase, productos]);

    const visibles = useMemo(() => (productos ?? []).filter(p => {
        if (filtroCategoria && p.categoria !== filtroCategoria) return false;
        if (!busqueda.trim()) return true;
        const texto = normalizar(`${p.id} ${p.name} ${p.categoria} ${p.marca ?? ''}`);
        return normalizar(busqueda).trim().split(/\s+/).every(palabra => texto.includes(palabra));
    }), [productos, busqueda, filtroCategoria]);

    const cerrarFormulario = useCallback(() => setEditando(undefined), []);

    const alGuardar = (producto : Product, esNuevo : boolean) => {
        setProductos(lista => esNuevo ? [...(lista ?? []), producto] : (lista ?? []).map(p => p.id === producto.id ? producto : p));
        setEditando(undefined);
        setAviso({tipo: 'exito', texto: esNuevo ? `Se creó "${producto.name}"` : `Se guardaron los cambios de "${producto.name}"`});
    }

    const confirmarEliminacion = async () => {
        if (!eliminando) return;
        setBorrando(true);
        try {
            await clienteAdmin.delete(`${API}/productos/${eliminando.id}`);
            setProductos(lista => (lista ?? []).filter(p => p.id !== eliminando.id));
            setAviso({tipo: 'exito', texto: `Se eliminó "${eliminando.name}"`});
        } catch {
            setAviso({tipo: 'error', texto: 'No se pudo eliminar el producto'});
        }
        setBorrando(false);
        setEliminando(null);
    }

    const unidades = (productos ?? []).reduce((acc, p) => acc + p.stock, 0);
    const agotados = (productos ?? []).filter(p => p.stock === 0).length;
    const bajos = (productos ?? []).filter(p => p.stock > 0 && p.stock < STOCK_BAJO).length;

    return (
        <section className={"flex flex-col gap-[20px]"}>

            <div className={"flex flex-wrap items-end justify-between gap-[12px]"}>
                <div>
                    <h2 className={"text-[22px] font-bold text-gray-900 leading-none"}>Productos</h2>
                    <p className={"text-[13px] text-gray-500"}>Crea, edita y elimina los productos del catálogo.</p>
                </div>
                <button onClick={() => setEditando(null)} className={"flex items-center gap-[6px] bg-slate-900 text-white rounded-[10px] px-[16px] py-[10px] text-[14px] font-semibold hover:bg-slate-700 cursor-pointer transition-colors"}>
                    <span className={"text-[18px] leading-none"}>+</span> Nuevo producto
                </button>
            </div>

            <div className={"grid grid-cols-2 lg:grid-cols-4 gap-[12px]"}>
                <Estadistica titulo={"Productos"} valor={productos?.length ?? '—'} detalle={`${categorias.length} categorías`}/>
                <Estadistica titulo={"Unidades en stock"} valor={productos ? unidades.toLocaleString('es-PE') : '—'}/>
                <Estadistica titulo={"Stock bajo"} valor={productos ? bajos : '—'} detalle={`Menos de ${STOCK_BAJO} unidades`}/>
                <Estadistica titulo={"Agotados"} valor={productos ? agotados : '—'}/>
            </div>

            <div className={"bg-white border border-gray-200 rounded-[14px] overflow-hidden"}>
                <div className={"flex flex-wrap items-center gap-[10px] p-[14px] border-b border-gray-200"}>
                    <div className={"flex-1 min-w-[200px] flex items-center gap-[8px] border-2 border-gray-200 rounded-[10px] px-[10px] py-[6px] focus-within:border-slate-900"}>
                        <svg viewBox="0 0 24 24" className={"w-[18px] h-[18px] text-gray-400 shrink-0"} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                            <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
                        </svg>
                        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} type="search" placeholder={"Buscar por nombre, ID, categoría o marca"} className={"w-full text-[14px] outline-none"}/>
                    </div>
                    <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className={"border-2 border-gray-200 rounded-[10px] px-[10px] py-[7px] text-[14px] outline-none cursor-pointer focus:border-slate-900 first-letter:uppercase"}>
                        <option value="">Todas las categorías</option>
                        {categorias.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                </div>

                {errorCarga ? (
                    <div className={"py-[48px] px-[16px] flex flex-col items-center gap-[10px] text-center"}>
                        <p className={"text-[15px] font-semibold text-gray-900"}>No se pudieron cargar los productos</p>
                        <p className={"text-[13px] text-gray-500"}>Revisa que el backend esté encendido en {API}.</p>
                        <button onClick={cargar} className={"mt-[4px] bg-slate-900 text-white rounded-[10px] px-[16px] py-[8px] text-[13px] font-semibold cursor-pointer"}>Reintentar</button>
                    </div>
                ) : productos === null ? (
                    <Cargando texto={"Cargando productos..."}/>
                ) : visibles.length === 0 ? (
                    <p className={"py-[48px] text-center text-[14px] text-gray-500"}>
                        {productos.length === 0 ? 'Todavía no hay productos. Crea el primero con "Nuevo producto".' : 'Ningún producto coincide con la búsqueda.'}
                    </p>
                ) : (
                    <div className={"overflow-x-auto scroll-fino"}>
                        <table className={"w-full min-w-[760px] text-left text-[14px]"}>
                            <thead className={"bg-gray-50 text-[12px] uppercase tracking-wide text-gray-500"}>
                                <tr>
                                    <th className={"px-[16px] py-[10px] font-semibold"}>Producto</th>
                                    <th className={"px-[16px] py-[10px] font-semibold"}>Categoría</th>
                                    <th className={"px-[16px] py-[10px] font-semibold text-right"}>Precio</th>
                                    <th className={"px-[16px] py-[10px] font-semibold text-center"}>Stock</th>
                                    <th className={"px-[16px] py-[10px] font-semibold text-center"}>Imágenes</th>
                                    <th className={"px-[16px] py-[10px] font-semibold text-right"}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className={"divide-y divide-gray-100"}>
                                {visibles.map(p => (
                                    <tr key={p.id} className={"hover:bg-gray-50"}>
                                        <td className={"px-[16px] py-[10px]"}>
                                            <div className={"flex items-center gap-[12px]"}>
                                                <img src={p.img[0]} alt="" className={"w-[48px] h-[48px] shrink-0 rounded-[8px] border border-gray-200 object-contain bg-white"}/>
                                                <div className={"min-w-0"}>
                                                    <p className={"font-medium text-gray-900 first-letter:uppercase truncate max-w-[280px]"}>{p.name}</p>
                                                    <p className={"text-[12px] text-gray-500"}>#{String(p.id).padStart(5, '0')}{p.marca ? ` · ${p.marca}` : ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={"px-[16px] py-[10px] text-gray-600 first-letter:uppercase"}>{p.categoria}</td>
                                        <td className={"px-[16px] py-[10px] text-right whitespace-nowrap"}>
                                            <div className={"flex flex-col items-end gap-[2px]"}>
                                                <span className={`font-medium ${enOferta(p) ? "text-red-600" : ""}`}>{formatoPrecio(precioFinal(p))}</span>
                                                {enOferta(p) && (
                                                    <span className={"flex items-center gap-[6px] text-[12px] text-gray-400"}>
                                                        <span className={"line-through"}>{formatoPrecio(p.precio)}</span>
                                                        <EtiquetaDescuento descuento={p.descuento!} className={"text-[10px] px-[6px] py-[3px]"}/>
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className={"px-[16px] py-[10px] text-center"}><EstadoStock stock={p.stock}/></td>
                                        <td className={"px-[16px] py-[10px] text-center text-gray-600"}>{p.img.length}</td>
                                        <td className={"px-[16px] py-[10px]"}>
                                            <div className={"flex justify-end gap-[2px]"}>
                                                <Link href={`/productos/${aSlug(p.categoria)}/${aSlug(p.name)}`} target="_blank" aria-label={`Ver ${p.name} en la tienda`} title={"Ver en la tienda"} className={claseAccion}>
                                                    <svg viewBox="0 0 24 24" className={"w-[18px] h-[18px]"} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
                                                </Link>
                                                <button onClick={() => setEditando(p)} aria-label={`Editar ${p.name}`} title={"Editar"} className={claseAccion}>
                                                    <svg viewBox="0 0 24 24" className={"w-[18px] h-[18px]"} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                                </button>
                                                <button onClick={() => setEliminando(p)} aria-label={`Eliminar ${p.name}`} title={"Eliminar"} className={`${claseAccion} hover:!bg-red-50 hover:!text-red-600`}>
                                                    <svg viewBox="0 0 24 24" className={"w-[18px] h-[18px]"} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {editando !== undefined && (
                <FormularioProducto producto={editando ?? undefined} categorias={categorias} onCerrar={cerrarFormulario} onGuardado={alGuardar}/>
            )}

            {eliminando && (
                <div className={"fixed inset-0 z-[60] flex items-center justify-center p-[16px]"}>
                    <div onClick={() => !borrando && setEliminando(null)} className={"absolute inset-0 bg-black/50"}/>
                    <div role="alertdialog" aria-modal="true" className={"relative w-full max-w-[420px] bg-white rounded-[16px] p-[24px] flex flex-col gap-[14px] shadow-[0px_10px_40px_rgba(0,0,0,.25)]"}>
                        <h2 className={"text-[17px] font-bold text-gray-900 leading-none"}>¿Eliminar producto?</h2>
                        <div className={"flex items-center gap-[12px]"}>
                            <img src={eliminando.img[0]} alt="" className={"w-[56px] h-[56px] rounded-[8px] border border-gray-200 object-contain"}/>
                            <p className={"text-[14px] text-gray-600"}>
                                Se eliminará <span className={"font-semibold text-gray-900"}>&quot;{eliminando.name}&quot;</span> y las imágenes que subiste para él. Esta acción no se puede deshacer.
                            </p>
                        </div>
                        <div className={"flex justify-end gap-[10px]"}>
                            <button onClick={() => setEliminando(null)} disabled={borrando} className={"px-[16px] py-[9px] rounded-[10px] text-[14px] font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"}>Cancelar</button>
                            <button onClick={confirmarEliminacion} disabled={borrando} className={"px-[16px] py-[9px] rounded-[10px] text-[14px] font-semibold bg-red-600 text-white hover:bg-red-700 cursor-pointer disabled:opacity-60"}>
                                {borrando ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {aviso && (
                <div role="status" className={`fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[70] rounded-[12px] px-[18px] py-[12px] text-[14px] font-medium text-white shadow-[0px_6px_20px_rgba(0,0,0,.2)] ${aviso.tipo === 'exito' ? "bg-slate-900" : "bg-red-600"}`}>
                    {aviso.texto}
                </div>
            )}
        </section>
    )
}
