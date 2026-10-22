'use client'
import axios from 'axios';
import {clienteAdmin} from './clienteAdmin';
import Link from 'next/link';
import {useState, useEffect, useRef} from 'react';
import {Product, Banners, BannerOferta, PosicionBanner, POSICIONES_NUEVOS} from '@/app/tipos/elementsType';
import {enOferta, idsNuevosIngresos} from '@/app/componentes/elementosProducto';
import {calcularRanuras, describirRanura, VistaRanura, grupoDe, formatoDe, ASPECTO, type Ranura, type GrupoBanner} from '@/app/componentes/BannersInicio';
import {API} from './FormularioProducto';

const MAX_BYTES = 5 * 1024 * 1024;
const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

const INFO_POSICION : Record<PosicionBanner, {titulo : string, medida : string}> = {
    'principal': {titulo: 'Banner principal', medida: 'Ancho completo · recomendado 1600 × 400 px'},
    'secundario-1': {titulo: 'Banner secundario 1', medida: 'Un tercio del ancho · recomendado 800 × 600 px'},
    'secundario-2': {titulo: 'Banner secundario 2', medida: 'Un tercio del ancho · recomendado 800 × 600 px'},
    'secundario-3': {titulo: 'Banner secundario 3', medida: 'Un tercio del ancho · recomendado 800 × 600 px'},
    'nuevos-1': {titulo: 'Nuevo ingreso 1', medida: 'Mitad del ancho · recomendado 1200 × 675 px'},
    'nuevos-2': {titulo: 'Nuevo ingreso 2', medida: 'Mitad del ancho · recomendado 1200 × 675 px'},
    'nuevos-3': {titulo: 'Nuevo ingreso 3', medida: 'Un tercio del ancho · recomendado 800 × 600 px'},
    'nuevos-4': {titulo: 'Nuevo ingreso 4', medida: 'Un tercio del ancho · recomendado 800 × 600 px'},
    'nuevos-5': {titulo: 'Nuevo ingreso 5', medida: 'Un tercio del ancho · recomendado 800 × 600 px'},
};

// textos que cambian segun la seccion del banner
const TEXTOS_GRUPO : Record<GrupoBanner, {todos : string, deCategoria : string, enCategoria : string, sinEnCategoria : string}> = {
    ofertas: {todos: 'Todas las ofertas', deCategoria: 'Ofertas de una categoría', enCategoria: 'en oferta', sinEnCategoria: 'sin ofertas'},
    nuevos: {todos: 'Todos los nuevos ingresos', deCategoria: 'Nuevos ingresos de una categoría', enCategoria: 'nuevos', sinEnCategoria: 'sin nuevos'},
};

const SECCIONES : {titulo : string, descripcion : string, filas : PosicionBanner[][]}[] = [
    {
        titulo: 'Banners de ofertas',
        descripcion: 'Sección "Ofertas": un banner a todo el ancho y tres debajo. Sin imagen propia se muestran las categorías y productos con mayor descuento.',
        filas: [['principal'], ['secundario-1', 'secundario-2', 'secundario-3']],
    },
    {
        titulo: 'Banners de nuevos ingresos',
        descripcion: 'Sección "Nuevos ingresos" antes del footer: dos banners arriba y tres debajo. Sin imagen propia se muestran los productos agregados más recientemente.',
        filas: [[...POSICIONES_NUEVOS.slice(0, 2)], [...POSICIONES_NUEVOS.slice(2)]],
    },
];

const capitalizar = (texto : string) => texto.charAt(0).toUpperCase() + texto.slice(1);

// texto legible del destino ("" | "categoria:<nombre>" | "producto:<id>")
const textoDestino = (destino : string, productos : Product[], grupo : GrupoBanner) => {
    const [tipo, valor] = destino.split(/:(.*)/);
    if (tipo === 'categoria') return `${grupo === 'nuevos' ? 'Nuevos ingresos' : 'Ofertas'} de ${valor}`;
    if (tipo === 'producto') {
        const producto = productos.find(p => p.id === Number(valor));
        return producto ? `Producto: ${producto.name}` : `Un producto que ya no existe (lleva a ${TEXTOS_GRUPO[grupo].todos.toLowerCase()})`;
    }
    return TEXTOS_GRUPO[grupo].todos;
}

const TarjetaBanner = ({posicion, banner, ranura, indice, productos, categorias, nuevos, onCambio} : {posicion : PosicionBanner, banner : BannerOferta | null, ranura : Ranura | null, indice : number, productos : Product[], categorias : string[], nuevos : Set<number>, onCambio : (banner : BannerOferta | null, mensaje : string) => void}) => {

    const grupo = grupoDe(posicion);
    const textos = TEXTOS_GRUPO[grupo];
    // los campos arrancan con lo que la pagina muestra hoy en esta posicion (subido o automatico)
    const actual = describirRanura(ranura);
    const [archivo, setArchivo] = useState<File | null>(null);
    const [vistaPrevia, setVistaPrevia] = useState('');
    const [titulo, setTitulo] = useState(actual.descripcion);
    const [destino, setDestino] = useState(actual.destino);
    const [estado, setEstado] = useState<'libre' | 'guardando' | 'quitando'>('libre');
    const [error, setError] = useState('');

    // la vista previa es un blob en memoria: se libera al cambiarla y al desmontar
    const vistaActual = useRef('');
    const cambiarVista = (url : string) => {
        if (vistaActual.current) URL.revokeObjectURL(vistaActual.current);
        vistaActual.current = url;
        setVistaPrevia(url);
    }
    useEffect(() => () => { if (vistaActual.current) URL.revokeObjectURL(vistaActual.current); }, []);

    const elegirArchivo = (lista : FileList | null) => {
        const elegido = lista?.[0];
        if (!elegido) return;
        if (!TIPOS_IMAGEN.includes(elegido.type)) return setError('Formato no permitido. Usa JPG, PNG, WEBP, GIF o AVIF.');
        if (elegido.size > MAX_BYTES) return setError('La imagen pesa más de 5 MB.');
        setError('');
        setArchivo(elegido);
        cambiarVista(URL.createObjectURL(elegido));
    }

    const descartar = () => {
        setArchivo(null);
        cambiarVista('');
        setTitulo(actual.descripcion);
        setDestino(actual.destino);
        setError('');
    }

    const hayCambios = !!archivo || titulo !== actual.descripcion || destino !== actual.destino;
    // un banner automatico solo se reemplaza subiendo una imagen
    const puedeGuardar = hayCambios && (!!archivo || !!banner);

    const guardar = async () => {
        const [tipo, valor] = destino.split(/:(.*)/);
        const datos = new FormData();
        datos.append('datos', JSON.stringify({titulo, ...(tipo === 'producto' ? {productoId: Number(valor)} : tipo === 'categoria' ? {categoria: valor} : {})}));
        if (archivo) datos.append('imagen', archivo);

        setEstado('guardando');
        setError('');
        try {
            const {data} = await clienteAdmin.put<BannerOferta>(`${API}/banners/${posicion}`, datos);
            onCambio(data, `Se guardó "${INFO_POSICION[posicion].titulo}"`);
        } catch (e) {
            setError(axios.isAxiosError(e) && e.response?.data?.error ? e.response.data.error : 'No se pudo guardar el banner.');
            setEstado('libre');
        }
    }

    const quitar = async () => {
        if (!window.confirm('¿Quitar la imagen de este banner? En su lugar se mostrará el banner automático.')) return;
        setEstado('quitando');
        try {
            await clienteAdmin.delete(`${API}/banners/${posicion}`);
            onCambio(null, `"${INFO_POSICION[posicion].titulo}" volvió a ser automático`);
        } catch {
            setError('No se pudo quitar el banner.');
            setEstado('libre');
        }
    }

    const ocupado = estado !== 'libre';
    const anchoCompleto = formatoDe(posicion) === 'completo';

    return (
        <div className={"bg-white border border-gray-200 rounded-[14px] p-[16px] flex flex-col gap-[12px]"}>
            <div className={"flex items-start justify-between gap-[10px]"}>
                <div>
                    <h3 className={"text-[15px] font-semibold text-gray-900 leading-none"}>{INFO_POSICION[posicion].titulo}</h3>
                    <p className={"text-[12px] text-gray-500"}>{INFO_POSICION[posicion].medida}</p>
                </div>
                <span className={`shrink-0 text-[11px] font-semibold rounded-full px-[10px] py-[3px] ${banner ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {banner ? 'Imagen propia' : 'Automático'}
                </span>
            </div>

            <div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); elegirArchivo(e.dataTransfer.files); }} className={"flex flex-col gap-[6px]"}>
                <span className={`text-[11px] font-semibold uppercase tracking-wide ${archivo ? "text-amber-600" : "text-gray-500"}`}>
                    {archivo ? 'Vista previa · sin guardar' : 'Así se ve ahora en la página principal'}
                </span>
                {archivo ? (
                    <div className={`relative overflow-hidden rounded-[14px] ring-2 ring-amber-400 ${ASPECTO[formatoDe(posicion)]}`}>
                        <img src={vistaPrevia} alt="" className={"absolute inset-0 w-full h-full object-cover"}/>
                    </div>
                ) : ranura ? (
                    // inert: la vista es solo para mirar, sus enlaces no se pueden usar desde el dashboard
                    <div inert className={"select-none"}>
                        <VistaRanura ranura={ranura} productos={productos} posicion={posicion} indice={indice}/>
                    </div>
                ) : (
                    <div className={`flex items-center justify-center rounded-[14px] border-2 border-dashed border-gray-300 bg-gray-50 p-[16px] text-center text-[13px] text-gray-500 ${ASPECTO[formatoDe(posicion)]}`}>
                        Ahora no se muestra nada en esta posición: no quedan productos para un banner automático.
                    </div>
                )}
                <label className={"self-start flex items-center gap-[6px] border-2 border-gray-300 hover:border-slate-900 rounded-[10px] px-[12px] py-[6px] text-[13px] font-semibold text-gray-800 cursor-pointer transition-colors"}>
                    <svg viewBox="0 0 24 24" className={"w-[16px] h-[16px]"} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                    </svg>
                    {archivo || banner ? 'Cambiar imagen' : 'Subir imagen propia'}
                    <input type="file" accept={TIPOS_IMAGEN.join(',')} className={"hidden"} onChange={e => { elegirArchivo(e.target.files); e.target.value = ''; }}/>
                </label>
            </div>

            <div className={`grid gap-[10px] ${anchoCompleto ? "sm:grid-cols-2" : ""}`}>
                <label className={"flex flex-col gap-[4px]"}>
                    <span className={"text-[12px] font-medium text-gray-700"}>Al hacer clic lleva a</span>
                    <select value={destino} onChange={e => setDestino(e.target.value)} className={"w-full border-2 border-gray-200 rounded-[10px] px-[10px] py-[7px] text-[13px] outline-none cursor-pointer focus:border-slate-900"}>
                        <option value="">{textos.todos}</option>
                        <optgroup label={textos.deCategoria}>
                            {categorias.map(c => {
                                const cantidad = productos.filter(p => p.categoria === c && (grupo === 'nuevos' ? nuevos.has(p.id) : enOferta(p))).length;
                                return <option key={c} value={`categoria:${c}`}>{capitalizar(c)} ({cantidad ? `${cantidad} ${textos.enCategoria}` : textos.sinEnCategoria})</option>
                            })}
                        </optgroup>
                        <optgroup label="Un producto">
                            {productos.map(p => (
                                <option key={p.id} value={`producto:${p.id}`}>{capitalizar(p.name)}{enOferta(p) ? ` (-${p.descuento}%)` : ''}{nuevos.has(p.id) ? ' · nuevo' : ''}</option>
                            ))}
                        </optgroup>
                    </select>
                    {destino !== actual.destino && <span className={"text-[11px] text-gray-500"}>Ahora lleva a: {textoDestino(actual.destino, productos, grupo)}</span>}
                </label>
                <label className={"flex flex-col gap-[4px]"}>
                    <span className={"text-[12px] font-medium text-gray-700"}>Descripción de la imagen</span>
                    <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder={grupo === 'nuevos' ? "Ej. Nuevos cascos dieléctricos" : "Ej. Cascos hasta 30% de descuento"} className={"w-full border-2 border-gray-200 rounded-[10px] px-[10px] py-[7px] text-[13px] outline-none focus:border-slate-900"}/>
                    {titulo !== actual.descripcion && <span className={"text-[11px] text-gray-500"}>Descripción actual: {actual.descripcion || '(sin descripción)'}</span>}
                </label>
            </div>

            {!banner && hayCambios && !archivo && (
                <span className={"text-[12px] text-amber-600"}>Para reemplazar el banner automático, sube una imagen propia.</span>
            )}
            {error && <span className={"text-[12px] text-red-600"} role="alert">{error}</span>}

            <div className={"flex justify-end gap-[8px] mt-auto"}>
                {hayCambios && (
                    <button onClick={descartar} disabled={ocupado} className={"px-[12px] py-[7px] rounded-[10px] text-[13px] font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer disabled:opacity-50"}>
                        Descartar cambios
                    </button>
                )}
                {banner && !hayCambios && (
                    <button onClick={quitar} disabled={ocupado} className={"px-[12px] py-[7px] rounded-[10px] text-[13px] font-semibold text-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-50"}>
                        {estado === 'quitando' ? 'Quitando...' : 'Usar automático'}
                    </button>
                )}
                <button onClick={guardar} disabled={ocupado || !puedeGuardar} className={"px-[14px] py-[7px] rounded-[10px] text-[13px] font-semibold bg-slate-900 text-white hover:bg-slate-700 cursor-pointer disabled:opacity-40 disabled:cursor-default"}>
                    {estado === 'guardando' ? 'Guardando...' : 'Guardar'}
                </button>
            </div>
        </div>
    )
}

export const GestorBanners = () => {

    const [banners, setBanners] = useState<Banners | null>(null);
    const [productos, setProductos] = useState<Product[]>([]);
    const [errorCarga, setErrorCarga] = useState(false);
    const [aviso, setAviso] = useState('');

    useEffect(() => {
        Promise.all([
            clienteAdmin.get<Banners>(`${API}/banners`),
            clienteAdmin.get<Product[]>(`${API}/getProductosCategoria`),
        ])
            .then(([{data : configuracion}, {data : lista}]) => {
                setBanners(configuracion);
                setProductos(lista);
            })
            .catch(() => setErrorCarga(true));
    }, []);

    useEffect(() => {
        if (!aviso) return;
        const timer = setTimeout(() => setAviso(''), 3500);
        return () => clearTimeout(timer);
    }, [aviso]);

    const categorias = [...new Set(productos.map(p => p.categoria))].sort((a, b) => a.localeCompare(b, 'es'));
    const nuevos = idsNuevosIngresos(productos);
    const ranuras = banners ? calcularRanuras(productos, banners) : null;

    const mensajeVacio = errorCarga
        ? 'No se pudieron cargar los banners. Revisa que el backend esté encendido.'
        : !banners || !ranuras ? 'Cargando banners...' : '';

    return (
        <>
            {SECCIONES.map(seccion => (
                <section key={seccion.titulo} className={"flex flex-col gap-[16px]"}>
                    <div className={"flex flex-wrap items-end justify-between gap-[12px]"}>
                        <div>
                            <h2 className={"text-[22px] font-bold text-gray-900 leading-none"}>{seccion.titulo}</h2>
                            <p className={"text-[13px] text-gray-500"}>{seccion.descripcion}</p>
                        </div>
                        <Link href={"/"} target="_blank" className={"text-[13px] font-semibold text-slate-900 underline"}>Ver página principal</Link>
                    </div>

                    {mensajeVacio || !banners || !ranuras ? (
                        <p className={"bg-white border border-gray-200 rounded-[14px] py-[32px] text-center text-[14px] text-gray-500"}>{mensajeVacio}</p>
                    ) : seccion.filas.map(fila => (
                        <div key={fila.join()} className={`grid grid-cols-1 gap-[14px] ${fila.length === 2 ? "lg:grid-cols-2" : fila.length === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : ""}`}>
                            {fila.map(posicion => {
                                // mismo color que en la pagina: en ofertas cuenta solo las posiciones que se muestran,
                                // en nuevos ingresos cada posicion tiene su color fijo
                                const indice = grupoDe(posicion) === 'nuevos'
                                    ? POSICIONES_NUEVOS.indexOf(posicion as typeof POSICIONES_NUEVOS[number])
                                    : Math.max(fila.filter(p => ranuras[p]).indexOf(posicion), 0);
                                const actual = describirRanura(ranuras[posicion]);
                                return (
                                    <TarjetaBanner
                                        // si cambia lo que se muestra en esta posicion, la tarjeta se reinicia con los datos nuevos
                                        key={`${posicion}|${banners[posicion]?.imagen ?? ''}|${actual.destino}|${actual.descripcion}`}
                                        posicion={posicion}
                                        banner={banners[posicion]}
                                        ranura={ranuras[posicion]}
                                        indice={indice}
                                        productos={productos}
                                        categorias={categorias}
                                        nuevos={nuevos}
                                        onCambio={(banner, mensaje) => {
                                            setBanners(anteriores => anteriores && {...anteriores, [posicion]: banner});
                                            setAviso(mensaje);
                                        }}/>
                                )
                            })}
                        </div>
                    ))}
                </section>
            ))}

            {aviso && (
                <div role="status" className={"fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[70] rounded-[12px] px-[18px] py-[12px] text-[14px] font-medium text-white bg-slate-900 shadow-[0px_6px_20px_rgba(0,0,0,.2)]"}>
                    {aviso}
                </div>
            )}
        </>
    )
}
